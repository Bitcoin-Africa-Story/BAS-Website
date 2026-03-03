// import { useParams, Link } from 'react-router-dom';
// import { Helmet } from 'react-helmet';
// import { ArrowLeft, Calendar, Clock, Share2, Twitter, Facebook, Link2, Linkedin, MessageCircle, Heart, Send, CornerDownRight, X } from 'lucide-react';
// import { toast } from 'sonner';
// import ScrollToTop from '../components/ScrollToTop';
// import { useEffect, useState } from 'react';
// import { useNews } from '../context/NewsContext';
// import StatusModal from '../dashboard/components/StatusModal';
// import { getNewsById, newsService } from '../services/newsService';

// const BlogPost = () => {
//   const { slug } = useParams();
//   const { news: posts, loading: newsLoading } = useNews();
//   const [post, setPost] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [modal, setModal] = useState({ open: false, title: '', message: '' });
//   const [liked, setLiked] = useState(false);
//   const [likeCount, setLikeCount] = useState(0);
//   const [comments, setComments] = useState([]);
//   const [newComment, setNewComment] = useState('');
//   const [isSubmittingComment, setIsSubmittingComment] = useState(false);

//   useEffect(() => {
//     if (!newsLoading) {
//       const found = posts.find(p => p.slug === slug || p.id === slug);
//       if (found) {
//         setPost(found);
//         setLoading(false);
//         // Increment views once post is found
//         newsService.incrementViews(found.id);
//         setLikeCount(found.likes?.length || 0);

//         // Check if user has already liked
//         const userId = localStorage.getItem('bas_user_id');
//         if (userId) {
//           newsService.checkIfLiked(found.id, userId).then(setLiked);
//         }

//         // Subscribe to comments
//         const unsub = newsService.getComments(found.id, (fetched) => {
//           setComments(fetched);
//         });
//         return () => unsub();
//       }

//       // If not found in context, attempt to fetch by id from service
//       (async () => {
//         try {
//           const fetched = await getNewsById(slug);
//           if (fetched) {
//             setPost(fetched);
//             newsService.incrementViews(fetched.id);
//             setLikeCount(fetched.likes?.length || 0);

//             const userId = localStorage.getItem('bas_user_id');
//             if (userId && fetched.likes?.includes(userId)) {
//               setLiked(true);
//             }

//             const unsub = newsService.getComments(fetched.id, (f) => setComments(f));
//             return () => unsub();
//           } else {
//             setPost(null);
//           }
//         } catch (err) {
//           console.warn('Could not fetch post by id:', err);
//           setPost(null);
//         } finally {
//           setLoading(false);
//         }
//       })();
//     }
//   }, [slug, posts, newsLoading]);

//   const handleCommentSubmit = async (e) => {
//     e.preventDefault();
//     if (!newComment.trim() || !post) return;

//     setIsSubmittingComment(true);
//     try {
//       let userId = localStorage.getItem('bas_user_id');
//       if (!userId) {
//         userId = 'user_' + Math.random().toString(36).substr(2, 9);
//         localStorage.setItem('bas_user_id', userId);
//       }

//       await newsService.addComment(post.id, {
//         content: newComment,
//         authorName: 'Community Member',
//         authorId: userId
//       });

//       setNewComment('');
//       toast.success('Comment posted successfully');
//     } catch (err) {
//       toast.error('Failed to post comment');
//     } finally {
//       setIsSubmittingComment(false);
//     }
//   };

//   const handleLike = async () => {
//     if (!post) return;
//     // For now, we use a simple local storage ID to identify the user if not logged in
//     let userId = localStorage.getItem('bas_user_id');
//     if (!userId) {
//       userId = 'user_' + Math.random().toString(36).substr(2, 9);
//       localStorage.setItem('bas_user_id', userId);
//     }

//     try {
//       const isLiked = await newsService.toggleLike(post.id, userId);
//       setLiked(isLiked);
//       setLikeCount(prev => isLiked ? prev + 1 : prev - 1);
//     } catch (err) {
//       toast.error('Failed to update like');
//     }
//   };

//   if (loading) {
//     return (
//       <div className="pt-32 min-h-screen text-center">
//         <div className="w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
//         <p className="text-gray-400">Loading story...</p>
//       </div>
//     );
//   }

//   if (!post) {
//     return (
//       <div className="pt-16 min-h-screen flex items-center justify-center">
//         <div className="text-center">
//           <h1 className="text-4xl font-bold mb-4">Post Not Found</h1>
//           <Link to="/news" className="text-yellow-500 hover:text-yellow-400">
//             &larr; Back to News
//           </Link>
//         </div>
//       </div>
//     );
//   }

//   const relatedPosts = posts
//     .filter(p => p.id !== post.id && p.category === post.category)
//     .slice(0, 3);

//   const pageUrl = typeof window !== 'undefined' ? window.location.href : `https://bitcoinafricastory.com/news/${post.slug || post.id}`;
//   // Ensure image used in OG tags is an absolute URL so social platforms can fetch it
//   const imageUrl = post.image
//     ? (typeof window !== 'undefined'
//       ? new URL(post.image, window.location.origin).toString()
//       : (post.image.startsWith('http') ? post.image : `https://bitcoinafricastory.com${post.image}`))
//     : '';
//   // Share endpoint returns HTML with OG tags which crawlers will scrape
//   const shareUrl = typeof window !== 'undefined'
//     ? `${window.location.origin}/api/share-news/${encodeURIComponent(post.slug || post.id)}`
//     : `https://bitcoinafricastory.com/api/share-news/${encodeURIComponent(post.slug || post.id)}`;
//   const shareTitle = `${post.title} | Bitcoin Africa Story`;

//   const handleShare = (platform) => {
//     if (post) newsService.incrementShares(post.id);
//     switch (platform) {
//       case 'twitter':
//         // Use the share endpoint so X scrapes the server-rendered OG tags (post image)
//         window.open(
//           `https://x.com/intent/post?text=${encodeURIComponent(shareTitle)}&url=${encodeURIComponent(shareUrl)}`,
//           '_blank',
//           'noopener,noreferrer'
//         );
//         break;
//       case 'facebook':
//         // Use share endpoint so Facebook scrapes post image from OG tags
//         window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank', 'noopener,noreferrer');
//         break;
//       case 'linkedin':
//         // Use share endpoint so LinkedIn scrapes post image from OG tags
//         window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, '_blank', 'noopener,noreferrer');
//         break;
//       case 'whatsapp':
//         // WhatsApp doesn't scrape OG tags, but we'll use the share endpoint for consistency
//         const whatsappText = `${shareTitle} ${shareUrl}`;
//         window.open(`https://wa.me/?text=${encodeURIComponent(whatsappText)}`, '_blank', 'noopener,noreferrer');
//         break;
//       case 'copy':
//         // Copy the share endpoint URL so pasted links show the post image
//         if (navigator.clipboard && navigator.clipboard.writeText) {
//           navigator.clipboard.writeText(shareUrl)
//             .then(() => setModal({ open: true, title: 'Copied', message: 'Share link copied to clipboard!' }))
//             .catch(() => setModal({ open: true, title: 'Copy failed', message: 'Could not copy link. Please copy manually.' }));
//         } else {
//           // Fallback for older browsers
//           try {
//             const ta = document.createElement('textarea');
//             ta.value = shareUrl;
//             ta.setAttribute('readonly', '');
//             ta.style.position = 'absolute';
//             ta.style.left = '-9999px';
//             document.body.appendChild(ta);
//             ta.select();
//             document.execCommand('copy');
//             document.body.removeChild(ta);
//             setModal({ open: true, title: 'Copied', message: 'Share link copied to clipboard!' });
//           } catch (err) {
//             setModal({ open: true, title: 'Copy failed', message: 'Could not copy link. Please copy manually.' });
//           }
//         }
//         break;
//       default:
//         break;
//     }
//   };

//   return (
//     <div className="pt-16">
//       <ScrollToTop />
//       {/* Back Button */}
//       <div className="max-w-5xl mx-auto px-6 py-8">
//         <Link
//           to="/news"
//           className="inline-flex items-center text-gray-400 hover:text-yellow-500 transition-colors duration-200"
//         >
//           <ArrowLeft size={20} className="mr-2" />
//           Back to Blog
//         </Link>
//       </div>

//       {/* Article Header */}
//       <article className="max-w-5xl mx-auto px-6 pb-20">
//         {/* Category Badge */}
//         <div className="mb-6">
//           <span className="inline-block text-sm font-semibold text-black bg-yellow-500 px-4 py-2 rounded-full">
//             {post.category}
//           </span>
//         </div>

//         <Helmet>
//           <title>{post.title} | Bitcoin Africa Story</title>
//           <meta name="description" content={post.excerpt} />
//           <link rel="canonical" href={pageUrl} />

//           <script type="application/ld+json">
//             {JSON.stringify({
//               "@context": "https://schema.org",
//               "@type": "NewsArticle",
//               "headline": post.title,
//               "image": [imageUrl],
//               "datePublished": post.date ? new Date(post.date).toISOString() : new Date().toISOString(),
//               "author": [{
//                 "@type": "Person",
//                 "name": post.author || "Bitcoin Africa Story",
//                 "url": "https://bitcoinafricastory.com/about"
//               }],
//               "publisher": {
//                 "@type": "Organization",
//                 "name": "Bitcoin Africa Story",
//                 "logo": {
//                   "@type": "ImageObject",
//                   "url": "https://bitcoinafricastory.com/assets/BitcoinAfricaStoryLogo.png"
//                 }
//               },
//               "description": post.excerpt
//             })}
//           </script>

//           {/* Open Graph / Facebook */}
//           <meta property="og:type" content="article" />
//           <meta property="og:url" content={pageUrl} />
//           <meta property="og:title" content={post.title} />
//           <meta property="og:description" content={post.excerpt} />
//           <meta property="og:image" content={post.image} />
//           <meta property="og:image:secure_url" content={post.image} />
//           <meta property="og:site_name" content="Bitcoin Africa Story" />

//           {/* Twitter */}
//           <meta name="twitter:card" content="summary_large_image" />
//           <meta name="twitter:url" content={pageUrl} />
//           <meta name="twitter:title" content={post.title} />
//           <meta name="twitter:description" content={post.excerpt} />
//           <meta name="twitter:image" content={post.image} />
//         </Helmet>

//         {/* Title */}
//         <h1 className="text-4xl md:text-5xl font-black mb-6 leading-tight">
//           {post.title}
//         </h1>

//         {/* Meta Info */}
//         <div className="flex flex-wrap items-center justify-between gap-6 mb-12 p-6 bg-gray-900/50 border border-gray-800 rounded-2xl">
//           <div className="flex items-center gap-4">
//             <div className="relative">
//               <div className="w-16 h-16 rounded-full bg-yellow-500/10 flex items-center justify-center text-yellow-500 border border-yellow-500/20 overflow-hidden shadow-xl">
//                 {post.authorImage ? (
//                   <img src={post.authorImage} alt={post.author} className="w-full h-full object-cover" />
//                 ) : (
//                   <span className="text-2xl font-black">{post.author?.charAt(0) || 'B'}</span>
//                 )}
//               </div>
//               <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-2 border-[#0A0A0A] rounded-full"></div>
//             </div>
//             <div>
//               <div className="font-bold text-white text-lg tracking-tight">{post.author}</div>
//               <div className="text-xs text-yellow-500/70 font-black uppercase tracking-widest flex items-center gap-2">
//                 <Calendar size={12} /> {new Date(post.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
//               </div>
//             </div>
//           </div>

//           <div className="flex items-center gap-6">
//             <div className="hidden md:flex flex-col items-end">
//               <div className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-1">Engage with Author</div>
//               <div className="flex gap-3">
//                 {post.authorLinkedIn && (
//                   <a href={post.authorLinkedIn} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-400 transition-colors">
//                     <Linkedin size={18} />
//                   </a>
//                 )}
//                 {post.authorX && (
//                   <a href={post.authorX} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
//                     <Twitter size={18} />
//                   </a>
//                 )}
//               </div>
//             </div>
//             <div className="h-10 w-px bg-gray-800 hidden md:block"></div>
//             <div className="flex flex-col">
//               <div className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-1">Read Duration</div>
//               <div className="text-sm font-bold text-white flex items-center gap-2">
//                 <Clock size={14} className="text-yellow-500" /> {post.readTime}
//               </div>
//             </div>
//             <div className="h-10 w-px bg-gray-800 hidden md:block"></div>
//             <button
//               onClick={handleLike}
//               className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all ${liked ? 'bg-red-500/10 border-red-500 text-red-500' : 'bg-gray-800/50 border-gray-700 text-gray-400 hover:border-gray-600'
//                 }`}
//             >
//               <Heart size={18} fill={liked ? 'currentColor' : 'none'} />
//               <span className="font-bold">{likeCount}</span>
//             </button>
//           </div>
//         </div>

//         <p className="text-xl text-yellow-500/90 font-medium leading-relaxed mb-6 italic border-l-4 border-yellow-500 pl-6">
//           {post.excerpt}
//         </p>

//         {/* Featured Image */}
//         <meta property="og:image" content={imageUrl} />
//         <meta property="og:image:secure_url" content={imageUrl} />

//         {/* Twitter */}
//         <meta name="twitter:card" content="summary_large_image" />
//         <meta name="twitter:url" content={pageUrl} />
//         <meta name="twitter:title" content={post.title} />
//         <meta name="twitter:description" content={post.excerpt} />
//         <meta name="twitter:image" content={imageUrl} />

//         <div className="mb-12 rounded-xl overflow-hidden">
//           <img
//             src={imageUrl}
//             alt={post.title}
//             className="w-full h-auto"
//           />
//         </div>

//         {/* Share Buttons */}
//         <div className="mb-12 p-6 bg-gray-900 border border-gray-800 rounded-xl">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center">
//               <Share2 className="text-yellow-500 mr-3" size={20} />
//               <span className="text-white font-semibold">Share this article</span>
//             </div>
//             <div className="flex gap-3">
//               <button
//                 onClick={() => handleShare('twitter')}
//                 className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-yellow-500 hover:text-black transition-colors duration-200"
//                 aria-label="Share on X"
//               >
//                 <Twitter size={18} />
//               </button>
//               <button
//                 onClick={() => handleShare('facebook')}
//                 className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-yellow-500 hover:text-black transition-colors duration-200"
//                 aria-label="Share on Facebook"
//               >
//                 <Facebook size={18} />
//               </button>
//               <button
//                 onClick={() => handleShare('linkedin')}
//                 className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-yellow-500 hover:text-black transition-colors duration-200"
//                 aria-label="Share on LinkedIn"
//               >
//                 <Linkedin size={18} />
//               </button>
//               <button
//                 onClick={() => handleShare('whatsapp')}
//                 className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-yellow-500 hover:text-black transition-colors duration-200"
//                 aria-label="Share on WhatsApp"
//               >
//                 <MessageCircle size={18} />
//               </button>
//               <button
//                 onClick={() => handleShare('copy')}
//                 className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-yellow-500 hover:text-black transition-colors duration-200"
//                 aria-label="Copy Link"
//               >
//                 <Link2 size={18} />
//               </button>
//             </div>
//           </div>
//         </div>

//         {/* Article Content */}
//         <div className="prose prose-invert prose-base max-w-none mb-16">


//           {/* YouTube Video Embed */}
//           {post.youtubeUrl && (() => {
//             const getYouTubeEmbedUrl = (url) => {
//               const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
//               const match = url.match(regExp);
//               return (match && match[2].length === 11)
//                 ? `https://www.youtube.com/embed/${match[2]}`
//                 : null;
//             };

//             const embedUrl = getYouTubeEmbedUrl(post.youtubeUrl);

//             return embedUrl ? (
//               <div className="mb-10">
//                 <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
//                   <iframe
//                     className="absolute top-0 left-0 w-full h-full rounded-xl border-2 border-gray-800"
//                     src={embedUrl}
//                     title="YouTube video player"
//                     frameBorder="0"
//                     allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
//                     allowFullScreen
//                   ></iframe>
//                 </div>
//               </div>
//             ) : null;
//           })()}

//           <div
//             className="blog-post-content text-gray-300 leading-relaxed"
//             dangerouslySetInnerHTML={{ __html: post.content }}
//           />
//         </div>

//         {/* Comments Section */}
//         <div className="mt-20 pt-12 border-t border-gray-800">
//           <div className="flex items-center gap-3 mb-8">
//             <MessageCircle size={24} className="text-yellow-500" />
//             <h2 className="text-2xl font-bold">Community <span className="text-yellow-500">Discussion</span></h2>
//             <span className="bg-gray-800 text-gray-400 px-3 py-1 rounded-full text-sm font-bold">{comments.length}</span>
//           </div>

//           {/* Comment Form */}
//           <form onSubmit={handleCommentSubmit} className="mb-12 bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
//             <textarea
//               value={newComment}
//               onChange={(e) => setNewComment(e.target.value)}
//               placeholder="Join the conversation..."
//               className="w-full bg-gray-800/50 border border-gray-700 rounded-xl p-4 text-white placeholder:text-gray-500 focus:outline-none focus:border-yellow-500 transition-all resize-none min-h-[120px]"
//               required
//             />
//             <div className="flex justify-end mt-4">
//               <button
//                 type="submit"
//                 disabled={isSubmittingComment || !newComment.trim()}
//                 className="bg-yellow-500 hover:bg-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold px-6 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-yellow-500/10 lg:hover:scale-105 active:scale-95"
//               >
//                 {isSubmittingComment ? 'Posting...' : 'Post Comment'}
//                 <Send size={18} />
//               </button>
//             </div>
//           </form>

//           {/* Comments List */}
//           <div className="space-y-8">
//             {comments.length === 0 ? (
//               <div className="text-center py-12 bg-gray-900/30 rounded-2xl border border-dashed border-gray-800">
//                 <p className="text-gray-500">Be the first to share your thoughts on this story.</p>
//               </div>
//             ) : (
//               comments.map(comment => (
//                 <div key={comment.id} className="group">
//                   <div className="flex gap-4">
//                     <div className="w-12 h-12 rounded-full bg-yellow-500/10 flex items-center justify-center text-yellow-500 border border-yellow-500/20 shrink-0">
//                       <span className="text-lg font-black uppercase text-yellow-500">{comment.authorName?.charAt(0)}</span>
//                     </div>
//                     <div className="flex-1">
//                       <div className="flex items-center justify-between mb-1">
//                         <h4 className="font-bold text-white uppercase tracking-wider text-sm">{comment.authorName}</h4>
//                         <span className="text-xs text-gray-500 italic">
//                           {comment.createdAt?.toDate?.() ? comment.createdAt.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Just now'}
//                         </span>
//                       </div>
//                       <p className="text-gray-300 leading-relaxed">{comment.content}</p>
//                     </div>
//                   </div>
//                 </div>
//               ))
//             )}
//           </div>
//         </div>

//       </article>


//       {/* Related Posts */}
//       {relatedPosts.length > 0 && (
//         <div className="max-w-7xl mx-auto px-6 pb-20">
//           <div className="pt-12 border-t border-gray-800">
//             <h2 className="text-3xl font-bold mb-8">
//               Related <span className="text-yellow-500">Articles</span>
//             </h2>
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
//               {relatedPosts.map((relatedPost) => (
//                 <Link
//                   key={relatedPost.id}
//                   to={`/news/${relatedPost.slug}`}
//                   className="group bg-gray-900 border border-gray-800 rounded-xl overflow-hidden hover:border-yellow-500 transition-all duration-300"
//                 >
//                   <div className="aspect-video overflow-hidden">
//                     <img
//                       src={relatedPost.image}
//                       alt={relatedPost.title}
//                       className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
//                     />
//                   </div>
//                   <div className="p-6">
//                     <div className="flex items-center justify-between mb-3">
//                       <span className="text-xs font-semibold text-yellow-500 bg-yellow-500/10 px-3 py-1 rounded-full">{relatedPost.category}</span>
//                       <span className="text-xs text-gray-400">{relatedPost.readTime}</span>
//                     </div>
//                     <h3 className="text-xl font-bold mb-2 group-hover:text-yellow-500 transition-colors duration-200">
//                       {relatedPost.title}
//                     </h3>
//                   </div>
//                 </Link>
//               ))}
//             </div>
//           </div>
//         </div>
//       )}
//       <StatusModal
//         open={modal.open}
//         title={modal.title}
//         message={modal.message}
//         onClose={() => setModal({ ...modal, open: false })}
//       />
//       <ScrollToTop />
//     </div>
//   );
// };

// export default BlogPost;





import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { ArrowLeft, Calendar, Clock, Share2, Twitter, Facebook, Link2, Linkedin, MessageCircle, Heart, Send } from 'lucide-react';
import { toast } from 'sonner';
import ScrollToTop from '../components/ScrollToTop';
import { useEffect, useState, useRef } from 'react';
import { useNews } from '../context/NewsContext';
import StatusModal from '../dashboard/components/StatusModal';
import { getNewsById, newsService } from '../services/newsService';

// Helper: get or create anonymous user ID
const getAnonymousUserId = () => {
  let userId = localStorage.getItem('bas_user_id');
  if (!userId) {
    userId = 'user_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('bas_user_id', userId);
  }
  return userId;
};

const BlogPost = () => {
  const { slug } = useParams();
  const { news: posts, loading: newsLoading } = useNews();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ open: false, title: '', message: '' });

  // Analytics state (all driven from analytics collection)
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [viewCount, setViewCount] = useState(0);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  const viewIncrementedRef = useRef(false); // prevent double-counting on re-renders

  // ── Load post ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (newsLoading) return;

    const found = posts.find(p => p.slug === slug || p.id === slug);
    if (found) {
      setPost(found);
      setLoading(false);
      return;
    }

    // Fallback: fetch by ID from Firestore
    (async () => {
      try {
        const fetched = await getNewsById(slug);
        setPost(fetched || null);
      } catch (err) {
        console.warn('Could not fetch post by id:', err);
        setPost(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [slug, posts, newsLoading]);

  // ── Subscribe to analytics + comments once post is known ──────────────────
  useEffect(() => {
    if (!post) return;

    const userId = getAnonymousUserId();

    // Increment views once per mount
    if (!viewIncrementedRef.current) {
      viewIncrementedRef.current = true;
      newsService.incrementViews(post.id);
    }

    // Real-time analytics (views, likes)
    const unsubAnalytics = newsService.subscribeToAnalytics(post.id, (data) => {
      setLikeCount(data.likes || 0);
      setViewCount(data.views || 0);
      setLiked((data.likedBy || []).includes(userId));
    });

    // Real-time comments
    const unsubComments = newsService.getComments(post.id, (fetched) => {
      setComments(fetched);
    });

    return () => {
      unsubAnalytics();
      unsubComments();
    };
  }, [post]);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleLike = async () => {
    if (!post) return;
    const userId = getAnonymousUserId();
    try {
      const { liked: isNowLiked, newCount } = await newsService.toggleLike(post.id, userId);
      setLiked(isNowLiked);
      setLikeCount(newCount);
    } catch {
      toast.error('Failed to update like');
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !post) return;

    setIsSubmittingComment(true);
    try {
      const userId = getAnonymousUserId();
      await newsService.addComment(post.id, {
        content: newComment,
        authorName: 'Community Member',
        authorId: userId
      });
      setNewComment('');
      toast.success('Comment posted successfully');
    } catch {
      toast.error('Failed to post comment');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleShare = (platform) => {
    if (post) newsService.incrementShares(post.id);

    const pageUrl = window.location.href;
    const shareUrl = `${window.location.origin}/api/share-news/${encodeURIComponent(post.slug || post.id)}`;
    const shareTitle = `${post.title} | Bitcoin Africa Story`;

    switch (platform) {
      case 'twitter':
        window.open(`https://x.com/intent/post?text=${encodeURIComponent(shareTitle)}&url=${encodeURIComponent(shareUrl)}`, '_blank', 'noopener,noreferrer');
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank', 'noopener,noreferrer');
        break;
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, '_blank', 'noopener,noreferrer');
        break;
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(`${shareTitle} ${shareUrl}`)}`, '_blank', 'noopener,noreferrer');
        break;
      case 'copy':
        if (navigator.clipboard?.writeText) {
          navigator.clipboard.writeText(shareUrl)
            .then(() => setModal({ open: true, title: 'Copied', message: 'Share link copied to clipboard!' }))
            .catch(() => setModal({ open: true, title: 'Copy failed', message: 'Could not copy link. Please copy manually.' }));
        } else {
          try {
            const ta = document.createElement('textarea');
            ta.value = shareUrl;
            ta.style.cssText = 'position:absolute;left:-9999px';
            document.body.appendChild(ta);
            ta.select();
            document.execCommand('copy');
            document.body.removeChild(ta);
            setModal({ open: true, title: 'Copied', message: 'Share link copied to clipboard!' });
          } catch {
            setModal({ open: true, title: 'Copy failed', message: 'Could not copy link. Please copy manually.' });
          }
        }
        break;
      default:
        break;
    }
  };

  // ── Render states ──────────────────────────────────────────────────────────
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
          <Link to="/news" className="text-yellow-500 hover:text-yellow-400">&larr; Back to News</Link>
        </div>
      </div>
    );
  }

  const relatedPosts = posts.filter(p => p.id !== post.id && p.category === post.category).slice(0, 3);
  const pageUrl = typeof window !== 'undefined' ? window.location.href : `https://bitcoinafricastory.com/news/${post.slug || post.id}`;
  const imageUrl = post.image
    ? (post.image.startsWith('http') ? post.image : `https://bitcoinafricastory.com${post.image}`)
    : '';

  return (
    <div className="pt-16">
      <ScrollToTop />

      {/* Back Button */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        <Link to="/news" className="inline-flex items-center text-gray-400 hover:text-yellow-500 transition-colors duration-200">
          <ArrowLeft size={20} className="mr-2" />
          Back to Blog
        </Link>
      </div>

      <article className="max-w-5xl mx-auto px-6 pb-20">
        {/* SEO */}
        <Helmet>
          <title>{post.title} | Bitcoin Africa Story</title>
          <meta name="description" content={post.excerpt} />
          <link rel="canonical" href={pageUrl} />
          <script type="application/ld+json">
            {JSON.stringify({
              "@context": "https://schema.org",
              "@type": "NewsArticle",
              "headline": post.title,
              "image": [imageUrl],
              "datePublished": post.date ? new Date(post.date).toISOString() : new Date().toISOString(),
              "author": [{ "@type": "Person", "name": post.author || "Bitcoin Africa Story", "url": "https://bitcoinafricastory.com/about" }],
              "publisher": { "@type": "Organization", "name": "Bitcoin Africa Story", "logo": { "@type": "ImageObject", "url": "https://bitcoinafricastory.com/assets/BitcoinAfricaStoryLogo.png" } },
              "description": post.excerpt
            })}
          </script>
          <meta property="og:type" content="article" />
          <meta property="og:url" content={pageUrl} />
          <meta property="og:title" content={post.title} />
          <meta property="og:description" content={post.excerpt} />
          <meta property="og:image" content={imageUrl} />
          <meta property="og:site_name" content="Bitcoin Africa Story" />
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:url" content={pageUrl} />
          <meta name="twitter:title" content={post.title} />
          <meta name="twitter:description" content={post.excerpt} />
          <meta name="twitter:image" content={imageUrl} />
        </Helmet>

        {/* Category Badge */}
        <div className="mb-6">
          <span className="inline-block text-sm font-semibold text-black bg-yellow-500 px-4 py-2 rounded-full">
            {post.category}
          </span>
        </div>

        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-black mb-6 leading-tight">{post.title}</h1>

        {/* Meta Info */}
        <div className="flex flex-wrap items-center justify-between gap-6 mb-12 p-6 bg-gray-900/50 border border-gray-800 rounded-2xl">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-yellow-500/10 flex items-center justify-center text-yellow-500 border border-yellow-500/20 overflow-hidden shadow-xl">
                {post.authorImage
                  ? <img src={post.authorImage} alt={post.author} className="w-full h-full object-cover" />
                  : <span className="text-2xl font-black">{post.author?.charAt(0) || 'B'}</span>
                }
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

          <div className="flex items-center gap-4 flex-wrap">
            {/* Views */}
            <div className="flex flex-col items-center">
              <div className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-1">Views</div>
              <div className="text-sm font-bold text-white">{viewCount.toLocaleString()}</div>
            </div>
            <div className="h-10 w-px bg-gray-800 hidden md:block"></div>

            {/* Read time */}
            <div className="flex flex-col">
              <div className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-1">Read Duration</div>
              <div className="text-sm font-bold text-white flex items-center gap-2">
                <Clock size={14} className="text-yellow-500" /> {post.readTime}
              </div>
            </div>
            <div className="h-10 w-px bg-gray-800 hidden md:block"></div>

            {/* Like button */}
            <button
              onClick={handleLike}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all active:scale-95 ${
                liked
                  ? 'bg-red-500/10 border-red-500 text-red-500'
                  : 'bg-gray-800/50 border-gray-700 text-gray-400 hover:border-red-500/50 hover:text-red-400'
              }`}
            >
              <Heart size={18} fill={liked ? 'currentColor' : 'none'} />
              <span className="font-bold">{likeCount.toLocaleString()}</span>
            </button>
          </div>
        </div>

        {/* Excerpt */}
        <p className="text-xl text-yellow-500/90 font-medium leading-relaxed mb-6 italic border-l-4 border-yellow-500 pl-6">
          {post.excerpt}
        </p>

        {/* Featured Image */}
        {imageUrl && (
          <div className="mb-12 rounded-xl overflow-hidden">
            <img src={imageUrl} alt={post.title} className="w-full h-auto" />
          </div>
        )}

        {/* Share Buttons */}
        <div className="mb-12 p-6 bg-gray-900 border border-gray-800 rounded-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Share2 className="text-yellow-500 mr-3" size={20} />
              <span className="text-white font-semibold">Share this article</span>
            </div>
            <div className="flex gap-3">
              {[
                { key: 'twitter', icon: <Twitter size={18} />, label: 'Share on X' },
                { key: 'facebook', icon: <Facebook size={18} />, label: 'Share on Facebook' },
                { key: 'linkedin', icon: <Linkedin size={18} />, label: 'Share on LinkedIn' },
                { key: 'whatsapp', icon: <MessageCircle size={18} />, label: 'Share on WhatsApp' },
                { key: 'copy', icon: <Link2 size={18} />, label: 'Copy Link' },
              ].map(({ key, icon, label }) => (
                <button
                  key={key}
                  onClick={() => handleShare(key)}
                  className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-yellow-500 hover:text-black transition-colors duration-200"
                  aria-label={label}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Article Content */}
        <div className="prose prose-invert prose-base max-w-none mb-16">
          {/* YouTube Embed */}
          {post.youtubeUrl && (() => {
            const match = post.youtubeUrl.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/);
            const embedUrl = match && match[2].length === 11 ? `https://www.youtube.com/embed/${match[2]}` : null;
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
                  />
                </div>
              </div>
            ) : null;
          })()}

          <div
            className="blog-post-content text-gray-300 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </div>

        {/* Comments Section */}
        <div className="mt-20 pt-12 border-t border-gray-800">
          <div className="flex items-center gap-3 mb-8">
            <MessageCircle size={24} className="text-yellow-500" />
            <h2 className="text-2xl font-bold">Community <span className="text-yellow-500">Discussion</span></h2>
            <span className="bg-gray-800 text-gray-400 px-3 py-1 rounded-full text-sm font-bold">{comments.length}</span>
          </div>

          {/* Comment Form */}
          <form onSubmit={handleCommentSubmit} className="mb-12 bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Join the conversation..."
              className="w-full bg-gray-800/50 border border-gray-700 rounded-xl p-4 text-white placeholder:text-gray-500 focus:outline-none focus:border-yellow-500 transition-all resize-none min-h-[120px]"
              required
            />
            <div className="flex justify-end mt-4">
              <button
                type="submit"
                disabled={isSubmittingComment || !newComment.trim()}
                className="bg-yellow-500 hover:bg-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold px-6 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-yellow-500/10 lg:hover:scale-105 active:scale-95"
              >
                {isSubmittingComment ? 'Posting...' : 'Post Comment'}
                <Send size={18} />
              </button>
            </div>
          </form>

          {/* Comments List */}
          <div className="space-y-8">
            {comments.length === 0 ? (
              <div className="text-center py-12 bg-gray-900/30 rounded-2xl border border-dashed border-gray-800">
                <p className="text-gray-500">Be the first to share your thoughts on this story.</p>
              </div>
            ) : (
              comments.map(comment => (
                <div key={comment.id} className="group">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-full bg-yellow-500/10 flex items-center justify-center text-yellow-500 border border-yellow-500/20 shrink-0">
                      <span className="text-lg font-black uppercase">{comment.authorName?.charAt(0)}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-bold text-white uppercase tracking-wider text-sm">{comment.authorName}</h4>
                        <span className="text-xs text-gray-500 italic">
                          {comment.createdAt?.toDate?.()
                            ? comment.createdAt.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                            : 'Just now'}
                        </span>
                      </div>
                      <p className="text-gray-300 leading-relaxed">{comment.content}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </article>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <div className="max-w-7xl mx-auto px-6 pb-20">
          <div className="pt-12 border-t border-gray-800">
            <h2 className="text-3xl font-bold mb-8">Related <span className="text-yellow-500">Articles</span></h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {relatedPosts.map((relatedPost) => (
                <Link
                  key={relatedPost.id}
                  to={`/news/${relatedPost.slug}`}
                  className="group bg-gray-900 border border-gray-800 rounded-xl overflow-hidden hover:border-yellow-500 transition-all duration-300"
                >
                  <div className="aspect-video overflow-hidden">
                    <img src={relatedPost.image} alt={relatedPost.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                  </div>
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-semibold text-yellow-500 bg-yellow-500/10 px-3 py-1 rounded-full">{relatedPost.category}</span>
                      <span className="text-xs text-gray-400">{relatedPost.readTime}</span>
                    </div>
                    <h3 className="text-xl font-bold mb-2 group-hover:text-yellow-500 transition-colors duration-200">{relatedPost.title}</h3>
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