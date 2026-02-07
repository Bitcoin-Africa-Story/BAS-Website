import React, { useMemo } from 'react';
import { Helmet } from "react-helmet";
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Users, Shield, TrendingUp } from 'lucide-react';
import { blogPosts as mockPosts, testimonials, features, categories } from '../mock';
import { PostsGrid, TestimonialCarousel, Hero, Mission } from '../components/sections';
import ScrollToTop from '../components/ScrollToTop';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { useNews } from '../context/NewsContext';

const Home = () => {
  const { news: posts, loading } = useNews();
  const [communities, setCommunities] = useState([]);
  const [communitiesLoading, setCommunitiesLoading] = useState(true);
  const [testimonialsList, setTestimonialsList] = useState([]);
  const [testimonialsLoading, setTestimonialsLoading] = useState(true);

  // Fetch communities from Firebase
  useEffect(() => {
    const fetchCommunities = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'communities'));
        const communitiesData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setCommunities(communitiesData);
      } catch (error) {
        console.error('Error fetching communities:', error);
      } finally {
        setCommunitiesLoading(false);
      }
    };

    fetchCommunities();
  }, []);

  // Fetch testimonials from Firebase
  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'testimonials'));
        const testimonialsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setTestimonialsList(testimonialsData);
      } catch (error) {
        console.error('Error fetching testimonials:', error);
      } finally {
        setTestimonialsLoading(false);
      }
    };

    fetchTestimonials();
  }, []);

  // Group posts by category for categorized display (dynamic, works with API-shaped data)
  const groupedPosts = useMemo(() => {
    return posts.slice(0).reverse().reduce((acc, post) => {
      const cat = post.category || 'Uncategorized';
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(post);
      return acc;
    }, {});
  }, [posts]);

  // Use categories from mock if available, otherwise derive from grouped posts
  const categoriesToShow = (categories && categories.length > 0)
    ? categories.filter(c => c !== 'All')
    : Object.keys(groupedPosts);

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Bitcoin Africa Story",
    "url": "https://bitcoinafricastory.com",
    "logo": "https://bitcoinafricastory.com/assets/BASlogo.png",
    "sameAs": [
      "https://x.com/story_bitcoin",
      "https://youtube.com/@bitcoinafricastory",
      "https://t.me/+KirVlW8gMMtlNDI8",
      "https://www.linkedin.com/company/bitcoin-africa-story/",
      "https://primal.net/p/nprofile1qqs0tmrphute79adfe4r3h8qdkdgqw3fz9244238x2ss53lmhft3jug4hhw4r"
    ]
  };

  return (
    <div className="pt-16 md:mt-[40px]">
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify(organizationSchema)}
        </script>
      </Helmet>
      {/* Hero Section */}
      <Hero />

      {/* Why Bitcoin Matters */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Pillars of   <span className="text-yellow-500"> Bitcoin Africa Story </span>
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Discover how Bitcoin is transforming lives and creating opportunities across Africa
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => (
              <div
                key={feature.id}
                className="group relative overflow-hidden  bg-gray-900 border border-gray-800 hover:border-yellow-500 transition-all duration-300 hover:scale-105"
              >
                <div className="aspect-video overflow-hidden">
                  <img
                    src={feature.image}
                    alt={feature.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-2xl font-bold mb-3 text-yellow-500">{feature.title}</h3>
                  <p className="text-gray-400 leading-relaxed">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Mission */}
      <Mission />

      {/* Recent Blog Posts - CATEGORIZED */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                From Our News and <span className="text-yellow-500">Stories</span>
              </h2>
              <p className="text-xl text-gray-400">Latest insights on Bitcoin Movement and adoption in Africa</p>
            </div>
            <Link
              to="/news"
              className="hidden md:inline-flex items-center text-yellow-500 font-semibold hover:text-yellow-400 transition-colors duration-200"
            >
              View All Posts
              <ArrowRight className="ml-2" size={20} />
            </Link>
          </div>

          {/* Dynamically render categories and their posts (preserves existing UI) */}
          {categoriesToShow.map((cat) => {
            const posts = (groupedPosts[cat] || []).slice(0, 3);
            if (!posts || posts.length === 0) return null;
            return (
              <div key={cat} className="mb-16">
                <h3 className="text-2xl md:text-3xl font-bold mb-8">{cat}</h3>
                <PostsGrid posts={posts} />
              </div>
            );
          })}

          <div className="text-center mt-8 md:hidden">
            <Link
              to="/news"
              className="inline-flex items-center text-yellow-500 font-semibold hover:text-yellow-400 transition-colors duration-200"
            >
              View All Posts
              <ArrowRight className="ml-2" size={20} />
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials - CAROUSEL */}
      <section className="py-20 px-6 bg-gradient-to-b from-gray-900/30 to-transparent">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Success <span className="text-yellow-500">Stories</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Hear from learners who transformed their financial futures with Bitcoin
            </p>
          </div>

          {!testimonialsLoading && <TestimonialCarousel testimonials={testimonialsList} />}
        </div>
      </section>

      {/* Communities Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gray-900 border border-gray-800 p-8 shadow-lg">
            <div className="text-center mb-6">
              <h2 className="text-2xl md:text-3xl font-bold text-white">African Bitcoin Communities</h2>
              <p className="text-sm text-gray-400 mt-2">Discover other amazing Bitcoin communities across Africa</p>
            </div>

            {communitiesLoading ? (
              <div className="text-center py-12">
                <div className="w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-gray-400 mt-4">Loading communities...</p>
              </div>
            ) : communities.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-400">No communities available yet.</p>
              </div>
            ) : (
              <>
                {/* Logo grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                  {communities.slice(0, 8).map((community) => (
                    <a
                      key={community.id}
                      href={community.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center aspect-square bg-gray-800 border border-gray-700 hover:border-yellow-500 transition-all p-4 group"
                    >
                      <img
                        src={community.logo}
                        alt={community.name}
                        className="w-full h-full object-contain group-hover:scale-110 transition-transform"
                      />
                    </a>
                  ))}
                </div>

                {/* Community list */}
                <div className="space-y-4 mb-6">
                  {communities.slice(0, 4).map((community) => (
                    <div key={community.id} className="flex items-start justify-between p-4 bg-gray-800 border border-gray-700">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <div className="font-semibold text-white">{community.name}</div>
                        </div>
                        {community.description && (
                          <div className="text-sm text-gray-400 mt-1">{community.description}</div>
                        )}
                      </div>
                      <a
                        href={community.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-4 px-3 py-1 border border-yellow-500 text-yellow-500 rounded-md hover:bg-yellow-500/10 transition-all"
                      >
                        Visit
                      </a>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </section>
      <ScrollToTop />
    </div>
  );
};

export default Home;