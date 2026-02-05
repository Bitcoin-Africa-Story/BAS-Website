import { useState, useEffect } from 'react';
import { PlusCircle, Edit, Trash2, Save, X, BookOpen, Clock, Tag, Sparkles, UploadCloud } from 'lucide-react';
import { db, storage } from '../firebase';
import { collection, addDoc, getDocs, deleteDoc, updateDoc, doc, serverTimestamp, query, orderBy, onSnapshot } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { toast } from 'sonner';
import StatusModal from './components/StatusModal';
import ProcessingOverlay from './components/ProcessingOverlay';

const UploadEducationPrograms = () => {
    const [isEditing, setIsEditing] = useState(false);
    const [currentProgram, setCurrentProgram] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [programs, setPrograms] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const [formData, setFormData] = useState({
        title: '',
        level: 'BEGINNER',
        price: 'FREE',
        duration: '',
        image: '',
        desc: '',
        link: ''
    });

    const [imageMode, setImageMode] = useState('url');
    const [imagePreview, setImagePreview] = useState('');
    const [modal, setModal] = useState({ open: false, title: '', message: '' });

    useEffect(() => {
        const q = query(collection(db, 'education_programs'), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const programsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setPrograms(programsData);
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
            setFormData(prev => ({ ...prev, image: compressedBlob }));
            setImagePreview(URL.createObjectURL(compressedBlob));
        } catch (err) {
            console.error('Image compression error', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (name === 'image' && imageMode === 'url') {
            setImagePreview(value);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            // Upload to Storage if Blob
            let imageUrl = formData.image;
            if (imageUrl instanceof Blob) {
                const storageRef = ref(storage, `education/prog_${Date.now()}`);
                await uploadBytes(storageRef, imageUrl);
                imageUrl = await getDownloadURL(storageRef);
            }

            const payload = {
                ...formData,
                image: imageUrl,
                updatedAt: serverTimestamp()
            };

            if (isEditing && currentProgram) {
                await updateDoc(doc(db, 'education_programs', currentProgram.id), payload);
                toast.success('The education program has been updated successfully.');
            } else {
                await addDoc(collection(db, 'education_programs'), { ...payload, createdAt: serverTimestamp() });
                toast.success('New education program has been published.');
            }
            resetForm();
        } catch (err) {
            console.error('Error:', err);
            toast.error('Failed to save the program.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEdit = (program) => {
        setCurrentProgram(program);
        setFormData(program);
        setIsEditing(true);
        setImagePreview(program.image);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = (program) => {
        setModal({
            open: true,
            title: 'Confirm Delete',
            message: 'Delete this program and its associated image?',
            confirmAction: async () => {
                try {
                    // Delete from storage if it's a storage URL
                    if (program.image && program.image.includes('firebasestorage.googleapis.com')) {
                        try {
                            const fileRef = ref(storage, program.image);
                            await deleteObject(fileRef);
                        } catch (storageErr) {
                            console.error('Storage delete error:', storageErr);
                        }
                    }
                    await deleteDoc(doc(db, 'education_programs', program.id));
                } catch (err) {
                    console.error('Delete error:', err);
                }
            }
        });
    };

    const resetForm = () => {
        setFormData({
            title: '',
            level: 'BEGINNER',
            price: 'FREE',
            duration: '',
            image: '',
            desc: ''
        });
        setImagePreview('');
        setIsEditing(false);
        setCurrentProgram(null);
    };

    return (
        <div className="min-h-screen pb-12">
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-yellow-500 rounded-lg">
                        <BookOpen className="text-black" size={24} />
                    </div>
                    <h1 className="text-3xl font-bold text-white">Education Programs</h1>
                </div>
                <p className="text-sm text-gray-400 ml-14">Manage "New to Bitcoin?" programs section</p>
            </div>

            <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-6 mb-8">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <Sparkles className="text-yellow-500" size={20} />
                        <h2 className="text-xl font-bold text-white">{isEditing ? 'Edit Program' : 'New Program'}</h2>
                    </div>
                    {isEditing && (
                        <button onClick={resetForm} className="text-sm text-gray-400 hover:text-white flex items-center gap-1">
                            <X size={16} /> Cancel
                        </button>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Program Title</label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleInputChange}
                            required
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-yellow-500 outline-none transition-all"
                            placeholder="e.g. BITCOIN DIPLOMA"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Level</label>
                            <select
                                name="level"
                                value={formData.level}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-yellow-500 outline-none"
                            >
                                <option value="BEGINNER">BEGINNER</option>
                                <option value="INTERMEDIATE">INTERMEDIATE</option>
                                <option value="ADVANCED">ADVANCED</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Price</label>
                            <select
                                name="price"
                                value={formData.price}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-yellow-500 outline-none"
                            >
                                <option value="FREE">FREE</option>
                                <option value="PAID">PAID</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Duration</label>
                            <input
                                type="text"
                                name="duration"
                                value={formData.duration}
                                onChange={handleInputChange}
                                required
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-yellow-500 outline-none"
                                placeholder="e.g. 4 Weeks"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Featured Image</label>
                        <div className="flex gap-2 mb-3">
                            <button
                                type="button"
                                onClick={() => setImageMode('url')}
                                className={`flex-1 py-2 rounded-lg text-xs font-bold ${imageMode === 'url' ? 'bg-yellow-500 text-black' : 'bg-white/5 text-gray-400'}`}
                            >URL</button>
                            <button
                                type="button"
                                onClick={() => setImageMode('file')}
                                className={`flex-1 py-2 rounded-lg text-xs font-bold ${imageMode === 'file' ? 'bg-yellow-500 text-black' : 'bg-white/5 text-gray-400'}`}
                            >UPLOAD</button>
                        </div>
                        <input
                            type={imageMode === 'url' ? 'text' : 'file'}
                            name="image"
                            onChange={imageMode === 'url' ? handleInputChange : handleFileChange}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-yellow-500 outline-none"
                            placeholder="Image URL..."
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Description</label>
                        <textarea
                            name="desc"
                            value={formData.desc}
                            onChange={handleInputChange}
                            rows="3"
                            required
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-yellow-500 outline-none resize-none"
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
                            placeholder="https://example.com/course"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-4 bg-yellow-500 text-black font-black uppercase tracking-widest rounded-xl hover:bg-yellow-400 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {isSubmitting ? 'Processing...' : <><Save size={18} /> {isEditing ? 'Update Program' : 'Publish Program'}</>}
                    </button>
                </form>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {programs.map(program => (
                    <div key={program.id} className="relative h-[400px] overflow-hidden rounded-2xl border border-white/10 hover:border-yellow-500/50 transition-all duration-500 bg-[#111] group">
                        <img
                            src={program.image}
                            alt=""
                            className="w-full h-full object-cover opacity-60 group-hover:scale-110 group-hover:opacity-40 transition-all duration-700"
                        />

                        {/* Overlay Controls */}
                        <div className="absolute top-4 right-4 flex gap-2 z-10">
                            <button onClick={() => handleEdit(program)} className="p-2 bg-white/10 backdrop-blur-md rounded-lg hover:bg-yellow-500 hover:text-black transition-all">
                                <Edit size={16} />
                            </button>
                            <button onClick={() => handleDelete(program)} className="p-2 bg-red-500/20 backdrop-blur-md text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all">
                                <Trash2 size={16} />
                            </button>
                        </div>

                        {/* Content Overlay - Pro Style */}
                        <div className="absolute inset-0 p-6 flex flex-col justify-end bg-gradient-to-t from-black via-black/80 to-transparent">
                            <span className="text-[10px] font-bold text-yellow-500 uppercase mb-2">
                                {program.level} | {program.price}
                            </span>
                            <h3 className="text-xl font-bold text-white uppercase tracking-tight group-hover:text-yellow-500 transition-colors">
                                {program.title}
                            </h3>
                            <p className="text-xs text-gray-400 mt-2 line-clamp-2 leading-relaxed">
                                {program.desc}
                            </p>

                            <div className="flex items-center gap-4 mt-4 pt-4 border-t border-white/10">
                                <div className="flex items-center gap-1.5 text-[10px] text-gray-400 uppercase font-bold">
                                    <Clock className="w-3 h-3 text-yellow-500" />
                                    {program.duration}
                                </div>
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

export default UploadEducationPrograms;
