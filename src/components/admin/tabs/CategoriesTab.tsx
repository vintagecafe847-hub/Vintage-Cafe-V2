import { useState } from 'react';
import { Button } from '../../ui/button';
import {
  Plus,
  Coffee,
  ChevronLeft,
  ChevronRight,
  Edit,
  Trash2,
  Eye,
  EyeOff,
} from 'lucide-react';
import type { Category } from '../../../types/admin';

interface CategoriesTabProps {
  categories: Category[];
  dataLoading: boolean;
  updatingCategories: Set<string>;
  onAddCategory: () => void;
  onEditCategory: (category: Category) => void;
  onToggleStatus: (id: string, isActive: boolean) => void;
  onDeleteCategory: (id: string) => void;
  onDeleteCategoryImage: (category: Category) => void;
  onUpdateCategoryImage: (file: File, category: Category) => void;
  confirmingDeleteCategory: string | null;
  setConfirmingDeleteCategory: (id: string | null) => void;
  confirmingDeleteImageCategory: string | null;
  setConfirmingDeleteImageCategory: (id: string | null) => void;
  onCategoryDragStart: (category: Category) => void;
  onCategoryDragOver: (e: React.DragEvent, index: number) => void;
  onCategoryDragLeave: () => void;
  onCategoryDrop: (e: React.DragEvent, targetIndex: number) => void;
  categoryDragOverIndex: number | null;
}

export const CategoriesTab = ({
  categories,
  dataLoading,
  updatingCategories,
  onAddCategory,
  onEditCategory,
  onToggleStatus,
  onDeleteCategory,
  onDeleteCategoryImage,
  onUpdateCategoryImage,
  confirmingDeleteCategory,
  setConfirmingDeleteCategory,
  confirmingDeleteImageCategory,
  setConfirmingDeleteImageCategory,
  onCategoryDragStart,
  onCategoryDragOver,
  onCategoryDragLeave,
  onCategoryDrop,
  categoryDragOverIndex,
}: CategoriesTabProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const triggerCategoryImageSelect = (
    categoryId: string,
    e?: React.MouseEvent
  ) => {
    e?.stopPropagation();
    const el = document.getElementById(
      `cat-image-input-${categoryId}`
    ) as HTMLInputElement | null;
    if (el) el.click();
  };

  const handleCategoryImageChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    category: Category
  ) => {
    e.stopPropagation();
    const file = e.target.files?.[0];
    if (!file) return;
    onUpdateCategoryImage(file, category);

    // Clear the input value
    const el = document.getElementById(
      `cat-image-input-${category.id}`
    ) as HTMLInputElement | null;
    if (el) el.value = '';
  };

  if (dataLoading) {
    return (
      <div className="py-12 text-center">
        <div className="w-12 h-12 mx-auto border-b-2 rounded-full animate-spin border-emerald-500"></div>
        <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-400">
          Loading categories...
        </p>
      </div>
    );
  }

  const total = categories.length;
  const totalPages = Math.max(1, Math.ceil(total / itemsPerPage));
  const page = Math.min(Math.max(1, currentPage), totalPages);
  const start = (page - 1) * itemsPerPage;
  const paginated = categories.slice(start, start + itemsPerPage);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            Categories ({categories.length})
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Manage your menu categories
          </p>
        </div>
        <Button
          onClick={onAddCategory}
          className="bg-emerald-600 hover:bg-emerald-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Category
        </Button>
      </div>

      {/* Categories Grid */}
      {categories.length === 0 ? (
        <div className="py-12 text-center">
          <Coffee className="w-12 h-12 mx-auto mb-4 text-zinc-400 dark:text-zinc-600" />
          <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">
            No categories yet
          </h3>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            Get started by creating your first category.
          </p>
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {paginated.map((category, idx) => {
              const index = start + idx;
              const isUpdating = updatingCategories.has(category.id);

              return (
                <div
                  key={category.id}
                  draggable
                  onDragStart={() => onCategoryDragStart(category)}
                  onDragOver={(e) => onCategoryDragOver(e, index)}
                  onDragLeave={onCategoryDragLeave}
                  onDrop={(e) => onCategoryDrop(e, index)}
                  className={`relative p-4 bg-white rounded-lg border transition-all duration-200 cursor-move dark:bg-zinc-900 ${
                    categoryDragOverIndex === index
                      ? 'border-emerald-300 bg-emerald-50 dark:border-emerald-700 dark:bg-emerald-950/20'
                      : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600'
                  } ${isUpdating ? 'blur-sm' : ''}`}
                >
                  {isUpdating && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-white/80 dark:bg-zinc-900/80">
                      <div className="w-6 h-6 border-b-2 rounded-full animate-spin border-emerald-500"></div>
                    </div>
                  )}

                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-medium text-zinc-900 dark:text-zinc-100">
                        {category.name}
                      </h3>
                      {category.description && (
                        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                          {category.description}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 ml-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEditCategory(category)}
                        disabled={isUpdating}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>

                      {confirmingDeleteCategory === category.id ? (
                        <div className="flex items-center gap-1">
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteCategory(category.id);
                            }}
                          >
                            Delete
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              setConfirmingDeleteCategory(null);
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setConfirmingDeleteCategory(category.id);
                          }}
                          disabled={isUpdating}
                          className="text-white rounded bg-rose-600 hover:bg-rose-700"
                        >
                          <Trash2 className="w-4 h-4 text-white" />
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Category Image */}
                  <div className="mt-3">
                    <div className="relative w-full h-40 overflow-hidden border rounded border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900">
                      {category.image_url ? (
                        <img
                          src={category.image_url}
                          alt={category.name}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <div className="flex items-center justify-center w-full h-full text-zinc-400">
                          <span className="text-sm">No image</span>
                        </div>
                      )}

                      {/* Overlay icons */}
                      <div className="absolute flex gap-2 top-2 right-2">
                        <input
                          id={`cat-image-input-${category.id}`}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) =>
                            handleCategoryImageChange(e, category)
                          }
                          onClick={(e) => e.stopPropagation()}
                        />

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            triggerCategoryImageSelect(category.id, e);
                          }}
                          title="Update image"
                          className="p-2 transition-transform rounded shadow bg-white/90 dark:bg-zinc-800/80 hover:scale-105"
                        >
                          <Edit className="w-4 h-4 text-zinc-700 dark:text-zinc-100" />
                        </button>

                        {confirmingDeleteImageCategory === category.id ? (
                          <div className="flex items-center gap-1">
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteCategoryImage(category);
                              }}
                            >
                              Delete
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                setConfirmingDeleteImageCategory(null);
                              }}
                            >
                              Cancel
                            </Button>
                          </div>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setConfirmingDeleteImageCategory(category.id);
                            }}
                            title="Delete image"
                            className="p-2 transition-transform rounded shadow bg-white/90 dark:bg-zinc-800/80 hover:scale-105"
                          >
                            <Trash2 className="w-4 h-4 text-rose-600" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                          Order: {category.display_order}
                        </span>
                        <div className="flex items-center gap-1">
                          <div
                            className={`w-2 h-2 rounded-full ${
                              category.is_active ? 'bg-green-500' : 'bg-red-500'
                            }`}
                          />
                          <span className="text-xs text-zinc-500 dark:text-zinc-400">
                            {category.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          onToggleStatus(category.id, !category.is_active)
                        }
                        disabled={isUpdating}
                      >
                        {category.is_active ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
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
        </>
      )}
    </div>
  );
};
