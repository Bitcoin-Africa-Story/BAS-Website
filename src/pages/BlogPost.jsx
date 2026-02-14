import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { ArrowLeft, Calendar, Clock, Share2, Twitter, Facebook, Link2, Linkedin } from 'lucide-react';
import { blogPosts as mockPosts } from '../mock';
import ScrollToTop from '../components/ScrollToTop';
import { db } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { useNews } from '../context/NewsContext';
import StatusModal from '../dashboard/components/StatusModal';
import { getNewsById } from '../services/newsService';

const BlogPost = () => {
  const { slug } = useParams();
  const { news: posts, loading: newsLoading } = useNews();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ open: false, title: '', message: '' });

  useEffect(() => {
    if (!newsLoading) {
      const found = posts.find(p => p.slug === slug || p.id === slug);
      if (found) {
        setPost(found);
        setLoading(false);
        return;
      }

      // If not found in context, attempt to fetch by id from service
      (async () => {
        try {
          const fetched = await getNewsById(slug);
          setPost(fetched);
        } catch (err) {
          console.warn('Could not fetch post by id:', err);
          setPost(null);
        } finally {
          setLoading(false);
        }
      })();
    }
  }, [slug, posts, newsLoading]);

  if (loading) {
    return (
      <div className="pt-32 min-h-screen text-center">
        <div className="w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-400">Loading story...</p>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="pt-16 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Post Not Found</h1>
          <Link to="/news" className="text-yellow-500 hover:text-yellow-400">
            ← Back to News
          </Link>
        </div>
      </div>
    );
  }

  const relatedPosts = posts
    .filter(p => p.id !== post.id && p.category === post.category)
    .slice(0, 3);

  const handleShare = (platform) => {
    const url = window.location.href;
    const text = post.title;

    switch (platform) {
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'copy':
        navigator.clipboard.writeText(url);
        setModal({ open: true, title: 'Copied', message: 'Link copied to clipboard!' });
        break;
      default:
        break;
    }
  };

  return (
    <div className="pt-16">
      <ScrollToTop />
      {/* Back Button */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        <Link
          to="/news"
          className="inline-flex items-center text-gray-400 hover:text-yellow-500 transition-colors duration-200"
        >
          <ArrowLeft size={20} className="mr-2" />
          Back to Blog
        </Link>
      </div>

      {/* Article Header */}
      <article className="max-w-5xl mx-auto px-6 pb-20">
        {/* Category Badge */}
        <div className="mb-6">
          <span className="inline-block text-sm font-semibold text-black bg-yellow-500 px-4 py-2 rounded-full">
            {post.category}
          </span>
        </div>

        <Helmet>
          <title>{post.title} | Bitcoin Africa Story</title>
          <meta name="description" content={post.excerpt} />

          {/* Open Graph / Facebook */}
          <meta property="og:type" content="article" />
          <meta property="og:url" content={window.location.href} />
          <meta property="og:title" content={post.title} />
          <meta property="og:description" content={post.excerpt} />
          <meta property="og:image" content={post.image} />

          {/* Twitter */}
          <meta property="twitter:card" content="summary_large_image" />
          <meta property="twitter:url" content={window.location.href} />
          <meta property="twitter:title" content={post.title} />
          <meta property="twitter:description" content={post.excerpt} />
          <meta property="twitter:image" content={post.image} />
        </Helmet>

        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-black mb-6 leading-tight">
          {post.title}
        </h1>

        {/* Meta Info */}
        <div className="flex flex-wrap items-center justify-between gap-6 mb-12 p-6 bg-gray-900/50 border border-gray-800 rounded-2xl">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-yellow-500/10 flex items-center justify-center text-yellow-500 border border-yellow-500/20 overflow-hidden shadow-xl">
                {post.authorImage ? (
                  <img src={post.authorImage} alt={post.author} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl font-black">{post.author?.charAt(0) || 'B'}</span>
                )}
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-2 border-[#0A0A0A] rounded-full"></div>
            </div>
            <div>
              <div className="font-bold text-white text-lg tracking-tight">{post.author}</div>
              <div className="text-xs text-yellow-500/70 font-black uppercase tracking-widest flex items-center gap-2">
                <Calendar size={12} /> {new Date(post.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden md:flex flex-col items-end">
              <div className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-1">Engage with Author</div>
              <div className="flex gap-3">
                {post.authorLinkedIn && (
                  <a href={post.authorLinkedIn} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-400 transition-colors">
                    <Linkedin size={18} />
                  </a>
                )}
                {post.authorX && (
                  <a href={post.authorX} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                    <Twitter size={18} />
                  </a>
                )}
              </div>
            </div>
            <div className="h-10 w-px bg-gray-800 hidden md:block"></div>
            <div className="flex flex-col">
              <div className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-1">Read Duration</div>
              <div className="text-sm font-bold text-white flex items-center gap-2">
                <Clock size={14} className="text-yellow-500" /> {post.readTime}
              </div>
            </div>
          </div>
        </div>

        <p className="text-xl text-yellow-500/90 font-medium leading-relaxed mb-6 italic border-l-4 border-yellow-500 pl-6">
          {post.excerpt}
        </p>

        {/* Featured Image */}
        <div className="mb-12 rounded-xl overflow-hidden">
          <img
            src={post.image}
            alt={post.title}
            className="w-full h-auto"
          />
        </div>

        {/* Share Buttons */}
        <div className="mb-12 p-6 bg-gray-900 border border-gray-800 rounded-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Share2 className="text-yellow-500 mr-3" size={20} />
              <span className="text-white font-semibold">Share this article</span>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => handleShare('twitter')}
                className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-yellow-500 hover:text-black transition-colors duration-200"
                aria-label="Share on Twitter"
              >
                <Twitter size={18} />
              </button>
              <button
                onClick={() => handleShare('facebook')}
                className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-yellow-500 hover:text-black transition-colors duration-200"
                aria-label="Share on Facebook"
              >
                <Facebook size={18} />
              </button>
              <button
                onClick={() => handleShare('linkedin')}
                className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-yellow-500 hover:text-black transition-colors duration-200"
                aria-label="Share on LinkedIn"
              >
                <Linkedin size={18} />
              </button>
              <button
                onClick={() => handleShare('copy')}
                className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-yellow-500 hover:text-black transition-colors duration-200"
                aria-label="Copy Link"
              >
                <Link2 size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Article Content */}
        <div className="prose prose-invert prose-base max-w-none mb-16">


          {/* YouTube Video Embed */}
          {post.youtubeUrl && (() => {
            const getYouTubeEmbedUrl = (url) => {
              const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
              const match = url.match(regExp);
              return (match && match[2].length === 11)
                ? `https://www.youtube.com/embed/${match[2]}`
                : null;
            };

            const embedUrl = getYouTubeEmbedUrl(post.youtubeUrl);

            return embedUrl ? (
              <div className="mb-10">
                <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                  <iframe
                    className="absolute top-0 left-0 w-full h-full rounded-xl border-2 border-gray-800"
                    src={embedUrl}
                    title="YouTube video player"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              </div>
            ) : null;
          })()}

          <div
            className="blog-post-content text-gray-300 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </div>

      </article>


      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <div className="max-w-7xl mx-auto px-6 pb-20">
          <div className="pt-12 border-t border-gray-800">
            <h2 className="text-3xl font-bold mb-8">
              Related <span className="text-yellow-500">Articles</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {relatedPosts.map((relatedPost) => (
                <Link
                  key={relatedPost.id}
                  to={`/news/${relatedPost.slug}`}
                  className="group bg-gray-900 border border-gray-800 rounded-xl overflow-hidden hover:border-yellow-500 transition-all duration-300"
                >
                  <div className="aspect-video overflow-hidden">
                    <img
                      src={relatedPost.image}
                      alt={relatedPost.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-semibold text-yellow-500 bg-yellow-500/10 px-3 py-1 rounded-full">{relatedPost.category}</span>
                      <span className="text-xs text-gray-400">{relatedPost.readTime}</span>
                    </div>
                    <h3 className="text-xl font-bold mb-2 group-hover:text-yellow-500 transition-colors duration-200">
                      {relatedPost.title}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
      <StatusModal
        open={modal.open}
        title={modal.title}
        message={modal.message}
        onClose={() => setModal({ ...modal, open: false })}
      />
      <ScrollToTop />
    </div>
  );
};

export default BlogPost;