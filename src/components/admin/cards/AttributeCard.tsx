import { Button } from '../../ui/button';
import { Edit, Trash2 } from 'lucide-react';
import type { Attribute } from '../../../types/admin';

interface AttributeCardProps {
  attribute: Attribute;
  isUpdating: boolean;
  onEdit: (attribute: Attribute) => void;
  onDelete: (name: string) => void;
  onToggleStatus: (isActive: boolean) => void;
}

export const AttributeCard = ({
  attribute,
  isUpdating,
  onEdit,
  onDelete,
  onToggleStatus,
}: AttributeCardProps) => {
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
          <div className="flex items-center gap-2 mb-1">
            {attribute.color && (
              <div
                className="w-3 h-3 border rounded-full border-zinc-300 dark:border-zinc-600"
                style={{ backgroundColor: attribute.color }}
              />
            )}
            <h3 className="font-medium text-zinc-900 dark:text-zinc-100">
              {attribute.name}
            </h3>
          </div>
          {attribute.description && (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              {attribute.description}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 ml-2">
          <Button variant="ghost" size="sm" onClick={() => onEdit(attribute)}>
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(attribute.name);
            }}
            className="text-white rounded bg-rose-600 hover:bg-rose-700"
          >
            <Trash2 className="w-4 h-4 text-white" />
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
            Order: {attribute.display_order}
          </span>
          <div className="flex items-center gap-1">
            <div
              className={`w-2 h-2 rounded-full ${
                attribute.is_active ? 'bg-green-500' : 'bg-red-500'
              }`}
            />
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              {attribute.is_active ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
