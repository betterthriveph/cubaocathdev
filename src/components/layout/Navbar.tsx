import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Church, 
  BookOpen, 
  Building2, 
  Newspaper, 
  Phone, 
  Info,
  Clock
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { path: '/', label: 'Home', icon: <Church className="w-3.5 h-3.5" />, match: (p: string) => p === '/' },
    { path: '/about', label: 'About', icon: <Info className="w-3.5 h-3.5" />, match: (p: string) => p.startsWith('/about') },
    { path: '/mass-schedule', label: 'Mass Schedule', icon: <Clock className="w-3.5 h-3.5" />, match: (p: string) => p === '/mass-schedule' },
    { path: '/sacraments', label: 'Sacraments', icon: <BookOpen className="w-3.5 h-3.5" />, match: (p: string) => p.startsWith('/sacraments') },
    { path: '/facilities', label: 'Facilities', icon: <Building2 className="w-3.5 h-3.5" />, match: (p: string) => p.startsWith('/facilities') },
    { path: '/news', label: 'News & Events', icon: <Newspaper className="w-3.5 h-3.5" />, match: (p: string) => p.startsWith('/news') || p.startsWith('/announcements') || p === '/calendar' || p === '/news-and-events' },
    { path: '/contact', label: 'Contact', icon: <Phone className="w-3.5 h-3.5" />, match: (p: string) => p.startsWith('/contact') },
  ];

  return (
    <header className="sticky top-0 z-50 w-full transition-all duration-300">
      {/* Main Header Bar with Page Tabs across the top */}
      <div className={`bg-white/98 backdrop-blur-md transition-shadow duration-300 border-b border-slate-200 ${isScrolled ? 'shadow-md shadow-slate-900/5' : ''}`}>
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between py-2.5 lg:py-0 lg:h-20 gap-2.5 lg:gap-4">
            
            {/* Cathedral Logo & Title */}
            <div className="flex items-center justify-between w-full lg:w-auto">
              <Link 
                id="brand-logo-btn"
                to="/"
                className="flex items-center gap-2.5 sm:gap-3 text-left group focus:outline-none cursor-pointer shrink-0"
              >
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl overflow-hidden bg-white shadow-sm border border-slate-200 group-hover:scale-105 transition-transform flex items-center justify-center p-0.5 shrink-0">
                  <img
                    src="/logo.jpg"
                    alt="Immaculate Conception Cathedral of Cubao Seal"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-cathedral text-sm sm:text-base font-bold tracking-tight text-slate-900 leading-tight">
                      Cubao Cathedral
                    </span>
                  </div>
                  <p className="text-[10px] sm:text-xs text-slate-500 font-medium tracking-wide">
                    Immaculate Conception Cathedral Parish
                  </p>
                  <p className="text-[9px] text-amber-800 font-semibold tracking-wider uppercase">
                    Diocese of Cubao • Quezon City
                  </p>
                </div>
              </Link>
            </div>

            {/* Page Tabs On Top (Directly visible, horizontal navigation) */}
            <nav id="top-pages-tabs-nav" className="flex items-center gap-1 overflow-x-auto pb-1 lg:pb-0 scrollbar-none max-w-full">
              {navItems.map((item) => {
                const isActive = item.match(currentPath);

                return (
                  <Link
                    key={item.path}
                    id={`nav-tab-${item.label.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                    to={item.path}
                    className={`shrink-0 px-2.5 sm:px-3 py-1.5 sm:py-2 text-[11px] sm:text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                      isActive
                        ? 'bg-[#0171bb] text-white shadow-sm font-bold'
                        : 'text-slate-700 hover:text-[#0171bb] hover:bg-slate-100'
                    }`}
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

          </div>
        </div>
      </div>
    </header>
  );
};
