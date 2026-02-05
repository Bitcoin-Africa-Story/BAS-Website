import { useState, useEffect } from 'react';
import { Edit, Trash2, Save, Users, Upload } from 'lucide-react';
import { db, storage } from '../firebase';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { toast } from 'sonner';

const UploadEducationTestimonials = () => {
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    text: '',
    image: '',
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
        const snap = await getDocs(collection(db, 'educationTestimonials'));
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.role.trim() || !formData.text.trim()) {
      openModal('Error', 'Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      let imageUrl = formData.image;

      // Upload image if it's a Blob
      if (imageUrl instanceof Blob) {
        const storageRef = ref(storage, `educationTestimonials/image_${Date.now()}`);
        await uploadBytes(storageRef, imageUrl);
        imageUrl = await getDownloadURL(storageRef);
      }

      const payload = {
        name: formData.name,
        role: formData.role,
        text: formData.text,
        image: imageUrl,
        createdAt: serverTimestamp()
      };

      if (isEditing && formData.id) {
        // Delete old image if it exists in Firebase Storage
        if (formData.image && typeof formData.image === 'string' && formData.image.includes('firebasestorage')) {
          try {
            const fileRef = ref(storage, formData.image);
            await deleteObject(fileRef);
          } catch (err) {
            console.log('Could not delete old image');
          }
        }

        await updateDoc(doc(db, 'educationTestimonials', formData.id), payload);
        setTestimonials(prev => prev.map(t => t.id === formData.id ? { ...t, ...payload, id: formData.id } : t));
        toast.success('Education testimonial updated successfully.');
      } else {
        const docRef = await addDoc(collection(db, 'educationTestimonials'), payload);
        setTestimonials(prev => [{ ...payload, id: docRef.id }, ...prev]);
        toast.success('Education testimonial created and saved to Firebase!');
      }

      // reset form
      setFormData({ name: '', role: '', text: '', image: '', id: null });
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

        await deleteDoc(doc(db, 'educationTestimonials', testimonial.id));
        setTestimonials(prev => prev.filter(t => t.id !== testimonial.id));
        openModal('Deleted', 'Testimonial deleted successfully.');
      } catch (err) {
        console.error('Error deleting testimonial:', err);
        openModal('Error', 'Error deleting testimonial: ' + (err.message || 'unknown'));
      }
    });
  };

  const handleCancel = () => {
    setFormData({ name: '', role: '', text: '', image: '', id: null });
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
            <Users className="text-yellow-500" size={32} />
            <h1 className="text-4xl font-bold text-white">Education Testimonials</h1>
          </div>
          <p className="text-gray-400">Add student testimonials and success stories from your education programs</p>
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
              <label className="block text-sm font-medium text-white mb-2">Testimonial Text</label>
              <textarea
                name="text"
                value={formData.text}
                onChange={handleChange}
                placeholder="Share the student's experience and how Bitcoin education has impacted them..."
                rows="5"
                className="w-full px-4 py-2 bg-white/5 border border-white/10 text-white rounded-lg focus:border-yellow-500 focus:outline-none placeholder-gray-500 resize-none"
              />
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

            {/* Submit Buttons */}
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 px-6 py-2 bg-yellow-500 text-black font-semibold rounded-lg hover:bg-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Save size={18} />
                {isEditing ? 'Update' : 'Add'} Testimonial
              </button>
              {isEditing && (
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex items-center gap-2 px-6 py-2 bg-gray-700 text-white font-semibold rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Testimonials List */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">Uploaded Testimonials ({testimonials.length})</h2>

          {initialLoading ? (
            <div className="text-center py-12">
              <p className="text-gray-400">Loading testimonials...</p>
            </div>
          ) : testimonials.length === 0 ? (
            <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-12 text-center">
              <Users className="mx-auto mb-3 text-gray-600" size={40} />
              <p className="text-gray-400">No testimonials yet. Add your first one!</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {testimonials.map((testimonial) => (
                <div
                  key={testimonial.id}
                  className="bg-[#0A0A0A] border border-white/10 rounded-xl p-6 hover:border-yellow-500/30 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-4 mb-3">
                        {testimonial.image && (
                          <img
                            src={testimonial.image}
                            alt={testimonial.name}
                            className="w-16 h-16 rounded-lg object-cover border border-white/10 flex-shrink-0"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-white font-semibold">{testimonial.name}</h3>
                          <p className="text-sm text-yellow-500">{testimonial.role}</p>
                          <p className="text-sm text-gray-400 mt-2 line-clamp-2">{testimonial.text}</p>
                          {testimonial.createdAt && (
                            <p className="text-xs text-gray-500 mt-2">
                              Added: {new Date(testimonial.createdAt.seconds * 1000).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleEdit(testimonial)}
                        className="p-2 text-blue-400 hover:bg-blue-400/10 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(testimonial)}
                        className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {modal.open && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#0A0A0A] border border-white/10 rounded-xl max-w-sm w-full p-6 space-y-4">
            <h2 className="text-xl font-bold text-white">{modal.title}</h2>
            <p className="text-gray-400">{modal.message}</p>
            <div className="flex gap-3 justify-end">
              {modal.confirmAction ? (
                <>
                  <button
                    onClick={closeModal}
                    className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      modal.confirmAction();
                      closeModal();
                    }}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Delete
                  </button>
                </>
              ) : (
                <button
                  onClick={closeModal}
                  className="px-4 py-2 bg-yellow-500 text-black font-semibold rounded-lg hover:bg-yellow-400 transition-colors"
                >
                  OK
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadEducationTestimonials;
