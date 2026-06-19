import { useEffect, useState } from 'react';

export default function Navbar(): React.JSX.Element {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-[#E5E7EB] transition-all duration-200"
      style={{ backdropFilter: scrolled ? 'blur(8px)' : 'none', backgroundColor: scrolled ? 'rgba(255,255,255,0.9)' : '#ffffff' }}
    >
      <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
        <span
          className="text-base font-bold tracking-widest"
          style={{ fontFamily: "'DM Mono', monospace", color: '#F97316' }}
        >
          PRICE SENTINEL
        </span>
        <span
          className="text-sm hidden sm:block"
          style={{ fontFamily: "'DM Mono', monospace", color: '#6B7280' }}
        >
          Metro Vancouver · 22 Stores · June 2026
        </span>
      </div>
    </nav>
  );
}
