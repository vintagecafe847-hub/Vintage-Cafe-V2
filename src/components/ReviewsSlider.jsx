import { useState, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Star,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

const ReviewsSlider = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [expandedReviews, setExpandedReviews] = useState({});
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [missingImages, setMissingImages] = useState({});

  // Generate random background elements (similar to AboutStory)
  const generateRandomElements = () => {
    const elements = [];
    const numElements = 8 + Math.floor(Math.random() * 4);

    for (let i = 0; i < numElements; i++) {
      elements.push({
        id: i,
        type: Math.random() > 0.5 ? 'circle' : 'blob',
        top: Math.random() * 80 + 10,
        left: Math.random() * 80 + 10,
        size: Math.random() * 150 + 80,
        opacity: Math.random() * 0.4 + 0.1,
        animationDelay: Math.random() * 6,
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

  const StripedCircle = ({ className, size = 120, style }) => (
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

  const OrganicBorder = ({ className, size = 160, style }) => (
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

  // Reviews data
  const reviews = [
    // Google Reviews
    {
      id: 1,
      name: 'Alexa',
      platform: 'google',
      rating: 5,
      text: "Vintage Cafe has a super cozy, laid-back vibe—perfect for hanging out or getting some work done. The Nutella latte was delicious, like dessert in a cup. The cardamom latte seemed like a good choice but it didn't have much flavor. Still, lots of fun drinks to try!",
      image: '/images/reviews/google/alexa.jpg',
    },
    {
      id: 2,
      name: 'George',
      platform: 'google',
      rating: 5,
      text: 'Vintage Cafe really has the "home and cozy" vibes perfected. First time checking them out Saturday between 11-1 and it was quite busy! All the rooms were full and there was live music, so maybe try and get there early if you want a seat! I tried their matcha tea latte and their cheese danish with jam and it was very good! I would recommend this place to anyone. Nice spot for a coffee date, study time, or catching up with friends.',
      image: '/images/reviews/google/george.jpg',
    },
    {
      id: 3,
      name: 'Alexis',
      platform: 'google',
      rating: 5,
      text: "Vintage Cafe is a hidden gem in Schaumburg! I stopped by and ordered the Nutella Latte, and it was absolutely perfect—rich, smooth, and just the right amount of sweetness without being overpowering. The Nutella flavor blends so well with the coffee, making it a must-try for any Nutella lover. The ambiance is warm and inviting, with a cozy, vintage-inspired decor that makes it a great place to relax or get some work done. The staff is super friendly and attentive, making sure you have a great experience. Whether you're looking for a great cup of coffee, a delicious pastry, or just a comfy spot to unwind, Vintage Cafe is the place to go. Can't wait to come back and try more from their menu!",
      image: '/images/reviews/google/alexis.jpg',
    },
    {
      id: 4,
      name: 'Anne',
      platform: 'google',
      rating: 5,
      text: 'My favorite cafe in the Chicagoland area. Great coffee, kind staff, yummy European pastries, good seating indoors and outdoors, plenty of outlets, and good music. The owner takes great care of the place. Thanks for always giving me a delightful place to "work from home"!',
      image: '/images/reviews/google/anne.jpg',
    },
    {
      id: 5,
      name: 'Jim',
      platform: 'google',
      rating: 5,
      text: "Love this place, cool vibe, cool baristas. Great coffee and delicious pastries. Plenty of seating and plenty of parking. It's the perfect spot to relax or catch up with friends......",
      image: '/images/reviews/google/jim.jpg',
    },
    {
      id: 6,
      name: 'Zach',
      platform: 'google',
      rating: 5,
      text: 'This place is great! Very quaint inside with a lot of different RELAXING seating options. It is everything you would want in a chill coffee shop. They have a few choices for food but best of all all coffee drinks are SOLID. Not too sweet, 2 shots in each size (small and large), one of my new fav spots!',
      image: '/images/reviews/google/zach.jpg',
    },
    // Yelp Reviews
    {
      id: 7,
      name: 'Miranda',
      platform: 'yelp',
      rating: 5,
      text: "I've driven past this cafe many of times and finally made a stop in! This older house was transformed into a coffee cafe that has a front and back entrance, three seating areas, a music room, and main coffee counter. The inside is a bit dimly lit but overall very charming. They have a variety of coffee/tea offerings as well as some bakery items. While the menu is small, the quality of items seems spot on. I ordered an Iced Rose Cardamom Latte. It came with edible rose petals on top and was absolutely delicious! It did take a bit of time to make but was well worth it! So happy I stopped into this neighborhood gem and will certainly be back!",
      image: '/images/reviews/yelp/miranda.jpg',
    },
    {
      id: 8,
      name: 'Dina',
      platform: 'yelp',
      rating: 5,
      text: "We checked out Vintage Cafe, a local gem, and WOW -- the Dubai chocolate latte and the iced caramel macchiato had incredible flavor profiles. The Nutella Latte was our least favorite out of the three. The cafe's menu has more variety and additional flavor options than any spot I've seen! Not to mention, the cafe gives off such a homey vibe and feels like a great place to work or study from. If you're a coffee lover, this place is a must. I can't wait to go back!",
      image: '/images/reviews/yelp/dina.jpg',
    },
    {
      id: 9,
      name: 'Muhammad',
      platform: 'yelp',
      rating: 5,
      text: "Vintage Café: Where Cozy Vibes & Quality Sips Meet. Vintage Café in Schaumburg really delivers on the kind of ambiance that makes you want to stay a while -- whether it's a casual hangout, a cute little date, or even a productive meeting spot. It's a rare blend of cozy and versatile, and I'm definitely coming back with friends. I ordered the cream cheese and strawberry croissant, which was a strong 8/10 -- soft, buttery, flaky, and sweet without being overwhelming. Their hot chocolate is easily a 9.5/10 -- rich, smooth, and perfectly balanced. It's one of those rare drinks where the first sip hits just as hard as the last. Their cardamom chai also holds its own with a respectable 8.5/10 -- aromatic, warm, and lightly spiced.",
      image: '/images/reviews/yelp/muhammad.jpg',
    },
    {
      id: 10,
      name: 'Mark',
      platform: 'yelp',
      rating: 5,
      text: 'gorgeous cozy intimate little coffee shop just off the side of Schaumburg road. absolutely love the vibe here. I picked up a London Fog and a pastry when I popped by and totally loved it.',
      image: '/images/reviews/yelp/mark.jpg',
    },
    {
      id: 11,
      name: 'Brenda',
      platform: 'yelp',
      rating: 5,
      text: "Great food, great service, and SO cute!! I had a cafe au lait and a tomato/leek pastry. We ate inside, and we got to pick out our own mug, which was fun! Cute decor inside, plenty of seating, but didn't feel crowded since you could sit in 3 different rooms, or outside. I'll def go back.",
      image: '/images/reviews/yelp/brenda.jpg',
    },
  ];

  // Auto-advance slider
  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % reviews.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, reviews.length]);

  const GoogleIcon = () => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );

  const YelpIcon = () => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="#FF1A1A">
      <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.624 5.367 11.99 11.988 11.99s11.987-5.366 11.987-11.99C24.004 5.367 18.641.001 12.017.001zm.169 17.241c-2.859 0-5.175-2.315-5.175-5.175s2.316-5.176 5.175-5.176 5.176 2.316 5.176 5.176-2.317 5.175-5.176 5.175z" />
    </svg>
  );

  const renderStars = (rating) =>
    Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`w-5 h-5 ${
          index < rating ? 'text-amber-400 fill-amber-400' : 'text-gray-300'
        }`}
      />
    ));

  const toggleExpanded = (reviewId) => {
    setExpandedReviews((prev) => {
      const newState = {};
      Object.keys(prev).forEach((key) => {
        newState[key] = false;
      });
      newState[reviewId] = !prev[reviewId];
      return newState;
    });
  };

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % reviews.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 12000);
  };

  const prevSlide = () => {
    setCurrentIndex(
      (prevIndex) => (prevIndex - 1 + reviews.length) % reviews.length
    );
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 12000);
  };

  const shouldShowReadMore = (text) => text.length > 180;

  return (
    <section className="relative py-20 overflow-hidden bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
      {/* Random background elements (decorative, pointer-events-none) */}
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
      <div className="relative max-w-6xl px-4 mx-auto sm:px-6 lg:px-8 z-10">
        {/* Decorative flowers & blobs (desktop only) - now positioned relative to the centered container */}
        <div
          className="absolute z-0 hidden lg:block"
          style={{
            left: '-5%',
            top: '5%',
            width: 120,
            pointerEvents: 'none',
            zIndex: 10,
          }}
          aria-hidden="true"
        >
          <img
            src="/icons/yellow-tall-flower.svg"
            alt=""
            style={{ width: '100%', height: 'auto', display: 'block' }}
          />
        </div>

        {/* Top-left (md and smaller): pinned to top-0 left-0 */}
        <div
          className="absolute z-0 block lg:hidden"
          style={{
            left: 4,
            top: 40,
            width: 60,
            pointerEvents: 'none',
            zIndex: 10,
            rotate: '10deg',
          }}
          aria-hidden="true"
        >
          <img
            src="/icons/yellow-tall-flower.svg"
            alt=""
            style={{ width: '100%', height: 'auto', display: 'block' }}
          />
        </div>

        <div
          className="absolute z-0 hidden lg:block"
          style={{
            right: '-5%',
            top: '5%',
            width: 120,
            pointerEvents: 'none',
            zIndex: 10,
          }}
          aria-hidden="true"
        >
          <img
            src="/icons/pink-flower.svg"
            alt=""
            style={{ width: '100%', height: 'auto', display: 'block' }}
          />
        </div>

        {/* Top-right (md and smaller): pinned to top-0 right-0 */}
        <div
          className="absolute z-0 block lg:hidden"
          style={{
            right: 4,
            top: 40,
            width: 60,
            pointerEvents: 'none',
            zIndex: 10,
          }}
          aria-hidden="true"
        >
          <img
            src="/icons/pink-flower.svg"
            alt=""
            style={{ width: '100%', height: 'auto', display: 'block' }}
          />
        </div>

        <div
          className="absolute z-0 hidden lg:block"
          aria-hidden="true"
          style={{ left: '-5%', top: '16%', width: 120, height: 120 }}
        >
          <div
            className="glow-ball glow-gold"
            style={{ width: '100%', height: '100%' }}
          />
        </div>

        {/* Gold glow (md and smaller): pinned top-0 left-0 */}
        <div
          className="absolute z-0 block lg:hidden"
          aria-hidden="true"
          style={{ left: 0, top: 90, width: 60, height: 60 }}
        >
          <div
            className="glow-ball glow-gold"
            style={{ width: '100%', height: '100%' }}
          />
        </div>

        <div
          className="absolute z-0 hidden lg:block"
          aria-hidden="true"
          style={{ right: '-5%', top: '14%', width: 120, height: 120 }}
        >
          <div
            className="glow-ball glow-pink"
            style={{ width: '100%', height: '100%' }}
          />
        </div>

        {/* Pink glow (md and smaller): pinned top-0 right-0 */}
        <div
          className="absolute z-0 block lg:hidden"
          aria-hidden="true"
          style={{ right: 0, top: 90, width: 60, height: 60 }}
        >
          <div
            className="glow-ball glow-pink"
            style={{ width: '100%', height: '100%' }}
          />
        </div>

        {/* Bottom decorative corners */}
        <div
          className="absolute z-0 hidden lg:block"
          aria-hidden="true"
          style={{
            right: '0%',
            bottom: 5,
            width: 200,
            transform: 'rotate(70deg)',
            pointerEvents: 'none',
            zIndex: 20,
          }}
        >
          <img
            src="/icons/flower-corner.svg"
            alt=""
            style={{ width: '100%', height: 'auto', display: 'block' }}
          />
        </div>

        {/* Bottom-right (md and smaller): pinned to bottom-0 right-0 at 50% size */}
        <div
          className="absolute z-0 block lg:hidden"
          aria-hidden="true"
          style={{
            right: 0,
            bottom: 0,
            width: 100,
            transform: 'rotate(70deg)',
            pointerEvents: 'none',
            zIndex: 20,
          }}
        >
          <img
            src="/icons/flower-corner.svg"
            alt=""
            style={{ width: '100%', height: 'auto', display: 'block' }}
          />
        </div>

        <div
          className="absolute z-0 hidden lg:block"
          aria-hidden="true"
          style={{
            left: '0%',
            bottom: 5,
            width: 200,
            transform: 'rotate(-170deg)',
            pointerEvents: 'none',
            zIndex: 20,
          }}
        >
          <img
            src="/icons/flower-corner.svg"
            alt=""
            style={{ width: '100%', height: 'auto', display: 'block' }}
          />
        </div>

        {/* Bottom-left (md and smaller): pinned to bottom-0 left-0 at 50% size */}
        <div
          className="absolute z-0 block lg:hidden"
          aria-hidden="true"
          style={{
            left: 0,
            bottom: 0,
            width: 100,
            transform: 'rotate(-170deg)',
            pointerEvents: 'none',
            zIndex: 20,
          }}
        >
          <img
            src="/icons/flower-corner.svg"
            alt=""
            style={{ width: '100%', height: 'auto', display: 'block' }}
          />
        </div>

        {/* Navigation */}
        <div className="relative">
          <button
            onClick={prevSlide}
            aria-label="Previous review"
            className="absolute z-20 w-12 h-12 transition-all duration-200 transform -translate-y-1/2 rounded-full shadow-xl left-2 sm:left-8 top-1/2 sm:w-14 sm:h-14 hover:scale-110"
            style={{ backgroundColor: 'var(--primary-brown)', color: 'white' }}
            onMouseEnter={(e) =>
              (e.target.style.backgroundColor = 'var(--dark-brown)')
            }
            onMouseLeave={(e) =>
              (e.target.style.backgroundColor = 'var(--primary-brown)')
            }
          >
            <ChevronLeft className="w-6 h-6 mx-auto sm:w-7 sm:h-7" />
          </button>

          <button
            onClick={nextSlide}
            aria-label="Next review"
            className="absolute z-20 w-12 h-12 transition-all duration-200 transform -translate-y-1/2 rounded-full shadow-xl right-2 sm:right-8 top-1/2 sm:w-14 sm:h-14 hover:scale-110"
            style={{ backgroundColor: 'var(--primary-brown)', color: 'white' }}
            onMouseEnter={(e) =>
              (e.target.style.backgroundColor = 'var(--dark-brown)')
            }
            onMouseLeave={(e) =>
              (e.target.style.backgroundColor = 'var(--primary-brown)')
            }
          >
            <ChevronRight className="w-6 h-6 mx-auto sm:w-7 sm:h-7" />
          </button>

          {/* Review Cards */}
          <div className="overflow-hidden md:mx-8">
            <div
              className="flex transition-transform duration-700 ease-in-out"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {reviews.map((review) => {
                const isExpanded = expandedReviews[review.id] || false;
                const showReadMore = shouldShowReadMore(review.text);
                const displayText =
                  showReadMore && !isExpanded
                    ? review.text.substring(0, 180) + '...'
                    : review.text;

                return (
                  <div
                    key={review.id}
                    className="flex-shrink-0 w-full px-2 md:px-4"
                  >
                    <div className="max-w-4xl mx-auto">
                      <div
                        className="relative p-6 transition-all duration-300 transform rounded-2xl md:rounded-3xl md:p-12"
                        style={{ backgroundColor: 'white' }}
                      >
                        <div className="absolute z-10 top-4 left-4 md:top-6 md:left-6">
                          <div className="flex items-center justify-center w-12 h-12 bg-white rounded-full md:w-14 md:h-14">
                            {review.platform === 'google' ? (
                              <GoogleIcon />
                            ) : (
                              <YelpIcon />
                            )}
                          </div>
                        </div>

                        <div className="absolute z-10 top-4 right-4 md:top-6 md:right-6">
                          <div className="flex items-center px-3 py-2 bg-white rounded-full">
                            {renderStars(review.rating)}
                          </div>
                        </div>

                        <div className="flex flex-col items-center pt-8 mb-6 text-center">
                          <div className="flex-shrink-0 mb-6">
                            {!missingImages[review.id] && review.image && (
                              <img
                                src={review.image}
                                alt={`Review from ${review.name}`}
                                className="object-cover shadow-xl rounded-3xl w-64 h-48 sm:w-80 sm:h-60 md:w-96 md:h-72 lg:w-[28rem] lg:h-80"
                                style={{
                                  border: '6px solid var(--soft-beige)',
                                  objectPosition: 'center',
                                }}
                                onError={() =>
                                  setMissingImages((prev) => ({
                                    ...prev,
                                    [review.id]: true,
                                  }))
                                }
                              />
                            )}
                          </div>

                          <div className="flex-1">
                            <div className="flex items-center justify-center mb-4">
                              <h3
                                className="text-2xl font-bold sm:text-3xl md:text-4xl"
                                style={{ color: 'var(--dark-brown)' }}
                              >
                                {review.name}
                              </h3>
                            </div>

                            <div className="p-4 bg-gradient-to-r from-transparent via-gray-50 to-transparent md:p-6 rounded-xl md:rounded-2xl">
                              <blockquote
                                className="text-base italic leading-relaxed text-left sm:text-lg md:text-xl"
                                style={{ color: 'var(--warm-gray)' }}
                              >
                                "{displayText}"
                              </blockquote>
                              {showReadMore && (
                                <button
                                  onClick={() => toggleExpanded(review.id)}
                                  className="flex items-center mx-auto mt-4 space-x-2 text-sm font-medium transition-colors duration-200 sm:text-base active:scale-95"
                                  style={{ color: 'var(--primary-brown)' }}
                                >
                                  <span>
                                    {isExpanded ? 'Read less' : 'Read more'}
                                  </span>
                                  {isExpanded ? (
                                    <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5" />
                                  ) : (
                                    <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5" />
                                  )}
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Dots Indicator */}
          <div className="flex justify-center mt-8 space-x-2 md:mt-12 md:space-x-3">
            {reviews.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setCurrentIndex(index);
                  setIsAutoPlaying(false);
                  setTimeout(() => setIsAutoPlaying(true), 12000);
                }}
                className={`h-2 md:h-3 rounded-full transition-all duration-300 active:scale-95 ${
                  index === currentIndex
                    ? 'w-6 md:w-10 shadow-lg'
                    : 'w-2 md:w-3'
                }`}
                style={{
                  backgroundColor:
                    index === currentIndex
                      ? 'var(--primary-brown)'
                      : 'var(--soft-beige)',
                }}
              />
            ))}
          </div>

          {/* Review Counter */}
          <div className="hidden mt-6 text-center md:block">
            <span className="text-sm" style={{ color: 'var(--warm-gray)' }}>
              {currentIndex + 1} of {reviews.length} reviews
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ReviewsSlider;
