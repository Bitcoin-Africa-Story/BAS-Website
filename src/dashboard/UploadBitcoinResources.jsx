import { useState, useEffect } from 'react';
import { PlusCircle, Edit, Trash2, Save, X, Library, Sparkles, UploadCloud } from 'lucide-react';
import { db, storage } from '../firebase';
import { collection, addDoc, getDocs, deleteDoc, updateDoc, doc, serverTimestamp, query, orderBy, onSnapshot } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import StatusModal from './components/StatusModal';
import ProcessingOverlay from './components/ProcessingOverlay';

const UploadBitcoinResources = () => {
    const [isEditing, setIsEditing] = useState(false);
    const [currentResource, setCurrentResource] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [resources, setResources] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const [formData, setFormData] = useState({
        title: '',
        subtitle: '',
        imageSrc: '',
        imageAlt: '',
        link: ''
    });

    const [imageMode, setImageMode] = useState('url');
    const [modal, setModal] = useState({ open: false, title: '', message: '' });

    useEffect(() => {
        const q = query(collection(db, 'bitcoin_resources'), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const resourcesData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setResources(resourcesData);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const compressImage = (file, maxWidth = 800) => new Promise((resolve, reject) => {
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
                    height = (maxWidth / width) * height;
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

    const handleFileChange = async (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;
        try {
            setIsSubmitting(true);
            const compressedBlob = await compressImage(file);
            setFormData(prev => ({ ...prev, imageSrc: compressedBlob }));
        } catch (err) {
            console.error('Image compression error', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (name === 'title' && !formData.imageAlt) {
            setFormData(prev => ({ ...prev, imageAlt: value.toLowerCase() }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        const payload = {
            ...formData,
            updatedAt: serverTimestamp()
        };

        try {
            // Upload to Storage if Blob
            let imageUrl = formData.imageSrc;
            if (imageUrl instanceof Blob) {
                const storageRef = ref(storage, `resources/res_${Date.now()}`);
                await uploadBytes(storageRef, imageUrl);
                imageUrl = await getDownloadURL(storageRef);
            }

            const payload = {
                ...formData,
                imageSrc: imageUrl,
                updatedAt: serverTimestamp()
            };

            if (isEditing && currentResource) {
                await updateDoc(doc(db, 'bitcoin_resources', currentResource.id), payload);
                setModal({ open: true, title: 'Updated', message: 'Resource updated.' });
            } else {
                await addDoc(collection(db, 'bitcoin_resources'), { ...payload, createdAt: serverTimestamp() });
                setModal({ open: true, title: 'Published', message: 'Resource published.' });
            }
            resetForm();
        } catch (err) {
            setModal({ open: true, title: 'Error', message: 'Operation failed.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEdit = (res) => {
        setCurrentResource(res);
        setFormData(res);
        setIsEditing(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = (res) => {
        setModal({
            open: true,
            title: 'Confirm Delete',
            message: 'Delete resource and associated image?',
            confirmAction: async () => {
                try {
                    // Delete from storage if it's a storage URL
                    if (res.imageSrc && res.imageSrc.includes('firebasestorage.googleapis.com')) {
                        try {
                            const fileRef = ref(storage, res.imageSrc);
                            await deleteObject(fileRef);
                        } catch (storageErr) {
                            console.error('Storage delete error:', storageErr);
                        }
                    }
                    await deleteDoc(doc(db, 'bitcoin_resources', res.id));
                } catch (err) {
                    console.error('Delete error:', err);
                }
            }
        });
    };

    const resetForm = () => {
        setFormData({
            title: '',
            subtitle: '',
            imageSrc: '',
            imageAlt: '',
            link: ''
        });
        setIsEditing(false);
        setCurrentResource(null);
    };

    return (
        <div className="min-h-screen pb-12">
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-yellow-500 rounded-lg">
                        <Library className="text-black" size={24} />
                    </div>
                    <h1 className="text-3xl font-bold text-white">Bitcoin Resources</h1>
                </div>
                <p className="text-sm text-gray-400 ml-14">Manage "Bitcoin Resources" grid</p>
            </div>

            <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-6 mb-8">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <Sparkles className="text-yellow-500" size={20} />
                        <h2 className="text-xl font-bold text-white">{isEditing ? 'Edit Resource' : 'Add Resource'}</h2>
                    </div>
                    {isEditing && (
                        <button onClick={resetForm} className="text-sm text-gray-400 hover:text-white flex items-center gap-1">
                            <X size={16} /> Cancel
                        </button>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Resource Title</label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleInputChange}
                            required
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-yellow-500 outline-none uppercase"
                            placeholder="e.g. BITCOIN WHITEPAPER"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Subtitle / Description</label>
                        <input
                            type="text"
                            name="subtitle"
                            value={formData.subtitle}
                            onChange={handleInputChange}
                            required
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-yellow-500 outline-none"
                            placeholder="e.g. Bitcoin whitepaper and history"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Featured Image</label>
                        <div className="flex gap-2 mb-3">
                            <button type="button" onClick={() => setImageMode('url')} className={`flex-1 py-2 rounded-lg text-xs font-bold ${imageMode === 'url' ? 'bg-yellow-500 text-black' : 'bg-white/5 text-gray-400'}`}>URL</button>
                            <button type="button" onClick={() => setImageMode('file')} className={`flex-1 py-2 rounded-lg text-xs font-bold ${imageMode === 'file' ? 'bg-yellow-500 text-black' : 'bg-white/5 text-gray-400'}`}>UPLOAD</button>
                        </div>
                        <input
                            type={imageMode === 'url' ? 'text' : 'file'}
                            name="imageSrc"
                            onChange={imageMode === 'url' ? handleInputChange : handleFileChange}
                            value={imageMode === 'url' ? formData.imageSrc : undefined}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-yellow-500 outline-none"
                            placeholder="Image URL..."
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Redirect Link (URL)</label>
                        <input
                            type="url"
                            name="link"
                            value={formData.link}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-yellow-500 outline-none transition-all"
                            placeholder="https://example.com/resource"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-4 bg-yellow-500 text-black font-black uppercase tracking-widest rounded-xl hover:bg-yellow-400 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {isSubmitting ? 'Processing...' : <><Save size={18} /> {isEditing ? 'Update Resource' : 'Publish Resource'}</>}
                    </button>
                </form>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {resources.map(res => (
                    <div key={res.id} className="relative h-[400px] overflow-hidden rounded-2xl border border-white/10 hover:border-yellow-500/50 transition-all duration-500 bg-[#111] group">
                        <img
                            src={typeof res.imageSrc === 'string' ? res.imageSrc : URL.createObjectURL(res.imageSrc)}
                            alt=""
                            className="w-full h-full object-cover opacity-60 group-hover:scale-110 group-hover:opacity-40 transition-all duration-700"
                        />

                        {/* Overlay Controls */}
                        <div className="absolute top-4 right-4 flex gap-2 z-10">
                            <button onClick={() => handleEdit(res)} className="p-2 bg-white/10 backdrop-blur-md rounded-lg hover:bg-yellow-500 hover:text-black transition-all">
                                <Edit size={16} />
                            </button>
                            <button onClick={() => handleDelete(res)} className="p-2 bg-red-500/20 backdrop-blur-md text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all">
                                <Trash2 size={16} />
                            </button>
                        </div>

                        {/* Content Overlay - Pro Style */}
                        <div className="absolute inset-0 p-6 flex flex-col justify-end bg-gradient-to-t from-black via-black/90 to-transparent">
                            <h3 className="text-xl font-bold text-white uppercase tracking-tight group-hover:text-yellow-500 transition-colors">
                                {res.title}
                            </h3>
                            <p className="text-xs text-gray-400 mt-2 line-clamp-2 leading-relaxed">
                                {res.subtitle}
                            </p>

                            <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center text-[10px] text-gray-500 font-bold uppercase tracking-widest leading-none">
                                <span>Preview Resource</span>
                                <PlusCircle className="w-3 h-3 text-yellow-500" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

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
            <ProcessingOverlay isVisible={isSubmitting} />
        </div>
    );
};

export default UploadBitcoinResources;
