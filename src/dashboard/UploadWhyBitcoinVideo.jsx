import { useState, useEffect } from 'react';
import { PlusCircle, Edit, Trash2, Save, X, PlayCircle, Video, Sparkles } from 'lucide-react';
import { db } from '../firebase';
import { collection, addDoc, getDocs, deleteDoc, updateDoc, doc, serverTimestamp, onSnapshot } from 'firebase/firestore';
import StatusModal from './components/StatusModal';
import ProcessingOverlay from './components/ProcessingOverlay';

const UploadWhyBitcoinVideo = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [current, setCurrent] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [videoLoading, setVideoLoading] = useState(true);
  const [modal, setModal] = useState({ open: false, title: '', message: '', confirmAction: null });

  const [formData, setFormData] = useState({
    title: '',
    embedUrl: '',
    videoId: '',
    thumbnailUrl: ''
  });

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'whyBitcoinVideo'), (snapshot) => {
      const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setCurrent(docs[0] || null);
      setVideoLoading(false);
    }, (err) => {
      console.error('Why video fetch error', err);
      setVideoLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const normalizeEmbed = (url) => {
    if (!url) return '';
    const u = url.trim();
    const watchMatch = u.match(/[?&]v=([\w-_-]+)/);
    if (watchMatch && watchMatch[1]) return `https://www.youtube.com/embed/${watchMatch[1]}`;
    const shortMatch = u.match(/youtu\.be\/(\w[-\w]*)/i);
    if (shortMatch && shortMatch[1]) return `https://www.youtube.com/embed/${shortMatch[1]}`;
    // if user pasted embed URL already
    if (u.includes('youtube.com/embed')) return u;
    return u;
  };

  const extractVideoId = (url) => {
    if (!url) return '';
    const m = url.match(/(?:embed\/|v=|youtu\.be\/)([\w-]+)/);
    return m ? m[1] : '';
  };

  const handleInput = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.embedUrl && !formData.videoId) {
      setModal({ open: true, title: 'Missing', message: 'Please provide a YouTube URL or video ID.' });
      return;
    }

    if (!isEditing && current) {
      setModal({ open: true, title: 'One Video Only', message: 'A Why Bitcoin video already exists. Delete it before adding a new one.' });
      return;
    }

    setIsSubmitting(true);
    try {
      const embedUrl = normalizeEmbed(formData.embedUrl || formData.videoId);
      const payload = {
        ...formData,
        embedUrl,
        videoId: extractVideoId(embedUrl) || formData.videoId,
        updatedAt: serverTimestamp()
      };

      if (isEditing && current) {
        await updateDoc(doc(db, 'whyBitcoinVideo', current.id), payload);
        setModal({ open: true, title: 'Updated', message: 'Why Bitcoin video updated.' });
      } else {
        await addDoc(collection(db, 'whyBitcoinVideo'), { ...payload, createdAt: serverTimestamp() });
        setModal({ open: true, title: 'Added', message: 'Why Bitcoin video published.' });
      }

      setFormData({ title: '', embedUrl: '', videoId: '', thumbnailUrl: '' });
      setIsEditing(false);
    } catch (err) {
      console.error('Save error', err);
      setModal({ open: true, title: 'Error', message: 'Failed to save video.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (video) => {
    setIsEditing(true);
    setFormData({ title: video.title || '', embedUrl: video.embedUrl || '', videoId: video.videoId || '', thumbnailUrl: video.thumbnailUrl || '' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async () => {
    if (!current) return;
    // show confirm modal
    setModal({
      open: true,
      title: 'Confirm Delete',
      message: 'Are you sure you want to delete the Why Bitcoin video?',
      confirmAction: async () => {
        try {
          await deleteDoc(doc(db, 'whyBitcoinVideo', current.id));
          setModal({ open: true, title: 'Deleted', message: 'Why Bitcoin video removed.' });
        } catch (err) {
          console.error('Delete error', err);
          setModal({ open: true, title: 'Error', message: 'Could not delete video.' });
        }
      }
    });
  };

  return (
    <div className="min-h-screen pb-12">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-yellow-500 rounded-lg">
            <PlayCircle className="text-black" size={24} />
          </div>
          <h1 className="text-3xl font-bold text-white">Why Bitcoin Video</h1>
        </div>
        {current && (
          <div className="flex items-center gap-2">
            <button onClick={() => handleEdit(current)} className="px-4 py-2 bg-white/5 rounded-lg hover:bg-yellow-500 hover:text-black">Edit</button>
            <button onClick={handleDelete} className="px-4 py-2 bg-red-500/20 rounded-lg hover:bg-red-500 hover:text-white">Delete</button>
          </div>
        )}
      </div>

      <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-6 mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Sparkles className="text-yellow-500" size={20} />
          <h2 className="text-xl font-bold">{isEditing ? 'Edit Why Video' : 'Add Why Bitcoin Video'}</h2>
        </div>

        {current && (
          <div className="mb-4 rounded-lg overflow-hidden border border-white/5">
            <div className="relative aspect-video bg-black">
              <iframe src={current.embedUrl || `https://www.youtube.com/embed/${current.videoId}`} title="preview" className="w-full h-full" frameBorder="0" allowFullScreen />
            </div>
            <div className="p-4 bg-[#050505]">
              <h3 className="font-bold">Currently Published</h3>
              <p className="text-sm text-gray-400">{current.title || current.videoId}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Title (optional)</label>
            <input name="title" value={formData.title} onChange={handleInput} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl" placeholder="A short title" />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">YouTube URL or Video ID</label>
            <input name="embedUrl" value={formData.embedUrl} onChange={handleInput} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl" placeholder="https://www.youtube.com/watch?v=... or dQw4w9WgXcQ" />
          </div>

          <div className="flex gap-2">
            <button type="submit" disabled={isSubmitting} className="px-6 py-3 bg-yellow-500 rounded-lg font-bold hover:bg-yellow-400 disabled:opacity-50">{isSubmitting ? 'Saving...' : (isEditing ? 'Update Video' : 'Add Video')}</button>
            <button type="button" onClick={() => { setFormData({ title: '', embedUrl: '', videoId: '', thumbnailUrl: '' }); setIsEditing(false); }} className="px-6 py-3 bg-white/5 rounded-lg">Reset</button>
          </div>

          {current && !isEditing && (
            <p className="text-sm text-gray-400">Only one Why Bitcoin video is allowed. Delete the existing one to add another.</p>
          )}
        </form>
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

export default UploadWhyBitcoinVideo;
