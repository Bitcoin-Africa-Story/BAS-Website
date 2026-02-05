import React, { useState, useEffect } from 'react';
import { Play, Clock, Layers, ChevronRight, Activity } from 'lucide-react';
import { db } from '../../firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';

const BitcoinVideos = () => {
  const [videos, setVideos] = useState([]);
  const [activeVideo, setActiveVideo] = useState(null);
  const [loading, setLoading] = useState(true);

  // Helper: normalize YouTube URLs to embed format
  const getEmbedUrl = (url) => {
    if (!url) return null;
    try {
      const u = url.trim();
      // If already an embed link, return as-is
      if (u.includes('youtube.com/embed') || u.includes('youtube-nocookie.com/embed')) return u;
      // Standard watch URL -> convert
      const watchMatch = u.match(/[?&]v=([\w-_-]+)/);
      if (watchMatch && watchMatch[1]) return `https://www.youtube.com/embed/${watchMatch[1]}`;
      // youtu.be short link
      const shortMatch = u.match(/youtu\.be\/(\w[-\w]*)/i);
      if (shortMatch && shortMatch[1]) return `https://www.youtube.com/embed/${shortMatch[1]}`;
      // Already an iframe/embed-like url (keep it) or unknown provider
      if (u.startsWith('http')) return u;
      return null;
    } catch (err) {
      return null;
    }
  };

  useEffect(() => {
    const q = query(collection(db, 'bitcoin_videos'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const videosData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setVideos(videosData);
      // Set active video only if we don't have one yet
      setActiveVideo(prev => prev || (videosData.length > 0 ? videosData[0] : null));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) return null;
  if (videos.length === 0) return null;

  const currentVideo = activeVideo || videos[0];
  const embedSrc = getEmbedUrl(currentVideo?.embedUrl);

  return (
    <div className="bg-black min-h-screen text-white font-mono uppercase tracking-tighter">
      <div className="border-b border-white/10 px-8 py-3 flex justify-between items-center text-[10px] text-gray-500">
        <div className="flex gap-6">
          <span className="flex items-center gap-2"><Activity className="w-3 h-3 text-yellow-500" /> NETWORK: MAINNET</span>
          <span>EST. 2009</span>
        </div>
        <div className="flex gap-4">
          <span>LATENCY: 24MS</span>
          <span className="text-yellow-500">LIVE FEED</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[calc(100vh-45px)]">
        <div className="lg:col-span-8 border-r border-white/10 flex flex-col">
          <div className="p-8 lg:p-12 flex-grow">
            <div className="relative aspect-video bg-[#0A0A0A] border border-white/20">
              {embedSrc ? (
                <iframe
                  className="w-full h-full"
                  src={`${embedSrc}${embedSrc.includes('?') ? '&' : '?'}autoplay=0&controls=1&modestbranding=1`}
                  title={currentVideo.title}
                  allowFullScreen
                ></iframe>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <p className="text-gray-400">Invalid video URL. Please check the embed URL in the dashboard.</p>
                </div>
              )}
              <div className="absolute -top-[1px] -left-[1px] w-4 h-4 border-t border-l border-yellow-500"></div>
              <div className="absolute -bottom-[1px] -right-[1px] w-4 h-4 border-b border-r border-yellow-500"></div>
            </div>

            <div className="mt-12 space-y-8">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="max-w-2xl">
                  <div className="flex items-center gap-3 mb-4 text-yellow-500 text-xs font-bold tracking-[0.2em]">
                    <Layers className="w-4 h-4" />
                    MODULE: {currentVideo.category}
                  </div>
                  <h1 className="text-3xl md:text-5xl font-black leading-none">
                    {currentVideo.title}
                  </h1>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-8 border-y border-white/10">
                <div>
                  <span className="block text-gray-500 text-[10px] mb-1">DURATION</span>
                  <span className="text-xl font-bold">{currentVideo.duration}</span>
                </div>
                <div>
                  <span className="block text-gray-500 text-[10px] mb-1">FORMAT</span>
                  <span className="text-xl font-bold underline decoration-yellow-500">4K HDR</span>
                </div>
                <div>
                  <span className="block text-gray-500 text-[10px] mb-1">LEVEL</span>
                  <span className="text-xl font-bold">PRO-VERIFIED</span>
                </div>
              </div>

              <p className="text-gray-400 font-sans normal-case text-lg leading-relaxed max-w-3xl">
                {currentVideo.description}
              </p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 bg-[#050505] flex flex-col">
          <div className="p-6 border-b border-white/10 flex justify-between items-center">
            <h2 className="text-sm font-black tracking-[0.3em]">CURRICULUM</h2>
            <span className="text-[10px] text-yellow-500 font-bold">{videos.length} MODULES AVAILABLE</span>
          </div>

          <div className="flex-grow overflow-y-auto">
            {videos.map((video) => (
              <button
                key={video.id}
                onClick={() => setActiveVideo(video)}
                className={`w-full group relative flex flex-col border-b border-white/5 transition-all duration-300 ${currentVideo.id === video.id
                  ? 'bg-white text-black'
                  : 'bg-transparent text-white hover:bg-white/5'
                  }`}
              >
                <div className="p-6 flex gap-6">
                  <div className="w-24 aspect-square bg-zinc-900 flex-shrink-0 border border-white/10 overflow-hidden">
                    <img
                      src={video.thumbnailUrl}
                      alt=""
                      className={`w-full h-full object-cover transition-opacity duration-500 ${currentVideo.id === video.id ? 'opacity-100' : 'opacity-40 group-hover:opacity-100'}`}
                    />
                  </div>
                  <div className="flex flex-col justify-between py-1">
                    <h3 className={`text-xs font-black leading-tight tracking-tight ${currentVideo.id === video.id ? 'text-black' : 'text-gray-300 group-hover:text-white'}`}>
                      {video.title}
                    </h3>
                    <div className={`flex items-center gap-2 text-[10px] font-bold ${currentVideo.id === video.id ? 'text-black/60' : 'text-gray-500'}`}>
                      <Clock className="w-3 h-3" />
                      {video.duration}
                    </div>
                  </div>
                  {currentVideo.id === video.id && (
                    <div className="absolute right-6 top-1/2 -translate-y-1/2">
                      <ChevronRight className="w-5 h-5" />
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BitcoinVideos;