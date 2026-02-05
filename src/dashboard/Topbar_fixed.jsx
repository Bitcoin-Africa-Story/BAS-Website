import { useState, useEffect, useRef } from 'react';
import { Menu, User, Bell, Search, Newspaper, FileText, Library, Video, Globe, BookOpen, GraduationCap, Calendar, Clock, ChevronRight, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';

const Topbar = ({ onMenuClick = () => { } }) => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const dropdownRef = useRef(null);

  // Helper function to navigate to the item based on source type
  const handleViewDetails = (item) => {
    setShowNotifications(false); // Close dropdown
    
    const routes = {
      'Review News': `/dashboard/upload-news#post-${item.id}`,
      'Story Submission': `/dashboard/submitted-stories#story-${item.id}`,
      'Bitcoin Resource': `/dashboard/upload-resources#resource-${item.id}`,
      'New Video': `/dashboard/upload-videos#video-${item.id}`,
      'Community': `/dashboard/upload-communities#community-${item.id}`,
      'Education': `/dashboard/upload-programs#program-${item.id}`,
      'Program': `/dashboard/upload-other-programs#program-${item.id}`,
      'Event': `/dashboard/upload-event#event-${item.id}`
    };

    const route = routes[item.sourceType];
    if (route) {
      navigate(route);
      // Scroll to element after a small delay to ensure DOM is ready
      setTimeout(() => {
        const elementId = `${item.sourceType.toLowerCase()}-${item.id}`;
        const element = document.getElementById(elementId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          element.classList.add('highlight-item');
          setTimeout(() => element.classList.remove('highlight-item'), 3000);
        }
      }, 100);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Format relative time helper
  const getRelativeTime = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate();
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  // Fetch all activities
  useEffect(() => {
    // Helper to unsubscribe later
    const unsubscribers = [];

    // Define sources
    const sources = [
      { name: 'news', type: 'Review News', icon: Newspaper, color: 'text-blue-500', bg: 'bg-blue-500/10' },
      { name: 'submitted_stories', type: 'Story Submission', icon: FileText, color: 'text-green-500', bg: 'bg-green-500/10', timeField: 'submittedAt' },
      { name: 'bitcoin_resources', type: 'Bitcoin Resource', icon: Library, color: 'text-orange-500', bg: 'bg-orange-500/10' },
      { name: 'bitcoin_videos', type: 'New Video', icon: Video, color: 'text-red-500', bg: 'bg-red-500/10' },
      { name: 'communities', type: 'Community', icon: Globe, color: 'text-purple-500', bg: 'bg-purple-500/10' },
      { name: 'education_programs', type: 'Education', icon: BookOpen, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
      { name: 'other_programs', type: 'Program', icon: GraduationCap, color: 'text-pink-500', bg: 'bg-pink-500/10' },
      { name: 'events', type: 'Event', icon: Calendar, color: 'text-cyan-500', bg: 'bg-cyan-500/10' }
    ];

    // Local state to hold data from all streams
    let allData = {};

    sources.forEach(source => {
      const q = query(
        collection(db, source.name),
        orderBy(source.timeField || 'createdAt', 'desc'),
        limit(3) // Fetch top 3 from each to keep it light but diverse
      );

      const unsub = onSnapshot(q, (snapshot) => {
        const items = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            sourceType: source.type,
            SourceIcon: source.icon,
            iconColor: source.color,
            iconBg: source.bg,
            // Normalize fields
            title: data.title || data.name || data.eventName || 'Untitled Item',
            timestamp: data[source.timeField || 'createdAt'],
            image: data.image || data.logo || data.banner || data.imageSrc || data.thumbnailUrl
          };
        });

        allData[source.name] = items;

        // Merge and sort
        const merged = Object.values(allData).flat().sort((a, b) => {
          const t1 = a.timestamp?.seconds || 0;
          const t2 = b.timestamp?.seconds || 0;
          return t2 - t1;
        });

        setNotifications(merged.slice(0, 15)); // Keep top 15 recent items
        setHasUnread(true); // Simplified "unread" logic
      });

      unsubscribers.push(unsub);
    });

    return () => unsubscribers.forEach(u => u());
  }, []);

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-[#050505]/80 backdrop-blur-md border-b border-white/5 px-4 md:px-8 h-20 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="md:hidden p-2.5 rounded-xl text-gray-400 hover:bg-white/5 hover:text-white transition-all bg-white/5 border border-white/5"
          >
            <Menu size={20} />
          </button>
          <div className="hidden md:flex items-center gap-2 text-sm text-gray-400">
            <span className="opacity-50">Pages</span>
            <span className="opacity-50">/</span>
            <span className="text-white font-medium capitalize">Dashboard</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center bg-white/5 border border-white/5 rounded-xl px-3 py-1.5 gap-2 text-gray-400 focus-within:border-yellow-500/50 transition-all">
            <Search size={16} />
            <input
              type="text"
              placeholder="Search..."
              className="bg-transparent border-none outline-none text-xs w-32 focus:w-48 transition-all"
            />
          </div>

          {/* Notification Dropdown Container */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className={`p-2.5 rounded-xl transition-all relative ${showNotifications ? 'bg-white/10 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
            >
              <Bell size={18} />
              {hasUnread && (
                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-yellow-500 rounded-full border-2 border-[#050505] animate-pulse"></span>
              )}
            </button>

            {/* Review Dropdown UI */}
            {showNotifications && (
              <div className="absolute right-0 top-full mt-4 w-80 md:w-96 bg-[#0A0A0A] border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="p-4 border-b border-white/5 flex items-center justify-between sticky top-0 bg-[#0A0A0A]/95 backdrop-blur z-10">
                  <h3 className="font-bold text-white">Recent Activity</h3>
                  <span className="text-[10px] bg-white/5 px-2 py-1 rounded-full text-gray-400 border border-white/5">{notifications.length} Updates</span>
                </div>

                <div className="max-h-[60vh] overflow-y-auto custom-scrollbar">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                      <Bell size={24} className="mx-auto mb-2 opacity-20" />
                      <p className="text-xs">No recent activity found</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-white/5">
                      {notifications.map((item) => (
                        <div key={`${item.sourceType}-${item.id}`} className="p-4 hover:bg-white/5 transition-colors cursor-pointer group flex gap-4 items-start">
                          {/* Icon/Image */}
                          <div className="flex-shrink-0">
                            {item.image ? (
                              <img src={item.image} alt="" className="w-10 h-10 rounded-lg object-cover border border-white/10" />
                            ) : (
                              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${item.iconBg} ${item.iconColor}`}>
                                <item.SourceIcon size={18} />
                              </div>
                            )}
                          </div>

                          {/* Content */}
                          <div className="flex-grow min-w-0">
                            <div className="flex justify-between items-start gap-2">
                              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-0.5">{item.sourceType}</p>
                              <span className="text-[10px] text-gray-600 flex-shrink-0 whitespace-nowrap">{getRelativeTime(item.timestamp)}</span>
                            </div>
                            <h4 className="text-sm font-medium text-white leading-tight line-clamp-2">{item.title}</h4>
                            <button
                              onClick={() => handleViewDetails(item)}
                              className="flex items-center gap-1 mt-2 text-[10px] text-yellow-500 font-bold opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-[-10px] group-hover:translate-x-0 hover:underline"
                            >
                              View Details <ExternalLink size={10} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="p-3 border-t border-white/5 bg-white/[0.02] text-center">
                  <button className="text-xs text-gray-400 hover:text-white transition-colors">View All Activity</button>
                </div>
              </div>
            )}
          </div>

          <div className="h-8 w-[1px] bg-white/5 mx-1"></div>

          <div className="flex items-center gap-3 pl-2 group cursor-pointer">
            <div className="flex flex-col items-end hidden xs:block">
              <span className="text-sm font-bold text-white leading-none mb-1">Admin</span>
              <span className="text-[10px] text-yellow-500 font-bold uppercase tracking-wider leading-none">Superuser</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400 to-yellow-600 p-[1px]">
              <div className="w-full h-full rounded-[11px] bg-[#0A0A0A] flex items-center justify-center overflow-hidden">
                <User size={20} className="text-yellow-500" />
              </div>
            </div>
          </div>
        </div>
      </header>

      <style>{`
        @keyframes highlight-pulse {
          0%, 100% { background-color: rgba(234, 179, 8, 0.1); }
          50% { background-color: rgba(234, 179, 8, 0.2); }
        }
        .highlight-item {
          animation: highlight-pulse 0.6s ease-in-out 3 !important;
          border-radius: 0.75rem;
        }
      `}</style>
    </>
  );
};

export default Topbar;
