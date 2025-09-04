import { useEffect, useRef, useState } from 'react';
import { Heart, Music, Users, Wifi, Star, Award, Coffee } from 'lucide-react';

const About = () => {
  const features = [
    { icon: Music, text: 'Piano, Voice, Violin & Guitar Lessons' },
    { icon: Users, text: 'Meditation Sessions' },
    { icon: Star, text: 'Live Music Weekends' },
    { icon: Wifi, text: 'Free WiFi & Study Space' },
    { icon: Heart, text: 'Community Events' },
  ];

  // refs and state for positioning the decorative flower
  const containerRef = useRef<HTMLDivElement | null>(null);
  const headerRef = useRef<HTMLDivElement | null>(null);

  return (
    <section
      id="about"
      className="relative pt-20 bg-[#FAFAFA]"
      style={{ overflow: 'visible' }}
    >
      <div
        className="relative z-10 px-4 mx-auto max-w-7xl sm:px-6 lg:px-8"
        ref={containerRef}
      >
        {/* Header */}
        <div className="mb-16 text-center" ref={headerRef}>
          <h2
            className="mb-6 text-4xl font-bold md:text-5xl text-[#3B2A20]"
            style={{
              fontFamily: 'Prata, serif',
            }}
          >
            Our Story
          </h2>
          <div className="w-24 h-1 mx-auto mb-6 bg-[#D8A24A]"></div>
          <p className="max-w-3xl mx-auto text-xl leading-relaxed text-[#3B2A20]/70">
            More than just a coffee shop – we're a community hub where neighbors
            become friends and creativity flourishes in the heart of Schaumburg.
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid items-center gap-16 mb-20 lg:grid-cols-2">
          {/* Image */}
          <div className="relative group">
            {/* Plant SVG (asset2) behind the image */}
            <div className="absolute left-[-80px] sm:left-[-110px] lg:left-[-110px] top-[-110px] z-0 rotate-[20deg] w-[130px] sm:w-[180px] pointer-events-none">
              <img
                src="/icons/green-plant.svg"
                alt="Decorative plant"
                style={{ width: '100%', height: 'auto', display: 'block' }}
              />
            </div>
            <img
              src="/images/outside/vintage-cafe-outside2.jpg"
              alt="Cafe interior with warm lighting"
              className="relative z-10 object-cover w-full transition-shadow duration-300 shadow-2xl h-96 rounded-2xl group-hover:shadow-3xl"
            />
            <div className="absolute z-20 p-3 text-white rounded-lg shadow-lg sm:p-4 md:p-6 -bottom-3 sm:-bottom-4 md:-bottom-6 -right-3 sm:-right-4 md:-right-6 bg-[#D8A24A] sm:rounded-xl">
              <Coffee className="w-6 h-6 mb-1 sm:w-7 sm:h-7 sm:mb-2 md:w-8 md:h-8 md:mb-2" />
              <p className="text-xs font-semibold sm:text-sm">
                Cozy & Relaxing
                <br />
                Atmosphere
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="space-y-8">
            <div className="relative">
              {/* Clickable flower that links to the Woman-Owned heading */}
              <a
                href="#woman-owned"
                aria-label="Jump to Woman-Owned & Community-Focused"
                className="absolute right-0 z-20 -top-[760px] sm:-top-[700px] md:-top-[740px] lg:-top-48"
                style={{ pointerEvents: 'auto' }}
              >
                <img
                  src="/icons/pink-flower.svg"
                  alt="Flower - jump to Woman-Owned section"
                  className="w-[65px] sm:w-[65px] md:w-[70px] lg:w-[100px] md:w-[110px]"
                  style={{ display: 'block', height: 'auto' }}
                />
              </a>

              {/* Mirrored decorative pink flower on the left for screens < md */}
              <div
                className="absolute left-0 z-20 -top-[760px] sm:-top-[700px] md:-top-[740px] lg:-top-48 block md:hidden"
                aria-hidden="true"
                style={{ pointerEvents: 'none' }}
              >
                <img
                  src="/icons/pink-flower3.svg"
                  alt=""
                  className="w-[65px] sm:w-[65px] md:w-[70px] lg:w-[100px] md:w-[110px]"
                  style={{
                    display: 'block',
                    height: 'auto',
                    transform: 'scaleX(-1)',
                  }}
                />
              </div>

              <h3
                id="woman-owned"
                className="mb-4 text-2xl font-bold text-[#3B2A20]"
              >
                Woman-Owned & Community-Focused
              </h3>
              <p className="leading-relaxed text-[#3B2A20]/70">
                Vintage Cafe is more than just a coffee shop – it's a community
                hub where neighbors become friends and creativity flourishes. As
                a proud woman-owned business, we're committed to creating a
                welcoming space for everyone.
              </p>
            </div>

            <div>
              <h3 className="mb-4 text-2xl font-bold text-[#3B2A20]">
                More Than Coffee
              </h3>
              <p className="leading-relaxed text-[#3B2A20]/70">
                Beyond our carefully crafted beverages and fresh pastries, we
                offer music lessons, meditation sessions, and creative workshops
                upstairs. Whether you're here for your morning coffee or to
                learn a new skill, we're here to support your journey.
              </p>
            </div>
          </div>
        </div>

        {/* Second Row - Reversed */}
        <div className="grid items-center gap-16 mb-16 lg:grid-cols-2">
          {/* Decorative Caramel Blob SVG */}
          <div
            className="absolute z-0 hidden md:block"
            style={{
              left: '-10%',
              top: '60%',
              transform: 'translate(-50%, -50%)',
              width: 250,
              pointerEvents: 'none',
            }}
            aria-hidden="true"
          >
            <img
              src="/icons/caramel-blob.svg"
              alt="Decorative caramel blob"
              style={{ width: '100%', height: 'auto', display: 'block' }}
            />
          </div>
          {/* Content */}
          <div className="order-2 lg:order-1">
            <h3 className="mb-4 text-2xl font-bold text-[#3B2A20]">
              Live Music & Events
            </h3>
            <p className="mb-8 leading-relaxed text-[#3B2A20]/70">
              Join us on weekends for live music performances that fill our
              space with warmth and energy. Our upstairs area hosts piano,
              voice, violin, and guitar lessons, making music an integral part
              of our cafe's soul.
            </p>

            {/* Features List */}
            <div className="space-y-4">
              {features.map((feature, index) => (
                <div key={index} className="z-10 flex items-center space-x-3">
                  <div className="z-10 flex items-center justify-center flex-shrink-0 w-10 h-10 rounded-full bg-[#D8A24A]/20">
                    <feature.icon className="w-5 h-5 text-[#D8A24A]" />
                  </div>
                  <span className="font-medium text-[#3B2A20]">
                    {feature.text}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Image */}
          <div className="relative order-1 lg:order-2">
            {/* Flower SVG on top right of second image */}
            <div
              className="absolute w-[60px] md:w-[90px] top-0 right-0 z-20 "
              style={{
                pointerEvents: 'none',
                transform: 'translate(30%, -30%)',
              }}
              aria-hidden="true"
            >
              <img
                src="/icons/flower.svg"
                alt="Decorative flower"
                style={{ width: '100%', height: 'auto', display: 'block' }}
              />
            </div>
            <img
              src="/images/inside/vintage-cafe-schaumburg-cozy-cafe-inside2.jpg"
              alt="Live music performance at cafe"
              className="object-cover w-full shadow-2xl h-96 rounded-2xl"
            />
          </div>
        </div>

        {/* Bottom Stats/Highlights */}
        <div className="relative p-8 rounded-2xl md:p-12">
          {/* Flower SVG on left top side of stats */}
          <div
            className="absolute z-0 w-[60px] md:w-[80px] -top-8 -left-4  md:-left-8"
            aria-hidden="true"
          >
            <img
              src="/icons/flower2.svg"
              alt="Decorative flower"
              style={{ width: '100%', height: 'auto', display: 'block' }}
            />
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {/* Community First Card */}
            <div className="relative p-6 overflow-hidden border rounded-xl border-[#3B2A20]/10 bg-white/80 backdrop-blur-sm">
              <div className="absolute inset-0 opacity-100 bg-gradient-to-br from-[#D8A24A]/10 via-transparent to-transparent"></div>

              <div className="relative z-10">
                <div className="flex items-center justify-center w-12 h-12 mb-4 rounded-lg bg-gradient-to-br from-[#D8A24A]/20 to-[#D8A24A]/10 ring-1 ring-[#D8A24A]/20">
                  <Heart className="w-6 h-6 text-[#D8A24A]" />
                </div>

                <h4 className="mb-3 text-lg font-semibold text-[#3B2A20]">
                  Community First
                </h4>

                <p className="text-sm leading-relaxed text-[#3B2A20]/70">
                  A space where everyone feels welcome and connections are made
                  over great coffee.
                </p>
              </div>
            </div>

            {/* Music & Arts Card (kept original text) */}
            <div className="relative p-6 overflow-hidden border rounded-xl border-[#3B2A20]/10 bg-white/80 backdrop-blur-sm">
              <div className="absolute inset-0 opacity-100 bg-gradient-to-br from-[#D8A24A]/10 via-transparent to-transparent"></div>

              <div className="relative z-10">
                <div className="flex items-center justify-center w-12 h-12 mb-4 rounded-lg bg-gradient-to-br from-[#D8A24A]/20 to-[#D8A24A]/10 ring-1 ring-[#D8A24A]/20">
                  <Music className="w-6 h-6 text-[#D8A24A]" />
                </div>

                <h4 className="mb-3 text-lg font-semibold text-[#3B2A20]">
                  Music & Arts
                </h4>

                <p className="text-sm leading-relaxed text-[#3B2A20]/70">
                  Fostering creativity through music lessons, live performances,
                  and artistic expression.
                </p>
              </div>
            </div>

            {/* Quality Crafted Card */}
            <div className="relative p-6 overflow-hidden border rounded-xl border-[#3B2A20]/10 bg-white/80 backdrop-blur-sm">
              <div className="absolute inset-0 opacity-100 bg-gradient-to-br from-[#D8A24A]/10 via-transparent to-transparent"></div>

              <div className="relative z-10">
                <div className="flex items-center justify-center w-12 h-12 mb-4 rounded-lg bg-gradient-to-br from-[#D8A24A]/20 to-[#D8A24A]/10 ring-1 ring-[#D8A24A]/20">
                  <Award className="w-6 h-6 text-[#D8A24A]" />
                </div>

                <h4 className="mb-3 text-lg font-semibold text-[#3B2A20]">
                  Quality Crafted
                </h4>

                <p className="text-sm leading-relaxed text-[#3B2A20]/70">
                  Every cup and pastry is made with care, using the finest
                  ingredients and techniques.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative Green Blob - visible only on large screens (lg+) */}
        <div
          className="absolute z-0 hidden lg:block"
          style={{
            right: '-8%',
            bottom: '24%',
            transform: 'translate(50%, 50%)',
            width: 280,
            pointerEvents: 'none',
          }}
          aria-hidden="true"
        >
          <img
            src="/icons/green-blob.svg"
            alt="Decorative green blob"
            style={{ width: '100%', height: 'auto', display: 'block' }}
          />
        </div>

        {/* Decorative Green Blob - visible only on extra-small screens (<sm) */}
        <div
          className="absolute z-0 block sm:hidden"
          style={{
            right: '-20%',
            bottom: '28%',
            transform: 'translate(-50%, 50%)',
            width: 180,
            pointerEvents: 'none',
          }}
          aria-hidden="true"
        >
          <img
            src="/icons/green-blob.svg"
            alt="Decorative green blob (mobile)"
            style={{ width: '100%', height: 'auto', display: 'block' }}
          />
        </div>
      </div>
    </section>
  );
};

export default About;
