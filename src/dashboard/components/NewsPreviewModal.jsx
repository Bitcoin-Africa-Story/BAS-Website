import React from 'react';
import { X, Linkedin, Twitter } from 'lucide-react';

const NewsPreviewModal = ({ open, post, onClose }) => {
    if (!open || !post) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
                <div className="p-6 border-b border-gray-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-black bg-yellow-500 px-3 py-1 rounded">{post.category}</span>
                        <span className="text-sm text-gray-500">{post.date}</span>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                    >
                        <X size={20} className="text-gray-400" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-8">
                    <div className="max-w-2xl mx-auto">
                        <h2 className="text-3xl font-bold text-white mb-4">{post.title}</h2>

                        <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-800/50">
                            <div className="flex items-center gap-4">
                                <div className="relative">
                                    <div className="w-14 h-14 rounded-full bg-yellow-500/10 flex items-center justify-center text-yellow-500 border border-yellow-500/20 overflow-hidden shadow-xl">
                                        {post.authorImage ? (
                                            <img src={post.authorImage} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-xl font-black">{post.author?.charAt(0) || 'A'}</span>
                                        )}
                                    </div>
                                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-2 border-[#0A0A0A] rounded-full"></div>
                                </div>
                                <div>
                                    <div className="text-lg font-bold text-white tracking-tight">{post.author}</div>
                                    <div className="text-xs text-yellow-500/70 font-black uppercase tracking-widest">{post.readTime} • Author</div>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                {post.authorLinkedIn && (
                                    <a href={post.authorLinkedIn} target="_blank" rel="noopener noreferrer" className="p-2.5 bg-gray-800 hover:bg-blue-600/20 hover:text-blue-400 rounded-xl transition-all border border-gray-700">
                                        <Linkedin size={18} />
                                    </a>
                                )}
                                {post.authorX && (
                                    <a href={post.authorX} target="_blank" rel="noopener noreferrer" className="p-2.5 bg-gray-800 hover:bg-white/10 hover:text-white rounded-xl transition-all border border-gray-700">
                                        <Twitter size={18} />
                                    </a>
                                )}
                            </div>
                        </div>

                        {post.image && (
                            <div className="mb-8 rounded-2xl overflow-hidden">
                                <img
                                    src={post.image}
                                    alt={post.title}
                                    className="w-full h-auto max-h-96 object-cover"
                                />
                            </div>
                        )}

                        <div className="bg-gradient-to-r from-yellow-500/10 to-transparent border-l-4 border-yellow-500 p-4 rounded-r-xl mb-8">
                            <p className="text-gray-300 italic">{post.excerpt}</p>
                        </div>

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
                                <div className="mb-8">
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

                        <div className="prose prose-invert max-w-none">
                            <div
                                className="blog-post-content text-gray-400 leading-relaxed"
                                dangerouslySetInnerHTML={{ __html: post.content }}
                            />
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t border-gray-800 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-gray-800 hover:bg-gray-700 rounded-xl font-medium transition-colors text-white"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NewsPreviewModal;
