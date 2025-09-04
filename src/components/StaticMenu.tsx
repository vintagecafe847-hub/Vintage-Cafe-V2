import { useState, useEffect, useMemo } from 'react';
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
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import { useStaticMenuData } from '../hooks/useStaticMenuData';
import type { StaticMenuData } from '../utils/staticDataExport';

// Extended types for the component
type MenuItem = StaticMenuData['menuItems'][0] & {
  categoryName?: string;
  categoryIndex?: number;
  tags?: string[] | string | null;
  pricing_type?: 'fixed' | 'consistent_size' | 'custom_size';
  image_url?: string | null;
};

type Category = StaticMenuData['categories'][0] & {
  icon?: React.ComponentType<{ className?: string }>;
};

// Category icons mapping
const categoryIcons: Record<
  string,
  React.ComponentType<{ className?: string }>
> = {
  coffee: Coffee,
  tea: Leaf,
  pastries: Sparkles,
  sandwiches: Heart,
  beverages: Coffee,
  desserts: Sparkles,
  breakfast: Coffee,
  lunch: Heart,
};

export default function StaticMenu() {
  const { data, loading, error } = useStaticMenuData();

  // UI State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'popular'>('name');
  const [showFilters, setShowFilters] = useState(false);

  const itemsPerPage = 12;

  // Process data when it loads
  const { categories, menuItems, allTags } = useMemo(() => {
    if (!data) {
      return { categories: [], menuItems: [], allTags: [] };
    }

    // Process categories with icons
    const processedCategories: Category[] = data.categories.map((category) => ({
      ...category,
      icon: categoryIcons[category.name.toLowerCase()] || Coffee,
    }));

    // Process menu items with category names
    const processedMenuItems: MenuItem[] = data.menuItems.map((item) => {
      const category = data.categories.find(
        (cat) => cat.id === item.category_id
      );

      // Parse tags
      let parsedTags: string[] = [];
      if (typeof item.tags === 'string') {
        try {
          parsedTags = JSON.parse(item.tags);
        } catch {
          parsedTags = (item.tags as string)
            .split(',')
            .map((tag: string) => tag.trim())
            .filter(Boolean);
        }
      } else if (Array.isArray(item.tags)) {
        parsedTags = item.tags;
      }

      return {
        ...item,
        categoryName: category?.name || 'Other',
        categoryIndex: category?.display_order || 999,
        tags: parsedTags,
      };
    });

    // Extract all unique tags
    const tagSet = new Set<string>();
    processedMenuItems.forEach((item) => {
      if (Array.isArray(item.tags)) {
        item.tags.forEach((tag) => tagSet.add(tag));
      }
    });
    const uniqueTags = Array.from(tagSet).sort();

    return {
      categories: processedCategories,
      menuItems: processedMenuItems,
      allTags: uniqueTags,
    };
  }, [data]);

  // Filter and sort menu items
  const filteredAndSortedItems = useMemo(() => {
    const filtered = menuItems.filter((item) => {
      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch =
          item.name.toLowerCase().includes(searchLower) ||
          item.description?.toLowerCase().includes(searchLower) ||
          item.categoryName?.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      // Category filter
      if (selectedCategory !== 'all' && item.category_id !== selectedCategory) {
        return false;
      }

      // Tags filter
      if (selectedTags.length > 0 && Array.isArray(item.tags)) {
        if (!selectedTags.some((tag) => item.tags?.includes(tag))) {
          return false;
        }
      }

      return true;
    });

    // Sort items
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'price':
          return (a.price || 0) - (b.price || 0);
        case 'popular':
          return (a.display_order || 999) - (b.display_order || 999);
        default:
          return 0;
      }
    });

    return filtered;
  }, [menuItems, searchTerm, selectedCategory, selectedTags, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedItems.length / itemsPerPage);
  const paginatedItems = filteredAndSortedItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, selectedTags, sortBy]);

  // Helper functions
  const formatPrice = (price: number | null) => {
    if (price === null || price === undefined) return 'Price varies';
    return `$${price.toFixed(2)}`;
  };

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

  const handleTagToggle = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 mx-auto mb-4 animate-spin text-amber-600" />
          <p className="text-gray-600">Loading menu...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center max-w-md mx-auto p-6">
          <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-red-500" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Menu Unavailable
          </h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <p className="text-sm text-gray-500">
            Our menu data is currently being updated. Please try again in a few
            minutes.
          </p>
        </div>
      </div>
    );
  }

  // No data state
  if (!data || menuItems.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Coffee className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600">No menu items available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Data freshness indicator */}
      {data && (
        <div className="mb-6 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-700">
            ✨ Menu last updated:{' '}
            {new Date(data.lastUpdated).toLocaleDateString()} at{' '}
            {new Date(data.lastUpdated).toLocaleTimeString()}
          </p>
        </div>
      )}

      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Our Menu
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Discover our carefully crafted selection of coffee, pastries, and
          delicious treats
        </p>
      </div>

      {/* Search and Filters */}
      <div className="mb-8 space-y-4">
        {/* Search Bar */}
        <div className="relative max-w-md mx-auto">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search menu items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          />
        </div>

        {/* Filter Toggle */}
        <div className="text-center">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Filters
            {showFilters ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="bg-white p-6 rounded-xl border border-gray-200 space-y-6">
            {/* Categories */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-3">
                Categories
              </h3>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`px-3 py-2 text-sm rounded-full border transition-colors ${
                    selectedCategory === 'all'
                      ? 'bg-amber-100 text-amber-800 border-amber-300'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  All Categories
                </button>
                {categories.map((category) => {
                  const Icon = category.icon || Coffee;
                  return (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`flex items-center gap-2 px-3 py-2 text-sm rounded-full border transition-colors ${
                        selectedCategory === category.id
                          ? 'bg-amber-100 text-amber-800 border-amber-300'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {category.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tags */}
            {allTags.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {allTags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => handleTagToggle(tag)}
                      className={`flex items-center gap-1 px-3 py-2 text-sm rounded-full border transition-colors ${
                        selectedTags.includes(tag)
                          ? 'bg-green-100 text-green-800 border-green-300'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <Tag className="w-3 h-3" />
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Sort */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-3">
                Sort by
              </h3>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: 'name', label: 'Name' },
                  { value: 'price', label: 'Price' },
                  { value: 'popular', label: 'Popular' },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() =>
                      setSortBy(option.value as 'name' | 'price' | 'popular')
                    }
                    className={`px-3 py-2 text-sm rounded-full border transition-colors ${
                      sortBy === option.value
                        ? 'bg-purple-100 text-purple-800 border-purple-300'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Results Count */}
      <div className="mb-6 text-center">
        <p className="text-gray-600">
          Showing {paginatedItems.length} of {filteredAndSortedItems.length}{' '}
          items
          {searchTerm && ` for "${searchTerm}"`}
        </p>
      </div>

      {/* Menu Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {paginatedItems.map((item) => {
          const isExpanded = expandedItems.has(item.id);

          return (
            <div
              key={item.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* Item Image */}
              {item.image_url && (
                <div className="aspect-video overflow-hidden">
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="p-6">
                {/* Header */}
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {item.name}
                    </h3>
                    <p className="text-sm text-gray-500">{item.categoryName}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold text-amber-600">
                      {formatPrice(item.price)}
                    </span>
                  </div>
                </div>

                {/* Description */}
                {item.description && (
                  <p
                    className={`text-gray-600 mb-4 ${
                      !isExpanded && item.description.length > 100
                        ? 'line-clamp-3'
                        : ''
                    }`}
                  >
                    {item.description}
                  </p>
                )}

                {/* Tags */}
                {Array.isArray(item.tags) && item.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {item.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full"
                      >
                        <Tag className="w-3 h-3" />
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Expand/Collapse for long descriptions */}
                {item.description && item.description.length > 100 && (
                  <button
                    onClick={() => toggleItemExpansion(item.id)}
                    className="text-sm text-amber-600 hover:text-amber-700 font-medium"
                  >
                    {isExpanded ? 'Show less' : 'Show more'}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>

          <div className="flex gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-2 text-sm font-medium rounded-lg ${
                  currentPage === page
                    ? 'bg-amber-600 text-white'
                    : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {page}
              </button>
            ))}
          </div>

          <button
            onClick={() =>
              setCurrentPage(Math.min(totalPages, currentPage + 1))
            }
            disabled={currentPage === totalPages}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
