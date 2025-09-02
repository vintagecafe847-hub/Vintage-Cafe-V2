import { useRef, useState, FC, CSSProperties } from 'react';

const AboutStory = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  type StoryItem = {
    id: number;
    title: string;
    description: string;
    image: string;
    alt: string;
    color: string;
    titleColor?: string;
    titleBg?: string;
    titleBgActive?: string;
    slug: string;
    filterName: string;
  };

  const storyItems: StoryItem[] = [
    {
      id: 1,
      title: 'Our Cozy Atmosphere',
      description:
        'Step into our warm and inviting space where every corner tells a story. Our vintage decor and comfortable seating create the perfect ambiance for catching up with friends, reading a book, or working on your laptop.',
      image: '/images/cozy2.png',
      alt: 'Cozy cafe interior',
      color: 'from-amber-400/20 to-orange-400/20',
      titleColor: '#78350F',
      titleBg: 'rgba(120,53,15,0.08)',
      titleBgActive: 'rgba(120,53,15,0.15)',
      slug: 'atmosphere',
      filterName: 'Cozy Atmosphere',
    },
    {
      id: 2,
      title: 'Artisan Coffee Craftsmanship',
      description:
        'Our skilled baristas take pride in every cup they create. Using premium beans sourced from sustainable farms around the world, we craft each drink with precision and passion.',
      image: '/images/coffee2.png',
      alt: 'Coffee preparation',
      color: 'from-orange-400/20 to-red-400/20',
      titleColor: '#a0845c',
      titleBg: 'rgba(160,132,92,0.08)',
      titleBgActive: 'rgba(160,132,92,0.14)',
      slug: 'craftsmanship',
      filterName: 'Coffee Craftsmanship',
    },
    {
      id: 3,
      title: 'Community Gathering Place',
      description:
        "More than just a cafe, we're a place where friendships bloom and connections are made. Our weekly events bring together people from all walks of life in our beloved community.",
      image: '/images/coffee3.png',
      alt: 'People enjoying coffee together',
      color: 'from-red-400/20 to-pink-400/20',
      titleColor: '#D97706',
      titleBg: 'rgba(217,119,6,0.08)',
      titleBgActive: 'rgba(217,119,6,0.16)',
      slug: 'community',
      filterName: 'Community Hub',
    },
  ];

  // Generate random positions and properties for background elements
  const generateRandomElements = () => {
    const elements = [];
    const numElements = 8 + Math.floor(Math.random() * 4); // 8-12 elements

    for (let i = 0; i < numElements; i++) {
      elements.push({
        id: i,
        type: Math.random() > 0.5 ? 'circle' : 'blob',
        top: Math.random() * 80 + 10, // 10% to 90%
        left: Math.random() * 80 + 10, // 10% to 90%
        size: Math.random() * 150 + 80, // 80px to 230px
        opacity: Math.random() * 0.4 + 0.1, // 0.1 to 0.5
        animationDelay: Math.random() * 6, // 0 to 6 seconds
        colors: [
          'from-amber-400/30 to-orange-400/30',
          'from-orange-400/25 to-red-400/25',
          'from-red-400/30 to-pink-400/30',
          'from-pink-400/25 to-purple-400/25',
          'from-yellow-400/30 to-amber-400/30',
        ][Math.floor(Math.random() * 5)],
      });
    }
    return elements;
  };

  const randomElements = generateRandomElements();

  // Filter component
  const StoryFilter: FC<{ items: StoryItem[]; activeIndex: number }> = ({
    items,
    activeIndex,
  }) => {
    const scrollToSection = (targetIndex: number) => {
      const element = document.getElementById(`story-section-${targetIndex}`);
      if (element) {
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
        setActiveIndex(targetIndex);
      }
    };

    return (
      <div className="relative flex items-center justify-center mb-6">
        {/* Small screens (sm and smaller): single flower above the filter */}
        <img
          src="/icons/top-flower.svg"
          alt="decorative flower top"
          draggable={false}
          className="pointer-events-none select-none block md:hidden absolute top-[6px] left-1/2 -translate-x-1/2 w-[200px] sm:w-[240px]"
        />

        {/* md+ screens: two flowers left and right, closer to the filter with smaller sizes */}
        <div className="hidden md:flex items-center justify-center md:gap-x-6 lg:gap-x-[140px]">
          <img
            src="/icons/top-flower.svg"
            alt="decorative flower left"
            draggable={false}
            className="pointer-events-none select-none transform translate-y-[6px] md:translate-y-[14px] lg:translate-y-[22px] w-[240px] md:w-[280px] lg:w-[320px] xl:w-[360px]"
          />

          <div className="relative">
            <div
              className="flex gap-1 rounded-full border-[0.7px] border-[rgba(120,113,108,0.12)] bg-[rgba(251,251,248,0.9)] backdrop-blur-sm px-1 py-1 md:px-2 md:py-2 overflow-x-auto w-fit max-w-[calc(100vw-2rem)] md:max-w-[calc(100vw-2rem)]"
              style={{
                scrollbarWidth: 'thin',
                scrollbarColor: '#e5e5e5 transparent',
              }}
            >
              {items.map((item, index) => {
                const isActive = activeIndex === index;
                return (
                  <button
                    key={item.slug}
                    onClick={() => scrollToSection(index)}
                    className={`flex-shrink-0 whitespace-nowrap rounded-full px-4 py-2 md:px-6 md:py-4 text-sm md:text-base font-semibold transition-colors duration-200 leading-[18px] md:leading-[21px]`}
                    style={{
                      backgroundColor: isActive
                        ? item.titleBgActive
                        : item.titleBg,
                      color: item.titleColor || undefined,
                      border: 'none',
                    }}
                  >
                    {item.filterName}
                  </button>
                );
              })}
            </div>
          </div>

          <img
            src="/icons/top-flower.svg"
            alt="decorative flower right"
            draggable={false}
            className="pointer-events-none select-none transform translate-y-[6px] md:translate-y-[14px] lg:translate-y-[22px] w-[240px] md:w-[280px] lg:w-[320px] xl:w-[360px]"
          />
        </div>
      </div>
    );
  };

  // Striped Circle SVG Component
  const StripedCircle: FC<{
    className?: string;
    size?: number;
    style?: CSSProperties;
  }> = ({ className, size = 120, style }) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      className={className}
      style={style}
    >
      <defs>
        <pattern
          id={`stripes-${size}`}
          patternUnits="userSpaceOnUse"
          width="8"
          height="8"
          patternTransform="rotate(45)"
        >
          <rect width="4" height="8" fill="rgba(251, 191, 36, 0.4)" />
          <rect x="4" width="4" height="8" fill="rgba(249, 115, 22, 0.3)" />
        </pattern>
      </defs>
      <circle
        cx="60"
        cy="60"
        r="50"
        fill={`url(#stripes-${size})`}
        stroke="rgba(251, 191, 36, 0.6)"
        strokeWidth="2"
      />
    </svg>
  );

  // Organic Abstract Border SVG Component
  const OrganicBorder: FC<{
    className?: string;
    size?: number;
    style?: CSSProperties;
  }> = ({ className, size = 160, style }) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 160 160"
      className={className}
      style={style}
    >
      <path
        d="M80 20 C110 30, 140 50, 140 80 C140 110, 110 140, 80 140 C50 140, 20 110, 20 80 C20 50, 50 30, 80 20 Z"
        fill="none"
        stroke="rgba(239, 68, 68, 0.5)"
        strokeWidth="3"
        strokeDasharray="15,10"
      />
      <path
        d="M80 35 C100 40, 125 60, 125 80 C125 100, 100 120, 80 125 C60 120, 35 100, 35 80 C35 60, 60 40, 80 35 Z"
        fill="rgba(251, 191, 36, 0.1)"
        stroke="rgba(251, 191, 36, 0.4)"
        strokeWidth="2"
      />
    </svg>
  );

  return (
    <section className="relative py-12 overflow-hidden md:py-20 bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
      {/* Random background elements */}
      <div className="absolute inset-0 pointer-events-none">
        {randomElements.map((element) => (
          <div key={element.id}>
            {element.type === 'circle' ? (
              <div
                className={`absolute rounded-full bg-gradient-to-r ${element.colors} blur-2xl animate-pulse`}
                style={{
                  top: `${element.top}%`,
                  left: `${element.left}%`,
                  width: `${element.size}px`,
                  height: `${element.size}px`,
                  opacity: element.opacity,
                  animationDelay: `${element.animationDelay}s`,
                }}
              />
            ) : element.id % 3 === 0 ? (
              <StripedCircle
                className="absolute animate-pulse"
                size={element.size * 0.8}
                style={{
                  top: `${element.top}%`,
                  left: `${element.left}%`,
                  opacity: element.opacity,
                  animationDelay: `${element.animationDelay}s`,
                }}
              />
            ) : (
              <OrganicBorder
                className="absolute animate-pulse"
                size={element.size}
                style={{
                  top: `${element.top}%`,
                  left: `${element.left}%`,
                  opacity: element.opacity,
                  animationDelay: `${element.animationDelay}s`,
                }}
              />
            )}
          </div>
        ))}
      </div>

      <div className="container relative z-10 px-4 mx-auto">
        {/* Filter Component */}
        <StoryFilter items={storyItems} activeIndex={activeIndex} />

        {/* Story Sections */}
        <div className="space-y-6 md:space-y-8">
          {storyItems.map((item, index) => (
            <div
              key={item.id}
              id={`story-section-${index}`}
              className="flex items-center py-8"
            >
              <div className="w-full">
                {/* Mobile Layout - Always text left */}
                <div className="block space-y-4 md:hidden">
                  <div className="space-y-3 text-left">
                    <h2
                      className="text-3xl font-bold leading-tight"
                      style={{
                        fontFamily: 'serif',
                        color: item.titleColor || '#8b6f47',
                      }}
                    >
                      {item.title}
                    </h2>
                    <p className="text-base leading-relaxed text-gray-600">
                      {item.description}
                    </p>
                  </div>
                  <div className="relative flex items-center justify-center overflow-visible">
                    <span
                      className={`absolute -z-10 w-48 h-48 bg-gradient-to-br ${item.color} rounded-full blur-xl opacity-70`}
                    />
                    <img
                      src={item.image}
                      alt={item.alt}
                      className="relative z-10 object-cover w-full max-w-sm rounded-2xl"
                      draggable={false}
                    />
                    {index === 1 && (
                      <img
                        src="/icons/caramel-blob.svg"
                        alt=""
                        aria-hidden="true"
                        draggable={false}
                        className="absolute z-0 pointer-events-none"
                        style={{
                          // larger: place about 140px to the right of the image container and scale with viewport
                          left: 'calc(100% + 140px)',
                          top: '8%',
                          width: 'clamp(64px, 14vw, 160px)',
                          height: 'auto',
                          opacity: 0.95,
                        }}
                      />
                    )}
                  </div>
                </div>

                {/* Desktop Layout - Alternating */}
                <div className="hidden md:grid md:grid-cols-2 md:gap-8 lg:gap-12 md:items-center">
                  {index % 2 === 0 ? (
                    <>
                      {/* Text on left, Image on right */}
                      <div className="space-y-6">
                        <h2
                          className="text-4xl font-bold leading-tight lg:text-6xl xl:text-7xl"
                          style={{
                            fontFamily: 'serif',
                            color: item.titleColor || '#8b6f47',
                          }}
                        >
                          {item.title}
                        </h2>
                        <p className="max-w-2xl text-lg leading-relaxed text-gray-600 lg:text-xl">
                          {item.description}
                        </p>
                      </div>
                      <div className="relative flex items-center justify-center overflow-visible">
                        <span
                          className={`absolute -z-10 w-80 h-80 lg:w-96 lg:h-96 bg-gradient-to-br ${item.color} rounded-full blur-2xl opacity-70`}
                        />
                        <img
                          src={item.image}
                          alt={item.alt}
                          className="relative z-10 object-cover w-full max-w-md lg:max-w-lg xl:max-w-xl rounded-3xl"
                          draggable={false}
                        />
                        {index === 1 && (
                          <img
                            src="/icons/caramel-blob.svg"
                            alt=""
                            aria-hidden="true"
                            draggable={false}
                            className="absolute z-0 pointer-events-none"
                            style={{
                              // larger: ~140px away from image, scales with viewport using clamp
                              left: 'calc(100% + 140px)',
                              top: '12%',
                              width: 'clamp(110px, 12vw, 220px)',
                              height: 'auto',
                              opacity: 0.95,
                            }}
                          />
                        )}
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Image on left, Text on right */}
                      <div className="relative flex items-center justify-center overflow-visible">
                        <span
                          className={`absolute -z-10 w-80 h-80 lg:w-96 lg:h-96 bg-gradient-to-br ${item.color} rounded-full blur-2xl opacity-70`}
                        />
                        <img
                          src={item.image}
                          alt={item.alt}
                          className="relative z-10 object-cover w-full max-w-md lg:max-w-lg xl:max-w-xl rounded-3xl"
                          draggable={false}
                        />
                        {index === 1 && (
                          <img
                            src="/icons/caramel-blob.svg"
                            alt=""
                            aria-hidden="true"
                            draggable={false}
                            className="absolute z-0 pointer-events-none"
                            style={{
                              // larger: place roughly 140px to the left of the image when image is on the left
                              left: '-140px',
                              top: '12%',
                              width: 'clamp(110px, 12vw, 220px)',
                              height: 'auto',
                              opacity: 0.95,
                            }}
                          />
                        )}
                      </div>
                      <div className="space-y-6">
                        <h2
                          className="text-4xl font-bold leading-tight lg:text-6xl xl:text-7xl"
                          style={{
                            fontFamily: 'serif',
                            color: item.titleColor || '#8b6f47',
                          }}
                        >
                          {item.title}
                        </h2>
                        <p className="max-w-2xl text-lg leading-relaxed text-gray-600 lg:text-xl">
                          {item.description}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AboutStory;
