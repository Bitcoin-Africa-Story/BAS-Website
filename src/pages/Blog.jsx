import { useState, useMemo } from 'react';
// import { Link } from 'react-router-dom';
import { Search, Calendar, Clock, Save, AlertCircle, CheckCircle, PlusCircle, User } from 'lucide-react';
import { blogPosts as mockPosts, categories } from '../mock';
import { PostsGrid } from '../components/sections';
// import { collection, getDocs } from 'firebase/firestore';
import Autoplay from "embla-carousel-autoplay";
import { Carousel, CarouselContent, CarouselItem } from "../components/ui/carousel";
import ScrollToTop from '../components/ScrollToTop';
import { useNews } from '../context/NewsContext';
import { newsService } from '../services/newsService';
import { db, storage } from '../firebase';
import { serverTimestamp, addDoc, collection } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import ReactQuill, { Quill } from 'react-quill';
import 'react-quill/dist/quill.snow.css';

// Add custom size options
const fontSizeArr = ['10px', '12px', '14px', '16px', '18px', '20px', '24px', '30px', '36px', '48px'];
var Size = Quill.import('attributors/style/size');
Size.whitelist = fontSizeArr;
Quill.register(Size, true);

// Custom styles for the size picker to show values (Exact same as UploadNews.jsx)
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
`;

const Blog = () => {
  const { news: posts, loading } = useNews();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [imageMode, setImageMode] = useState('url');
  const [imagePreview, setImagePreview] = useState('');
  const [authorImageMode, setAuthorImageMode] = useState('url');
  const [authorImagePreview, setAuthorImagePreview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [submitError, setSubmitError] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    category: '',
    date: new Date().toISOString().split('T')[0],
    readTime: '',
    image: '',
    excerpt: '',
    content: '',
    authorName: '',
    authorImage: '',
    authorLinkedIn: '',
    authorX: '',
    youtubeUrl: ''
  });

  const filteredPosts = posts.filter(post => {
    const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
    const matchesSearch = (post.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (post.excerpt || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Group posts by category to support the 'All' view that shows categorized sections
  const groupedPosts = useMemo(() => {
    return posts.reduce((acc, post) => {
      const cat = post.category || 'Uncategorized';
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(post);
      return acc;
    }, {});
  }, [posts]);

  const categoriesToShow = (categories && categories.length > 0)
    ? categories.filter(c => c !== 'All')
    : Object.keys(groupedPosts);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
      ...(name === 'title' && { slug: value.toLowerCase().replace(/\s+/g, '-') })
    }));
  };

  const handleContentChange = (content) => {
    setFormData(prev => ({
      ...prev,
      content
    }));
  };

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      [{ 'font': [] }],
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

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (5MB max)
    const maxSizeInBytes = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSizeInBytes) {
      setSubmitError('Image file must not be more than 5MB');
      return;
    }

    setImagePreview(URL.createObjectURL(file));
    setFormData(prev => ({ ...prev, image: file }));
    setSubmitError('');
  };

  const handleAuthorFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (5MB max)
    const maxSizeInBytes = 5 * 1024 * 1024;
    if (file.size > maxSizeInBytes) {
      setSubmitError('Image file must not be more than 5MB');
      return;
    }

    setAuthorImagePreview(URL.createObjectURL(file));
    setFormData(prev => ({ ...prev, authorImage: file }));
    setSubmitError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError('');
    setSubmitMessage('');

    try {
      if (!formData.title || !formData.category || !formData.date || !formData.excerpt || !formData.content || !formData.authorName) {
        setSubmitError('Please fill in all required fields');
        setIsSubmitting(false);
        return;
      }

      // Upload to Storage if Blob
      let imageUrl = formData.image;
      if (imageUrl instanceof Blob) {
        const storageRef = ref(storage, `submissions/sub_${Date.now()}`);
        await uploadBytes(storageRef, imageUrl);
        imageUrl = await getDownloadURL(storageRef);
      }

      let authorImageUrl = formData.authorImage;
      if (authorImageUrl instanceof Blob) {
        const authorStorageRef = ref(storage, `submissions/author_${Date.now()}`);
        await uploadBytes(authorStorageRef, authorImageUrl);
        authorImageUrl = await getDownloadURL(authorStorageRef);
      }

      const submittedData = {
        title: formData.title,
        slug: formData.slug,
        category: formData.category,
        date: formData.date,
        readTime: formData.readTime || '5 min read',
        image: imageUrl,
        excerpt: formData.excerpt,
        content: formData.content,
        authorName: formData.authorName,
        authorImage: authorImageUrl || '',
        authorLinkedIn: formData.authorLinkedIn || '',
        authorX: formData.authorX || '',
        youtubeUrl: formData.youtubeUrl || '',
        submittedAt: serverTimestamp()
      };

      await addDoc(collection(db, 'submitted_stories'), submittedData);

      setSubmitMessage('Story submitted successfully! Thank you for your contribution.');
      setFormData({
        title: '',
        slug: '',
        category: '',
        date: new Date().toISOString().split('T')[0],
        readTime: '',
        image: '',
        excerpt: '',
        content: '',
        authorName: '',
        authorImage: '',
        authorLinkedIn: '',
        authorX: '',
        youtubeUrl: ''
      });
      setImagePreview('');
      setAuthorImagePreview('');
      setImageMode('url');
      setAuthorImageMode('url');

      setTimeout(() => {
        setSubmitMessage('');
      }, 5000);
    } catch (error) {
      console.error('Error submitting story:', error);
      setSubmitError('Failed to submit story. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pt-16">
      {/* Hero Section */}
      <section id="hero" className="relative  flex items-center overflow-hidden">

        {/* Background Image with Carousel */}
        <Carousel
          plugins={[Autoplay({ delay: 3000 })]}
          opts={{ duration: 50 }}
          className="absolute inset-0 w-full h-full "
        >
          <CarouselContent className="h-full min-h-screen">
            <CarouselItem className="pl-0 h-full min-h-screen">
              <img
                src="/assets/blogbg1.jpg"
                alt="Hero background 1"
                className="h-full w-full min-h-screen object-cover opacity-70"
              />
            </CarouselItem>
            <CarouselItem className="pl-0 h-full min-h-screen">
              <img
                src="/assets/blogbg2.jpg"
                alt="Hero background 2"
                className="h-full w-full min-h-screen object-cover opacity-70"
              />
            </CarouselItem>
          </CarouselContent>
        </Carousel>

        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/80"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black"></div>

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
          <div className="flex flex-col lg:flex-row items-start gap-8 lg:gap-16">
            <div className="w-full lg:w-1/2 text-left mt-12 md:mt-10 lg:text-left">
              <h1 className="text-5xl sm:text-7xl md:text-6xl lg:text-7xl md:font-extrabold mb-4 leading-tight">
                <span>The </span> <br className="sm:hidden" /> <span>Pulse of </span> <br className="sm:hidden" /> <span>Bitcoin </span> <br className="" /> <span className="text-yellow-400">in Africa</span>
              </h1>

              <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-2xl">
                spotlighting innovation, grassroots adoption, policy developments, and the people using Bitcoin to build financial freedom in Africa.
              </p>

              {/* <div className="flex sm:flex-row gap-4 justify-start mb-6 w-full max-w-md">
          <button className="inline-flex w-auto sm:w-auto items-center justify-center px-6 py-3 bg-yellow-500 text-black font-bold text-lg hover:bg-yellow-400 transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-yellow-500/50">
            Donate
          </button>

          <button className="inline-flex w-auto sm:w-auto items-center justify-center px-6 py-3 bg-transparent border-2 border-yellow-500 text-yellow-500 font-bold text-lg hover:bg-yellow-500 hover:text-black transition-all duration-200">
            Submit story
          </button>
        </div> */}
            </div>
          </div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="py-8 px-6 md:sticky top-16 bg-black/95 backdrop-blur-sm border-b border-gray-800 z-40">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap gap-3 justify-center">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-2  font-medium transition-all duration-200 ${selectedCategory === category
                  ? 'bg-yellow-500 text-black'
                  : 'bg-gray-900 text-gray-300 hover:bg-gray-800 border border-gray-800'
                  }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="py-16 px-6 relative">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-16 h-16 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-400 mt-6 font-medium animate-pulse">Syncing with Bitcoin Pulse...</p>
            </div>
          ) : selectedCategory === 'All' ? (
            // Render categorized sections (Home-style) when 'All' is selected
            categoriesToShow.map((cat) => {
              const posts = (groupedPosts[cat] || []);
              if (!posts || posts.length === 0) return null;
              return (
                <div key={cat} className="mb-16">
                  <h3 className="text-2xl md:text-3xl font-bold mb-8">{cat}</h3>
                  <PostsGrid posts={posts} />
                </div>
              );
            })
          ) : filteredPosts.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-xl text-gray-400">No articles found. Try adjusting your search or filter.</p>
            </div>
          ) : (
            <PostsGrid posts={filteredPosts} />
          )}
        </div>
      </section>

      {/* Submit Story Section */}
      <section className="py-20 px-6 bg-gradient-to-b from-gray-900/30 to-transparent">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Share Your Bitcoin <span className="text-yellow-500">Story</span>
            </h2>
            <p className="text-lg text-gray-300">
              Have a Bitcoin adoption story or education content to share? Submit your story below.
            </p>
          </div>

          <button
            onClick={() => setShowForm(!showForm)}
            className="w-full mb-6 px-8 py-4 bg-yellow-500 text-black font-bold text-lg hover:bg-yellow-400 transition-all duration-200 hover:scale-105"
          >
            {showForm ? 'Cancel' : 'Submit Your Story'}
          </button>

          {showForm && (
            <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-2xl p-6 mb-8 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-yellow-500/10 rounded-xl border border-yellow-500/20">
                    <PlusCircle className="text-yellow-500" size={20} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Submit Your Story</h2>
                    <p className="text-xs text-gray-500">Fill in the details below</p>
                  </div>
                </div>
              </div>

              {submitError && (
                <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg flex items-start gap-3">
                  <AlertCircle size={20} className="text-red-500 mt-0.5 flex-shrink-0" />
                  <p className="text-red-200">{submitError}</p>
                </div>
              )}

              {submitMessage && (
                <div className="mb-6 p-4 bg-green-500/20 border border-green-500/50 rounded-lg flex items-start gap-3">
                  <CheckCircle size={20} className="text-green-500 mt-0.5 flex-shrink-0" />
                  <p className="text-green-200">{submitMessage}</p>
                </div>
              )}

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
                      <option value="">Select a category</option>
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
                    <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">Author Name</label>
                    <input
                      type="text"
                      name="authorName"
                      value={formData.authorName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder:text-gray-600 focus:outline-none focus:border-yellow-500/50 focus:ring-2 focus:ring-yellow-500/20 transition-all"
                      placeholder="Your name"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">Read Time</label>
                    <input
                      type="text"
                      name="readTime"
                      value={formData.readTime}
                      onChange={handleInputChange}
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
                    readOnly
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-yellow-500/70 font-mono text-sm focus:outline-none focus:border-yellow-500/50 focus:ring-2 focus:ring-yellow-500/20 transition-all cursor-not-allowed"
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
                        theme="snow"
                        value={formData.content}
                        onChange={handleContentChange}
                        modules={modules}
                        formats={formats}
                        className="bg-gray-800/50 border border-gray-700 rounded-xl text-white overflow-hidden"
                      />
                    </div>

                    <style jsx="true">{`
                      .quill-editor-container .ql-toolbar {
                        background: #1f2937;
                        border-top-left-radius: 0.75rem;
                        border-top-right-radius: 0.75rem;
                        border-color: #374151;
                      }
                      .quill-editor-container .ql-container {
                        border-bottom-left-radius: 0.75rem;
                        border-bottom-right-radius: 0.75rem;
                        border-color: #374151;
                        min-height: 300px;
                        font-size: 1rem;
                        color: white;
                      }
                      .quill-editor-container .ql-editor.ql-blank::before {
                        color: #4b5563;
                      }
                      .quill-editor-container .ql-snow .ql-stroke {
                        stroke: #9ca3af;
                      }
                      .quill-editor-container .ql-snow .ql-fill {
                        fill: #9ca3af;
                      }
                      .quill-editor-container .ql-snow .ql-picker {
                        color: #9ca3af;
                      }
                      .quill-editor-container .ql-snow .ql-picker-options {
                        background-color: #111827;
                        border-color: #374151;
                      }
                      .quill-editor-container .ql-snow .ql-picker-item {
                        color: #9ca3af;
                      }
                    `}</style>
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
                        Submit Story
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </section>
      <style>{quillSizeStyles}</style>
      <ScrollToTop />
    </div>
  );
};

export default Blog;