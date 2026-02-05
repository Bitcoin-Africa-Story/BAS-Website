import React from 'react';
import { Eye, Edit, Trash2 } from 'lucide-react';

const NewsListItem = ({ post, onView, onEdit, onDelete }) => {
    return (
        <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-2xl p-5 hover:border-gray-700 transition-all group">
            <div className="flex flex-col md:flex-row gap-5">
                <div className="w-full md:w-48 h-32 rounded-xl overflow-hidden bg-gray-800 flex-shrink-0">
                    <img
                        src={post.image}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                </div>

                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                        <span className="text-xs font-bold text-black bg-yellow-500 px-2 py-1 rounded">{post.category}</span>
                        <span className="text-xs text-gray-500">{post.date}</span>
                        <span className="text-xs text-gray-500">•</span>
                        <span className="text-xs text-gray-500">{post.author}</span>

                        {/* Editorial badges */}
                        {post.isPopular && (
                          <span className="ml-2 text-[10px] font-black text-black bg-yellow-300 px-2 py-1 rounded uppercase">Popular</span>
                        )}
                        {post.isTopStory && (
                          <span className="ml-2 text-[10px] font-black text-white bg-red-600 px-2 py-1 rounded uppercase">Top Story</span>
                        )}
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2 group-hover:text-yellow-500 transition-colors">
                        {post.title}
                    </h3>
                    <p className="text-sm text-gray-400 line-clamp-2 mb-4">{post.excerpt}</p>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => onView(post)}
                            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-xs font-medium transition-colors flex items-center gap-2 text-white"
                        >
                            <Eye size={14} /> View
                        </button>
                        <button
                            onClick={() => onEdit(post)}
                            className="px-4 py-2 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-500 rounded-lg text-xs font-medium transition-colors flex items-center gap-2"
                        >
                            <Edit size={14} /> Edit
                        </button>
                        <button
                            onClick={() => onDelete(post.id)}
                            className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg text-xs font-medium transition-colors flex items-center gap-2 ml-auto"
                        >
                            <Trash2 size={14} /> Delete
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NewsListItem;
