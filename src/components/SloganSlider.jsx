import React from 'react';
import { Coffee, Heart, Star, Leaf, Users, Sparkles } from 'lucide-react';

const SloganSlider = () => {
  const slogans = [
    { text: 'Where every cup tells a story', pill: 'Artisan', icon: Coffee },
    { text: 'Brewing community, one cup at a time', pill: null, icon: Users },
    { text: 'Your neighborhood coffee sanctuary', pill: 'Local', icon: Heart },
    { text: 'Handcrafted with love since day one', pill: 'Fresh', icon: Leaf },
    { text: "More than coffee, it's home", pill: null, icon: Heart },
    {
      text: 'Roasted to perfection, served with passion',
      pill: 'Premium',
      icon: Star,
    },
    { text: 'Creating moments that matter', pill: null, icon: Sparkles },
    {
      text: 'Where friends gather and stories begin',
      pill: 'Community',
      icon: Users,
    },
    { text: 'Excellence in every sip', pill: 'Quality', icon: Star },
    { text: 'Your daily dose of happiness', pill: null, icon: Sparkles },
    { text: 'Crafting memories over coffee', pill: 'Experience', icon: Coffee },
    { text: 'Slow coffee for fast lives', pill: null, icon: Leaf },
  ];

  return (
    <section className="relative z-0 overflow-hidden py-5 border-b border-amber-200/25 bg-gradient-to-r from-amber-100 to-orange-100">
      <div className="w-full overflow-hidden">
        <div
          className="flex gap-8"
          style={{
            '--animation-duration': '60s',
          }}
        >
          <div className="flex items-center gap-8 animate-scroll">
            {slogans.map((slogan, index) => {
              const IconComponent = slogan.icon;
              return (
                <div
                  key={`first-${index}`}
                  className="flex items-center flex-shrink-0 gap-6 px-4 whitespace-nowrap"
                >
                  <IconComponent className="w-4 h-4 text-amber-600 shrink-0" />
                  <div className="flex items-center gap-3">
                    <p className="text-sm font-semibold text-amber-800/90">
                      {slogan.text}
                    </p>
                    {slogan.pill && (
                      <span className="px-3 py-1 text-xs font-bold rounded-full text-amber-800 bg-amber-200/80">
                        {slogan.pill}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex items-center gap-8 animate-scroll">
            {slogans.map((slogan, index) => {
              const IconComponent = slogan.icon;
              return (
                <div
                  key={`second-${index}`}
                  className="flex items-center flex-shrink-0 gap-6 px-4 whitespace-nowrap"
                >
                  <IconComponent className="w-4 h-4 text-amber-600 shrink-0" />
                  <div className="flex items-center gap-3">
                    <p className="text-sm font-semibold text-amber-800/90">
                      {slogan.text}
                    </p>
                    {slogan.pill && (
                      <span className="px-3 py-1 text-xs font-bold rounded-full text-amber-800 bg-amber-200/80">
                        {slogan.pill}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default SloganSlider;
