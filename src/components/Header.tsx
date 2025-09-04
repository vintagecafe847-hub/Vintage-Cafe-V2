import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Instagram, Facebook } from 'lucide-react';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const revealThreshold = 50; // px the user must scroll up before header reveals

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsScrolled(currentScrollY > 50);

      // If mobile menu is open, always keep header visible
      if (isMenuOpen) {
        setIsVisible(true);
        lastScrollY.current = currentScrollY;
        return;
      }

      // Scrolling down: hide header after passing a small offset
      if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
        setIsVisible(false);
      } else {
        // Scrolling up: only reveal if user scrolled up more than the threshold
        if (
          lastScrollY.current - currentScrollY > revealThreshold ||
          currentScrollY < 50
        ) {
          setIsVisible(true);
        }
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isMenuOpen]);

  const scrollToSection = (sectionId: string) => {
    if (location.pathname !== '/') {
      // If not on home page, navigate to home first
      navigate('/', { state: { scrollTo: sectionId } });
    } else {
      // If on home page, scroll directly
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
    setIsMenuOpen(false);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsMenuOpen(false);
  };

  return (
    <header
      className={`fixed w-full z-50 transition-all duration-500 ${
        isVisible ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      <div className="px-4 pt-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div
          className={`transition-all duration-500 rounded-3xl ${
            isScrolled || isMenuOpen
              ? 'bg-[#121212] backdrop-blur-lg shadow-lg border border-[#D8A24A]/20'
              : 'bg-transparent'
          }`}
        >
          <div className="flex items-center justify-between h-20 px-6 lg:h-24">
            {/* Logo */}
            <div className="flex-shrink-0">
              <img
                src={
                  isScrolled || isMenuOpen
                    ? '/white-logo.png'
                    : '/dark-logo.png'
                }
                alt="The Shiplap Shop & Coffee House"
                width={120}
                height={40}
                style={{ display: 'block' }}
                className="transition-opacity duration-500"
              />
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden space-x-10 md:flex">
              {[
                { name: 'Home', id: 'hero', type: 'scroll' },
                { name: 'About', id: 'about', type: 'scroll' },
                { name: 'Menu', id: 'menu', type: 'scroll' },
                { name: 'Contact', id: 'contact', type: 'scroll' },
              ].map((item) => (
                <button
                  key={item.name}
                  onClick={() =>
                    item.type === 'navigate'
                      ? handleNavigation(item.id)
                      : scrollToSection(item.id)
                  }
                  className={`relative px-4 py-3 text-base font-medium transition-colors duration-200 group ${
                    isScrolled || isMenuOpen
                      ? 'text-white hover:text-[#D8A24A]'
                      : 'text-black hover:text-black/80'
                  }`}
                  style={{
                    textShadow: isScrolled || isMenuOpen ? 'none' : 'none',
                  }}
                >
                  {item.name}
                  <span
                    className={`absolute bottom-0 left-0 w-0 h-0.5 group-hover:w-full transition-all duration-300 ${
                      isScrolled || isMenuOpen ? 'bg-[#D8A24A]' : 'bg-black'
                    }`}
                  ></span>
                </button>
              ))}
            </nav>

            {/* Social Links & Mobile Menu */}
            <div className="flex items-center space-x-4">
              <div className="hidden space-x-4 md:flex">
                <a
                  href="https://www.instagram.com/vintagecafeschaumburg/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`transition-colors duration-200 ${
                    isScrolled || isMenuOpen
                      ? 'text-white hover:text-[#D8A24A]'
                      : 'text-black hover:text-black/80'
                  }`}
                  style={{
                    filter: 'none',
                  }}
                >
                  <Instagram size={24} />
                </a>
                <a
                  href="https://www.facebook.com/vintagecafeschaumburg"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`transition-colors duration-200 ${
                    isScrolled || isMenuOpen
                      ? 'text-white hover:text-[#D8A24A]'
                      : 'text-[#3B2A20] hover:text-[#3B2A20]/80'
                  }`}
                  style={{
                    filter: 'none',
                  }}
                >
                  <Facebook size={24} />
                </a>
              </div>

              {/* Mobile menu button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className={`transition-colors duration-200 md:hidden ${
                  isScrolled || isMenuOpen
                    ? 'text-white hover:text-[#D8A24A]'
                    : 'text-black hover:text-black/80'
                }`}
                style={{
                  filter: 'none',
                }}
              >
                {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          <div
            className={`md:hidden transition-all duration-300 ${
              isMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
            } overflow-hidden bg-[#121212] backdrop-blur-md border-t border-[#D8A24A]/20 rounded-b-3xl`}
          >
            <div className="flex flex-col items-center px-2 pt-4 pb-6 space-y-2">
              {[
                { name: 'Home', id: 'hero', type: 'scroll' },
                { name: 'About', id: 'about', type: 'scroll' },
                { name: 'Menu', id: 'menu', type: 'scroll' },
                { name: 'Contact', id: 'contact', type: 'scroll' },
              ].map((item) => (
                <button
                  key={item.name}
                  onClick={() =>
                    item.type === 'navigate'
                      ? handleNavigation(item.id)
                      : scrollToSection(item.id)
                  }
                  className="block w-auto px-6 py-3 mx-2 text-lg font-medium text-center text-white transition-colors duration-200 rounded-lg hover:bg-[#D8A24A]/20 hover:text-[#D8A24A]"
                >
                  {item.name}
                </button>
              ))}
              <div className="flex items-center justify-center px-6 pt-4 space-x-6">
                <a
                  href="https://www.instagram.com/vintagecafeschaumburg/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white transition-colors duration-200 hover:text-[#D8A24A]"
                >
                  <Instagram size={24} />
                </a>
                <a
                  href="https://www.facebook.com/vintagecafeschaumburg"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white transition-colors duration-200 hover:text-[#D8A24A]"
                >
                  <Facebook size={24} />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
