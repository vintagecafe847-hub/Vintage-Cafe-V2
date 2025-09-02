import { useState, useEffect, useCallback } from 'react';
import {
  Coffee,
  Leaf,
  Sparkles,
  Heart,
  Search,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import {
  supabase,
  Category as DBCategory,
  MenuItem as DBMenuItem,
} from '../lib/supabase';

// --- Extended types for the component ---
type MenuItem = DBMenuItem & {
  categoryName?: string;
  categoryIndex?: number;
  tags?: string[] | string | null;
};

type Category = DBCategory & {
  icon?: React.ComponentType<{ className?: string }>;
  image?: string; // For backward compatibility with existing component code
  items: MenuItem[];
};

// Default images for categories without uploaded images
const DEFAULT_IMAGES = [
  '/images/coffee2.png',
  '/images/coffee3.png',
  '/images/cozy.jpg',
  '/images/cozy2.png',
];

const Menu = () => {
  const [activeCategory, setActiveCategory] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [categories, setCategories] = useState<Category[]>([]);
  const [attributeColors, setAttributeColors] = useState<
    Record<string, string>
  >({});
  const [loading, setLoading] = useState(true);
  const itemsPerPage = 6;

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

  // Helper function to get a random default image
  const getDefaultImage = useCallback((categoryIndex: number) => {
    return DEFAULT_IMAGES[categoryIndex % DEFAULT_IMAGES.length];
  }, []);

  // Fetch categories and menu items from Supabase
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch categories
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('categories')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: true });

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
          .order('created_at', { ascending: true });

        if (menuItemsError) throw menuItemsError;

        // Fetch attributes (for tag colors)
        const { data: attributesData, error: attributesError } = await supabase
          .from('attributes')
          .select('*')
          .eq('is_active', true)
          .order('display_order', { ascending: true });

        if (attributesError) throw attributesError;

        // Build a name -> color map for quick lookup (case-insensitive)
        const attrColorMap: Record<string, string> = {};
        (attributesData || []).forEach((a: any) => {
          if (a.name)
            attrColorMap[(a.name as string).toLowerCase()] =
              a.color || '#E5E7EB';
        });
        setAttributeColors(attrColorMap);

        // Group menu items by category
        const categoriesWithItems: Category[] = (categoriesData || []).map(
          (category, index) => {
            const categoryItems = (menuItemsData || [])
              .filter((item) => item.category_id === category.id)
              .map((item) => ({
                ...item,
                categoryName: category.name,
                categoryIndex: index,
              }));

            return {
              ...category,
              icon: getIconComponent(category.name?.toLowerCase()),
              image: category.image_url || getDefaultImage(index),
              items: categoryItems,
            };
          }
        );

        setCategories(categoriesWithItems);
      } catch (error) {
        console.error('Error fetching menu data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [getDefaultImage]);

  // Filter items - search across all categories or filter by active category
  const filteredItems = searchTerm
    ? // When searching, look across all categories
      categories.flatMap((category: Category, categoryIndex: number) =>
        category.items
          .filter((item: MenuItem) => {
            const name = (item.name || '').toString().toLowerCase();
            const desc = (item.description || '').toString().toLowerCase();
            const term = searchTerm.toLowerCase();
            return name.includes(term) || desc.includes(term);
          })
          .map((item: MenuItem) => ({
            ...item,
            categoryName: category.name,
            categoryIndex: categoryIndex,
          }))
      )
    : // When not searching, show items from active category only
      (categories[activeCategory] || { items: [] }).items.map(
        (item: MenuItem) => ({
          ...item,
          categoryName: (categories[activeCategory] || categories[0])?.name,
          categoryIndex: activeCategory >= 0 ? activeCategory : 0,
        })
      );

  // Pagination logic
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const startIndex = currentPage * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filteredItems.slice(startIndex, endIndex);

  const goToNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Reset page when search changes
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(0);
  };

  // Handle category change
  const handleCategoryChange = (index: number) => {
    setActiveCategory(index);
    setSearchTerm(''); // Clear search when switching categories
    setCurrentPage(0);
  };

  // Format price display
  const formatPrice = (price?: number, sizes?: Record<string, number>) => {
    if (sizes && Object.keys(sizes).length > 0) {
      const prices = Object.values(sizes);
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      if (minPrice === maxPrice) {
        return `$${minPrice.toFixed(2)}`;
      }
      return `$${minPrice.toFixed(2)} - $${maxPrice.toFixed(2)}`;
    }
    return price ? `$${price.toFixed(2)}` : '';
  };

  // Normalize tags stored as array or comma-separated string
  const normalizeTags = (tags?: string[] | string | null) => {
    if (!tags) return [] as string[];
    if (Array.isArray(tags)) return tags as string[];
    if (typeof tags === 'string')
      return tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);
    return [] as string[];
  };

  // Helper to pick readable text color (#000 or #fff) for a background hex color
  const getContrastColor = (hex: string) => {
    if (!hex) return '#000';
    // Normalize hex
    const cleaned = hex.replace('#', '').trim();
    let r = 0,
      g = 0,
      b = 0;
    if (cleaned.length === 3) {
      r = parseInt(cleaned[0] + cleaned[0], 16);
      g = parseInt(cleaned[1] + cleaned[1], 16);
      b = parseInt(cleaned[2] + cleaned[2], 16);
    } else if (cleaned.length === 6) {
      r = parseInt(cleaned.substring(0, 2), 16);
      g = parseInt(cleaned.substring(2, 4), 16);
      b = parseInt(cleaned.substring(4, 6), 16);
    } else {
      // fallback
      return '#000';
    }

    // Perceived luminance
    const luminance = (r * 299 + g * 587 + b * 114) / 1000;
    return luminance > 150 ? '#000' : '#fff';
  };

  if (loading) {
    return (
      <section
        id="menu"
        className="relative py-12 overflow-hidden bg-white lg:py-4"
      >
        <div className="relative z-20 px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-b-2 rounded-full animate-spin border-amber-600"></div>
          </div>
        </div>
      </section>
    );
  }

  if (categories.length === 0) {
    return (
      <section
        id="menu"
        className="relative py-12 overflow-hidden bg-white lg:py-4"
      >
        <div className="relative z-20 px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="py-20 text-center">
            <h2 className="mb-4 text-2xl font-bold text-amber-800">
              Menu Coming Soon
            </h2>
            <p className="text-gray-600">
              Our delicious menu items will be available shortly.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      id="menu"
      className="relative py-12 overflow-hidden bg-white lg:py-4"
    >
      {/* Mobile-only coffee beans (visible on small screens) */}
      <img
        src="/icons/coffee-beans.svg"
        alt=""
        aria-hidden="true"
        className="absolute top-4 left-4 block sm:w-[120px] w-[100px] h-auto z-10 opacity-40 sm:opacity-50 md:hidden"
      />

      {/* Coffee beans for md screens only (150px, restored position) */}
      <img
        src="/icons/coffee-beans.svg"
        alt=""
        aria-hidden="true"
        className="absolute md:block lg:hidden hidden top-8 left-8 w-[150px] h-auto z-10 opacity-50"
      />

      {/* Mobile-only donut/pizza sketch placed top-right a bit lower than coffee */}
      <img
        src="/icons/dount-sketch.svg"
        alt=""
        aria-hidden="true"
        className="absolute right-4 top-16 block lg:hidden w-[100px] sm:w-[150px] h-auto z-10 opacity-40 sm:opacity-50 lg:opacity-70 rotate-12"
      />

      <div className="absolute inset-0 hidden pointer-events-none lg:block">
        {/* Coffee beans top-left (lg+) */}
        <img
          src="/icons/coffee-beans.svg"
          alt=""
          aria-hidden="true"
          className="absolute top-[5%] left-[5%] w-[120px] sm:w-[200px] md:w-[270px] md:top-[13%] md:left-[13%] lg:w-[220px] lg:top-[10%] lg:left-[10%] xl:w-[250px] h-auto z-10 opacity-40 sm:opacity-50 lg:opacity-70"
        />

        {/* Donut sketch top-right */}
        <img
          src="/icons/dount-sketch.svg"
          alt=""
          aria-hidden="true"
          className="absolute top-[25%] right-[5%] rotate-12 w-[100px] sm:w-[150px] lg:w-[230px] h-auto z-10 opacity-40 sm:opacity-50 lg:opacity-70"
        />

        {/* Pizza sketch mid-left (horizontally flipped) */}
        <img
          src="/icons/pizza-slice.png"
          alt=""
          aria-hidden="true"
          className="absolute top-[62%] left-[3%] rotate-6 scale-x-[-1] w-[120px] sm:w-[200px] lg:w-[300px] h-auto z-10 opacity-40 sm:opacity-50 lg:opacity-70"
        />

        {/* Orange slice mid-right */}
        <img
          src="/icons/orange-slice.svg"
          alt=""
          aria-hidden="true"
          className="absolute top-[60%] right-[12%] -rotate-12 w-[80px] sm:w-[150px] lg:w-[170px] h-auto z-10 opacity-40 sm:opacity-50 lg:opacity-70"
        />
      </div>

      <div className="relative z-20 px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {/* Decorative flowers (replicates top-flower usage from AboutStory) */}
        <div className="relative flex items-center justify-center mb-6">
          {/* Small screens: single flower centered above the header */}
          <img
            src="/icons/top-flower2.svg"
            alt="decorative flower top"
            draggable={false}
            className="pointer-events-none select-none block lg:hidden absolute top-[-25px] left-1/2 -translate-x-1/2 w-[200px] sm:w-[240px]"
          />

          {/* md+ screens: two flowers left and right */}
          <div className="hidden md:flex items-center justify-center md:gap-x-6 lg:gap-x-[140px] w-full">
            <img
              src="/icons/top-flower2.svg"
              alt="decorative flower left"
              draggable={false}
              className="pointer-events-none select-none sm:hidden lg:block transform translate-y-[6px] md:translate-y-[14px] lg:translate-y-[22px] w-[240px] md:w-[280px] lg:w-[320px] xl:w-[360px] md:-translate-x-[100px] lg:-translate-x-[100px] xl:-translate-x-[100px]"
            />

            <img
              src="/icons/top-flower2.svg"
              alt="decorative flower right"
              draggable={false}
              className="pointer-events-none select-none sm:hidden lg:block transform translate-y-[6px] md:translate-y-[14px] lg:translate-y-[22px] w-[240px] md:w-[280px] lg:w-[320px] xl:w-[360px] md:translate-x-[100px] lg:translate-x-[100px] xl:translate-x-[100px]"
            />
          </div>
        </div>

        {/* Header */}
        <div className="mb-6 text-center lg:mb-16">
          <h2
            className="mb-6 text-3xl font-bold lg:text-4xl xl:text-5xl text-amber-800"
            style={{ fontFamily: 'Prata, serif' }}
          >
            Our Menu
          </h2>
          <div className="w-24 h-1 mx-auto mb-4 bg-amber-600"></div>
          <p className="max-w-2xl mx-auto text-lg leading-relaxed text-gray-600 lg:text-xl">
            Crafted with care, served with love
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-4 lg:mb-12">
          <div className="max-w-md mx-auto">
            <div className="relative">
              <Search className="absolute w-5 h-5 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
              <input
                type="text"
                placeholder="Search across all menu items..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full py-3 pl-10 pr-4 transition-all duration-200 border border-gray-200 rounded-full outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
              />
              {searchTerm && (
                <button
                  onClick={() => handleSearchChange('')}
                  className="absolute text-gray-400 transform -translate-y-1/2 right-3 top-1/2 hover:text-gray-600"
                >
                  ×
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Category Navigation - Only show when not searching */}
        {!searchTerm && (
          <div className="mb-4 lg:mb-12">
            <div className="flex gap-3 pb-4 overflow-x-auto lg:flex-wrap lg:justify-center lg:gap-4 lg:pb-0">
              {categories.map((category, index) => {
                const Icon = category.icon || Coffee;
                return (
                  <button
                    key={index}
                    onClick={() => handleCategoryChange(index)}
                    className={`flex items-center space-x-2 px-4 lg:px-6 py-2 lg:py-3 rounded-full font-medium transition-all duration-300 whitespace-nowrap flex-shrink-0 ${
                      activeCategory === index
                        ? 'bg-amber-600 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-amber-100'
                    }`}
                  >
                    <Icon className="w-4 h-4 lg:w-5 lg:h-5" />
                    <span className="text-sm lg:text-base">
                      {category.name}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Mobile-only category image preview: appears between categories and items on small screens */}
            <div className="mt-4 mb-6 overflow-hidden rounded-2xl lg:hidden">
              <div className="relative overflow-hidden rounded-2xl">
                <img
                  src={categories[activeCategory].image}
                  alt={categories[activeCategory].name}
                  className="object-cover w-full transition-all duration-500 h-44"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute text-white bottom-3 left-4 right-4">
                  <h3 className="mb-1 text-lg font-bold transition-transform duration-300">
                    {categories[activeCategory].name}
                  </h3>
                  <p className="text-sm transition-opacity duration-300 opacity-90">
                    {categories[activeCategory].description}
                  </p>
                </div>
              </div>
            </div>

            {/* Mobile-only category stats: moved from right column so mobile shows counts here */}
            <div className="p-4 transition-all duration-300 shadow-sm bg-amber-50 rounded-xl lg:hidden">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="transition-transform duration-200 hover:scale-105">
                  <div className="text-2xl font-bold transition-colors duration-200 text-amber-700">
                    {searchTerm
                      ? filteredItems.length
                      : categories[activeCategory].items.length}
                  </div>
                  <div className="text-sm text-gray-600">
                    {searchTerm ? 'Found' : 'Items'}
                  </div>
                </div>
                <div className="transition-transform duration-200 hover:scale-105">
                  <div className="text-2xl font-bold transition-colors duration-200 text-amber-700">
                    {searchTerm
                      ? filteredItems.filter((item) => !!item.popular).length
                      : categories[activeCategory]?.items.filter(
                          (item) => !!item.popular
                        ).length || 0}
                  </div>
                  <div className="text-sm text-gray-600">Popular</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Search Results Header */}
        {searchTerm && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-center text-gray-700">
              Search Results for "{searchTerm}"
            </h3>
            <p className="text-sm text-center text-gray-500">
              Found {filteredItems.length} items across all categories
            </p>
          </div>
        )}

        {/* Main Content */}
        <div className="grid gap-8 mb-8 lg:grid-cols-3 lg:mb-16">
          {/* Menu Items */}
          <div className="lg:col-span-2 lg:order-1">
            <div className="space-y-3" id="menu-items-container">
              {filteredItems.length === 0 ? (
                <div className="py-12 text-center">
                  <p className="text-lg text-gray-500">
                    No items found matching "{searchTerm}"
                  </p>
                  <button
                    onClick={() => handleSearchChange('')}
                    className="mt-4 font-medium transition-colors duration-200 text-amber-600 hover:text-amber-700"
                  >
                    Clear search
                  </button>
                </div>
              ) : (
                currentItems.map((item, index) => {
                  const tags = normalizeTags((item as MenuItem).tags);
                  return (
                    <div
                      key={index}
                      className="p-3 transition-all duration-200 bg-white border border-gray-100 rounded-lg lg:p-4 hover:shadow-md hover:border-amber-200 hover:transform hover:scale-[1.01] group"
                      style={{
                        animationDelay: `${index * 50}ms`,
                      }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <h4 className="text-base font-semibold text-gray-800 transition-colors duration-200 lg:text-lg group-hover:text-amber-700">
                              {item.name}
                            </h4>
                            {/* Show category name when searching */}
                            {searchTerm && item.categoryName && (
                              <span className="px-2 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded-full">
                                {item.categoryName}
                              </span>
                            )}
                            {item.popular && (
                              <span className="px-2 py-1 text-xs font-medium rounded-full bg-amber-100 text-amber-700 animate-pulse">
                                Popular
                              </span>
                            )}
                            {formatPrice(item.price, item.sizes) && (
                              <span className="px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full">
                                {formatPrice(item.price, item.sizes)}
                              </span>
                            )}

                            {/* Tags (if any) */}
                            {tags.length > 0 &&
                              tags.map((tag, tIdx) => {
                                const colorKey = tag.toLowerCase();
                                const bg =
                                  attributeColors[colorKey] || '#E5E7EB';
                                const text = getContrastColor(bg);
                                return (
                                  <span
                                    key={tIdx}
                                    className="px-2 py-1 text-xs font-medium rounded-full"
                                    style={{ backgroundColor: bg, color: text }}
                                  >
                                    {tag}
                                  </span>
                                );
                              })}
                          </div>
                          <p className="text-sm leading-relaxed text-gray-600 transition-colors duration-200 group-hover:text-gray-700">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Pagination Controls */}
            {filteredItems.length > itemsPerPage && (
              <div className="flex items-center justify-between pt-6 mt-8 border-t border-gray-100">
                <button
                  onClick={goToPreviousPage}
                  disabled={currentPage === 0}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    currentPage === 0
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-amber-100 text-amber-700 hover:bg-amber-200 hover:shadow-md'
                  }`}
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </button>

                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">
                    Page {currentPage + 1} of {totalPages}
                  </span>
                  <span className="text-xs text-gray-400">
                    ({startIndex + 1}-{Math.min(endIndex, filteredItems.length)}{' '}
                    of {filteredItems.length})
                  </span>
                </div>

                <button
                  onClick={goToNextPage}
                  disabled={currentPage >= totalPages - 1}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    currentPage >= totalPages - 1
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-amber-100 text-amber-700 hover:bg-amber-200 hover:shadow-md'
                  }`}
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Category Image & Info - Right Side (hidden on mobile; shown at lg+) */}
          <div className="hidden lg:block lg:col-span-1 lg:order-2">
            <div className="transition-all duration-300 ease-in-out">
              <div className="relative mb-6 overflow-hidden rounded-2xl transform transition-transform duration-500 hover:scale-[1.02]">
                <img
                  src={categories[activeCategory].image}
                  alt={categories[activeCategory].name}
                  className="object-cover w-full h-64 transition-all duration-500 lg:h-96"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute text-white transition-all duration-300 bottom-4 left-4 right-4">
                  <h3 className="mb-2 text-xl font-bold transition-transform duration-300 transform lg:text-2xl">
                    {categories[activeCategory].name}
                  </h3>
                  <p className="text-sm transition-opacity duration-300 lg:text-base opacity-90">
                    {categories[activeCategory].description}
                  </p>
                </div>
              </div>
              {/* Additional Info */}
              <div className="hidden mt-6 lg:block">
                <div className="p-4 bg-white border border-gray-100 rounded-xl">
                  <p className="text-sm text-center text-gray-500">
                    {searchTerm
                      ? `${filteredItems.length} search results`
                      : `${categories[activeCategory].items.length} items in this category`}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Menu;
