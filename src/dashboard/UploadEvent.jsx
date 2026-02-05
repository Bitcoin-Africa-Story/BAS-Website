import { useState, useEffect } from 'react';
import { PlusCircle, Edit, Trash2, Save, Calendar, Clock, MapPin } from 'lucide-react';
import { db, storage } from '../firebase';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { toast } from 'sonner';

const UploadEvent = () => {
  const [formData, setFormData] = useState({
    eventName: '',
    venue: '',
    address: '',
    date: '',
    time: '',
    description: '',
    banner: '',
    registrationUrl: '',
    id: null,
  });
  const [events, setEvents] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [modal, setModal] = useState({ open: false, title: '', message: '', confirmAction: null });
  const [initialLoading, setInitialLoading] = useState(true);
  const [imageMode, setImageMode] = useState('url');
  const [imagePreview, setImagePreview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // fetch events from Firestore
  useEffect(() => {
    let mounted = true;
    const fetchEvents = async () => {
      try {
        const snap = await getDocs(collection(db, 'events'));
        const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        if (mounted) setEvents(items);
      } catch (err) {
        console.error('Error fetching events:', err);
      } finally {
        if (mounted) setInitialLoading(false);
      }
    };
    fetchEvents();
    return () => { mounted = false; };
  }, []);

  const openModal = (title, message, confirmAction = null) => {
    setModal({ open: true, title, message, confirmAction });
  };

  const closeModal = () => setModal({ open: false, title: '', message: '', confirmAction: null });

  const compressImage = (file, maxWidth = 1200) => new Promise((resolve, reject) => {
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
        canvas.toBlob((blob) => resolve(blob), 'image/jpeg', 0.8);
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
      setFormData(prev => ({ ...prev, banner: compressedBlob }));
      setImagePreview(URL.createObjectURL(compressedBlob));
    } catch (err) {
      console.error('Image compression error', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      let bannerUrl = formData.banner;
      if (bannerUrl instanceof Blob) {
        const storageRef = ref(storage, `events/banner_${Date.now()}`);
        await uploadBytes(storageRef, bannerUrl);
        bannerUrl = await getDownloadURL(storageRef);
      }

      const payload = {
        eventName: formData.eventName,
        venue: formData.venue,
        address: formData.address,
        date: formData.date,
        time: formData.time,
        description: formData.description,
        banner: bannerUrl,
        registrationUrl: formData.registrationUrl || '',
        createdAt: serverTimestamp()
      };

      if (isEditing && formData.id) {
        await updateDoc(doc(db, 'events', formData.id), payload);
        setEvents(prev => prev.map(ev => ev.id === formData.id ? { ...ev, ...payload, id: formData.id } : ev));
        toast.success('Event updated successfully.');
      } else {
        const ref = await addDoc(collection(db, 'events'), payload);
        setEvents(prev => [{ ...payload, id: ref.id }, ...prev]);
        toast.success('Event created and saved to Firebase!');
      }
      // reset form
      setFormData({ eventName: '', venue: '', address: '', date: '', time: '', description: '', banner: '', registrationUrl: '', id: null });
      setImagePreview('');
      setIsEditing(false);
    } catch (err) {
      console.error('Error saving event:', err);
      toast.error('Error saving event: ' + (err.message || 'unknown'));
    } finally {
      setIsSubmitting(false);
    }
  };


  const handleEdit = (event) => {
    setFormData({ ...event });
    setIsEditing(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (event) => {
    openModal('Confirm Delete', 'Are you sure you want to delete this event and its banner?', async () => {
      try {
        if (event.banner && event.banner.includes('firebasestorage.googleapis.com')) {
          try {
            const fileRef = ref(storage, event.banner);
            await deleteObject(fileRef);
          } catch (storageErr) {
            console.error('Storage delete error:', storageErr);
          }
        }
        await deleteDoc(doc(db, 'events', event.id));
        setEvents(prev => prev.filter(ev => ev.id !== event.id));
        closeModal();
      } catch (err) {
        console.error('Error deleting event:', err);
        openModal('Error', 'Failed to delete event. See console for details.');
      }
    });
  };

  return (
    <div className="pb-20">
      {/* Header */}
      <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black mb-2 tracking-tight">Events <span className="text-yellow-500">Manager</span></h1>
          <p className="text-sm text-gray-400">Schedule and manage community events and meetups.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-1 gap-12">
        {/* Form Section */}
        <section className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-yellow-500/10 to-transparent rounded-[2rem] blur opacity-0 group-hover:opacity-100 transition duration-1000"></div>
          <div className="relative bg-[#0A0A0A] border border-white/5 rounded-[2rem] overflow-hidden shadow-2xl">
            <div className="p-8 md:p-10">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-yellow-500/10 rounded-2xl text-yellow-500 border border-yellow-500/20">
                    <Calendar size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">{isEditing ? 'Edit Event Details' : 'Create New Event'}</h2>
                    <p className="text-xs text-gray-400 mt-1">Organize your next Bitcoin meetup or workshop.</p>
                  </div>
                </div>
                {isEditing && (
                  <button
                    onClick={() => { setIsEditing(false); setFormData({ eventName: '', venue: '', address: '', date: '', time: '', description: '', banner: '', registrationUrl: '', id: null }); }}
                    className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm font-semibold text-gray-400 hover:text-white transition-all flex items-center gap-2"
                  >
                    Cancel Edit
                  </button>
                )}
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 ml-1">Event Name</label>
                    <input
                      type="text"
                      name="eventName"
                      value={formData.eventName}
                      onChange={handleChange}
                      required
                      className="w-full px-6 py-4 bg-black/40 border border-white/5 rounded-2xl text-white focus:outline-none focus:border-yellow-500/50 transition-all placeholder:text-gray-700"
                      placeholder="e.g. Lagos Bitcoin Meetup"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 ml-1">Venue Name</label>
                    <input
                      type="text"
                      name="venue"
                      value={formData.venue}
                      onChange={handleChange}
                      required
                      className="w-full px-6 py-4 bg-black/40 border border-white/5 rounded-2xl text-white focus:outline-none focus:border-yellow-500/50 transition-all placeholder:text-gray-700"
                      placeholder="e.g. Innovation Hub"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 ml-1">Physical Address</label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      required
                      className="w-full px-6 py-4 bg-black/40 border border-white/5 rounded-2xl text-white focus:outline-none focus:border-yellow-500/50 transition-all placeholder:text-gray-700"
                      placeholder="e.g. 123 Freedom Way, Victoria Island"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 ml-1">Date</label>
                      <input
                        type="date"
                        name="date"
                        value={formData.date}
                        onChange={handleChange}
                        required
                        className="w-full px-6 py-4 bg-black/40 border border-white/5 rounded-2xl text-white focus:outline-none focus:border-yellow-500/50 transition-all invert brightness-200"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 ml-1">Time</label>
                      <input
                        type="text"
                        name="time"
                        value={formData.time}
                        onChange={handleChange}
                        required
                        placeholder="e.g. 6:00 PM"
                        className="w-full px-6 py-4 bg-black/40 border border-white/5 rounded-2xl text-white focus:outline-none focus:border-yellow-500/50 transition-all placeholder:text-gray-700"
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 ml-1">Event Link (optional)</label>
                    <input
                      type="url"
                      name="registrationUrl"
                      value={formData.registrationUrl}
                      onChange={handleChange}
                      placeholder="https://register.example.com/your-event"
                      className="w-full px-6 py-4 bg-black/40 border border-white/5 rounded-2xl text-white focus:outline-none focus:border-yellow-500/50 transition-all placeholder:text-gray-700"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 ml-1">Event Banner Image</label>
                    <div className="flex gap-2 mb-4">
                      <button
                        type="button"
                        onClick={() => setImageMode('url')}
                        className={`flex-1 py-3 rounded-2xl text-[10px] font-black tracking-widest transition-all ${imageMode === 'url' ? 'bg-yellow-500 text-black' : 'bg-white/5 text-gray-400'}`}
                      >
                        URL LINK
                      </button>
                      <button
                        type="button"
                        onClick={() => setImageMode('file')}
                        className={`flex-1 py-3 rounded-2xl text-[10px] font-black tracking-widest transition-all ${imageMode === 'file' ? 'bg-yellow-500 text-black' : 'bg-white/5 text-gray-400'}`}
                      >
                        UPLOAD FILE
                      </button>
                    </div>
                    {imageMode === 'url' ? (
                      <input
                        type="url"
                        name="banner"
                        value={formData.banner instanceof Blob ? '' : formData.banner}
                        onChange={handleChange}
                        required
                        className="w-full px-6 py-4 bg-black/40 border border-white/5 rounded-2xl text-white focus:outline-none focus:border-yellow-500/50 transition-all placeholder:text-gray-700 font-mono text-sm"
                        placeholder="https://images.unsplash.com/..."
                      />
                    ) : (
                      <input
                        type="file"
                        onChange={handleFileChange}
                        accept="image/*"
                        className="w-full px-6 py-4 bg-black/40 border border-white/5 rounded-2xl text-white focus:outline-none focus:border-yellow-500/50 transition-all font-mono text-sm"
                      />
                    )}
                    {imagePreview && (
                      <div className="mt-4 rounded-xl overflow-hidden border border-white/10 h-32">
                        <img src={imagePreview} className="w-full h-full object-cover" alt="Preview" />
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 ml-1">Event Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    rows="4"
                    className="w-full px-6 py-4 bg-black/40 border border-white/5 rounded-2xl text-white focus:outline-none focus:border-yellow-500/50 transition-all resize-none placeholder:text-gray-700 leading-relaxed font-light"
                    placeholder="Tell everyone what this event is about..."
                  />
                </div>

                <div className="pt-4 flex gap-4">
                  <button type="submit" disabled={isSubmitting} className="flex-1 px-8 py-4 bg-yellow-500 text-black font-black text-lg rounded-2xl hover:bg-yellow-400 transition-all duration-300 hover:scale-[1.02] flex items-center justify-center shadow-xl shadow-yellow-500/10 disabled:opacity-50">
                    <Save size={20} className="mr-2" />
                    {isSubmitting ? 'PROCESSING...' : (isEditing ? 'Update Event Info' : 'Publish Event')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </section>

        {/* List Section */}
        <section className="space-y-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-black italic uppercase tracking-tighter">Posted <span className="text-yellow-500">Events</span></h2>
            <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-black text-gray-500 tracking-widest">{events.length} UPCOMING</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {initialLoading ? (
              <div className="col-span-2 py-20 text-center bg-[#0A0A0A] border border-white/5 border-dashed rounded-[3rem]">
                <div className="w-10 h-10 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Fetching events...</p>
              </div>
            ) : (
              <>
                {events.map(ev => (
                  <div key={ev.id} className="group bg-[#0A0A0A] border border-white/5 rounded-[2rem] overflow-hidden hover:border-white/20 transition-all duration-500">
                    <div className="h-40 bg-gray-800 relative overflow-hidden">
                      <img src={ev.banner} alt={ev.eventName} className="w-full h-full object-cover opacity-60 group-hover:opacity-80 group-hover:scale-110 transition-all duration-700" />
                      <div className="absolute top-4 left-4 bg-yellow-500 text-black text-[10px] font-black px-2 py-1 rounded-md shadow-lg">{ev.date}</div>
                    </div>
                    <div className="p-6 flex flex-col justify-between h-48">
                      <div>
                        <h3 className="text-xl font-bold mb-2 group-hover:text-yellow-500 transition-all line-clamp-1 italic">{ev.eventName}</h3>
                        <div className="flex items-start gap-4 text-xs text-gray-500">
                          <div className="flex items-center gap-1.5"><Clock size={12} className="text-yellow-500" /> {ev.time}</div>
                          <div className="flex items-center gap-1.5 line-clamp-1"><MapPin size={12} className="text-yellow-500" /> {ev.venue}</div>
                        </div>
                      </div>

                      <div className="flex gap-3 pt-4 border-t border-white/5 mt-auto">
                        <button onClick={() => handleEdit(ev)} className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white/5 text-gray-300 border border-white/5 rounded-xl hover:bg-yellow-500 hover:text-black hover:border-transparent transition-all duration-300 text-[10px] font-black">
                          <Edit size={12} /> MANAGE
                        </button>
                        <button onClick={() => handleDelete(ev)} className="px-4 py-3 bg-red-500/5 text-red-500 border border-red-500/10 rounded-xl hover:bg-red-500 hover:text-white transition-all duration-300">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {events.length === 0 && (
                  <div className="col-span-2 py-20 text-center bg-[#0A0A0A] border border-white/5 border-dashed rounded-[3rem]">
                    <p className="text-gray-500 font-bold uppercase tracking-widest">No active events</p>
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      </div>

      {/* Modal */}
      {modal.open && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={closeModal}></div>
          <div className="relative bg-[#0A0A0A] border border-white/10 rounded-[2.5rem] p-10 w-full max-w-md shadow-2xl text-center">
            <h3 className="text-2xl font-black mb-3 italic uppercase tracking-tighter text-yellow-500">{modal.title}</h3>
            <p className="text-gray-400 mb-8 leading-relaxed font-light">{modal.message}</p>
            <div className="flex gap-4">
              {modal.confirmAction ? (
                <>
                  <button onClick={closeModal} className="flex-1 px-4 py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-bold">CANCEL</button>
                  <button onClick={modal.confirmAction} className="flex-1 px-4 py-4 bg-red-500 text-white rounded-2xl font-bold shadow-xl shadow-red-500/20">DELETE</button>
                </>
              ) : (
                <button onClick={closeModal} className="w-full py-4 bg-yellow-500 text-black rounded-2xl font-black text-lg hover:bg-yellow-400">CONTINUE</button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadEvent;
