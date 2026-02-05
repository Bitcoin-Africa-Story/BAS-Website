import { useState, useEffect, useRef } from 'react';
import { PlusCircle, Edit, Trash2, Save, X, Newspaper, Calendar, Eye, Tag, User, Clock, Link2, UploadCloud, FileText, CheckCircle, Sparkles, Linkedin, Twitter } from 'lucide-react';
import { categories } from '../mock';
import { db, storage } from '../firebase';
import { collection, addDoc, getDocs, deleteDoc, updateDoc, doc, serverTimestamp, query, orderBy, onSnapshot } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { toast } from 'sonner';
import { useNews } from '../context/NewsContext';
import StatusModal from './components/StatusModal';
import NewsPreviewModal from './components/NewsPreviewModal';
import ProcessingOverlay from './components/ProcessingOverlay';
import NewsListItem from './components/NewsListItem';
import ReactQuill, { Quill } from 'react-quill';
import 'react-quill/dist/quill.snow.css';

// Add custom size options
const fontSizeArr = ['10px', '12px', '14px', '16px', '18px', '20px', '24px', '30px', '36px', '48px'];
var Size = Quill.import('attributors/style/size');
Size.whitelist = fontSizeArr;
Quill.register(Size, true);

// Add custom font support
var Font = Quill.import('attributors/style/font');
Font.whitelist = [false, 'serif', 'monospace', 'Montserrat'];
Quill.register(Font, true);

// Custom styles for the size picker to show values
const quillSizeStyles = `
  .ql-snow .ql-picker.ql-size .ql-picker-label::before,
  .ql-snow .ql-picker.ql-size .ql-picker-item::before {
    content: attr(data-value) !important;
  }
  .ql-snow .ql-picker.ql-size .ql-picker-label[data-value="10px"]::before,
  .ql-snow .ql-picker.ql-size .ql-picker-item[data-value="10px"]::before { content: "10px" !important; }
  .ql-snow .ql-picker.ql-size .ql-picker-label[data-value="12px"]::before,
  .ql-snow .ql-picker.ql-size .ql-picker-item[data-value="12px"]::before { content: "12px" !important; }
  .ql-snow .ql-picker.ql-size .ql-picker-label[data-value="14px"]::before,
  .ql-snow .ql-picker.ql-size .ql-picker-item[data-value="14px"]::before { content: "14px" !important; }
  .ql-snow .ql-picker.ql-size .ql-picker-label[data-value="16px"]::before,
  .ql-snow .ql-picker.ql-size .ql-picker-item[data-value="16px"]::before { content: "16px" !important; }
  .ql-snow .ql-picker.ql-size .ql-picker-label[data-value="18px"]::before,
  .ql-snow .ql-picker.ql-size .ql-picker-item[data-value="18px"]::before { content: "18px" !important; }
  .ql-snow .ql-picker.ql-size .ql-picker-label[data-value="20px"]::before,
  .ql-snow .ql-picker.ql-size .ql-picker-item[data-value="20px"]::before { content: "20px" !important; }
  .ql-snow .ql-picker.ql-size .ql-picker-label[data-value="24px"]::before,
  .ql-snow .ql-picker.ql-size .ql-picker-item[data-value="24px"]::before { content: "24px" !important; }
  .ql-snow .ql-picker.ql-size .ql-picker-label[data-value="30px"]::before,
  .ql-snow .ql-picker.ql-size .ql-picker-item[data-value="30px"]::before { content: "30px" !important; }
  .ql-snow .ql-picker.ql-size .ql-picker-label[data-value="36px"]::before,
  .ql-snow .ql-picker.ql-size .ql-picker-item[data-value="36px"]::before { content: "36px" !important; }
  .ql-snow .ql-picker.ql-size .ql-picker-label[data-value="48px"]::before,
  .ql-snow .ql-picker.ql-size .ql-picker-item[data-value="48px"]::before { content: "48px" !important; }

  /* Font Labels */
  .ql-snow .ql-picker.ql-font .ql-picker-label::before,
  .ql-snow .ql-picker.ql-font .ql-picker-item::before {
    content: "Sans Serif" !important;
  }
  .ql-snow .ql-picker.ql-font .ql-picker-label[data-value="serif"]::before,
  .ql-snow .ql-picker.ql-font .ql-picker-item[data-value="serif"]::before {
    content: "Serif" !important;
    font-family: serif !important;
  }
  .ql-snow .ql-picker.ql-font .ql-picker-label[data-value="monospace"]::before,
  .ql-snow .ql-picker.ql-font .ql-picker-item[data-value="monospace"]::before {
    content: "Monospace" !important;
    font-family: monospace !important;
  }
  .ql-snow .ql-picker.ql-font .ql-picker-label[data-value="Montserrat"]::before,
  .ql-snow .ql-picker.ql-font .ql-picker-item[data-value="Montserrat"]::before {
    content: "Montserrat" !important;
    font-family: 'Montserrat', sans-serif !important;
  }

  /* Restore Editor Height */
  .ql-container.ql-snow {
    min-height: 250px;
    border-bottom-left-radius: 0.75rem;
    border-bottom-right-radius: 0.75rem;
  }
  .ql-editor {
    min-height: 250px;
  }
`;

const UploadNews = () => {
  const { news: blogPosts, loading: isInitialLoading, loadMore, loadingMore, hasMore } = useNews();
  const [isEditing, setIsEditing] = useState(false);
  const [currentPost, setCurrentPost] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const quillRef = useRef(null);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    category: 'Adoption',
    image: '',
    author: 'Bitcoin Educator',
    authorImage: '',
    authorLinkedIn: '',
    authorX: '',
    date: new Date().toISOString().split('T')[0],
    readTime: '5 min read',
    youtubeUrl: '',
    // New flags for editorial picks
    isPopular: false,
    isTopStory: false
  });

  const [imageMode, setImageMode] = useState('url');
  const [imagePreview, setImagePreview] = useState('');
  const [authorImageMode, setAuthorImageMode] = useState('url');
  const [authorImagePreview, setAuthorImagePreview] = useState('');
  const [modal, setModal] = useState({ open: false, title: '', message: '', confirmAction: null });
  const [detailModal, setDetailModal] = useState({ open: false, post: null });
  // TRACKING: Prevent auto-slug updates if user manually typed one
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

  // Add tooltips to editor toolbar
  useEffect(() => {
    const addTooltips = () => {
      const toolbar = document.querySelector('.ql-toolbar');
      if (!toolbar) return;

      const tooltips = {
        'ql-bold': 'Bold',
        'ql-italic': 'Italic',
        'ql-underline': 'Underline',
        'ql-strike': 'Strike',
        'ql-link': 'Link',
        'ql-image': 'Insert Image',
        'ql-video': 'Insert Video',
        'ql-blockquote': 'Blockquote',
        'ql-code-block': 'Code Block',
        'ql-clean': 'Remove Formatting',
        'ql-indent[value="-1"]': 'Decrease Indent',
        'ql-indent[value="+1"]': 'Increase Indent',
        'ql-list[value="ordered"]': 'Numbered List',
        'ql-list[value="bullet"]': 'Bullet List',
        'ql-align': 'Alignment',
        'ql-header': 'Heading Level',
        'ql-size': 'Font Size',
        'ql-color': 'Text Color',
        'ql-background': 'Background Color',
        'ql-script[value="sub"]': 'Subscript',
        'ql-script[value="super"]': 'Superscript'
      };

      Object.entries(tooltips).forEach(([selector, text]) => {
        const elements = toolbar.querySelectorAll(`.${selector}`);
        elements.forEach(el => {
          if (!el.getAttribute('title')) {
            el.setAttribute('title', text);
          }
        });
      });
    };

    // Small delay to ensure editor is rendered
    const timer = setTimeout(addTooltips, 500);
    return () => clearTimeout(timer);
  }, [isInitialLoading]);

  // Compress image and return as Blob
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

    // SAFETY CHECK: Prevent massive files from freezing the browser
    if (file.size > 10 * 1024 * 1024) {
      setModal({
        open: true,
        title: 'File Too Large',
        message: 'Please upload an image smaller than 10MB to ensure smooth performance.'
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const compressedBlob = await compressImage(file);
      setFormData(prev => ({ ...prev, image: compressedBlob }));
      setImagePreview(URL.createObjectURL(compressedBlob));
    } catch (err) {
      console.error('Image compression error', err);
      setModal({
        open: true,
        title: 'Error',
        message: 'Failed to process image. Try a different file.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAuthorFileChange = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setModal({
        open: true,
        title: 'File Too Large',
        message: 'Author image must be smaller than 5MB.'
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const compressedBlob = await compressImage(file, 300); // Author images can be smaller
      setFormData(prev => ({ ...prev, authorImage: compressedBlob }));
      setAuthorImagePreview(URL.createObjectURL(compressedBlob));
    } catch (err) {
      console.error('Author image compression error', err);
    } finally {
      setIsSubmitting(false);
    }
  };



  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));

    // If user manually edits slug, stop auto-updates
    if (name === 'slug') {
      setSlugManuallyEdited(true);
    }

    // Auto-generate slug from title ONLY if not manually edited
    if (name === 'title' && !slugManuallyEdited && !isEditing) {
      const slug = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      setFormData(prev => ({ ...prev, slug }));
    }
    if (name === 'image' && imageMode === 'url') {
      setImagePreview(value);
    }
    if (name === 'authorImage' && authorImageMode === 'url') {
      setAuthorImagePreview(value);
    }
  };

  const handleContentChange = (content) => {
    setFormData(prev => ({
      ...prev,
      content
    }));
  };

  // Helper: Handle Image Upload to Firebase
  const handleImageUpload = async (file, quill) => {
    try {
      // Save cursor position
      const range = quill.getSelection(true);
      const cursorPosition = range ? range.index : (quill.getLength() || 0);

      // Compress the image
      const compressedBlob = await compressImage(file, 1200);

      // Upload to Firebase Storage
      const timestamp = Date.now();
      const sanitizedFileName = file.name ? file.name.replace(/[^a-zA-Z0-9.]/g, '_') : 'pasted_image.png';
      const fileName = `content_${timestamp}_${sanitizedFileName}`;
      const storageRef = ref(storage, `news/content_images/${fileName}`);

      await uploadBytes(storageRef, compressedBlob);
      const imageUrl = await getDownloadURL(storageRef);

      // Insert image URL into editor
      quill.insertEmbed(cursorPosition, 'image', imageUrl);
      quill.setSelection(cursorPosition + 1);
    } catch (error) {
      console.error('Error uploading image:', error);
      setModal({
        open: true,
        title: 'Upload Failed',
        message: 'Failed to upload image to storage. Please try again.'
      });
    }
  };

  // Custom image handler for Toolbar Button
  const imageHandler = useRef(() => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();

    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;

      const quill = quillRef.current?.getEditor();
      if (quill) {
        await handleImageUpload(file, quill);
      }
    };
  }).current;

  // Handle Paste Events
  useEffect(() => {
    // Retry finding the editor a few times if it's not ready immediately
    const attachPasteHandler = () => {
      const quill = quillRef.current?.getEditor();
      if (!quill) return;

      const handlePaste = async (e) => {
        const clipboardData = e.clipboardData || window.clipboardData;
        const items = clipboardData?.items;

        if (items) {
          for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf('image') !== -1) {
              e.preventDefault(); // Prevent default base64 paste
              const file = items[i].getAsFile();
              if (file) {
                // Prevent huge pastes
                if (file.size > 10 * 1024 * 1024) {
                  setModal({
                    open: true,
                    title: 'Paste Failed',
                    message: 'Image is too large (max 10MB).'
                  });
                  return;
                }
                await handleImageUpload(file, quill);
              }
              return;
            }
          }
        }
      };

      quill.root.removeEventListener('paste', handlePaste); // Cleanup potential duplicates
      quill.root.addEventListener('paste', handlePaste);

      // Return cleanup function for this specific attachment
      return () => {
        quill.root.removeEventListener('paste', handlePaste);
      };
    };

    // Attempt to attach when loading is done
    if (!isInitialLoading) {
      const cleanup = attachPasteHandler();
      return cleanup;
    }
  }, [isInitialLoading, quillRef.current]); // Re-run when loading is done or ref changes

  const modules = {
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
        [{ 'font': [false, 'serif', 'monospace', 'Montserrat'] }],
        [{ 'size': fontSizeArr }],
        [{ 'align': [] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'script': 'sub' }, { 'script': 'super' }],
        ['blockquote', 'code-block'],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
        ['link', 'image', 'video'],
        ['clean']
      ],
      handlers: {
        image: imageHandler
      }
    }
  };

  const formats = [
    'header', 'font', 'size',
    'bold', 'italic', 'underline', 'strike',
    'color', 'background',
    'script',
    'blockquote', 'code-block',
    'list', 'bullet', 'indent',
    'align',
    'link', 'image', 'video'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const { id, _doc, ...sanitizedData } = formData;
    const payload = {
      ...sanitizedData,
      image: sanitizedData.image || imagePreview,
      updatedAt: serverTimestamp()
    };

    try {
      // Upload Images to Firebase Storage if they are Blobs
      let imageUrl = formData.image;
      let authorImageUrl = formData.authorImage;

      // Helper to upload if Blob
      const uploadIfFile = async (fileOrUrl, path) => {
        if (fileOrUrl instanceof Blob) {
          const storageRef = ref(storage, path);
          await uploadBytes(storageRef, fileOrUrl);
          return await getDownloadURL(storageRef);
        }
        return fileOrUrl;
      };

      if (imageUrl instanceof Blob) {
        imageUrl = await uploadIfFile(imageUrl, `news/featured_${Date.now()}`);
      }

      if (authorImageUrl instanceof Blob) {
        authorImageUrl = await uploadIfFile(authorImageUrl, `authors/author_${Date.now()}`);
      }

      const finalPayload = {
        ...sanitizedData,
        image: imageUrl,
        authorImage: authorImageUrl,
        updatedAt: serverTimestamp()
      };

      if (isEditing && currentPost) {
        const postRef = doc(db, 'news', currentPost.id);

        // Handle image cleanup if URLs changed (Basic implementation)
        // For a full implementation, we'd compare old and new URLs and delete the old ones from Storage

        await updateDoc(postRef, finalPayload);

        toast.success('The article has been updated successfully and is now live.');
      } else {
        if (!finalPayload.image) {
          toast.error('Please provide a featured image URL or upload a local file to proceed.');
          setIsSubmitting(false);
          return;
        }
        await addDoc(collection(db, 'news'), { ...finalPayload, createdAt: serverTimestamp() });

        toast.success('Your news article has been successfully published and is now live for the community.');
      }
      resetForm();
    } catch (err) {
      console.error('Publication Error:', err);
      toast.error('We encountered an unexpected issue. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (post) => {
    setCurrentPost(post);
    setFormData(post);
    setIsEditing(true);
    setImagePreview(post.image);
    setAuthorImagePreview(post.authorImage || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleView = (post) => {
    setDetailModal({ open: true, post });
  };

  const handleDelete = async (post) => {
    setModal({
      open: true,
      title: 'Confirm Delete',
      message: 'Are you sure you want to delete this post? This will also remove associated images from storage.',
      confirmAction: async () => {
        try {
          // Delete images from Storage if they exist
          const deleteStorageFile = async (url) => {
            if (!url) return;

            try {
              // Only attempt deletion for Firebase Storage URLs
              if (url.includes('firebasestorage.googleapis.com')) {
                const fileRef = ref(storage, url);
                await deleteObject(fileRef);
              }
            } catch (storageErr) {
              // Log but don't stop the main deletion process
              console.warn('Could not delete file from storage (might already be gone):', url, storageErr);
            }
          };

          if (post.image) await deleteStorageFile(post.image);
          if (post.authorImage) await deleteStorageFile(post.authorImage);

          await deleteDoc(doc(db, 'news', post.id));
          toast.success('Blog post deleted successfully.');
        } catch (err) {
          toast.error('Error deleting: ' + (err.message || 'unknown'));
        }
      }
    });
  };

  const resetForm = () => {
    setFormData({
      title: '',
      slug: '',
      excerpt: '',
      content: '',
      category: 'Adoption',
      image: '',
      author: 'Bitcoin Educator',
      authorImage: '',
      authorLinkedIn: '',
      authorX: '',
      date: new Date().toISOString().split('T')[0],
      readTime: '5 min read',
      youtubeUrl: '',
      isPopular: false,
      isTopStory: false
    });
    setImagePreview('');
    setAuthorImagePreview('');
    setIsEditing(false);
    setCurrentPost(null);
  };

  return (
    <div className="min-h-screen pb-12">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg">
            <Newspaper className="text-black" size={24} />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            News Manager
          </h1>
        </div>
        <p className="text-sm text-gray-400 ml-14">Manage and publish articles for your community</p>
      </div>

      {/* Form Card */}
      <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-2xl p-6 mb-8 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-yellow-500/10 rounded-xl border border-yellow-500/20">
              {isEditing ? <Edit className="text-yellow-500" size={20} /> : <Sparkles className="text-yellow-500" size={20} />}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{isEditing ? 'Edit Article' : 'Create New Article'}</h2>
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
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">Article Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder:text-gray-600 focus:outline-none focus:border-yellow-500/50 focus:ring-2 focus:ring-yellow-500/20 transition-all"
              placeholder="Enter your article title..."
            />
          </div>

          {/* Row 1: Category, Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-yellow-500/50 focus:ring-2 focus:ring-yellow-500/20 transition-all"
              >
                {categories.filter(cat => cat !== 'All').map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">Publish Date</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-yellow-500/50 focus:ring-2 focus:ring-yellow-500/20 transition-all"
              />
            </div>
          </div>

          {/* Row 2: Author, Read Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">Author</label>
              <input
                type="text"
                name="author"
                value={formData.author}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder:text-gray-600 focus:outline-none focus:border-yellow-500/50 focus:ring-2 focus:ring-yellow-500/20 transition-all"
                placeholder="Author name"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">Read Time</label>
              <input
                type="text"
                name="readTime"
                value={formData.readTime}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder:text-gray-600 focus:outline-none focus:border-yellow-500/50 focus:ring-2 focus:ring-yellow-500/20 transition-all"
                placeholder="e.g. 5 min read"
              />
            </div>
          </div>

          {/* Row 3: Author Media & Socials */}
          <div className="bg-gray-800/20 border border-gray-800 rounded-2xl p-5 space-y-6">
            <h3 className="text-xs font-black text-yellow-500 uppercase tracking-[0.2em] flex items-center gap-2">
              <User size={14} /> Author Profile Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">Author Profile Image</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setAuthorImageMode('url')}
                    className={`flex-1 py-2 px-4 rounded-lg text-[10px] font-black uppercase transition-all ${authorImageMode === 'url' ? 'bg-yellow-500 text-black' : 'bg-gray-800 text-gray-400'}`}
                  >
                    URL
                  </button>
                  <button
                    type="button"
                    onClick={() => setAuthorImageMode('file')}
                    className={`flex-1 py-2 px-4 rounded-lg text-[10px] font-black uppercase transition-all ${authorImageMode === 'file' ? 'bg-yellow-500 text-black' : 'bg-gray-800 text-gray-400'}`}
                  >
                    Upload
                  </button>
                </div>
                <input
                  type={authorImageMode === 'url' ? 'url' : 'file'}
                  name="authorImage"
                  onChange={authorImageMode === 'url' ? handleInputChange : handleAuthorFileChange}
                  value={authorImageMode === 'url' ? formData.authorImage : undefined}
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white text-xs focus:ring-1 focus:ring-yellow-500/50 transition-all"
                  placeholder="Author profile image URL..."
                  accept={authorImageMode === 'file' ? "image/*" : undefined}
                />
                {authorImagePreview && (
                  <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-yellow-500/20">
                    <img src={authorImagePreview} alt="Author" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">LinkedIn Profile</label>
                  <input
                    type="url"
                    name="authorLinkedIn"
                    value={formData.authorLinkedIn}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white text-sm focus:ring-1 focus:ring-yellow-500/50 transition-all placeholder:text-gray-700"
                    placeholder="https://linkedin.com/in/..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">X (Twitter) Profile</label>
                  <input
                    type="url"
                    name="authorX"
                    value={formData.authorX}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white text-sm focus:ring-1 focus:ring-yellow-500/50 transition-all placeholder:text-gray-700"
                    placeholder="https://x.com/..."
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Slug */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">URL Slug</label>
            <input
              type="text"
              name="slug"
              value={formData.slug}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-yellow-500/70 font-mono text-sm focus:outline-none focus:border-yellow-500/50 focus:ring-2 focus:ring-yellow-500/20 transition-all"
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">Featured Image</label>
            <div className="flex gap-2 mb-3">
              <button
                type="button"
                onClick={() => setImageMode('url')}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${imageMode === 'url'
                  ? 'bg-yellow-500 text-black'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
              >
                URL
              </button>
              <button
                type="button"
                onClick={() => setImageMode('file')}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${imageMode === 'file'
                  ? 'bg-yellow-500 text-black'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
              >
                Upload
              </button>
            </div>
            <input
              type={imageMode === 'url' ? 'url' : 'file'}
              name="image"
              onChange={imageMode === 'url' ? handleInputChange : handleFileChange}
              value={imageMode === 'url' ? formData.image : undefined}
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:border-yellow-500/50 focus:ring-2 focus:ring-yellow-500/20 transition-all"
              placeholder={imageMode === 'url' ? 'https://example.com/image.jpg' : ''}
              accept={imageMode === 'file' ? "image/*" : undefined}
            />
          </div>

          {/* Excerpt */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">Excerpt</label>
            <textarea
              name="excerpt"
              value={formData.excerpt}
              onChange={handleInputChange}
              rows="3"
              required
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder:text-gray-600 focus:outline-none focus:border-yellow-500/50 focus:ring-2 focus:ring-yellow-500/20 transition-all resize-none"
              placeholder="Brief summary of the article..."
            />
          </div>

          {/* Editorial Picks: Popular / Top Story */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                name="isPopular"
                checked={formData.isPopular}
                onChange={handleInputChange}
                className="w-4 h-4 rounded"
              />
              <span className="text-sm text-gray-300">Mark as <strong className="text-yellow-500">Popular Post</strong></span>
            </label>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                name="isTopStory"
                checked={formData.isTopStory}
                onChange={handleInputChange}
                className="w-4 h-4 rounded"
              />
              <span className="text-sm text-gray-300">Mark as <strong className="text-yellow-500">Top Story</strong></span>
            </label>
          </div>

          {/* YouTube Video URL (Optional) */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider flex items-center gap-2">
              <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
              YouTube Video URL (Optional)
            </label>
            <input
              type="url"
              name="youtubeUrl"
              value={formData.youtubeUrl}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder:text-gray-600 focus:outline-none focus:border-yellow-500/50 focus:ring-2 focus:ring-yellow-500/20 transition-all"
              placeholder="https://www.youtube.com/watch?v=..."
            />
            <p className="text-xs text-gray-500 mt-2">Add a YouTube video to embed in your article (optional)</p>
          </div>

          {/* Content with Preview */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">Content</label>
              <div className="quill-editor-container">
                <ReactQuill
                  ref={quillRef}
                  theme="snow"
                  value={formData.content}
                  onChange={handleContentChange}
                  modules={modules}
                  formats={formats}
                  className="bg-gray-800/50 border border-gray-700 rounded-xl text-white overflow-hidden"
                />
              </div>
            </div>

            {imagePreview && (
              <div className="lg:col-span-1">
                <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">Preview</label>
                <div className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700">
                  <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover" />
                  <div className="p-4">
                    <span className="text-xs font-bold text-yellow-500 uppercase">{formData.category}</span>
                    <p className="text-sm font-semibold text-white mt-1 line-clamp-2">{formData.title || 'Article Title'}</p>
                  </div>
                </div>
              </div>
            )}
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
                  {isEditing ? 'Update Article' : 'Publish Article'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Articles List */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-white">Published Articles</h2>
            <p className="text-sm text-gray-500">{blogPosts.length} total articles</p>
          </div>
        </div>

        {isInitialLoading ? (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-16 text-center">
            <div className="w-12 h-12 border-4 border-yellow-500/30 border-t-yellow-500 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-500 text-sm">Loading articles...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {blogPosts.map((post) => (
              <NewsListItem
                key={post.id}
                post={post}
                onView={handleView}
                onEdit={handleEdit}
                onDelete={() => handleDelete(post)}
              />
            ))}

            {blogPosts.length === 0 && (
              <div className="bg-gray-900 border border-gray-800 border-dashed rounded-2xl p-16 text-center">
                <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Newspaper size={32} className="text-gray-600" />
                </div>
                <p className="text-gray-400 font-semibold mb-1">No articles yet</p>
                <p className="text-sm text-gray-600">Create your first article above</p>
              </div>
            )}

            {hasMore && (
              <div className="pt-6 text-center">
                <button
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="px-6 py-3 bg-gray-900 border border-gray-800 text-white text-xs font-bold uppercase tracking-widest hover:border-yellow-500/50 transition-all flex items-center gap-2 mx-auto disabled:opacity-50"
                >
                  {loadingMore ? (
                    <div className="w-4 h-4 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <PlusCircle size={14} className="text-yellow-500" />
                  )}
                  {loadingMore ? 'Loading More...' : 'Load More Articles'}
                </button>
              </div>
            )}
          </div>
        )}
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

      <StatusModal
        open={modal.open && !modal.confirmAction}
        title={modal.title}
        message={modal.message}
        onClose={() => setModal({ open: false, title: '', message: '', confirmAction: null })}
      />

      <NewsPreviewModal
        open={detailModal.open}
        post={detailModal.post}
        onClose={() => setDetailModal({ open: false, post: null })}
      />

      <style>{quillSizeStyles}</style>
      <ProcessingOverlay isVisible={isSubmitting} />
    </div>
  );
};

export default UploadNews;
