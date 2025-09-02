import { Button } from '../../ui/button';
import { Plus, Sparkles } from 'lucide-react';
import { SizeCard } from '../cards/SizeCard';
import type { Size } from '../../../types/admin';

interface SizesTabProps {
  sizes: Size[];
  dataLoading: boolean;
  updatingSizes: Set<string>;
  onEditSize: (size: Size) => void;
  onDeleteSize: (id: string, name: string) => void;
  onToggleItemStatus: (id: string, isActive: boolean, type: 'size') => void;
  onCreateNew: () => void;
}

export const SizesTab = ({
  sizes,
  dataLoading,
  updatingSizes,
  onEditSize,
  onDeleteSize,
  onToggleItemStatus,
  onCreateNew,
}: SizesTabProps) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            Sizes ({sizes.length})
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Manage available sizes and price adjustments
          </p>
        </div>
        <Button
          onClick={onCreateNew}
          className="bg-emerald-600 hover:bg-emerald-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Size
        </Button>
      </div>

      {/* Loading State */}
      {dataLoading ? (
        <div className="py-12 text-center">
          <div className="w-12 h-12 mx-auto border-b-2 rounded-full animate-spin border-emerald-500"></div>
          <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-400">
            Loading sizes...
          </p>
        </div>
      ) : (
        <>
          {/* Sizes Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {sizes.map((size) => (
              <SizeCard
                key={size.id}
                size={size}
                isUpdating={updatingSizes.has(size.id)}
                onEdit={onEditSize}
                onDelete={(name) => onDeleteSize(size.id, name)}
                onToggleStatus={(isActive) =>
                  onToggleItemStatus(size.id, isActive, 'size')
                }
              />
            ))}
          </div>

          {/* Empty State */}
          {sizes.length === 0 && (
            <div className="py-12 text-center">
              <Sparkles className="w-12 h-12 mx-auto mb-4 text-zinc-400 dark:text-zinc-600" />
              <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">
                No sizes yet
              </h3>
              <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                Create sizes like Small, Medium, Large with price adjustments.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};
