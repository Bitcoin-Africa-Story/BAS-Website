import { useState, useEffect } from 'react';
import { Edit, Trash2, Save, Twitter, Heart, Link as LinkIcon } from 'lucide-react';
import { db, storage } from '../firebase';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { toast } from 'sonner';

const UploadTestimonials = () => {
  const MAX_TEXT_LENGTH = 280; // Character limit for testimonial text
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    text: '',
    image: '',
    twitterLink: '',
    id: null,
  });
  const [testimonials, setTestimonials] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [modal, setModal] = useState({ open: false, title: '', message: '', confirmAction: null });
  const [initialLoading, setInitialLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageMode, setImageMode] = useState('url');
  const [imagePreview, setImagePreview] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

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
      openModal('Error', 'Failed to process image');
    } finally {
      setIsSubmitting(false);
    }
  };

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

  // fetch testimonials from Firestore
  useEffect(() => {
    let mounted = true;
    const fetchTestimonials = async () => {
      try {
        const snap = await getDocs(collection(db, 'testimonials'));
        const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        if (mounted) setTestimonials(items);
      } catch (err) {
        console.error('Error fetching testimonials:', err);
      } finally {
        if (mounted) setInitialLoading(false);
      }
    };
    fetchTestimonials();
    return () => { mounted = false; };
  }, []);

  const openModal = (title, message, confirmAction = null) => {
    setModal({ open: true, title, message, confirmAction });
  };

  const closeModal = () => setModal({ open: false, title: '', message: '', confirmAction: null });

  const validateTwitterLink = (link) => {
    if (!link.trim()) return true; // Optional field
    return link.includes('twitter.com') || link.includes('x.com');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.role.trim() || !formData.text.trim()) {
      openModal('Error', 'Please fill in all required fields (Name, Role, and Text)');
      return;
    }

    if (formData.text.length > MAX_TEXT_LENGTH) {
      openModal('Error', `Testimonial text is too long. Maximum ${MAX_TEXT_LENGTH} characters allowed.`);
      return;
    }

    if (formData.twitterLink.trim() && !validateTwitterLink(formData.twitterLink)) {
      openModal('Error', 'Please enter a valid Twitter/X post link (twitter.com or x.com)');
      return;
    }

    setIsSubmitting(true);
    try {
      let imageUrl = formData.image;

      // Upload image if it's a Blob
      if (imageUrl instanceof Blob) {
        const storageRef = ref(storage, `testimonials/image_${Date.now()}`);
        await uploadBytes(storageRef, imageUrl);
        imageUrl = await getDownloadURL(storageRef);
      }

      const payload = {
        name: formData.name,
        role: formData.role,
        text: formData.text,
        image: imageUrl || '', // Ensure image is always a string, not undefined
        twitterLink: formData.twitterLink || '', // Ensure twitterLink is always a string
        createdAt: serverTimestamp()
      };

      if (isEditing && formData.id) {
        // Delete old image if it exists in Firebase Storage and we're replacing it
        if (formData.image && typeof formData.image === 'string' && formData.image.includes('firebasestorage') && imageUrl !== formData.image) {
          try {
            const fileRef = ref(storage, formData.image);
            await deleteObject(fileRef);
          } catch (err) {
            console.log('Could not delete old image');
          }
        }

        await updateDoc(doc(db, 'testimonials', formData.id), payload);
        setTestimonials(prev => prev.map(t => t.id === formData.id ? { ...t, ...payload, id: formData.id } : t));
        toast.success('Testimonial updated successfully.');
      } else {
        const docRef = await addDoc(collection(db, 'testimonials'), payload);
        setTestimonials(prev => [{ ...payload, id: docRef.id }, ...prev]);
        toast.success('Testimonial created and saved to Firebase!');
      }

      // reset form
      setFormData({ name: '', role: '', text: '', image: '', twitterLink: '', id: null });
      setImagePreview('');
      setImageMode('url');
      setIsEditing(false);
    } catch (err) {
      console.error('Error saving testimonial:', err);
      toast.error('Error saving testimonial: ' + (err.message || 'unknown'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (testimonial) => {
    setFormData({
      name: testimonial.name,
      role: testimonial.role,
      text: testimonial.text,
      image: testimonial.image,
      twitterLink: testimonial.twitterLink || '',
      id: testimonial.id
    });
    setImagePreview(testimonial.image);
    setImageMode('url');
    setIsEditing(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (testimonial) => {
    openModal('Confirm Delete', 'Are you sure you want to delete this testimonial?', async () => {
      try {
        // Delete image from storage if it exists
        if (testimonial.image && testimonial.image.includes('firebasestorage.googleapis.com')) {
          try {
            const fileRef = ref(storage, testimonial.image);
            await deleteObject(fileRef);
          } catch (err) {
            console.log('Could not delete image from storage');
          }
        }

        await deleteDoc(doc(db, 'testimonials', testimonial.id));
        setTestimonials(prev => prev.filter(t => t.id !== testimonial.id));
        openModal('Deleted', 'Testimonial deleted successfully.');
      } catch (err) {
        console.error('Error deleting testimonial:', err);
        openModal('Error', 'Error deleting testimonial: ' + (err.message || 'unknown'));
      }
    });
  };

  const handleCancel = () => {
    setFormData({ name: '', role: '', text: '', image: '', twitterLink: '', id: null });
    setImagePreview('');
    setImageMode('url');
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-black p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Twitter className="text-yellow-500" size={32} />
            <h1 className="text-4xl font-bold text-white">X Testimonials Manager</h1>
          </div>
          <p className="text-gray-400">Add student testimonials and link them to their original X posts</p>
        </div>

        {/* Form Section */}
        <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6 mb-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Input */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">Student Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., Amara O."
                className="w-full px-4 py-2 bg-white/5 border border-white/10 text-white rounded-lg focus:border-yellow-500 focus:outline-none placeholder-gray-500"
              />
            </div>

            {/* Role/Location Input */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">Role / Location</label>
              <input
                type="text"
                name="role"
                value={formData.role}
                onChange={handleChange}
                placeholder="e.g., Lagos, Nigeria or Community Leader"
                className="w-full px-4 py-2 bg-white/5 border border-white/10 text-white rounded-lg focus:border-yellow-500 focus:outline-none placeholder-gray-500"
              />
              <p className="text-xs text-gray-500 mt-1">Can be a location or role</p>
            </div>

            {/* Testimonial Text */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-white">Testimonial Text</label>
                <span className={`text-xs ${formData.text.length > MAX_TEXT_LENGTH ? 'text-red-500 font-bold' :
                  formData.text.length > MAX_TEXT_LENGTH * 0.9 ? 'text-yellow-500' :
                    'text-gray-500'
                  }`}>
                  {formData.text.length}/{MAX_TEXT_LENGTH}
                </span>
              </div>
              <textarea
                name="text"
                value={formData.text}
                onChange={handleChange}
                maxLength={MAX_TEXT_LENGTH}
                placeholder="Share the student's experience and how Bitcoin has impacted them..."
                rows="5"
                className="w-full px-4 py-2 bg-white/5 border border-white/10 text-white rounded-lg focus:border-yellow-500 focus:outline-none placeholder-gray-500 resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">Keep it concise to maintain card layout</p>
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">Student Image (Optional)</label>
              <div className="flex gap-2 mb-4">
                <button
                  type="button"
                  onClick={() => setImageMode('url')}
                  className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${imageMode === 'url' ? 'bg-yellow-500 text-black' : 'bg-gray-700 text-gray-400'
                    }`}
                >
                  URL
                </button>
                <button
                  type="button"
                  onClick={() => setImageMode('file')}
                  className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${imageMode === 'file' ? 'bg-yellow-500 text-black' : 'bg-gray-700 text-gray-400'
                    }`}
                >
                  Upload
                </button>
              </div>

              {imageMode === 'url' ? (
                <input
                  type="url"
                  name="image"
                  value={formData.image}
                  onChange={handleChange}
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 text-white rounded-lg focus:border-yellow-500 focus:outline-none placeholder-gray-500"
                />
              ) : (
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 text-white rounded-lg focus:border-yellow-500 focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-yellow-500 file:text-black file:cursor-pointer"
                />
              )}

              {imagePreview && (
                <div className="mt-4">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-20 h-20 rounded-lg object-cover border border-white/10"
                  />
                </div>
              )}
            </div>

            {/* Twitter Link Input */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                <LinkIcon size={14} className="inline mr-2 text-yellow-500" />
                Original X Post Link (Optional)
              </label>
              <input
                type="text"
                name="twitterLink"
                value={formData.twitterLink}
                onChange={handleChange}
                placeholder="https://x.com/user/status/..."
                className="w-full px-4 py-2 bg-white/5 border border-white/10 text-white rounded-lg focus:border-yellow-500 focus:outline-none placeholder-gray-500"
              />
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-yellow-500 text-black font-bold rounded-xl hover:bg-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <Save size={18} />
                {isEditing ? 'Update' : 'Add'} Testimonial
              </button>
              {isEditing && (
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-6 py-3 bg-gray-800 text-white font-bold rounded-xl hover:bg-gray-700 transition-all"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Testimonials List */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Active Testimonials ({testimonials.length})</h2>
          </div>

          {initialLoading ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-400">Loading your success stories...</p>
            </div>
          ) : testimonials.length === 0 ? (
            <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-12 text-center">
              <Heart className="mx-auto mb-3 text-gray-600" size={40} />
              <p className="text-gray-400">No testimonials yet. Share your movement's impact!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {testimonials.map((testimonial) => (
                <div
                  key={testimonial.id}
                  className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-2xl hover:border-yellow-500/30 transition-all group p-6"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-yellow-500 flex-shrink-0 flex items-center justify-center text-black font-bold">
                        {testimonial.image ? (
                          <img src={testimonial.image} alt={testimonial.name} className="w-full h-full object-cover" />
                        ) : (
                          testimonial.name ? testimonial.name[0] : 'U'
                        )}
                      </div>
                      <div className="ml-3">
                        <h3 className="text-white font-semibold">{testimonial.name}</h3>
                        <p className="text-xs text-yellow-500">{testimonial.role}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(testimonial)}
                        className="p-2 bg-black/40 text-blue-400 hover:text-blue-300 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(testimonial)}
                        className="p-2 bg-black/40 text-red-400 hover:text-red-300 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <p className="text-gray-300 text-sm italic mb-4">"{testimonial.text}"</p>

                  <div className="pt-4 border-t border-white/5">
                    {testimonial.twitterLink && (
                      <a
                        href={testimonial.twitterLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-yellow-500 text-[10px] hover:underline truncate block mb-1 font-mono"
                      >
                        {testimonial.twitterLink}
                      </a>
                    )}
                    {testimonial.createdAt && (
                      <p className="text-[10px] text-gray-500 uppercase tracking-widest">
                        Added {new Date(testimonial.createdAt.seconds * 1000).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {
        modal.open && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
              <h2 className="text-xl font-bold text-white">{modal.title}</h2>
              <p className="text-gray-400 text-sm leading-relaxed">{modal.message}</p>
              <div className="flex gap-3 justify-end pt-2">
                {modal.confirmAction ? (
                  <>
                    <button
                      onClick={closeModal}
                      className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        modal.confirmAction();
                        closeModal();
                      }}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-bold"
                    >
                      Delete
                    </button>
                  </>
                ) : (
                  <button
                    onClick={closeModal}
                    className="px-8 py-2 bg-yellow-500 text-black font-bold rounded-lg hover:bg-yellow-400 transition-colors"
                  >
                    Got it
                  </button>
                )}
              </div>
            </div>
          </div>
        )
      }
    </div >
  );
};

export default UploadTestimonials;
