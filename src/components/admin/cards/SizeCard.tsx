import { Button } from '../../ui/button';
import { Edit, Trash2 } from 'lucide-react';
import type { Size } from '../../../types/admin';

interface SizeCardProps {
  size: Size;
  isUpdating: boolean;
  onEdit: (size: Size) => void;
  onDelete: (name: string) => void;
  onToggleStatus: (isActive: boolean) => void;
}

export const SizeCard = ({
  size,
  isUpdating,
  onEdit,
  onDelete,
  onToggleStatus,
}: SizeCardProps) => {
  return (
    <div
      className={`relative p-4 bg-white border rounded-lg border-zinc-200 dark:bg-zinc-900 dark:border-zinc-700 ${
        isUpdating ? 'blur-sm' : ''
      }`}
    >
      {isUpdating && (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-white/80 dark:bg-zinc-900/80">
          <div className="w-6 h-6 border-b-2 rounded-full animate-spin border-emerald-500"></div>
        </div>
      )}

      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-medium text-zinc-900 dark:text-zinc-100">
            {size.name}
          </h3>
          {size.description && (
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              {size.description}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 ml-2">
          <Button variant="ghost" size="sm" onClick={() => onEdit(size)}>
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(size.name);
            }}
            className="text-white rounded bg-rose-600 hover:bg-rose-700"
          >
            <Trash2 className="w-4 h-4 text-white" />
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className={`text-sm font-medium px-2 py-1 rounded-full ${
              size.price_adjustment >= 0
                ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300'
                : 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300'
            }`}
          >
            {size.price_adjustment >= 0 ? '+' : ''}$
            {size.price_adjustment.toFixed(2)}
          </span>
          <div className="flex items-center gap-1">
            <div
              className={`w-2 h-2 rounded-full ${
                size.is_active ? 'bg-green-500' : 'bg-red-500'
              }`}
            />
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              {size.is_active ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
          Order: {size.display_order}
        </span>
      </div>
    </div>
  );
};
