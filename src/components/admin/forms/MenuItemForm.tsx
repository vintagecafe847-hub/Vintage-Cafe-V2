import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import { Plus, X } from '@/lib/icons';
import type { MenuItem, Category, Size, Attribute } from '../../../types/admin';

const menuItemSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  price: z.preprocess((val) => {
    if (typeof val === 'string') return parseFloat(val.replace(',', '.'));
    return val;
  }, z.number().min(0, 'Price must be positive')),
  category_id: z.string().min(1, 'Category is required'),
  tags: z.array(z.string()).optional(),
  pricing_type: z.enum(['fixed', 'consistent_size', 'custom_size']),
  selected_sizes: z
    .array(
      z.object({
        size_id: z.string(),
        price: z.preprocess((val) => {
          if (typeof val === 'string') return parseFloat(val.replace(',', '.'));
          return val;
        }, z.number()),
      })
    )
    .optional(),
  custom_sizes: z
    .array(
      z.object({
        name: z.string(),
        price: z.preprocess((val) => {
          if (typeof val === 'string') return parseFloat(val.replace(',', '.'));
          return val;
        }, z.number()),
      })
    )
    .optional(),
});

type MenuItemForm = z.infer<typeof menuItemSchema>;

interface MenuItemFormProps {
  editingItem: MenuItem | null;
  categories: Category[];
  sizes: Size[];
  attributes: Attribute[];
  isLoading: boolean;
  onSubmit: (
    data: MenuItemForm,
    pricingType: string,
    selectedSizes: any[],
    customSizes: any[]
  ) => void;
  onCancel: () => void;
}

export const MenuItemFormComponent = ({
  editingItem,
  categories,
  sizes,
  attributes,
  isLoading,
  onSubmit,
  onCancel,
}: MenuItemFormProps) => {
  const [pricingType, setPricingType] = useState<
    'fixed' | 'consistent_size' | 'custom_size'
  >(editingItem?.pricing_type || 'fixed');
  const [selectedSizes, setSelectedSizes] = useState<
    Array<{ size_id: string; price: number }>
  >(
    editingItem?.pricing_type === 'consistent_size' &&
      editingItem.menu_item_sizes
      ? editingItem.menu_item_sizes.map((mis) => ({
          size_id: mis.size_id,
          price: mis.price_override || 0,
        }))
      : []
  );
  const [customSizes, setCustomSizes] = useState<
    Array<{ name: string; price: number }>
  >(
    editingItem?.pricing_type === 'custom_size' && editingItem.custom_sizes
      ? editingItem.custom_sizes
      : []
  );

  const form = useForm<MenuItemForm>({
    resolver: zodResolver(menuItemSchema),
    defaultValues: {
      name: editingItem?.name || '',
      description: editingItem?.description || '',
      price: editingItem?.price || 0,
      category_id: editingItem?.category_id || '',
      tags: editingItem?.tags || [],
      pricing_type: editingItem?.pricing_type || 'fixed',
    },
  });

  const handleSubmit = (data: MenuItemForm) => {
    onSubmit(data, pricingType, selectedSizes, customSizes);
  };

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          {...form.register('name')}
          placeholder="Menu item name"
        />
        {form.formState.errors.name && (
          <p className="text-sm text-red-500">
            {form.formState.errors.name.message}
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          {...form.register('description')}
          placeholder="Menu item description (optional)"
        />
      </div>

      <div>
        <Label htmlFor="category_id">Category</Label>
        <select
          id="category_id"
          {...form.register('category_id')}
          className="w-full px-3 py-2 bg-white border rounded-md border-zinc-200 dark:border-zinc-700 dark:bg-zinc-900"
        >
          <option value="">Select a category</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        {form.formState.errors.category_id && (
          <p className="text-sm text-red-500">
            {form.formState.errors.category_id.message}
          </p>
        )}
      </div>

      {/* Pricing Type Selector */}
      <div>
        <Label>Pricing Type</Label>
        <div className="flex items-center gap-2 mt-2">
          <button
            type="button"
            onClick={() => setPricingType('fixed')}
            className={`px-3 py-2 text-sm font-medium rounded-full transition-colors border ${
              pricingType === 'fixed'
                ? 'bg-emerald-600 text-white border-emerald-600'
                : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200 border-zinc-200 dark:border-zinc-700'
            }`}
            aria-pressed={pricingType === 'fixed'}
          >
            Fixed Price
          </button>

          <button
            type="button"
            onClick={() => setPricingType('consistent_size')}
            className={`px-3 py-2 text-sm font-medium rounded-full transition-colors border ${
              pricingType === 'consistent_size'
                ? 'bg-emerald-600 text-white border-emerald-600'
                : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200 border-zinc-200 dark:border-zinc-700'
            }`}
            aria-pressed={pricingType === 'consistent_size'}
          >
            Consistent Sizes
          </button>

          <button
            type="button"
            onClick={() => setPricingType('custom_size')}
            className={`px-3 py-2 text-sm font-medium rounded-full transition-colors border ${
              pricingType === 'custom_size'
                ? 'bg-emerald-600 text-white border-emerald-600'
                : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200 border-zinc-200 dark:border-zinc-700'
            }`}
            aria-pressed={pricingType === 'custom_size'}
          >
            Custom Sizes
          </button>
        </div>
      </div>

      {/* Fixed Price */}
      {pricingType === 'fixed' && (
        <div>
          <Label htmlFor="price">Price</Label>
          <Input
            id="price"
            type="text"
            inputMode="decimal"
            pattern="[0-9]*[.,]?[0-9]*"
            step="0.01"
            {...form.register('price')}
            placeholder="0.00"
          />
          {form.formState.errors.price && (
            <p className="text-sm text-red-500">
              {form.formState.errors.price.message}
            </p>
          )}
        </div>
      )}

      {/* Consistent Size Pricing */}
      {pricingType === 'consistent_size' && (
        <div>
          <Label>Select Sizes and Prices</Label>
          <div className="space-y-2">
            {sizes
              .filter((s) => s.is_active)
              .map((size) => {
                const selected = selectedSizes.find(
                  (s) => s.size_id === size.id
                );
                return (
                  <div key={size.id} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={!!selected}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedSizes((prev) => [
                            ...prev,
                            { size_id: size.id, price: 0 },
                          ]);
                        } else {
                          setSelectedSizes((prev) =>
                            prev.filter((s) => s.size_id !== size.id)
                          );
                        }
                      }}
                      className="accent-emerald-600 focus:ring-emerald-500"
                    />

                    <Input
                      value={size.name}
                      readOnly
                      className="flex-1 hover:cursor-text"
                      aria-label={`${size.name} size`}
                    />

                    <Input
                      type="text"
                      inputMode="decimal"
                      pattern="[0-9]*[.,]?[0-9]*"
                      step="0.01"
                      placeholder="Price"
                      className="w-20"
                      value={selected ? selected.price || '' : ''}
                      onChange={(e) => {
                        const raw = e.target.value;
                        const price = parseFloat(raw) || 0;
                        setSelectedSizes((prev) =>
                          prev.map((s) =>
                            s.size_id === size.id ? { ...s, price } : s
                          )
                        );
                      }}
                      onBlur={(e) => {
                        const price = parseFloat(e.target.value) || 0;
                        setSelectedSizes((prev) =>
                          prev.map((s) =>
                            s.size_id === size.id
                              ? { ...s, price: Number(price.toFixed(2)) }
                              : s
                          )
                        );
                      }}
                      disabled={!selected}
                    />

                    {selected && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedSizes((prev) =>
                            prev.filter((item) => item.size_id !== size.id)
                          );
                        }}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Custom Size Pricing */}
      {pricingType === 'custom_size' && (
        <div>
          <Label>Custom Sizes</Label>
          <div className="space-y-2">
            {customSizes.map((customSize, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  placeholder="Size name"
                  value={customSize.name}
                  onChange={(e) => {
                    setCustomSizes((prev) =>
                      prev.map((s, i) =>
                        i === index ? { ...s, name: e.target.value } : s
                      )
                    );
                  }}
                  className="flex-1"
                />
                <Input
                  type="text"
                  inputMode="decimal"
                  pattern="[0-9]*[.,]?[0-9]*"
                  step="0.01"
                  placeholder="Price"
                  value={customSize.price || ''}
                  onChange={(e) => {
                    const raw = e.target.value;
                    const price = parseFloat(raw) || 0;
                    setCustomSizes((prev) =>
                      prev.map((s, i) => (i === index ? { ...s, price } : s))
                    );
                  }}
                  onBlur={(e) => {
                    const price = parseFloat(e.target.value) || 0;
                    setCustomSizes((prev) =>
                      prev.map((s, i) =>
                        i === index
                          ? { ...s, price: Number(price.toFixed(2)) }
                          : s
                      )
                    );
                  }}
                  className="w-20"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setCustomSizes((prev) =>
                      prev.filter((_, i) => i !== index)
                    );
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setCustomSizes((prev) => [...prev, { name: '', price: 0 }]);
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Custom Size
            </Button>
          </div>
        </div>
      )}

      {/* Tags */}
      <div>
        <Label>Tags</Label>
        <Controller
          control={form.control}
          name="tags"
          render={({ field }) => (
            <div className="flex flex-wrap gap-2 p-2 border rounded-md border-zinc-200 dark:border-zinc-700">
              {attributes.map((attr) => (
                <button
                  key={attr.id}
                  type="button"
                  onClick={() => {
                    const currentTags = field.value || [];
                    const newTags = currentTags.includes(attr.name)
                      ? currentTags.filter((t) => t !== attr.name)
                      : [...currentTags, attr.name];
                    field.onChange(newTags);
                  }}
                  className={`
                    px-2 py-1 text-xs rounded-full transition-colors
                    ${
                      (field.value || []).includes(attr.name)
                        ? 'bg-emerald-600 text-white'
                        : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200'
                    }
                  `}
                >
                  {attr.name}
                </button>
              ))}
            </div>
          )}
        />
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <div className="flex items-center gap-2">
              <span className="inline-block w-4 h-4 border-2 border-transparent rounded-full border-t-white animate-spin" />
              <span>Saving...</span>
            </div>
          ) : editingItem ? (
            'Update'
          ) : (
            'Create'
          )}
        </Button>
      </div>
    </form>
  );
};
