import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Coffee,
  Leaf,
  Sparkles,
  Heart,
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Tag,
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
  menu_item_attributes?: Array<{
    id: string;
    attribute: {
      id: string;
      name: string;
      description?: string;
      color?: string;
    };
  }>;
  menu_item_sizes?: Array<{
    id: string;
    size: {
      id: string;
      name: string;
    };
    price_override?: number;
  }>;
  custom_sizes?: Array<{
    name: string;
    price: number;
  }>;
  pricing_type?: 'fixed' | 'consistent_size' | 'custom_size';
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
  const [loading, setLoading] = useState(true);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [expandedSizes, setExpandedSizes] = useState<Set<string>>(new Set());
  const [isMobile, setIsMobile] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);

  // Dynamic items per page based on screen size
  const getItemsPerPage = () => (isMobile ? 4 : 10);

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

  // Helper function to get attribute color
  const getAttributeColor = (color?: string, index?: number) => {
    // Debug: log the color being passed
    console.log('getAttributeColor called with:', { color, index });

    // If color is provided and not empty, use it
    if (color && color.trim() !== '') {
      const trimmedColor = color.trim();

      // If it already starts with #, return as-is
      if (trimmedColor.startsWith('#')) {
        console.log('Returning color with #:', trimmedColor);
        return trimmedColor;
      }

      // If it's 6 hex characters without #, add the #
      if (trimmedColor.match(/^[0-9A-Fa-f]{6}$/)) {
        const colorWithHash = `#${trimmedColor}`;
        console.log('Adding # to color:', colorWithHash);
        return colorWithHash;
      }

      // Return as-is for named colors or other formats
      console.log('Returning color as-is:', trimmedColor);
      return trimmedColor;
    }

    // No fallback colors - return a default gray if no color provided
    console.log('No color provided, returning default gray');
    return '#6B7280'; // Gray color
  };

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

        // Fetch menu items with their categories, sizes, and attributes
        const { data: menuItemsData, error: menuItemsError } = await supabase
          .from('menu_items')
          .select(
            `
            *,
            category:categories(*),
            menu_item_sizes(
              id,
              price_override,
              size:sizes(
                id,
                name
              )
            ),
            menu_item_attributes(
              id,
              attribute:attributes(
                id,
                name,
                description,
                color
              )
            )
          `
          )
          .eq('is_active', true)
          .order('created_at', { ascending: true });

        if (menuItemsError) throw menuItemsError;

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

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Touch handlers for swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

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
  const itemsPerPage = getItemsPerPage();
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const startIndex = currentPage * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filteredItems.slice(startIndex, endIndex);

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;

    const distance = touchStartX.current - touchEndX.current;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe && currentPage < totalPages - 1) {
      setIsAnimating(true);
      setCurrentPage(currentPage + 1);
      setTimeout(() => setIsAnimating(false), 300);
    }
    if (isRightSwipe && currentPage > 0) {
      setIsAnimating(true);
      setCurrentPage(currentPage - 1);
      setTimeout(() => setIsAnimating(false), 300);
    }

    touchStartX.current = 0;
    touchEndX.current = 0;
  };

  const goToNextPage = () => {
    if (currentPage < totalPages - 1) {
      setIsAnimating(true);
      setCurrentPage(currentPage + 1);
      setTimeout(() => setIsAnimating(false), 300);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 0) {
      setIsAnimating(true);
      setCurrentPage(currentPage - 1);
      setTimeout(() => setIsAnimating(false), 300);
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

  // Get pricing display for an item
  const getItemPricing = (item: MenuItem) => {
    // Handle consistent_size pricing type
    if (
      item.pricing_type === 'consistent_size' &&
      item.menu_item_sizes?.length
    ) {
      const basePrice = parseFloat(item.price?.toString() || '0');
      const prices = item.menu_item_sizes.map((size) => {
        // If price_override exists, use it as final price, otherwise add to base price
        return size.price_override !== null
          ? parseFloat(size.price_override.toString())
          : basePrice;
      });
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      if (minPrice === maxPrice) {
        return `$${minPrice.toFixed(2)}`;
      }
      return `$${minPrice.toFixed(2)} - $${maxPrice.toFixed(2)}`;
    }
    // Handle custom_size pricing type
    else if (item.pricing_type === 'custom_size' && item.custom_sizes?.length) {
      const prices = item.custom_sizes.map((size) => size.price);
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      if (minPrice === maxPrice) {
        return `$${minPrice.toFixed(2)}`;
      }
      return `$${minPrice.toFixed(2)} - $${maxPrice.toFixed(2)}`;
    }
    // Handle legacy sizes object
    else if (item.sizes && Object.keys(item.sizes).length > 0) {
      return formatPrice(item.price, item.sizes);
    }
    // Handle fixed pricing
    else {
      const price = parseFloat(item.price?.toString() || '0');
      return price ? `$${price.toFixed(2)}` : '';
    }
  };

  // Toggle item expansion
  const toggleItemExpansion = (itemId: string) => {
    setExpandedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  // Toggle size dropdown expansion
  const toggleSizeExpansion = (itemId: string) => {
    setExpandedSizes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  // Close size dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // If there are no expanded sizes or items, no need to check
      if (expandedSizes.size === 0 && expandedItems.size === 0) return;

      const target = event.target as Element;

      // Check if the click is outside any size dropdown
      if (expandedSizes.size > 0 && !target.closest('[data-size-dropdown]')) {
        setExpandedSizes(new Set());
      }

      // Check if the click is outside any expanded item details
      if (expandedItems.size > 0 && !target.closest('[data-expanded-item]')) {
        setExpandedItems(new Set());
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [expandedSizes.size, expandedItems.size]);

  // Check if item has multiple sizes
  const hasMultipleSizes = (item: MenuItem) => {
    return (
      (item.pricing_type === 'consistent_size' &&
        item.menu_item_sizes &&
        item.menu_item_sizes.length > 1) ||
      (item.pricing_type === 'custom_size' &&
        item.custom_sizes &&
        item.custom_sizes.length > 1) ||
      (item.sizes && Object.keys(item.sizes).length > 1)
    );
  };

  // Check if item has additional details to show
  const hasAdditionalDetails = (item: MenuItem) => {
    return (
      (item.description && item.description.trim() !== '') ||
      (item.tags && Array.isArray(item.tags) && item.tags.length > 0) ||
      (item.menu_item_attributes && item.menu_item_attributes.length > 0)
    );
  };

  if (loading) {
    return (
      <section
        id="menu"
        className="relative py-12 overflow-hidden bg-[#FAFAFA] lg:py-4"
      >
        <div className="relative z-20 px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-b-2 rounded-full animate-spin border-[#D8A24A]"></div>
          </div>
        </div>
      </section>
    );
  }

  if (categories.length === 0) {
    return (
      <section
        id="menu"
        className="relative py-12 overflow-hidden bg-[#FAFAFA] lg:py-4"
      >
        <div className="relative z-20 px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="py-20 text-center">
            <h2 className="mb-4 text-2xl font-bold text-[#3B2A20]">
              Menu Coming Soon
            </h2>
            <p className="text-[#3B2A20]/70">
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
      className="relative py-12 overflow-hidden bg-[#FAFAFA] lg:py-4"
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
            className="mb-6 text-3xl font-bold lg:text-4xl xl:text-5xl text-[#3B2A20]"
            style={{ fontFamily: 'Prata, serif' }}
          >
            Our Menu
          </h2>
          <div className="w-24 h-1 mx-auto mb-4 bg-[#D8A24A]"></div>
          <p className="max-w-2xl mx-auto text-lg leading-relaxed text-[#3B2A20]/70 lg:text-xl">
            Crafted with care, served with love
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-4 lg:mb-12">
          <div className="max-w-md mx-auto">
            <div className="relative">
              <Search className="absolute w-5 h-5 text-[#3B2A20]/50 transform -translate-y-1/2 left-3 top-1/2" />
              <input
                type="text"
                placeholder="Search across all menu items..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full px-4 py-3 pl-10 pr-4 text-[#3B2A20] transition-all duration-200 bg-white border border-[#3B2A20]/20 rounded-full outline-none placeholder-[#3B2A20]/50 focus:border-[#D8A24A] focus:ring-2 focus:ring-[#D8A24A]/20"
              />
              {searchTerm && (
                <button
                  onClick={() => handleSearchChange('')}
                  className="absolute text-[#3B2A20]/50 transform -translate-y-1/2 right-3 top-1/2 hover:text-[#3B2A20]"
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
                        ? 'bg-[#D8A24A] text-white shadow-lg'
                        : 'bg-white text-[#3B2A20] hover:bg-[#D8A24A]/10 border border-[#3B2A20]/20'
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

            {/* Mobile-only category image preview: appears between categories and items on small screens
                and shows a small badge with the items count (replaces the separate stats block) */}
            <div className="mt-4 mb-6 overflow-hidden rounded-2xl lg:hidden">
              <div className="relative overflow-hidden rounded-2xl">
                <img
                  src={categories[activeCategory].image}
                  alt={categories[activeCategory].name}
                  className="object-cover w-full transition-all duration-500 h-44"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#3B2A20]/60 to-transparent"></div>

                {/* Small items-count badge on the right side of the image (mobile) */}
                <div className="absolute top-3 right-3">
                  <div
                    aria-hidden="true"
                    className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-semibold text-white bg-[#D8A24A] rounded-full shadow-md border border-white/40"
                    title={
                      searchTerm
                        ? `${filteredItems.length} search results`
                        : `${categories[activeCategory].items.length} items`
                    }
                  >
                    {searchTerm
                      ? filteredItems.length
                      : categories[activeCategory].items.length}
                  </div>
                </div>

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
          </div>
        )}

        {/* Search Results Header */}
        {searchTerm && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-center text-[#3B2A20]">
              Search Results for "{searchTerm}"
            </h3>
            <p className="text-sm text-center text-[#3B2A20]/60">
              Found {filteredItems.length} items across all categories
            </p>
          </div>
        )}

        {/* Main Content */}
        <div className="grid items-start gap-16 mb-8 lg:grid-cols-3 lg:mb-16">
          {/* Menu Items */}
          <div className="lg:col-span-2 lg:order-1">
            <div
              ref={containerRef}
              className={`grid grid-cols-1 gap-3 sm:grid-cols-2 transition-all duration-300 ${
                isAnimating
                  ? 'opacity-80 transform scale-[0.98]'
                  : 'opacity-100 transform scale-100'
              }`}
              id="menu-items-container"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {filteredItems.length === 0 ? (
                <div className="py-12 text-center sm:col-span-2">
                  <p className="text-lg text-[#3B2A20]/60">
                    No items found matching "{searchTerm}"
                  </p>
                  <button
                    onClick={() => handleSearchChange('')}
                    className="mt-4 font-medium transition-colors duration-200 text-[#D8A24A] hover:text-[#D8A24A]/80"
                  >
                    Clear search
                  </button>
                </div>
              ) : (
                currentItems.map((item, index) => {
                  const isExpanded = expandedItems.has(item.id);
                  const isSizeExpanded = expandedSizes.has(item.id);
                  const showDetails = hasAdditionalDetails(item);
                  const showSizes = hasMultipleSizes(item);

                  return (
                    <div
                      key={item.id}
                      className="overflow-visible transition-all duration-200 bg-white border border-[#3B2A20]/10 rounded-lg hover:bg-[#D8A24A]/5 group hover:border-[#D8A24A]/30"
                      style={{
                        animationDelay: `${index * 50}ms`,
                      }}
                    >
                      <div className="p-4">
                        {/* Name and Price Row */}
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center flex-1 gap-2">
                            <h4 className="text-sm font-medium text-[#3B2A20] transition-colors duration-200 lg:text-base group-hover:text-[#D8A24A] uppercase tracking-wide">
                              {item.name}
                            </h4>
                            {/* Show category name when searching */}
                            {searchTerm && item.categoryName && (
                              <span className="px-2 py-1 text-xs font-medium text-[#3B2A20]/70 bg-[#3B2A20]/10 rounded-full">
                                {item.categoryName}
                              </span>
                            )}
                            {item.popular && (
                              <span className="px-2 py-1 text-xs font-medium rounded-full bg-[#D8A24A]/20 text-[#D8A24A]">
                                Popular
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2 ml-4">
                            <div className="text-right">
                              {getItemPricing(item) && (
                                <span className="text-sm font-medium text-[#3B2A20] lg:text-base">
                                  {getItemPricing(item)}
                                </span>
                              )}
                            </div>

                            {/* Size dropdown button - only show if has multiple sizes */}
                            {showSizes && (
                              <div className="relative" data-size-dropdown>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleSizeExpansion(item.id);
                                  }}
                                  className="p-1 rounded-full transition-all duration-200 hover:bg-[#D8A24A]/20 text-[#3B2A20]/60 hover:text-[#D8A24A]"
                                  aria-label={
                                    isSizeExpanded ? 'Hide sizes' : 'Show sizes'
                                  }
                                >
                                  {isSizeExpanded ? (
                                    <ChevronUp className="w-4 h-4" />
                                  ) : (
                                    <ChevronDown className="w-4 h-4" />
                                  )}
                                </button>

                                {/* Size dropdown overlay */}
                                {isSizeExpanded && (
                                  <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-[#3B2A20]/20 rounded-lg shadow-lg z-50 overflow-hidden">
                                    <div className="p-3">
                                      <h6 className="mb-2 text-xs font-medium uppercase tracking-wide text-[#3B2A20]/80">
                                        Available Sizes
                                      </h6>
                                      <div className="space-y-2">
                                        {/* Consistent size options */}
                                        {item.pricing_type ===
                                          'consistent_size' &&
                                          item.menu_item_sizes &&
                                          item.menu_item_sizes.map(
                                            (menuSize) => {
                                              const basePrice = parseFloat(
                                                item.price?.toString() || '0'
                                              );
                                              const finalPrice =
                                                menuSize.price_override !== null
                                                  ? parseFloat(
                                                      menuSize.price_override.toString()
                                                    )
                                                  : basePrice;

                                              return (
                                                <div
                                                  key={menuSize.id}
                                                  className="flex items-center justify-between p-2 bg-[#3B2A20]/5 rounded border border-[#3B2A20]/10"
                                                >
                                                  <span className="text-sm font-medium text-[#3B2A20]">
                                                    {menuSize.size.name}
                                                  </span>
                                                  <span className="text-sm font-medium text-[#D8A24A]">
                                                    ${finalPrice.toFixed(2)}
                                                  </span>
                                                </div>
                                              );
                                            }
                                          )}

                                        {/* Custom size options */}
                                        {item.pricing_type === 'custom_size' &&
                                          item.custom_sizes &&
                                          item.custom_sizes.map((size, idx) => (
                                            <div
                                              key={idx}
                                              className="flex items-center justify-between p-2 bg-[#3B2A20]/5 rounded border border-[#3B2A20]/10"
                                            >
                                              <span className="text-sm font-medium text-[#3B2A20]">
                                                {size.name}
                                              </span>
                                              <span className="text-sm font-medium text-[#D8A24A]">
                                                ${size.price.toFixed(2)}
                                              </span>
                                            </div>
                                          ))}

                                        {/* Legacy sizes object */}
                                        {item.sizes &&
                                          Object.keys(item.sizes).length > 1 &&
                                          Object.entries(item.sizes).map(
                                            ([sizeName, price]) => (
                                              <div
                                                key={sizeName}
                                                className="flex items-center justify-between p-2 bg-[#3B2A20]/5 rounded border border-[#3B2A20]/10"
                                              >
                                                <span className="text-sm font-medium text-[#3B2A20] capitalize">
                                                  {sizeName}
                                                </span>
                                                <span className="text-sm font-medium text-[#D8A24A]">
                                                  $
                                                  {typeof price === 'number'
                                                    ? price.toFixed(2)
                                                    : price}
                                                </span>
                                              </div>
                                            )
                                          )}
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Description and Tags Row */}
                        <div className="relative">
                          <div
                            className={`flex items-center gap-2 overflow-hidden transition-all duration-300 ${
                              hasAdditionalDetails(item)
                                ? 'cursor-pointer hover:bg-[#D8A24A]/5 rounded-md p-1 -m-1'
                                : ''
                            }`}
                            onClick={(e) => {
                              // Only handle clicks if we have additional details and the click isn't on the overlay
                              if (
                                hasAdditionalDetails(item) &&
                                !e.defaultPrevented
                              ) {
                                e.stopPropagation();
                                console.log(
                                  `Toggling expansion for item: ${item.name}, currently expanded: ${isExpanded}`
                                );
                                toggleItemExpansion(item.id);
                              }
                            }}
                          >
                            {/* Description */}
                            {item.description && (
                              <div
                                id={`description-${item.id}`}
                                className="flex-1 min-w-0 line-clamp-1"
                              >
                                <p className="text-sm text-[#3B2A20]/60">
                                  {item.description}
                                </p>
                              </div>
                            )}

                            {/* Tags */}
                            <div className="flex items-center gap-1 flex-shrink-0 max-w-[40%]">
                              {(() => {
                                // Combine both tags and attributes into a single array
                                const allTags: Array<{
                                  type: 'tag' | 'attribute';
                                  key: string;
                                  name: string;
                                  color: string;
                                }> = [];

                                // Add tags from item.tags array
                                if (
                                  item.tags &&
                                  Array.isArray(item.tags) &&
                                  item.tags.length > 0
                                ) {
                                  item.tags.forEach((tag, tagIndex) => {
                                    allTags.push({
                                      type: 'tag',
                                      key: `tag-${tagIndex}`,
                                      name: tag,
                                      color: getAttributeColor(
                                        undefined,
                                        tagIndex
                                      ),
                                    });
                                  });
                                }

                                // Add attributes from menu_item_attributes
                                if (
                                  item.menu_item_attributes &&
                                  item.menu_item_attributes.length > 0
                                ) {
                                  item.menu_item_attributes.forEach(
                                    (attr, attrIndex) => {
                                      allTags.push({
                                        type: 'attribute',
                                        key: attr.id,
                                        name: attr.attribute.name,
                                        color: getAttributeColor(
                                          attr.attribute.color,
                                          attrIndex
                                        ),
                                      });
                                    }
                                  );
                                }

                                // Always limit to 2 tags in the card (regardless of expansion state)
                                const displayTags = allTags.slice(0, 2);
                                const hasMoreTags = allTags.length > 2;

                                return (
                                  <>
                                    {displayTags.map((tag) => (
                                      <span
                                        key={tag.key}
                                        className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap"
                                        style={{
                                          backgroundColor: tag.color,
                                          color: 'white',
                                        }}
                                      >
                                        <Tag className="w-3 h-3" />
                                        {tag.name}
                                      </span>
                                    ))}
                                    {hasMoreTags && (
                                      <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-[#D8A24A] bg-[#D8A24A]/10 rounded-full">
                                        +{allTags.length - 2} more
                                      </span>
                                    )}
                                  </>
                                );
                              })()}
                            </div>
                          </div>

                          {/* Expanded Details Overlay */}
                          {isExpanded && showDetails && (
                            <div
                              className="absolute top-full left-0 right-0 mt-2 p-4 bg-white border border-[#3B2A20]/20 rounded-lg shadow-lg z-50 cursor-pointer"
                              data-expanded-item
                              onClick={(e) => {
                                e.stopPropagation();
                                console.log(
                                  `Closing expanded details for item: ${item.name}`
                                );
                                toggleItemExpansion(item.id);
                              }}
                            >
                              <div className="flex items-center justify-between mb-3">
                                <h5 className="text-xs font-medium uppercase tracking-wide text-[#3B2A20]/80">
                                  Details
                                </h5>
                                <span className="text-xs text-[#3B2A20]/50 italic">
                                  Click to close
                                </span>
                              </div>
                              <div className="space-y-3">
                                {/* Full Description */}
                                {item.description && (
                                  <div>
                                    <h5 className="mb-2 text-xs font-medium uppercase tracking-wide text-[#3B2A20]/80">
                                      Description
                                    </h5>
                                    <p className="text-sm text-[#3B2A20]/70 leading-relaxed">
                                      {item.description}
                                    </p>
                                  </div>
                                )}

                                {/* All tags */}
                                {item.tags &&
                                  Array.isArray(item.tags) &&
                                  item.tags.length > 0 && (
                                    <div>
                                      <h5 className="mb-2 text-xs font-medium uppercase tracking-wide text-[#3B2A20]/80">
                                        Tags
                                      </h5>
                                      <div className="flex flex-wrap gap-2">
                                        {item.tags.map((tag, tagIndex) => (
                                          <span
                                            key={tagIndex}
                                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-full"
                                            style={{
                                              backgroundColor: '#6B7280',
                                              color: 'white',
                                            }}
                                          >
                                            <Tag className="w-3 h-3" />
                                            {tag}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                {/* All Attributes */}
                                {item.menu_item_attributes &&
                                  item.menu_item_attributes.length > 0 && (
                                    <div>
                                      <h5 className="mb-2 text-xs font-medium uppercase tracking-wide text-[#3B2A20]/80">
                                        Attributes
                                      </h5>
                                      <div className="flex flex-wrap gap-2">
                                        {item.menu_item_attributes.map(
                                          (attr, attrIndex) => (
                                            <span
                                              key={attr.id}
                                              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-full"
                                              style={{
                                                backgroundColor:
                                                  getAttributeColor(
                                                    attr.attribute.color,
                                                    attrIndex
                                                  ),
                                                color: 'white',
                                              }}
                                            >
                                              <Tag className="w-3 h-3" />
                                              <span>{attr.attribute.name}</span>
                                              {attr.attribute.description && (
                                                <span className="ml-1 text-xs opacity-80">
                                                  - {attr.attribute.description}
                                                </span>
                                              )}
                                            </span>
                                          )
                                        )}
                                      </div>
                                    </div>
                                  )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Mobile swipe instruction - only show on mobile when there are multiple pages */}
            {isMobile && totalPages > 1 && (
              <div className="mt-4 text-center lg:hidden">
                <p className="text-sm text-[#3B2A20]/60">
                  💡 Swipe left or right to see more items
                </p>
              </div>
            )}

            {/* Pagination Controls */}
            {filteredItems.length > itemsPerPage && (
              <div className="flex items-center justify-between pt-6 mt-8 border-t border-[#3B2A20]/10">
                <button
                  onClick={goToPreviousPage}
                  disabled={currentPage === 0}
                  className={`flex items-center gap-1 px-3 py-2 rounded-lg font-medium transition-all duration-200 ${
                    currentPage === 0
                      ? 'bg-[#3B2A20]/10 text-[#3B2A20]/40 cursor-not-allowed'
                      : 'bg-[#D8A24A]/20 text-[#D8A24A] hover:bg-[#D8A24A]/30 hover:shadow-md'
                  }`}
                >
                  <ChevronLeft className="w-4 h-4" />
                  Prev
                </button>

                <div className="flex items-center gap-2">
                  <span className="text-sm text-[#3B2A20]/70">
                    Page {currentPage + 1} of {totalPages}
                  </span>
                  <span className="text-xs text-[#3B2A20]/50">
                    ({startIndex + 1}-{Math.min(endIndex, filteredItems.length)}{' '}
                    of {filteredItems.length})
                  </span>
                </div>

                <button
                  onClick={goToNextPage}
                  disabled={currentPage >= totalPages - 1}
                  className={`flex items-center gap-1 px-3 py-2 rounded-lg font-medium transition-all duration-200 ${
                    currentPage >= totalPages - 1
                      ? 'bg-[#3B2A20]/10 text-[#3B2A20]/40 cursor-not-allowed'
                      : 'bg-[#D8A24A]/20 text-[#D8A24A] hover:bg-[#D8A24A]/30 hover:shadow-md'
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
                <div className="absolute inset-0 bg-gradient-to-t from-[#3B2A20]/60 to-transparent"></div>
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
                <div className="p-4 bg-white border border-[#3B2A20]/10 rounded-xl">
                  <p className="text-sm text-center text-[#3B2A20]/60">
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
