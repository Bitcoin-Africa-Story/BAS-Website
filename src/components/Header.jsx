import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'News ', path: '/news' },
    { name: 'Education', path: '/education' },
    { name: 'Events', path: '/events' },
    { name: 'Contact', path: '/contact' },
    { name: 'About', path: '/about' },
    { name: 'Donate', path: '/donate' }

  ];

  const subheadernavLinks = [
    { name: 'Donate', path: '/donate' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <header className="fixed    top-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-sm border-b border-gray-800  ">

      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      <nav className="max-w-7xl mx-auto px-6 pb-4 pt-[10px]">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center  group">

            <img
              src="/assets/BitcoinAfricaStoryLogo.png"
              alt="Bitcoin Africa Story"
              className="w-[100px] h-[50px] "
            />

          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-medium transition-colors duration-200 relative group ${link.name === 'Donate' ? 'bg-yellow-500 text-black px-3 py-2  shadow-lg' : (
                  isActive(link.path)
                    ? 'text-yellow-500'
                    : 'text-gray-300 hover:text-yellow-500'
                )
                  }`}
              >
                {link.name}
                <span
                  className={`absolute -bottom-1 left-0 h-0.5 bg-yellow-500 transition-all duration-200 ${link.name === 'Donate' ? 'hidden' : (
                    isActive(link.path) ? 'w-full' : 'w-0 group-hover:w-full'
                  )
                    }`}
                />
              </Link>
            ))}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-white hover:text-yellow-500 transition-colors duration-200"
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Subheader (compact) */}


        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden mt-4 pb-4 space-y-3 relative z-50 bg-black/80 backdrop-blur-sm rounded-lg p-4">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`block px-4 py-2  text-sm font-medium transition-colors duration-200 ${link.name === 'Donate' ? 'bg-yellow-500 text-black shadow-lg' : (
                  isActive(link.path)
                    ? 'text-yellow-500 bg-yellow-500/10'
                    : 'text-gray-300 hover:text-yellow-500 hover:bg-yellow-500/5'
                )
                  }`}
              >
                {link.name}
              </Link>
            ))}
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;