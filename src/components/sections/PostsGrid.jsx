import React from 'react';
import PostCard from './PostCard';

const PostsGrid = ({ posts = [] }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
};

export default PostsGrid;
