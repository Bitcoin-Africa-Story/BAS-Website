// import { useState, useEffect } from 'react';
// import { useNews } from '../context/NewsContext';
// import { newsService } from '../services/newsService';
// import { Eye, Heart, Share2, MessageSquare, TrendingUp, BarChart3, ArrowUpRight, Search, Filter, Calendar, X, User, Clock } from 'lucide-react';

// const BlogAnalytics = () => {
//     const { news } = useNews();
//     const [searchTerm, setSearchTerm] = useState('');
//     const [filterCategory, setFilterCategory] = useState('All');
//     const [selectedPost, setSelectedPost] = useState(null);
//     const [postComments, setPostComments] = useState([]);
//     const [isCommentsModalOpen, setIsCommentsModalOpen] = useState(false);

//     // Calculate totals
//     const totals = (news || []).reduce((acc, post) => ({
//         views: acc.views + (post.views || 0),
//         likes: acc.likes + (post.likesCount || post.likes?.length || 0),
//         shares: acc.shares + (post.shares || 0),
//         comments: acc.comments + (post.commentCount || 0)
//     }), { views: 0, likes: 0, shares: 0, comments: 0 });

//     const categories = ['All', ...new Set((news || []).map(p => p.category))];

//     const filteredPosts = (news || []).filter(post => {
//         const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase());
//         const matchesCategory = filterCategory === 'All' || post.category === filterCategory;
//         return matchesSearch && matchesCategory;
//     }).sort((a, b) => (b.views || 0) - (a.views || 0));

//     useEffect(() => {
//         let unsub;
//         if (selectedPost) {
//             unsub = newsService.getComments(selectedPost.id, (comments) => {
//                 setPostComments(comments);
//             });
//         }
//         return () => unsub && unsub();
//     }, [selectedPost]);

//     const openComments = (post) => {
//         setSelectedPost(post);
//         setIsCommentsModalOpen(true);
//     };

//     const closeComments = () => {
//         setIsCommentsModalOpen(false);
//         setSelectedPost(null);
//         setPostComments([]);
//     };

//     return (
//         <div className="min-h-screen pb-12">
//             {/* Header */}
//             <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
//                 <div>
//                     <div className="flex items-center gap-3 mb-2">
//                         <div className="p-2 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg">
//                             <TrendingUp className="text-black" size={24} />
//                         </div>
//                         <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
//                             Blog Analytics
//                         </h1>
//                     </div>
//                     <p className="text-sm text-gray-400 ml-14">Track the performance of your stories and community engagement</p>
//                 </div>

//                 <div className="flex items-center gap-3">
//                     <div className="bg-gray-900 border border-gray-800 rounded-xl px-4 py-2 flex items-center gap-2 text-xs font-bold text-gray-400">
//                         <Calendar size={14} />
//                         LIFETIME DATA
//                     </div>
//                 </div>
//             </div>

//             {/* Stats Overview */}
//             <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
//                 {[
//                     { label: 'Total Views', value: totals.views, icon: Eye, color: 'text-blue-500', bg: 'bg-blue-500/10' },
//                     { label: 'Total Likes', value: totals.likes, icon: Heart, color: 'text-red-500', bg: 'bg-red-500/10' },
//                     { label: 'Total Shares', value: totals.shares, icon: Share2, color: 'text-green-500', bg: 'bg-green-500/10' },
//                     { label: 'Total Comments', value: totals.comments, icon: MessageSquare, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
//                 ].map((stat, i) => (
//                     <div key={i} className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-2xl p-6 relative overflow-hidden group">
//                         <div className={`absolute top-0 right-0 w-32 h-32 ${stat.bg} blur-[60px] rounded-full -mr-16 -mt-16 group-hover:opacity-100 transition-opacity opacity-50`}></div>
//                         <div className="relative z-10">
//                             <div className="flex items-center justify-between mb-4">
//                                 <div className={`p-3 ${stat.bg} rounded-xl`}>
//                                     <stat.icon className={stat.color} size={20} />
//                                 </div>
//                                 <div className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Growth</div>
//                             </div>
//                             <div className="text-3xl font-black text-white mb-1">
//                                 {stat.value.toLocaleString()}
//                             </div>
//                             <div className="text-xs text-gray-500 uppercase font-bold tracking-wider">{stat.label}</div>
//                         </div>
//                     </div>
//                 ))}
//             </div>

//             {/* Filters & Search */}
//             <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-4 mb-8 flex flex-col md:flex-row gap-4">
//                 <div className="flex-1 relative">
//                     <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
//                     <input
//                         type="text"
//                         placeholder="Search posts..."
//                         value={searchTerm}
//                         onChange={(e) => setSearchTerm(e.target.value)}
//                         className="w-full bg-gray-800/50 border border-gray-700 rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:border-yellow-500/50 transition-all text-white"
//                     />
//                 </div>
//                 <div className="flex items-center gap-3">
//                     <Filter size={18} className="text-gray-500" />
//                     <select
//                         value={filterCategory}
//                         onChange={(e) => setFilterCategory(e.target.value)}
//                         className="bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-yellow-500/50"
//                     >
//                         {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
//                     </select>
//                 </div>
//             </div>

//             {/* Posts Table */}
//             <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-2xl overflow-hidden shadow-2xl">
//                 <div className="p-6 border-b border-gray-800 flex items-center justify-between">
//                     <h2 className="text-xl font-bold flex items-center gap-2">
//                         <BarChart3 className="text-yellow-500" size={20} />
//                         Post Performance
//                     </h2>
//                     <span className="text-xs text-gray-500 uppercase font-black tracking-widest">Sorted by Views</span>
//                 </div>

//                 <div className="overflow-x-auto">
//                     <table className="w-full text-left">
//                         <thead>
//                             <tr className="bg-gray-800/20 text-[10px] uppercase font-black tracking-[0.2em] text-gray-500">
//                                 <th className="px-6 py-4">Post Title</th>
//                                 <th className="px-6 py-4 text-center">Views</th>
//                                 <th className="px-6 py-4 text-center">Likes</th>
//                                 <th className="px-6 py-4 text-center">Comments</th>
//                                 <th className="px-6 py-4 text-center">Shares</th>
//                                 <th className="px-6 py-4 text-right">Action</th>
//                             </tr>
//                         </thead>
//                         <tbody className="divide-y divide-gray-800/50">
//                             {filteredPosts.length === 0 ? (
//                                 <tr>
//                                     <td colSpan="6" className="px-6 py-12 text-center text-gray-500 italic">No posts found matching your filters.</td>
//                                 </tr>
//                             ) : (
//                                 filteredPosts.map((post) => (
//                                     <tr key={post.id} className="hover:bg-gray-800/30 transition-colors group">
//                                         <td className="px-6 py-4">
//                                             <div className="flex flex-col">
//                                                 <span className="text-sm font-bold text-white line-clamp-1 group-hover:text-yellow-500 transition-colors">
//                                                     {post.title}
//                                                 </span>
//                                                 <span className="text-[10px] text-gray-500 font-mono mt-0.5">{post.id}</span>
//                                             </div>
//                                         </td>
//                                         <td className="px-6 py-4 text-center">
//                                             <span className="text-sm font-black text-white">{(post.views || 0).toLocaleString()}</span>
//                                         </td>
//                                         <td className="px-6 py-4 text-center">
//                                             <div className="flex items-center justify-center gap-1.5 text-red-500">
//                                                 <Heart size={14} fill="currentColor" />
//                                                 <span className="text-sm font-bold">{(post.likesCount || post.likes?.length || 0).toLocaleString()}</span>
//                                             </div>
//                                         </td>
//                                         <td className="px-6 py-4 text-center">
//                                             <button
//                                                 onClick={() => openComments(post)}
//                                                 className="flex items-center justify-center gap-1.5 text-yellow-500 hover:scale-110 transition-transform"
//                                             >
//                                                 <MessageSquare size={14} fill="currentColor" fillOpacity={0.2} />
//                                                 <span className="text-sm font-bold">{(post.commentCount || 0).toLocaleString()}</span>
//                                             </button>
//                                         </td>
//                                         <td className="px-6 py-4 text-center">
//                                             <div className="flex items-center justify-center gap-1.5 text-green-500">
//                                                 <Share2 size={14} />
//                                                 <span className="text-sm font-bold">{(post.shares || 0).toLocaleString()}</span>
//                                             </div>
//                                         </td>
//                                         <td className="px-6 py-4 text-right">
//                                             <div className="flex items-center justify-end gap-2">
//                                                 <button
//                                                     onClick={() => openComments(post)}
//                                                     className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-[10px] font-black uppercase tracking-widest text-gray-300 transition-all"
//                                                 >
//                                                     Comments
//                                                 </button>
//                                                 <a
//                                                     href={`/news/${post.slug || post.id}`}
//                                                     target="_blank"
//                                                     rel="noopener noreferrer"
//                                                     className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500 hover:text-black rounded-lg text-xs font-bold transition-all"
//                                                 >
//                                                     PREVIEW <ArrowUpRight size={12} />
//                                                 </a>
//                                             </div>
//                                         </td>
//                                     </tr>
//                                 ))
//                             )}
//                         </tbody>
//                     </table>
//                 </div>
//             </div>

//             {/* Comments Modal */}
//             {isCommentsModalOpen && selectedPost && (
//                 <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
//                     <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={closeComments}></div>
//                     <div className="relative bg-gray-900 border border-gray-800 rounded-3xl w-full max-w-2xl max-h-[85vh] overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
//                         {/* Modal Header */}
//                         <div className="p-6 border-b border-gray-800 flex items-center justify-between bg-black/20">
//                             <div>
//                                 <h3 className="text-xl font-bold text-white mb-1">Reader Comments</h3>
//                                 <p className="text-xs text-gray-500 truncate max-w-[400px]">On: {selectedPost.title}</p>
//                             </div>
//                             <button onClick={closeComments} className="p-2 hover:bg-gray-800 rounded-full text-gray-500 hover:text-white transition-colors">
//                                 <X size={24} />
//                             </button>
//                         </div>

//                         {/* Modal Content */}
//                         <div className="p-6 overflow-y-auto max-h-[calc(85vh-160px)] space-y-6">
//                             {postComments.length === 0 ? (
//                                 <div className="text-center py-20">
//                                     <MessageSquare className="mx-auto text-gray-700 mb-4" size={48} />
//                                     <p className="text-gray-500 italic">No comments on this post yet.</p>
//                                 </div>
//                             ) : (
//                                 postComments.map((comment) => (
//                                     <div key={comment.id} className="p-4 rounded-2xl border bg-gray-800/40 border-gray-700">
//                                         <div className="flex items-center gap-3 mb-3">
//                                             <div className="w-8 h-8 rounded-full bg-yellow-500/10 flex items-center justify-center text-yellow-500 border border-yellow-500/20">
//                                                 <User size={14} />
//                                             </div>
//                                             <div className="flex-1">
//                                                 <div className="flex items-center justify-between">
//                                                     <span className="text-sm font-bold text-white uppercase tracking-wider">{comment.authorName}</span>
//                                                     <div className="flex items-center gap-1 text-[10px] text-gray-500">
//                                                         <Clock size={10} />
//                                                         {comment.createdAt?.toDate ? comment.createdAt.toDate().toLocaleDateString() : 'Just now'}
//                                                     </div>
//                                                 </div>
//                                             </div>
//                                         </div>
//                                         <p className="text-sm text-gray-300 leading-relaxed font-medium">
//                                             {comment.content}
//                                         </p>
//                                     </div>
//                                 ))
//                             )}
//                         </div>

//                         {/* Modal Footer */}
//                         <div className="p-6 border-t border-gray-800 bg-black/20 text-center">
//                             <span className="text-xs text-gray-500 font-bold uppercase tracking-widest">
//                                 Total: {postComments.length} Comments
//                             </span>
//                         </div>
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// };

// export default BlogAnalytics;



import { useState, useEffect } from 'react';
import { useNews } from '../context/NewsContext';
import { newsService } from '../services/newsService';
import { Eye, Heart, Share2, MessageSquare, TrendingUp, BarChart3, ArrowUpRight, Search, Filter, Calendar, X, User, Clock, Trash2, Globe } from 'lucide-react';

const BlogAnalytics = () => {
    const { news } = useNews();
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('All');
    const [selectedPost, setSelectedPost] = useState(null);
    const [postComments, setPostComments] = useState([]);
    const [isCommentsModalOpen, setIsCommentsModalOpen] = useState(false);

    // Analytics from the analytics collection (real-time)
    const [analyticsMap, setAnalyticsMap] = useState({}); // { postId: { views, likes, shares, commentCount } }

    // Subscribe to all analytics docs
    useEffect(() => {
        const unsub = newsService.subscribeToAllAnalytics((allAnalytics) => {
            const map = {};
            allAnalytics.forEach(a => { map[a.postId || a.id] = a; });
            setAnalyticsMap(map);
        });
        return () => unsub();
    }, []);

    // Helper to get analytics for a post
    const getStats = (postId) => analyticsMap[postId] || { views: 0, likes: 0, shares: 0, commentCount: 0 };

    // Calculate totals from analytics map
    const totals = Object.values(analyticsMap).reduce((acc, a) => {
        if (a.id === '_site_stats_') return acc; // Don't include global stats in blog totals
        return {
            views: acc.views + (a.views || 0),
            likes: acc.likes + (a.likes || 0),
            shares: acc.shares + (a.shares || 0),
            comments: acc.comments + (a.commentCount || 0),
        };
    }, { views: 0, likes: 0, shares: 0, comments: 0 });

    const categories = ['All', ...new Set((news || []).map(p => p.category).filter(Boolean))];

    const filteredPosts = (news || [])
        .filter(post => {
            const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = filterCategory === 'All' || post.category === filterCategory;
            return matchesSearch && matchesCategory;
        })
        .sort((a, b) => (getStats(b.id).views) - (getStats(a.id).views));

    // Subscribe to comments when a post is selected
    useEffect(() => {
        if (!selectedPost) return;
        const unsub = newsService.getComments(selectedPost.id, setPostComments);
        return () => unsub();
    }, [selectedPost]);

    const openComments = (post) => {
        setSelectedPost(post);
        setIsCommentsModalOpen(true);
    };

    const closeComments = () => {
        setIsCommentsModalOpen(false);
        setSelectedPost(null);
        setPostComments([]);
    };

    const handleDeleteComment = async (commentId) => {
        if (!selectedPost) return;
        try {
            await newsService.deleteComment(selectedPost.id, commentId);
        } catch (err) {
            console.error('Failed to delete comment:', err);
        }
    };

    return (
        <div className="min-h-screen pb-12">
            {/* Header */}
            <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg">
                            <TrendingUp className="text-black" size={24} />
                        </div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                            Analytics
                        </h1>
                    </div>
                    <p className="text-sm text-gray-400 ml-14">Track the performance of your stories and community engagement</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="bg-gray-900 border border-gray-800 rounded-xl px-4 py-2 flex items-center gap-2 text-xs font-bold text-gray-400">
                        <Calendar size={14} />
                        LIFETIME DATA
                    </div>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-10">
                {[
                    { label: 'Website Visits', value: analyticsMap['_site_stats_']?.visited || 0, icon: Globe, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
                    { label: 'Total Views', value: totals.views, icon: Eye, color: 'text-blue-500', bg: 'bg-blue-500/10' },
                    { label: 'Total Likes', value: totals.likes, icon: Heart, color: 'text-red-500', bg: 'bg-red-500/10' },
                    { label: 'Total Shares', value: totals.shares, icon: Share2, color: 'text-green-500', bg: 'bg-green-500/10' },
                    { label: 'Total Comments', value: totals.comments, icon: MessageSquare, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
                ].map((stat, i) => (
                    <div key={i} className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-2xl p-6 relative overflow-hidden group">
                        <div className={`absolute top-0 right-0 w-32 h-32 ${stat.bg} blur-[60px] rounded-full -mr-16 -mt-16 group-hover:opacity-100 transition-opacity opacity-50`}></div>
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-4">
                                <div className={`p-3 ${stat.bg} rounded-xl`}>
                                    <stat.icon className={stat.color} size={20} />
                                </div>
                                <div className="text-[10px] font-black text-gray-600 uppercase tracking-widest">LIVE</div>
                            </div>
                            <div className="text-3xl font-black text-white mb-1">
                                {stat.value.toLocaleString()}
                            </div>
                            <div className="text-xs text-gray-500 uppercase font-bold tracking-wider">{stat.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Filters & Search */}
            <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-4 mb-8 flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input
                        type="text"
                        placeholder="Search posts..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-gray-800/50 border border-gray-700 rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:border-yellow-500/50 transition-all text-white"
                    />
                </div>
                <div className="flex items-center gap-3">
                    <Filter size={18} className="text-gray-500" />
                    <select
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className="bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-yellow-500/50"
                    >
                        {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                </div>
            </div>

            {/* Posts Table */}
            <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-2xl overflow-hidden shadow-2xl">
                <div className="p-6 border-b border-gray-800 flex items-center justify-between">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <BarChart3 className="text-yellow-500" size={20} />
                        Post Performance
                    </h2>
                    <span className="text-xs text-gray-500 uppercase font-black tracking-widest">Sorted by Views</span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-800/20 text-[10px] uppercase font-black tracking-[0.2em] text-gray-500">
                                <th className="px-6 py-4">Post Title</th>
                                <th className="px-6 py-4 text-center">Views</th>
                                <th className="px-6 py-4 text-center">Likes</th>
                                <th className="px-6 py-4 text-center">Comments</th>
                                <th className="px-6 py-4 text-center">Shares</th>
                                <th className="px-6 py-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800/50">
                            {filteredPosts.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500 italic">No posts found matching your filters.</td>
                                </tr>
                            ) : (
                                filteredPosts.map((post) => {
                                    const stats = getStats(post.id);
                                    return (
                                        <tr key={post.id} className="hover:bg-gray-800/30 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-white line-clamp-1 group-hover:text-yellow-500 transition-colors">
                                                        {post.title}
                                                    </span>
                                                    <span className="text-[10px] text-gray-500 font-mono mt-0.5">{post.id}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="flex items-center justify-center gap-1.5 text-blue-400">
                                                    <Eye size={13} />
                                                    <span className="text-sm font-black text-white">{(stats.views || 0).toLocaleString()}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="flex items-center justify-center gap-1.5 text-red-500">
                                                    <Heart size={14} fill="currentColor" />
                                                    <span className="text-sm font-bold">{(stats.likes || 0).toLocaleString()}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <button
                                                    onClick={() => openComments(post)}
                                                    className="flex items-center justify-center gap-1.5 text-yellow-500 hover:scale-110 transition-transform mx-auto"
                                                >
                                                    <MessageSquare size={14} fill="currentColor" fillOpacity={0.2} />
                                                    <span className="text-sm font-bold">{(stats.commentCount || 0).toLocaleString()}</span>
                                                </button>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="flex items-center justify-center gap-1.5 text-green-500">
                                                    <Share2 size={14} />
                                                    <span className="text-sm font-bold">{(stats.shares || 0).toLocaleString()}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => openComments(post)}
                                                        className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-[10px] font-black uppercase tracking-widest text-gray-300 transition-all"
                                                    >
                                                        Comments
                                                    </button>
                                                    <a
                                                        href={`/news/${post.slug || post.id}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500 hover:text-black rounded-lg text-xs font-bold transition-all"
                                                    >
                                                        PREVIEW <ArrowUpRight size={12} />
                                                    </a>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Comments Modal */}
            {isCommentsModalOpen && selectedPost && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={closeComments}></div>
                    <div className="relative bg-gray-900 border border-gray-800 rounded-3xl w-full max-w-2xl max-h-[85vh] overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
                        {/* Modal Header */}
                        <div className="p-6 border-b border-gray-800 flex items-center justify-between bg-black/20">
                            <div>
                                <h3 className="text-xl font-bold text-white mb-1">Reader Comments</h3>
                                <p className="text-xs text-gray-500 truncate max-w-[400px]">On: {selectedPost.title}</p>
                            </div>
                            <button onClick={closeComments} className="p-2 hover:bg-gray-800 rounded-full text-gray-500 hover:text-white transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6 overflow-y-auto max-h-[calc(85vh-160px)] space-y-6">
                            {postComments.length === 0 ? (
                                <div className="text-center py-20">
                                    <MessageSquare className="mx-auto text-gray-700 mb-4" size={48} />
                                    <p className="text-gray-500 italic">No comments on this post yet.</p>
                                </div>
                            ) : (
                                postComments.map((comment) => (
                                    <div key={comment.id} className="p-4 rounded-2xl border bg-gray-800/40 border-gray-700 group/comment">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="w-8 h-8 rounded-full bg-yellow-500/10 flex items-center justify-center text-yellow-500 border border-yellow-500/20">
                                                <User size={14} />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm font-bold text-white uppercase tracking-wider">{comment.authorName}</span>
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex items-center gap-1 text-[10px] text-gray-500">
                                                            <Clock size={10} />
                                                            {comment.createdAt?.toDate
                                                                ? comment.createdAt.toDate().toLocaleDateString()
                                                                : 'Just now'}
                                                        </div>
                                                        {/* Delete button */}
                                                        <button
                                                            onClick={() => handleDeleteComment(comment.id)}
                                                            className="opacity-0 group-hover/comment:opacity-100 transition-opacity p-1 hover:bg-red-500/20 rounded-lg text-red-500"
                                                            title="Delete comment"
                                                        >
                                                            <Trash2 size={13} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <p className="text-sm text-gray-300 leading-relaxed font-medium">{comment.content}</p>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="p-6 border-t border-gray-800 bg-black/20 text-center">
                            <span className="text-xs text-gray-500 font-bold uppercase tracking-widest">
                                Total: {postComments.length} Comments
                            </span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BlogAnalytics;