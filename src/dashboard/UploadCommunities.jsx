import { useState, useEffect } from 'react';
import { PlusCircle, Edit, Trash2, Save, X, Sparkles, Globe, Image as ImageIcon, Link2, CheckCircle } from 'lucide-react';
import { db, storage } from '../firebase';
import { collection, addDoc, getDocs, deleteDoc, updateDoc, doc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { toast } from 'sonner';
import StatusModal from './components/StatusModal';
import ProcessingOverlay from './components/ProcessingOverlay';

const UploadCommunities = () => {
    const [isEditing, setIsEditing] = useState(false);
    const [currentCommunity, setCurrentCommunity] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [communities, setCommunities] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [formData, setFormData] = useState({
        name: '',
        logo: '',
        link: '',
        description: ''
    });

    const [imageMode, setImageMode] = useState('url');
    const [imagePreview, setImagePreview] = useState('');
    const [modal, setModal] = useState({ open: false, title: '', message: '' });

    // Compress image
    const compressImage = (file, maxWidth = 400) => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                if (width > maxWidth) {
                    height = (height * maxWidth) / width;
                    width = maxWidth;
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                canvas.toBlob((blob) => {
                    resolve(blob);
                }, 'image/jpeg', 0.7);
            };
            img.onerror = reject;
        };
        reader.onerror = reject;
    });

    // Fetch communities
    const fetchCommunities = async () => {
        try {
            const q = query(collection(db, 'communities'), orderBy('createdAt', 'desc'));
            const querySnapshot = await getDocs(q);
            const communitiesData = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setCommunities(communitiesData);
        } catch (error) {
            console.error('Error fetching communities:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCommunities();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFileChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            setModal({ open: true, title: 'Error', message: 'Image file must not be more than 5MB' });
            return;
        }

        try {
            const compressedBlob = await compressImage(file);
            setImagePreview(URL.createObjectURL(compressedBlob));
            setFormData(prev => ({ ...prev, logo: compressedBlob }));
        } catch (error) {
            setModal({ open: true, title: 'Error', message: 'Failed to process image' });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            if (!formData.name || !formData.logo || !formData.link) {
                setModal({ open: true, title: 'Error', message: 'Please fill in all required fields' });
                setIsSubmitting(false);
                return;
            }

            // Upload to Storage if Blob
            let logoUrl = formData.logo;
            if (logoUrl instanceof Blob) {
                const storageRef = ref(storage, `communities/logo_${Date.now()}`);
                await uploadBytes(storageRef, logoUrl);
                logoUrl = await getDownloadURL(storageRef);
            }

            const communityData = {
                name: formData.name,
                logo: logoUrl,
                link: formData.link,
                description: formData.description,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            };

            if (isEditing && currentCommunity) {
                await updateDoc(doc(db, 'communities', currentCommunity.id), {
                    ...communityData,
                    createdAt: currentCommunity.createdAt
                });
                setModal({ open: true, title: 'Success', message: 'Community updated successfully!' });
                toast.success('Community updated successfully!');
            } else {
                await addDoc(collection(db, 'communities'), communityData);
                toast.success('Community added successfully!');
            }

            resetForm();
            fetchCommunities();
        } catch (error) {
            console.error('Error saving community:', error);
            toast.error('Failed to save community. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            logo: '',
            link: '',
            description: ''
        });
        setImagePreview('');
        setImageMode('url');
        setIsEditing(false);
        setCurrentCommunity(null);
    };

    const handleEdit = (community) => {
        setIsEditing(true);
        setCurrentCommunity(community);
        setFormData({
            name: community.name,
            logo: community.logo,
            link: community.link,
            description: community.description || ''
        });
        setImagePreview(community.logo);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = (community) => {
        setModal({
            open: true,
            title: 'Confirm Delete',
            message: 'Are you sure you want to delete this community and its logo?',
            confirmAction: async () => {
                try {
                    // Delete from storage if it's a storage URL
                    if (community.logo && community.logo.includes('firebasestorage.googleapis.com')) {
                        try {
                            const fileRef = ref(storage, community.logo);
                            await deleteObject(fileRef);
                        } catch (storageErr) {
                            console.error('Storage delete error:', storageErr);
                        }
                    }
                    await deleteDoc(doc(db, 'communities', community.id));
                    toast.success('Community deleted successfully!');
                    fetchCommunities();
                } catch (error) {
                    console.error('Error deleting community:', error);
                    toast.error('Failed to delete community');
                }
            }
        });
    };

    return (
        <div className="min-h-screen bg-black text-white p-6">
            <ProcessingOverlay isVisible={isSubmitting} />
            {modal.open && modal.confirmAction && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                    <div className="bg-[#0A0A0A] border border-white/10 rounded-xl max-w-sm w-full p-6 space-y-4">
                        <h2 className="text-xl font-bold text-white">{modal.title}</h2>
                        <p className="text-gray-400">{modal.message}</p>
                        <div className="flex gap-3 justify-end">
                            <button onClick={() => setModal({ open: false, title: '', message: '', confirmAction: null })} className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors">Cancel</button>
                            <button onClick={() => { modal.confirmAction(); setModal({ open: false, title: '', message: '', confirmAction: null }); }} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">Delete</button>
                        </div>
                    </div>
                </div>
            )}

            <StatusModal open={modal.open && !modal.confirmAction} title={modal.title} message={modal.message} onClose={() => setModal({ ...modal, open: false, confirmAction: null })} />

            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
                        <Globe className="text-yellow-500" size={36} />
                        Communities Management
                    </h1>
                    <p className="text-gray-400">Manage Bitcoin communities and their links</p>
                </div>

                {/* Form */}
                <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-2xl p-6 mb-8 shadow-2xl">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-yellow-500/10 rounded-xl border border-yellow-500/20">
                                {isEditing ? <Edit className="text-yellow-500" size={20} /> : <Sparkles className="text-yellow-500" size={20} />}
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white">{isEditing ? 'Edit Community' : 'Add New Community'}</h2>
                                <p className="text-xs text-gray-500">Fill in the details below</p>
                            </div>
                        </div>
                        {isEditing && (
                            <button
                                onClick={resetForm}
                                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                            >
                                <X size={16} /> Cancel
                            </button>
                        )}
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Community Name */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">Community Name</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                required
                                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder:text-gray-600 focus:outline-none focus:border-yellow-500/50 focus:ring-2 focus:ring-yellow-500/20 transition-all"
                                placeholder="Enter community name..."
                            />
                        </div>

                        {/* Logo Upload */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">Community Logo</label>
                            <div className="flex gap-2 mb-3">
                                <button
                                    type="button"
                                    onClick={() => setImageMode('url')}
                                    className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${imageMode === 'url' ? 'bg-yellow-500 text-black' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
                                >
                                    URL
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setImageMode('file')}
                                    className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${imageMode === 'file' ? 'bg-yellow-500 text-black' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
                                >
                                    Upload
                                </button>
                            </div>
                            <input
                                type={imageMode === 'url' ? 'url' : 'file'}
                                name="logo"
                                onChange={imageMode === 'url' ? handleInputChange : handleFileChange}
                                value={imageMode === 'url' ? formData.logo : undefined}
                                required={!imagePreview}
                                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:border-yellow-500/50 focus:ring-2 focus:ring-yellow-500/20 transition-all"
                                placeholder={imageMode === 'url' ? 'https://example.com/logo.png' : ''}
                                accept={imageMode === 'file' ? "image/*" : undefined}
                            />
                            {imagePreview && (
                                <div className="mt-4">
                                    <label className="block text-xs text-gray-400 mb-2">Preview</label>
                                    <div className="w-32 h-32 rounded-xl overflow-hidden border-2 border-gray-700">
                                        <img src={imagePreview} alt="Logo preview" className="w-full h-full object-contain bg-white" />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Website Link */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">Website Link</label>
                            <input
                                type="url"
                                name="link"
                                value={formData.link}
                                onChange={handleInputChange}
                                required
                                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder:text-gray-600 focus:outline-none focus:border-yellow-500/50 focus:ring-2 focus:ring-yellow-500/20 transition-all"
                                placeholder="https://community-website.com"
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">Description (Optional)</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                rows="3"
                                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder:text-gray-600 focus:outline-none focus:border-yellow-500/50 focus:ring-2 focus:ring-yellow-500/20 transition-all resize-none"
                                placeholder="Brief description of the community..."
                            />
                        </div>

                        {/* Submit Button */}
                        <div className="flex items-center gap-4 pt-4 border-t border-gray-800">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="px-8 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-bold rounded-xl hover:from-yellow-400 hover:to-yellow-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-yellow-500/20"
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <Save size={18} />
                                        {isEditing ? 'Update Community' : 'Add Community'}
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Communities List */}
                <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-2xl p-6 shadow-2xl">
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                        <Globe className="text-yellow-500" size={24} />
                        All Communities ({communities.length})
                    </h2>

                    {isLoading ? (
                        <div className="text-center py-12">
                            <div className="w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                            <p className="text-gray-400 mt-4">Loading communities...</p>
                        </div>
                    ) : communities.length === 0 ? (
                        <div className="text-center py-12">
                            <Globe className="mx-auto text-gray-600" size={48} />
                            <p className="text-gray-400 mt-4">No communities yet. Add your first one above!</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {communities.map((community) => (
                                <div
                                    key={community.id}
                                    className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 hover:border-yellow-500/50 transition-all group"
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="w-16 h-16 rounded-lg overflow-hidden border border-gray-700 flex-shrink-0 bg-white">
                                            <img src={community.logo} alt={community.name} className="w-full h-full object-contain" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-bold text-white truncate">{community.name}</h3>
                                            <a
                                                href={community.link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-xs text-yellow-500 hover:underline flex items-center gap-1 mt-1"
                                            >
                                                <Link2 size={12} />
                                                Visit Website
                                            </a>
                                            {community.description && (
                                                <p className="text-xs text-gray-400 mt-2 line-clamp-2">{community.description}</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex gap-2 mt-4 pt-4 border-t border-gray-700">
                                        <button
                                            onClick={() => handleEdit(community)}
                                            className="flex-1 px-3 py-2 bg-gray-700 hover:bg-yellow-500 hover:text-black rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2"
                                        >
                                            <Edit size={14} />
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(community)}
                                            className="flex-1 px-3 py-2 bg-gray-700 hover:bg-red-500 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2"
                                        >
                                            <Trash2 size={14} />
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UploadCommunities;
