import { Button } from '../../ui/button';
import { useState } from 'react';
import { Plus, Heart } from '@/lib/icons';
import { AttributeCard } from '../cards/AttributeCard';
import type { Attribute } from '../../../types/admin';

interface AttributesTabProps {
  attributes: Attribute[];
  dataLoading: boolean;
  updatingAttributes: Set<string>;
  onEditAttribute: (attribute: Attribute) => void;
  onDeleteAttribute: (id: string, name: string) => void;
  onToggleItemStatus: (
    id: string,
    isActive: boolean,
    type: 'attribute'
  ) => void;
  onCreateNew: () => void;
}

export const AttributesTab = ({
  attributes,
  dataLoading,
  updatingAttributes,
  onEditAttribute,
  onDeleteAttribute,
  onToggleItemStatus,
  onCreateNew,
}: AttributesTabProps) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            Attributes ({attributes.length})
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Manage item attributes like Hot, Iced, Vegan, etc.
          </p>
        </div>
        <Button
          onClick={onCreateNew}
          className="bg-emerald-600 hover:bg-emerald-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Attribute
        </Button>
      </div>

      {/* Loading State */}
      {dataLoading ? (
        <div className="py-12 text-center">
          <div className="w-12 h-12 mx-auto border-b-2 rounded-full animate-spin border-emerald-500"></div>
          <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-400">
            Loading attributes...
          </p>
        </div>
      ) : (
        <>
          {/* Attributes Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {attributes.map((attribute) => (
              <AttributeCard
                key={attribute.id}
                attribute={attribute}
                isUpdating={updatingAttributes.has(attribute.id)}
                onEdit={onEditAttribute}
                onDelete={(name) => onDeleteAttribute(attribute.id, name)}
                onToggleStatus={(isActive) =>
                  onToggleItemStatus(attribute.id, isActive, 'attribute')
                }
              />
            ))}
          </div>

          {/* Empty State */}
          {attributes.length === 0 && (
            <div className="py-12 text-center">
              <Heart className="w-12 h-12 mx-auto mb-4 text-zinc-400 dark:text-zinc-600" />
              <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">
                No attributes yet
              </h3>
              <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                Create attributes to add extra details to your menu items.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};
