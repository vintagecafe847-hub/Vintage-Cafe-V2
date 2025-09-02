import { ArrowRight, Phone } from 'lucide-react';

// --- The Hero Component ---
const Hero = () => {
  return (
    <section
      id="hero"
      className="relative flex items-center justify-center h-[calc(96vh-35px)] overflow-hidden"
    >
      {/* Top curves at very top of page - higher z-index and fixed positioning */}
      <img
        src="/vro3.svg"
        alt="Decorative curves"
        className="absolute top-0 left-0 z-30 w-full pointer-events-none"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 30,
        }}
      />

      {/* Background color */}
      <div className="absolute inset-0 z-0 bg-[#FEF7F3]"></div>

      {/* Content Container */}
      <div className="relative z-10 px-6 pt-20 mx-auto max-w-8xl sm:px-8 lg:px-12 sm:pt-24 lg:pt-8">
        <div className="flex flex-col items-center gap-8 lg:grid lg:grid-cols-2 lg:gap-8">
          {/* Hero Coffee Blob - First on mobile */}
          <div className="relative flex items-center justify-center mt-4 sm:mt-6 lg:justify-end lg:order-2 lg:mt-0 lg:pl-8">
            <img
              src="/icons/hero-coffee-blob.svg"
              alt="Decorative coffee blob"
              className="w-full max-w-[600px] lg:max-w-[700px]"
            />
          </div>
          {/* Decorative minimal lines in the bottom-right of the hero */}
          <img
            src="/icons/hero-minimal-lines.svg"
            alt=""
            aria-hidden="true"
            className="absolute right-[-110px] bottom-[-80px] w-64 pointer-events-none opacity-60"
            style={{ zIndex: 5 }}
          />

          {/* Text Content - Second on mobile, first on desktop */}
          <div className="text-left lg:order-1 max-w-[700px]">
            <h1 className="mb-6 text-4xl font-bold md:text-6xl lg:text-7xl">
              <span
                className="block"
                style={{
                  fontFamily: 'Montserrat',
                  fontWeight: 800,
                  lineHeight: 1.1,
                  color: '#3B2A20',
                }}
              >
                Handcrafted Coffee
              </span>
              <span
                className="block mt-2"
                style={{
                  fontFamily: 'Montserrat',
                  fontWeight: 800,
                  lineHeight: 1.1,
                  color: '#D8A24A',
                }}
              >
                Small-Town Heart
              </span>
            </h1>
            <p
              className="max-w-2xl mb-8 text-lg leading-relaxed md:text-xl"
              style={{ color: '#3B2A20' }}
            >
              Small-town, farmhouse-style coffeehouse + retail boutique
              featuring espresso drinks, donuts/pastries, and gifts from 100+
              local artisans.
            </p>
            <div className="flex items-center space-x-4">
              <a
                href="#menu"
                className="inline-flex items-center px-8 py-4 text-lg font-semibold text-white transition-all duration-300 transform rounded-full shadow-lg hover:scale-105 hover:shadow-xl group"
                style={{ backgroundColor: '#D8A24A' }}
                onMouseEnter={(e) =>
                  (e.target.style.backgroundColor = '#C8922A')
                }
                onMouseLeave={(e) =>
                  (e.target.style.backgroundColor = '#D8A24A')
                }
              >
                Our Menu
                <ArrowRight className="w-5 h-5 ml-2 transition-transform duration-200 group-hover:translate-x-1" />
              </a>

              <a
                href="tel:+13602000262"
                className="items-center inline-flex px-8 py-4 text-lg font-semibold transition-all duration-300 transform border-2 rounded-full bg-white hover:bg-[#FEF7F3]"
                style={{
                  color: '#3B2A20',
                  borderColor: '#D8A24A',
                }}
                onMouseEnter={(e) => {
                  e.target.style.borderColor = '#C8922A';
                  e.target.style.color = '#3B2A20';
                }}
                onMouseLeave={(e) => {
                  e.target.style.borderColor = '#D8A24A';
                  e.target.style.color = '#3B2A20';
                }}
                aria-label="Call The Shiplap Shop & Coffee House at +1 (360) 200-0262"
              >
                <Phone className="w-5 h-5 mr-2 opacity-90" />
                Call Us
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
