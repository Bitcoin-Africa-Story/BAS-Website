import { useState, useEffect } from 'react';
import { PlusCircle, Edit, Trash2, Save, X, Video, Sparkles, UploadCloud, PlayCircle } from 'lucide-react';
import { db, storage } from '../firebase';
import { collection, addDoc, getDocs, deleteDoc, updateDoc, doc, serverTimestamp, query, orderBy, onSnapshot } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import StatusModal from './components/StatusModal';
import ProcessingOverlay from './components/ProcessingOverlay';

const UploadBitcoinVideos = () => {
    const [isEditing, setIsEditing] = useState(false);
    const [currentVideo, setCurrentVideo] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [videos, setVideos] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const [modal, setModal] = useState({ open: false, title: '', message: '', confirmAction: null });

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        duration: '',
        embedUrl: '',
        thumbnailUrl: '',
        category: 'PROTOCOL'
    });

    const [imageMode, setImageMode] = useState('url');

    useEffect(() => {
        const q = query(collection(db, 'bitcoin_videos'), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const videosData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setVideos(videosData);
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
            setFormData(prev => ({ ...prev, thumbnailUrl: compressedBlob }));
        } catch (err) {
            console.error('Image compression error', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // Upload to Storage if Blob
            let thumbUrl = formData.thumbnailUrl;
            if (thumbUrl instanceof Blob) {
                const storageRef = ref(storage, `videos/thumb_${Date.now()}`);
                await uploadBytes(storageRef, thumbUrl);
                thumbUrl = await getDownloadURL(storageRef);
            }

                    // Normalize/embed URL if user pasted a watch or short URL
            const normalizeEmbed = (url) => {
                if (!url) return url;
                const u = url.trim();
                const watchMatch = u.match(/[?&]v=([\w-_-]+)/);
                if (watchMatch && watchMatch[1]) return `https://www.youtube.com/embed/${watchMatch[1]}`;
                const shortMatch = u.match(/youtu\.be\/(\w[-\w]*)/i);
                if (shortMatch && shortMatch[1]) return `https://www.youtube.com/embed/${shortMatch[1]}`;
                return u;
            };

            const payload = {
                ...formData,
                embedUrl: normalizeEmbed(formData.embedUrl),
                thumbnailUrl: thumbUrl,
                updatedAt: serverTimestamp()
            };
            if (isEditing && currentVideo) {
                await updateDoc(doc(db, 'bitcoin_videos', currentVideo.id), payload);
                setModal({ open: true, title: 'Updated', message: 'Video entry updated.' });
            } else {
                await addDoc(collection(db, 'bitcoin_videos'), { ...payload, createdAt: serverTimestamp() });
                setModal({ open: true, title: 'Published', message: 'New video added to library.' });
            }
            resetForm();
        } catch (err) {
            setModal({ open: true, title: 'Error', message: 'Failed to save.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEdit = (video) => {
        setCurrentVideo(video);
        setFormData(video);
        setIsEditing(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = (video) => {
        setModal({
            open: true,
            title: 'Confirm Delete',
            message: 'Delete video and its thumbnail?',
            confirmAction: async () => {
                try {
                    // Delete from storage if it's a storage URL
                    if (video.thumbnailUrl && video.thumbnailUrl.includes('firebasestorage.googleapis.com')) {
                        try {
                            const fileRef = ref(storage, video.thumbnailUrl);
                            await deleteObject(fileRef);
                        } catch (storageErr) {
                            console.error('Storage delete error:', storageErr);
                        }
                    }
                    await deleteDoc(doc(db, 'bitcoin_videos', video.id));
                } catch (err) {
                    console.error('Delete error:', err);
                }
            }
        });
    };

    const resetForm = () => {
        setFormData({
            title: '',
            description: '',
            duration: '',
            embedUrl: '',
            thumbnailUrl: '',
            category: 'PROTOCOL'
        });
        setIsEditing(false);
        setCurrentVideo(null);
    };

    return (
        <div className="min-h-screen pb-12">
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-yellow-500 rounded-lg">
                        <Video className="text-black" size={24} />
                    </div>
                    <h1 className="text-3xl font-bold text-white">Video Library</h1>
                </div>
                <p className="text-sm text-gray-400 ml-14">Manage "Bitcoin Video Library" section</p>
            </div>

            <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-6 mb-8">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <Sparkles className="text-yellow-500" size={20} />
                        <h2 className="text-xl font-bold text-white">{isEditing ? 'Edit Video' : 'Add New Video'}</h2>
                    </div>
                    {isEditing && (
                        <button onClick={resetForm} className="text-sm text-gray-400 hover:text-white flex items-center gap-1">
                            <X size={16} /> Cancel
                        </button>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Video Title</label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleInputChange}
                            required
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-yellow-500 outline-none uppercase"
                            placeholder="e.g. 01 / THE GENESIS BLOCK"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Module / Category</label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-yellow-500 outline-none"
                            >
                                <option value="PROTOCOL">PROTOCOL</option>
                                <option value="ADOPTION">ADOPTION</option>
                                <option value="SECURITY">SECURITY</option>
                                <option value="ECONOMICS">ECONOMICS</option>
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
                                placeholder="e.g. 40:05"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Embed URL (YouTube)</label>
                        <input
                            type="url"
                            name="embedUrl"
                            value={formData.embedUrl}
                            onChange={handleInputChange}
                            required
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-yellow-500 outline-none"
                            placeholder="https://www.youtube.com/embed/..."
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Thumbnail (URL or Upload)</label>
                        <div className="flex gap-2 mb-3">
                            <button type="button" onClick={() => setImageMode('url')} className={`flex-1 py-2 rounded-lg text-xs font-bold ${imageMode === 'url' ? 'bg-yellow-500 text-black' : 'bg-white/5 text-gray-400'}`}>URL</button>
                            <button type="button" onClick={() => setImageMode('file')} className={`flex-1 py-2 rounded-lg text-xs font-bold ${imageMode === 'file' ? 'bg-yellow-500 text-black' : 'bg-white/5 text-gray-400'}`}>UPLOAD</button>
                        </div>
                        <input
                            type={imageMode === 'url' ? 'text' : 'file'}
                            name="thumbnailUrl"
                            onChange={imageMode === 'url' ? handleInputChange : handleFileChange}
                            value={imageMode === 'url' ? formData.thumbnailUrl : undefined}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-yellow-500 outline-none"
                            placeholder="Thumbnail Image URL..."
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Description</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            rows="3"
                            required
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-yellow-500 outline-none resize-none"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-4 bg-yellow-500 text-black font-black uppercase tracking-widest rounded-xl hover:bg-yellow-400 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {isSubmitting ? 'Processing...' : <><Save size={18} /> {isEditing ? 'Update Video' : 'Add to Curriculum'}</>}
                    </button>
                </form>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {videos.map(video => (
                    <div key={video.id} className="relative h-[240px] overflow-hidden rounded-2xl border border-white/10 hover:border-yellow-500/50 transition-all duration-500 bg-[#111] group">
                        <img
                            src={typeof video.thumbnailUrl === 'string' ? video.thumbnailUrl : URL.createObjectURL(video.thumbnailUrl)}
                            alt=""
                            className="w-full h-full object-cover opacity-50 group-hover:scale-110 group-hover:opacity-30 transition-all duration-700"
                        />

                        {/* Play Icon Centered */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <PlayCircle size={48} className="text-white opacity-40 group-hover:opacity-100 group-hover:scale-110 transition-all" />
                        </div>

                        {/* Overlay Controls */}
                        <div className="absolute top-4 right-4 flex gap-2 z-10">
                            <button onClick={() => handleEdit(video)} className="p-2 bg-white/10 backdrop-blur-md rounded-lg hover:bg-yellow-500 hover:text-black transition-all">
                                <Edit size={16} />
                            </button>
                            <button onClick={() => handleDelete(video)} className="p-2 bg-red-500/20 backdrop-blur-md text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all">
                                <Trash2 size={16} />
                            </button>
                        </div>

                        {/* Content Overlay */}
                        <div className="absolute inset-0 p-5 flex flex-col justify-end bg-gradient-to-t from-black via-black/80 to-transparent">
                            <span className="text-[10px] font-bold text-yellow-500 uppercase mb-1">
                                {video.category} | {video.duration}
                            </span>
                            <h3 className="text-sm font-bold text-white uppercase tracking-tight truncate group-hover:text-yellow-500 transition-colors">
                                {video.title}
                            </h3>
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

export default UploadBitcoinVideos;
