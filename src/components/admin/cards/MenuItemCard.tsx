import { Button } from '../../ui/button';
import { Edit, Eye, EyeOff, Trash2, GripVertical } from '@/lib/icons';
import type { MenuItem, Category } from '../../../types/admin';

interface MenuItemCardProps {
  item: MenuItem;
  categories: Category[];
  isUpdating: boolean;
  selectedCategory: string;
  index: number;
  dragOverIndex: number | null;
  onEdit: (item: MenuItem) => void;
  onToggleStatus: (isActive: boolean) => void;
  onDelete: () => void;
  onDragStart: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent) => void;
}

export const MenuItemCard = ({
  item,
  categories,
  isUpdating,
  selectedCategory,
  index,
  dragOverIndex,
  onEdit,
  onToggleStatus,
  onDelete,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
}: MenuItemCardProps) => {
  // Helper to format currency
  const formatCurrency = (n: number | null | undefined) => {
    if (n === null || n === undefined || Number.isNaN(Number(n)))
      return '0.00$';
    try {
      return `${Number(n).toFixed(2)}$`;
    } catch {
      return '0.00$';
    }
  };

  return (
    <div
      onClick={() => onEdit(item)}
      className={`relative flex items-center gap-2 bg-white rounded-lg border transition-colors duration-150 dark:bg-zinc-900 cursor-pointer ${
        dragOverIndex === index
          ? 'border-emerald-300 bg-emerald-50 dark:border-emerald-700 dark:bg-emerald-950/20'
          : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600'
      } ${isUpdating ? 'blur-sm' : ''}`}
    >
      {isUpdating && (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-white/80 dark:bg-zinc-900/80">
          <div className="w-6 h-6 border-b-2 rounded-full animate-spin border-emerald-500"></div>
        </div>
      )}

      {/* Drag Handle - only show when filtering by category */}
      {selectedCategory && (
        <div
          draggable
          onDragStart={(e) => {
            e.stopPropagation();
            onDragStart();
          }}
          onDragOver={(e) => {
            e.stopPropagation();
            onDragOver(e);
          }}
          onDragLeave={(e) => {
            e.stopPropagation();
            onDragLeave();
          }}
          onDrop={(e) => {
            e.stopPropagation();
            onDrop(e);
          }}
          onClick={(e) => e.stopPropagation()}
          className="p-2 cursor-move text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
        >
          <GripVertical className="w-4 h-4" />
        </div>
      )}

      <div className="flex-1 px-3 py-2">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-medium truncate text-zinc-900 dark:text-zinc-100">
                {item.name}
              </h3>

              {/* Price Display Logic */}
              {item.pricing_type === 'fixed' || !item.pricing_type ? (
                <span className="ml-2 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(item.price)}
                </span>
              ) : item.pricing_type === 'consistent_size' &&
                item.menu_item_sizes &&
                item.menu_item_sizes.length > 0 ? (
                <div className="flex flex-wrap items-center gap-1 ml-2">
                  {item.menu_item_sizes.map((mis, i) => (
                    <span
                      key={mis.id || i}
                      className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                        i % 3 === 0
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300'
                          : i % 3 === 1
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300'
                          : 'bg-sky-100 text-sky-700 dark:bg-sky-900/20 dark:text-sky-300'
                      }`}
                    >
                      {mis.size?.name}:{' '}
                      {formatCurrency(mis.price_override || 0)}
                    </span>
                  ))}
                </div>
              ) : item.pricing_type === 'custom_size' &&
                item.custom_sizes &&
                item.custom_sizes.length > 0 ? (
                <div className="flex flex-wrap items-center gap-1 ml-2">
                  {item.custom_sizes.map((cs, i) => (
                    <span
                      key={cs.name + i}
                      className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                        i % 2 === 0
                          ? 'bg-pink-100 text-pink-700 dark:bg-pink-900/20 dark:text-pink-300'
                          : 'bg-violet-100 text-violet-700 dark:bg-violet-900/20 dark:text-violet-300'
                      }`}
                    >
                      {cs.name}: {formatCurrency(cs.price)}
                    </span>
                  ))}
                </div>
              ) : (
                <span className="ml-2 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(item.price)}
                </span>
              )}
            </div>

            {item.description && (
              <p className="mt-1 text-xs truncate text-zinc-500 dark:text-zinc-400">
                {item.description}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-2 mt-2 text-xs">
              <span className="px-2 py-0.5 font-medium text-blue-700 bg-blue-100 rounded-full dark:bg-blue-900/20 dark:text-blue-300">
                {categories.find((c) => c.id === item.category_id)?.name ||
                  'Unknown'}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                Order: {item.display_order}
              </span>

              {/* Tags */}
              {item.tags && item.tags.length > 0 && (
                <div className="relative z-0 flex flex-wrap gap-1 mt-0">
                  {item.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 text-xs text-purple-700 bg-purple-100 rounded-full dark:bg-purple-900/20 dark:text-purple-300"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Active indicator */}
              <div className="relative z-10 flex items-center gap-1 ml-2">
                <div
                  className={`w-2 h-2 rounded-full ${
                    item.is_active ? 'bg-green-500' : 'bg-red-500'
                  }`}
                />
                <span className="text-xs text-zinc-500 dark:text-zinc-400">
                  {item.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div
            className="flex items-center gap-2 ml-4"
            onClick={(e) => e.stopPropagation()}
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onToggleStatus(!item.is_active)}
              disabled={isUpdating}
            >
              {item.is_active ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(item)}
              disabled={isUpdating}
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onDelete}
              disabled={isUpdating}
              className="text-white rounded bg-rose-600 hover:bg-rose-700"
            >
              <Trash2 className="w-4 h-4 text-white" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
