import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import type { Attribute } from '../../../types/admin';

const attributeSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  color: z.string().optional(),
});

type AttributeForm = z.infer<typeof attributeSchema>;

interface AttributeFormProps {
  editingItem: Attribute | null;
  isLoading: boolean;
  onSubmit: (data: AttributeForm) => void;
  onCancel: () => void;
}

export const AttributeFormComponent = ({
  editingItem,
  isLoading,
  onSubmit,
  onCancel,
}: AttributeFormProps) => {
  const form = useForm<AttributeForm>({
    resolver: zodResolver(attributeSchema),
    defaultValues: {
      name: editingItem?.name || '',
      description: editingItem?.description || '',
      color: editingItem?.color || '',
    },
  });

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          {...form.register('name')}
          placeholder="Attribute name (e.g., Hot, Iced, Vegan)"
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
          placeholder="Attribute description (optional)"
        />
      </div>

      <div>
        <Label htmlFor="color">Color (optional)</Label>
        <Input
          id="color"
          type="color"
          {...form.register('color')}
          className="h-10"
        />
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
