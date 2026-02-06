import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Newspaper,
  Calendar,
  MessageSquare,
  LayoutDashboard,
  Home,
  LogOut,
  ChevronRight,
  Globe,
  BookOpen,
  Video,
  PlayCircle,
  Library,
  GraduationCap,
  Heart,
  Users,
  Mail
} from 'lucide-react';

const sidebarItems = [
  { name: 'News & Stories', path: '/dashboard/upload-news', icon: Newspaper },
  { name: 'Events Manager', path: '/dashboard/upload-event', icon: Calendar },
  { name: 'Submitted Events', path: '/dashboard/submitted-events', icon: MessageSquare },
  { name: 'Communities', path: '/dashboard/upload-communities', icon: Globe },
  { name: 'Submitted Stories', path: '/dashboard/submitted-stories', icon: MessageSquare },
  { name: 'Edu Programs', path: '/dashboard/upload-programs', icon: BookOpen },
  { name: 'Other Programs', path: '/dashboard/upload-other-programs', icon: GraduationCap },
  { name: 'Bitcoin Videos', path: '/dashboard/upload-videos', icon: Video },
  { name: 'Why Bitcoin Video', path: '/dashboard/upload-why-video', icon: PlayCircle },
  { name: 'Bitcoin Resources', path: '/dashboard/upload-resources', icon: Library },
  { name: 'X Testimonials', path: '/dashboard/upload-testimonials', icon: Heart },
  { name: 'Education Testimonials', path: '/dashboard/upload-education-testimonials', icon: Users },
  { name: 'Newsletter', path: '/dashboard/newsletter-subscribers', icon: Mail },
];

const Sidebar = ({ open = false, onClose = () => { } }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/admin');
    } catch (e) {
      console.error(e);
    }
  };
  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex fixed left-0 top-0 h-screen w-64 bg-[#0A0A0A] border-r border-white/5 flex-col z-50">
        <div className="p-8">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 bg-yellow-500 flex items-center justify-center rounded-lg group-hover:rotate-12 transition-transform duration-300">
              <span className="font-black text-black">B</span>
            </div>
            <span className="text-xl font-bold tracking-tighter">BAS <span className="text-yellow-500">ADMIN</span></span>
          </Link>
        </div>

        <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
          <div className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] px-4 mb-4">Management</div>
          {sidebarItems.map(item => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) => `
                flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 group
                ${isActive
                  ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'
                  : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'}
              `}
            >
              <div className="flex items-center gap-3">
                <item.icon size={18} className={`${({ isActive }) => isActive ? 'text-yellow-500' : ''}`} />
                <span className="text-sm font-medium">{item.name}</span>
              </div>
              <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-white/5 space-y-2">
          <Link
            to="/"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all"
          >
            <Home size={18} />
            <span className="text-sm font-medium">Main Site</span>
          </Link>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400/70 hover:text-red-400 hover:bg-red-400/5 transition-all">
            <LogOut size={18} />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile drawer */}
      <div className={`md:hidden fixed inset-0 z-[100] ${open ? '' : 'pointer-events-none'}`}>
        <div
          className={`absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity duration-300 ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
          onClick={onClose}
        />
        <aside className={`absolute left-0 top-0 h-full w-72 bg-[#0A0A0A] border-r border-white/10 p-4 pt-6 pb-8 transform transition-transform duration-500 ease-out ${open ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="flex items-center justify-between mb-6 px-2">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-8 h-8 bg-yellow-500 flex items-center justify-center rounded-lg">
                <span className="font-black text-black">B</span>
              </div>
              <span className="text-lg font-bold tracking-tighter">BAS <span className="text-yellow-500 font-black">ADMIN</span></span>
            </Link>
            <button onClick={onClose} className="p-2 text-gray-400 rounded-md hover:bg-white/5">
              <ChevronRight className="rotate-180" size={20} />
            </button>
          </div>

          <nav className="space-y-2 overflow-y-auto max-h-[calc(100vh-200px)] px-2 pr-3 pb-6">
            {sidebarItems.map(item => (
              <NavLink
                key={item.name}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) => `
                  flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-300
                  ${isActive
                    ? 'bg-yellow-500 text-black font-bold shadow-lg shadow-yellow-500/20'
                    : 'text-gray-400 hover:bg-white/5'}
                `}
              >
                <item.icon size={18} />
                <span className="text-sm">{item.name}</span>
              </NavLink>
            ))}
          </nav>

          <div className="mt-auto px-2 pt-4 border-t border-white/5">
            <Link to="/" className="flex items-center gap-3 px-3 py-3 text-gray-400 hover:text-white mb-2 rounded-lg">
              <Home size={18} />
              <span>Main Site</span>
            </Link>
            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-3 text-red-400/70 hover:text-red-400 rounded-lg">
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </div>
        </aside>
      </div>
    </>
  );
};

export default Sidebar;
