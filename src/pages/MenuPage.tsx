import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Coffee,
  Leaf,
  Sparkles,
  Heart,
  Search,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { supabase, type Category, type MenuItem } from '../lib/supabase';
import Header from '../components/Header';
import Footer from '../components/Footer';

const MenuPage = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 15; // Increased for 5 columns
  const navigate = useNavigate();

  // Helper function to map icon names to icon components
  const getIconComponent = (iconName?: string) => {
    const iconMap: {
      [key: string]: React.ComponentType<{ className?: string }>;
    } = {
      Coffee,
      Leaf,
      Sparkles,
      Heart,
    };
    return iconMap[iconName || 'Coffee'] || Coffee;
  };

  useEffect(() => {
    fetchMenuData();
  }, []);

  const fetchMenuData = async () => {
    try {
      setLoading(true);

      // Fetch categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (categoriesError) throw categoriesError;

      // Fetch menu items with their categories
      const { data: menuItemsData, error: menuItemsError } = await supabase
        .from('menu_items')
        .select(
          `
          *,
          category:categories(*)
        `
        )
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (menuItemsError) throw menuItemsError;

      setCategories(categoriesData || []);
      setMenuItems(menuItemsData || []);
    } catch (error) {
      console.error('Error fetching menu data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter items based on active category and search term
  const filteredItems = menuItems.filter((item) => {
    const categoryMatch =
      activeCategory === 0 ||
      item.category_id === categories[activeCategory - 1]?.id;
    const searchMatch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.description &&
        item.description.toLowerCase().includes(searchTerm.toLowerCase()));
    return categoryMatch && searchMatch;
  });

  // Pagination
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const paginatedItems = filteredItems.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(0);
  }, [activeCategory, searchTerm]);

  const getDisplayPrice = (item: MenuItem) => {
    if (item.sizes && Object.keys(item.sizes).length > 0) {
      const prices = Object.values(item.sizes);
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      return minPrice === maxPrice
        ? `$${minPrice.toFixed(2)}`
        : `$${minPrice.toFixed(2)} - $${maxPrice.toFixed(2)}`;
    }
    return `$${item.price.toFixed(2)}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 border-4 rounded-full animate-spin border-amber-200 border-t-amber-600"></div>
          <p className="font-medium text-amber-800">
            Loading our delicious menu...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />

      {/* Hero Section with Background Image */}
      <div className="relative min-h-screen">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-fixed bg-center bg-cover"
          style={{
            backgroundImage:
              'url("https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?ixlib=rb-4.0.3&auto=format&fit=crop&w=2340&q=80")',
          }}
        >
          <div className="absolute inset-0 bg-black/40"></div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 px-4 pt-32 pb-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-[60vh]">
              {/* Left Side - Title */}
              <div className="text-left">
                <h1 className="mb-6 text-6xl font-bold leading-tight text-white font-vintage md:text-7xl lg:text-8xl drop-shadow-2xl">
                  Our Menu
                </h1>
                <div className="w-32 h-1.5 bg-gradient-to-r from-amber-400 to-orange-500 mb-8 rounded-full shadow-lg"></div>
                <p className="max-w-xl text-xl leading-relaxed md:text-2xl text-white/90 drop-shadow-lg">
                  Discover our carefully crafted selection of artisanal coffees,
                  fresh pastries, and delicious treats made with love.
                </p>
              </div>

              {/* Right Side - Decorative Elements */}
              <div className="items-center justify-center hidden lg:flex">
                <div className="relative">
                  <div className="flex items-center justify-center border rounded-full w-80 h-80 bg-gradient-to-br from-amber-400/20 to-orange-600/20 backdrop-blur-sm border-white/20">
                    <div className="flex items-center justify-center border rounded-full w-60 h-60 bg-gradient-to-br from-amber-500/30 to-orange-700/30 backdrop-blur-sm border-white/30">
                      <Coffee className="w-32 h-32 text-white/80 drop-shadow-lg" />
                    </div>
                  </div>
                  <div className="absolute flex items-center justify-center w-16 h-16 rounded-full shadow-2xl -top-4 -right-4 bg-gradient-to-br from-yellow-400 to-orange-500 animate-bounce">
                    <Sparkles className="w-8 h-8 text-white" />
                  </div>
                  <div className="absolute flex items-center justify-center w-12 h-12 rounded-full shadow-xl -bottom-6 -left-6 bg-gradient-to-br from-amber-400 to-red-500 animate-pulse">
                    <Heart className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Transition Wave */}
        <div className="absolute bottom-0 left-0 right-0 z-20">
          <svg
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
            className="relative block w-full h-16"
          >
            <path
              d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z"
              opacity=".25"
              className="fill-gradient-to-r from-amber-50 to-orange-50"
            ></path>
            <path
              d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z"
              opacity=".5"
              className="fill-amber-50"
            ></path>
            <path
              d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z"
              className="fill-orange-50"
            ></path>
          </svg>
        </div>
      </div>

      {/* Menu Content Section */}
      <div className="relative px-4 pt-16 pb-12 bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          {/* Search Bar */}
          <div className="relative max-w-lg mx-auto mb-12 transition-transform duration-300 transform hover:scale-105">
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 blur opacity-30 animate-pulse"></div>
            <div className="relative bg-white border rounded-full shadow-2xl border-amber-200/50">
              <Search
                className="absolute z-10 transform -translate-y-1/2 left-5 top-1/2 text-amber-600"
                size={22}
              />
              <input
                type="text"
                placeholder="What's on your mind today?"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full py-5 pr-6 text-lg font-medium transition-all duration-300 bg-transparent border-0 rounded-full pl-14 focus:outline-none text-amber-900 placeholder-amber-500 focus:ring-4 focus:ring-amber-200/50"
              />
            </div>
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap justify-center gap-3 mb-16">
            <button
              onClick={() => setActiveCategory(0)}
              className={`group px-8 py-4 rounded-2xl font-bold transition-all duration-500 transform hover:scale-105 hover:rotate-1 shadow-lg hover:shadow-2xl ${
                activeCategory === 0
                  ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 text-white shadow-amber-300/50'
                  : 'bg-white/90 text-amber-800 hover:bg-gradient-to-r hover:from-amber-50 hover:to-orange-50 hover:shadow-amber-200/50'
              }`}
            >
              <span className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 group-hover:animate-spin" />
                All Items
              </span>
            </button>
            {categories.map((category, index) => {
              const IconComponent = getIconComponent();
              return (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(index + 1)}
                  className={`group flex items-center gap-3 px-8 py-4 rounded-2xl font-bold transition-all duration-500 transform hover:scale-105 hover:rotate-1 shadow-lg hover:shadow-2xl ${
                    activeCategory === index + 1
                      ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 text-white shadow-amber-300/50'
                      : 'bg-white/90 text-amber-800 hover:bg-gradient-to-r hover:from-amber-50 hover:to-orange-50 hover:shadow-amber-200/50'
                  }`}
                >
                  <IconComponent className="w-5 h-5 group-hover:bounce group-hover:animate-bounce" />
                  {category.name}
                </button>
              );
            })}
          </div>

          {/* Menu Grid - 5 columns */}
          {paginatedItems.length === 0 ? (
            <div className="py-20 text-center">
              <div className="max-w-md p-12 mx-auto shadow-lg bg-white/80 rounded-3xl">
                <Search className="w-16 h-16 mx-auto mb-4 text-amber-400" />
                <p className="text-xl font-medium text-amber-800">
                  No items found matching your search.
                </p>
                <p className="mt-2 text-amber-600">
                  Try a different search term or browse all categories.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 mb-16 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 md:gap-6">
              {paginatedItems.map((item, index) => (
                <div
                  key={item.id}
                  className="p-5 transition-all duration-500 border shadow-xl group bg-white/95 backdrop-blur-sm rounded-3xl hover:shadow-2xl hover:-translate-y-3 hover:rotate-1 border-amber-100/50 hover:border-amber-300/50"
                  style={{
                    animationDelay: `${index * 50}ms`,
                    animation: 'fadeInUp 0.6s ease-out forwards',
                  }}
                >
                  {item.image_url && (
                    <div className="relative mb-4 overflow-hidden aspect-square rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100">
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-125"
                      />
                      <div className="absolute inset-0 transition-opacity duration-300 opacity-0 bg-gradient-to-t from-black/20 to-transparent group-hover:opacity-100"></div>
                    </div>
                  )}

                  <div className="space-y-3">
                    <h3 className="text-base font-bold leading-tight transition-colors font-vintage md:text-lg text-amber-900 line-clamp-2 group-hover:text-amber-700">
                      {item.name}
                    </h3>

                    <div className="flex items-center justify-between">
                      <span className="text-lg font-black text-transparent md:text-xl bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 bg-clip-text">
                        {getDisplayPrice(item)}
                      </span>
                      <div className="flex items-center justify-center w-8 h-8 transition-all duration-300 transform scale-0 rounded-full opacity-0 bg-gradient-to-r from-amber-400 to-orange-500 group-hover:opacity-100 group-hover:scale-100">
                        <Heart className="w-4 h-4 text-white" />
                      </div>
                    </div>

                    {item.description && (
                      <p className="text-xs leading-relaxed transition-colors md:text-sm text-amber-700/80 line-clamp-2 group-hover:text-amber-800">
                        {item.description}
                      </p>
                    )}

                    {item.tags && item.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {item.tags.slice(0, 2).map((tag, tagIndex) => (
                          <span
                            key={tagIndex}
                            className="px-2.5 py-1 bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 text-xs rounded-2xl font-semibold border border-amber-200/50 transform hover:scale-110 transition-transform cursor-default"
                          >
                            {tag}
                          </span>
                        ))}
                        {item.tags.length > 2 && (
                          <span className="px-2.5 py-1 bg-gradient-to-r from-amber-200 to-orange-200 text-amber-700 text-xs rounded-2xl font-bold border border-amber-300/50">
                            +{item.tags.length - 2}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Enhanced Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                disabled={currentPage === 0}
                className="flex items-center gap-3 px-6 py-3 font-bold transition-all duration-500 transform shadow-lg group rounded-2xl bg-white/90 hover:bg-gradient-to-r hover:from-amber-50 hover:to-orange-50 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-2xl text-amber-800 hover:scale-105 hover:-rotate-1"
              >
                <ChevronLeft size={20} className="group-hover:animate-pulse" />
                <span className="hidden sm:inline">Previous</span>
              </button>

              <div className="flex gap-3">
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 7) {
                    pageNum = i;
                  } else if (currentPage < 3) {
                    pageNum = i;
                  } else if (currentPage > totalPages - 4) {
                    pageNum = totalPages - 7 + i;
                  } else {
                    pageNum = currentPage - 3 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-12 h-12 rounded-2xl font-black transition-all duration-500 shadow-lg transform hover:scale-125 hover:rotate-12 ${
                        currentPage === pageNum
                          ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 text-white shadow-amber-300/50 scale-110'
                          : 'bg-white/90 text-amber-800 hover:bg-gradient-to-r hover:from-amber-50 hover:to-orange-50 hover:shadow-2xl'
                      }`}
                    >
                      {pageNum + 1}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() =>
                  setCurrentPage(Math.min(totalPages - 1, currentPage + 1))
                }
                disabled={currentPage === totalPages - 1}
                className="flex items-center gap-3 px-6 py-3 font-bold transition-all duration-500 transform shadow-lg group rounded-2xl bg-white/90 hover:bg-gradient-to-r hover:from-amber-50 hover:to-orange-50 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-2xl text-amber-800 hover:scale-105 hover:rotate-1"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight size={20} className="group-hover:animate-pulse" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Add CSS animations */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }
      `}</style>

      <Footer />
    </div>
  );
};

export default MenuPage;
