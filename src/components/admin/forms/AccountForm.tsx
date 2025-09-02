import { useState, useEffect } from 'react';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Loader2 } from 'lucide-react';
import type { AdminAccount, AccountFormData } from '../../../types/admin';

interface AccountFormProps {
  editingItem: AdminAccount | null;
  isLoading: boolean;
  onSubmit: (data: AccountFormData) => Promise<void>;
  onCancel: () => void;
}

export const AccountFormComponent = ({
  editingItem,
  isLoading,
  onSubmit,
  onCancel,
}: AccountFormProps) => {
  const [formData, setFormData] = useState<AccountFormData>({
    email: '',
    display_name: '',
  });

  const [errors, setErrors] = useState<Partial<AccountFormData>>({});

  // Populate form when editing
  useEffect(() => {
    if (editingItem) {
      setFormData({
        email: editingItem.email,
        display_name: editingItem.display_name,
      });
    } else {
      setFormData({
        email: '',
        display_name: '',
      });
    }
    setErrors({});
  }, [editingItem]);

  const validateForm = (): boolean => {
    const newErrors: Partial<AccountFormData> = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.display_name.trim()) {
      newErrors.display_name = 'Display name is required';
    } else if (formData.display_name.trim().length < 2) {
      newErrors.display_name = 'Display name must be at least 2 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      await onSubmit({
        email: formData.email.trim().toLowerCase(),
        display_name: formData.display_name.trim(),
      });
    } catch (error) {
      console.error('Error submitting account form:', error);
    }
  };

  const handleInputChange = (field: keyof AccountFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email" className="text-zinc-700 dark:text-zinc-300">
          Email Address *
        </Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => handleInputChange('email', e.target.value)}
          className={`${
            errors.email
              ? 'border-red-500 focus:border-red-500'
              : 'border-zinc-300 dark:border-zinc-600'
          }`}
          placeholder="admin@example.com"
          disabled={isLoading || !!editingItem} // Disable email editing for existing accounts
        />
        {errors.email && (
          <p className="text-sm text-red-600 dark:text-red-400">
            {errors.email}
          </p>
        )}
        {editingItem && (
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Email cannot be changed for existing accounts
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label
          htmlFor="display_name"
          className="text-zinc-700 dark:text-zinc-300"
        >
          Display Name *
        </Label>
        <Input
          id="display_name"
          value={formData.display_name}
          onChange={(e) => handleInputChange('display_name', e.target.value)}
          className={`${
            errors.display_name
              ? 'border-red-500 focus:border-red-500'
              : 'border-zinc-300 dark:border-zinc-600'
          }`}
          placeholder="Admin Name"
          disabled={isLoading}
        />
        {errors.display_name && (
          <p className="text-sm text-red-600 dark:text-red-400">
            {errors.display_name}
          </p>
        )}
      </div>

      {!editingItem && (
        <div className="p-3 border border-blue-200 rounded-lg bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            <strong>Note:</strong> The user will need to sign in with Google
            using this exact email address to gain admin access.
          </p>
        </div>
      )}

      <div className="flex gap-3 pt-4">
        <Button
          type="submit"
          disabled={isLoading}
          className="flex-1 bg-emerald-600 hover:bg-emerald-700"
        >
          {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {editingItem ? 'Update Account' : 'Create Account'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
          className="border-zinc-300 dark:border-zinc-600"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
};
