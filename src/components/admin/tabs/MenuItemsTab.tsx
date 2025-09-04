import { useState } from 'react';
import { Button } from '../../ui/button';
import { Plus, Coffee, ChevronLeft, ChevronRight } from '@/lib/icons';
import { MenuItemCard } from '../cards/MenuItemCard';
import type { MenuItem, Category } from '../../../types/admin';

interface MenuItemsTabProps {
  menuItems: MenuItem[];
  categories: Category[];
  dataLoading: boolean;
  updatingMenuItems: Set<string>;
  onEditMenuItem: (item: MenuItem) => void;
  onDeleteMenuItem: (id: string, name?: string) => void;
  onToggleItemStatus: (
    id: string,
    isActive: boolean,
    type: 'menu_item'
  ) => void;
  onCreateNew: () => void;
  onDragStart: (item: MenuItem) => void;
  onDragOver: (e: React.DragEvent, index: number) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent, index: number) => void;
  dragOverIndex: number | null;
}

export const MenuItemsTab = ({
  menuItems,
  categories,
  dataLoading,
  updatingMenuItems,
  onEditMenuItem,
  onDeleteMenuItem,
  onToggleItemStatus,
  onCreateNew,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  dragOverIndex,
}: MenuItemsTabProps) => {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const filtered = menuItems.filter(
    (item) => !selectedCategory || item.category_id === selectedCategory
  );

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / itemsPerPage));
  const page = Math.min(Math.max(1, currentPage), totalPages);
  const start = (page - 1) * itemsPerPage;
  const paginated = filtered.slice(start, start + itemsPerPage);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            Menu Items ({menuItems.length})
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Manage your menu items
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button
            onClick={onCreateNew}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Menu Item
          </Button>
        </div>
      </div>

      {/* Category Filter Buttons */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <button
          onClick={() => setSelectedCategory('')}
          className={`px-3 py-1.5 text-sm rounded-full font-medium transition-colors ${
            selectedCategory === ''
              ? 'bg-emerald-600 text-white shadow'
              : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
          }`}
        >
          All Categories
        </button>
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`px-3 py-1.5 text-sm rounded-full font-medium transition-colors ${
              selectedCategory === category.id
                ? 'bg-emerald-600 text-white shadow'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>

      {/* Menu Items List */}
      {dataLoading ? (
        <div className="py-12 text-center">
          <div className="w-12 h-12 mx-auto border-b-2 rounded-full animate-spin border-emerald-500"></div>
          <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-400">
            Loading menu items...
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="space-y-2">
            {paginated.map((item, idx) => {
              const index = start + idx;
              return (
                <MenuItemCard
                  key={item.id}
                  item={item}
                  categories={categories}
                  isUpdating={updatingMenuItems.has(item.id)}
                  selectedCategory={selectedCategory}
                  index={index}
                  dragOverIndex={dragOverIndex}
                  onEdit={onEditMenuItem}
                  onToggleStatus={(isActive) =>
                    onToggleItemStatus(item.id, isActive, 'menu_item')
                  }
                  onDelete={() => onDeleteMenuItem(item.id, item.name)}
                  onDragStart={() => onDragStart(item)}
                  onDragOver={(e) => onDragOver(e, index)}
                  onDragLeave={onDragLeave}
                  onDrop={(e) => onDrop(e, index)}
                />
              );
            })}
          </div>

          {/* Pagination Controls */}
          {total > itemsPerPage && (
            <div className="flex items-center justify-center gap-3 py-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <div className="text-sm text-zinc-700 dark:text-zinc-300">
                Page {page} of {totalPages}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={page >= totalPages}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {!dataLoading && filtered.length === 0 && (
        <div className="py-12 text-center">
          <Coffee className="w-12 h-12 mx-auto mb-4 text-zinc-400 dark:text-zinc-600" />
          <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">
            No menu items found
          </h3>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            {selectedCategory
              ? 'No items in this category yet.'
              : 'Get started by creating your first menu item.'}
          </p>
        </div>
      )}
    </div>
  );
};
