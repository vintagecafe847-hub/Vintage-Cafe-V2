import { Instagram, Facebook, Heart, MapPin, Phone, Mail } from 'lucide-react';

const Footer = () => {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const quickLinks = [
    { name: 'Menu', id: 'menu' },
    { name: 'About Us', id: 'about' },
    { name: 'Contact', id: 'contact' },
    { name: 'Home', id: 'hero' },
  ];

  return (
    <footer
      className="relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #1a1a1a 0%, #0f0f0f 100%)',
        color: '#e5ddd5',
      }}
    >
      {/* Subtle overlay pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, rgba(139, 111, 71, 0.3) 2px, transparent 2px)`,
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      <div className="relative px-6 py-16 mx-auto max-w-7xl sm:px-8 lg:px-12">
        {/* Main Footer Content */}
        <div className="grid gap-32 mb-16 lg:grid-cols-3 md:grid-cols-2">
          {/* Left Column: Brand & Hours */}
          <div>
            <h3
              className="mb-6 text-3xl font-bold"
              style={{
                fontFamily: 'Prata, serif',
                color: '#f7f5f3',
                textShadow: '1px 1px 3px rgba(139, 111, 71, 0.3)',
              }}
            >
              Vintage Cafe Schaumburg
            </h3>
            <p
              className="mb-6 text-xl font-medium"
              style={{ color: '#c9a876' }}
            >
              Woman-owned • Community-driven
            </p>
            <p
              className="max-w-md mb-10 text-base leading-relaxed"
              style={{ color: '#b8b0a5' }}
            >
              Small-town, farmhouse-style coffeehouse + retail boutique
              featuring espresso drinks, donuts/pastries, and gifts from 100+
              local artisans in the heart of Yelm.
            </p>

            {/* Hours */}
            <h4
              className="mb-8 text-xl font-semibold"
              style={{
                color: '#f7f5f3',
                textShadow: '0.5px 0.5px 2px rgba(139, 111, 71, 0.2)',
              }}
            >
              Hours
            </h4>
            <div className="space-y-3 text-base">
              <div className="flex justify-between">
                <span style={{ color: '#a8a097' }}>Mon - Thu</span>
                <span style={{ color: '#c9a876' }}>6:00 AM - 5:00 PM</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: '#a8a097' }}>Friday</span>
                <span style={{ color: '#c9a876' }}>6:00 AM - 5:30 PM</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: '#a8a097' }}>Saturday</span>
                <span style={{ color: '#c9a876' }}>7:00 AM - 5:30 PM</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: '#a8a097' }}>Sunday</span>
                <span style={{ color: '#c9a876' }}>7:00 AM - 3:00 PM</span>
              </div>
            </div>
          </div>

          {/* Middle Column: Quick Links */}
          <div>
            <h4
              className="mb-8 text-xl font-semibold"
              style={{
                color: '#f7f5f3',
                textShadow: '0.5px 0.5px 2px rgba(139, 111, 71, 0.2)',
              }}
            >
              Quick Links
            </h4>
            <ul className="space-y-4">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <button
                    onClick={() => scrollToSection(link.id)}
                    className="text-base transition-all duration-300 transform hover:translate-x-1"
                    style={{
                      color: '#a8a097',
                    }}
                    onMouseEnter={(e) =>
                      ((e.target as HTMLElement).style.color = '#c9a876')
                    }
                    onMouseLeave={(e) =>
                      ((e.target as HTMLElement).style.color = '#a8a097')
                    }
                  >
                    {link.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Right Column: Visit Us & Follow Us */}
          <div>
            <h4
              className="mb-8 text-xl font-semibold"
              style={{
                color: '#f7f5f3',
                textShadow: '0.5px 0.5px 2px rgba(139, 111, 71, 0.2)',
              }}
            >
              Visit Us
            </h4>

            <div className="mb-24 space-y-6">
              <div className="flex items-start space-x-3">
                <MapPin
                  className="flex-shrink-0 w-5 h-5 mt-1"
                  style={{ color: '#c9a876' }}
                />
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: '#a8a097' }}
                >
                  105 E Schaumburg Rd
                  <br />
                  Schaumburg, IL 60194, USA
                </p>
              </div>

              <div className="flex items-center space-x-3">
                <Phone
                  className="flex-shrink-0 w-5 h-5"
                  style={{ color: '#c9a876' }}
                />
                <p className="text-sm" style={{ color: '#a8a097' }}>
                  +1 (630) 400-5155
                </p>
              </div>

              <div className="flex items-center space-x-3">
                <Mail
                  className="flex-shrink-0 w-5 h-5"
                  style={{ color: '#c9a876' }}
                />
                <p className="text-sm" style={{ color: '#a8a097' }}>
                  info@vintagecafeschaumburg.com
                </p>
              </div>
            </div>

            {/* Follow Us */}
            <h4
              className="mb-6 text-xl font-semibold"
              style={{
                color: '#f7f5f3',
                textShadow: '0.5px 0.5px 2px rgba(139, 111, 71, 0.2)',
              }}
            >
              Follow Us
            </h4>
            <div className="flex space-x-4">
              <a
                href="https://www.instagram.com/vintagecafeschaumburg/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-12 h-12 transition-all duration-300 transform rounded-full group hover:scale-110"
                style={{
                  backgroundColor: 'rgba(201, 168, 118, 0.15)',
                  border: '2px solid rgba(201, 168, 118, 0.3)',
                  backdropFilter: 'blur(10px)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor =
                    'rgba(201, 168, 118, 0.25)';
                  e.currentTarget.style.borderColor = '#c9a876';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor =
                    'rgba(201, 168, 118, 0.15)';
                  e.currentTarget.style.borderColor =
                    'rgba(201, 168, 118, 0.3)';
                }}
              >
                <Instagram className="w-6 h-6" style={{ color: '#c9a876' }} />
              </a>
              <a
                href="https://www.facebook.com/vintagecafeschaumburg"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-12 h-12 transition-all duration-300 transform rounded-full group hover:scale-110"
                style={{
                  backgroundColor: 'rgba(201, 168, 118, 0.15)',
                  border: '2px solid rgba(201, 168, 118, 0.3)',
                  backdropFilter: 'blur(10px)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor =
                    'rgba(201, 168, 118, 0.25)';
                  e.currentTarget.style.borderColor = '#c9a876';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor =
                    'rgba(201, 168, 118, 0.15)';
                  e.currentTarget.style.borderColor =
                    'rgba(201, 168, 118, 0.3)';
                }}
              >
                <Facebook className="w-6 h-6" style={{ color: '#c9a876' }} />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div
          className="flex flex-col items-center justify-between pt-8 space-y-4 sm:flex-row sm:space-y-0"
          style={{ borderTop: '1px solid rgba(201, 168, 118, 0.2)' }}
        >
          <p className="text-sm" style={{ color: '#a8a097' }}>
            © 2025 The Shiplap Shop & Coffee House. All rights reserved.
          </p>
          <p
            className="flex items-center gap-1 text-sm font-medium"
            style={{ color: '#c9a876' }}
          >
            Made with <Heart className="w-4 h-4 fill-current" /> for our amazing
            community
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
