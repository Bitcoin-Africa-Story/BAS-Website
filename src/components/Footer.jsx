import { Link } from 'react-router-dom';
import { Twitter, Facebook, Youtube } from 'lucide-react';
import { useNews } from '../context/NewsContext';
import { useMemo } from 'react';






// Reusable Post Card component (Unchanged)
const PostCard = ({ title, author, image, link }) => (
  <Link to={link} className="flex items-start space-x-3 group">
    {/* Post Image/Thumbnail */}
    <div className="flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 overflow-hidden rounded-md border border-gray-700">
      <img
        src={image}
        alt={title}
        className="w-full h-full object-cover group-hover:opacity-75 transition-opacity duration-200"
      />
    </div>
    {/* Post Content */}
    <div className="flex-1">
      <p className="text-gray-200 text-sm leading-snug group-hover:text-yellow-500 transition-colors duration-200">
        {title}
      </p>
      <p className="text-gray-500 text-xs mt-1">
        BY <span className="font-medium">{author}</span>
      </p>
    </div>
  </Link>
);


const Footer = () => {
  const { news } = useNews();

  // Dynamic Categories Logic
  const categories = useMemo(() => {
    if (!news || news.length === 0) return [];

    const counts = {};
    news.forEach(post => {
      if (post.category) {
        counts[post.category] = (counts[post.category] || 0) + 1;
      }
    });

    return Object.entries(counts)
      .map(([name, count]) => ({
        name,
        count,
        link: `/category/${name.toLowerCase().replace(/\s+/g, '-')}`
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8); // UI Limit as requested
  }, [news]);

  return (
    <footer className="bg-black border-t-8 border-yellow-500">
      <div className="max-w-7xl mx-auto px-6 py-12">

        {/* === TOP SECTION: POSTS AND CATEGORIES GRID === */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-16">

          {/* 1. Popular Posts Column */}
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-yellow-500 uppercase tracking-wider">Popular Posts</h2>
            <div className="space-y-4">
              {(() => {
                const popularList = (news || []).filter(p => p.isPopular).slice(0, 6);
                if (popularList.length === 0) {
                  return <p className="text-gray-500 italic text-sm">Popular posts will be uploaded soon.</p>;
                }
                return popularList.map((post) => (
                  <PostCard
                    key={post.id}
                    title={post.title}
                    author={post.author}
                    image={post.image}
                    link={`/news/${post.id}`}
                  />
                ));
              })()}
            </div>
          </div>

          {/* 2. Top Stories Column */}
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-yellow-500 uppercase tracking-wider">Top Stories</h2>
            <div className="space-y-4">
              {(() => {
                const topList = (news || []).filter(p => p.isTopStory).slice(0, 6);
                if (topList.length === 0) {
                  return <p className="text-gray-500 italic text-sm">Top stories will be uploaded soon.</p>;
                }
                return topList.map((post) => (
                  <PostCard
                    key={post.id + 'ts'}
                    title={post.title}
                    author={post.author}
                    image={post.image}
                    link={`/news/${post.id}`}
                  />
                ));
              })()}
            </div>
          </div>

          {/* 3. Categories Column */}
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-yellow-500 uppercase tracking-wider">Categories</h2>
            <ul className="space-y-2">
              {categories.length === 0 ? (
                <p className="text-gray-500 italic text-sm">No categories found.</p>
              ) : (
                categories.map((category) => (
                  <li
                    key={category.name}
                    className="flex items-center justify-between py-1 "
                  >
                    <Link
                      to={`/news?category=${category.name}`}
                      className="text-white text-base font-medium uppercase hover:text-yellow-500 cursor-pointer transition-colors duration-200"
                    >
                      {category.name}
                    </Link>
                    <span className="text-white ">
                      {category.count}
                    </span>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>

        {/* === BOTTOM SECTION: LOGO, ABOUT, FOLLOW US (3-Column Grid) === */}
        <div className="mt-[130px] grid grid-cols-1 md:grid-cols-3 gap-[50px] items-start">

          {/* 1. Logo/Brand Column */}
          <div className="flex justify-start">
            <Link to="/">
              <img
                src="/assets/BASlogo.png"
                alt="Bitcoin Africa Story "
                className="w-[100%] md:w-[200px] "
              />
            </Link>
          </div>

          {/* 2. About Us Column */}
          <div className="text-center md:text-left md:mt-[30px]">
            <div>
              <h3 className="text-lg font-bold text-white mb-2 uppercase">About Us</h3>
              <p className="text-gray-400 text-sm max-w-sm mx-auto md:mx-0">
                Bitcoin Africa Story is a trusted source of news, insights, and narratives focused on Bitcoin adoption, innovation, and impact around Bitcoin adoption across the African continent.
              </p>
            </div>

          </div>

          {/* 3. Follow Us Column */}
          <div className="text-center md:text-left md:mt-[20px]">
            <h3 className="text-lg font-bold text-white mb-2 uppercase">Follow Us</h3>
            <div className="flex flex-wrap gap-4 justify-center md:justify-start text-sm">
              <a
                href="https://x.com/story_bitcoin"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-yellow-500 transition-colors duration-200"
              >
                X (Twitter)
              </a>
              <span className="text-gray-600">·</span>
              <a
                href="https://youtube.com/@bitcoinafricastory"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-yellow-500 transition-colors duration-200"
              >
                YouTube
              </a>
              <span className="text-gray-600">·</span>
              <a
                href="https://t.me/+KirVlW8gMMtlNDI8"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-yellow-500 transition-colors duration-200"
              >
                Telegram
              </a>
              <span className="text-gray-600">·</span>
              <a
                href="https://www.linkedin.com/company/bitcoin-africa-story/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-yellow-500 transition-colors duration-200"
              >
                LinkedIn
              </a>
              <span className="text-gray-600">·</span>
              <a
                href="https://primal.net/p/nprofile1qqs0tmrphute79adfe4r3h8qdkdgqw3fz9244238x2ss53lmhft3jug4hhw4r"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-yellow-500 transition-colors duration-200"
              >
                Nostr
              </a>
            </div>

            <div className="mt-8 pt-6 text-center md:text-left   text-sm ">
              <ul className="flex md:flex-wrap d space-x-4 text-white">
                <li><Link to="/about" className="hover:text-yellow-500 uppercase">ABOUT US</Link></li>
                <li><Link to="/terms" className="hover:text-yellow-500 uppercase">TERM OF USE</Link></li>
                <li><Link to="/privacy" className="hover:text-yellow-500 uppercase">PRIVACY POLICY</Link></li>
              </ul>
              <p className="mt-2 text-xs text-gray-500">
                © Bitcoin Africa Story, 2026. All Rights Reserved.
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;