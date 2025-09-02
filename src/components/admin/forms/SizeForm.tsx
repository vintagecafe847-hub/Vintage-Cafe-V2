import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import type { Size } from '../../../types/admin';

const sizeSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  price_adjustment: z.preprocess((val) => {
    if (typeof val === 'string') return parseFloat(val.replace(',', '.'));
    return val;
  }, z.number()),
});

type SizeForm = z.infer<typeof sizeSchema>;

interface SizeFormProps {
  editingItem: Size | null;
  isLoading: boolean;
  onSubmit: (data: SizeForm) => void;
  onCancel: () => void;
}

export const SizeFormComponent = ({
  editingItem,
  isLoading,
  onSubmit,
  onCancel,
}: SizeFormProps) => {
  const form = useForm<SizeForm>({
    resolver: zodResolver(sizeSchema),
    defaultValues: {
      name: editingItem?.name || '',
      description: editingItem?.description || '',
      price_adjustment: editingItem?.price_adjustment || 0,
    },
  });

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          {...form.register('name')}
          placeholder="Size name (e.g., Small, Medium, Large)"
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
          placeholder="Size description (optional)"
        />
      </div>

      <div>
        <Label htmlFor="price_adjustment">Price Adjustment</Label>
        <Input
          id="price_adjustment"
          type="text"
          inputMode="decimal"
          pattern="[0-9]*[.,]?[0-9]*"
          step="0.01"
          {...form.register('price_adjustment')}
          placeholder="0.00 (positive for upcharge, negative for discount)"
        />
        {form.formState.errors.price_adjustment && (
          <p className="text-sm text-red-500">
            {form.formState.errors.price_adjustment.message}
          </p>
        )}
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          type="submit"
          className="bg-emerald-600 hover:bg-emerald-700"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <svg
                className="w-4 h-4 mr-2 -ml-1 text-white animate-spin"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                />
              </svg>
              Saving...
            </>
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
