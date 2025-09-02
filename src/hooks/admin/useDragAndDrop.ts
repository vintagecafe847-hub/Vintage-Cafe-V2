import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import type { MenuItem, Category, DragState } from '../../types/admin';

export const useDragAndDrop = (
  menuItems: MenuItem[],
  categories: Category[],
  refetchData: () => Promise<void>
) => {
  const [draggedItem, setDraggedItem] = useState<MenuItem | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [draggedCategory, setDraggedCategory] = useState<Category | null>(null);
  const [categoryDragOverIndex, setCategoryDragOverIndex] = useState<
    number | null
  >(null);

  // Menu Item Drag Handlers
  const handleMenuItemDragStart = (item: MenuItem) => {
    setDraggedItem(item);
  };

  const handleMenuItemDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleMenuItemDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleMenuItemDrop = async (
    e: React.DragEvent,
    targetIndex: number,
    selectedCategory: string
  ) => {
    e.preventDefault();
    setDragOverIndex(null);

    if (!draggedItem) return;

    const filteredItems = menuItems.filter(
      (item) => !selectedCategory || item.category_id === selectedCategory
    );
    const draggedIndex = filteredItems.findIndex(
      (item) => item.id === draggedItem.id
    );

    if (draggedIndex === targetIndex) return;

    try {
      // Reorder items
      const reorderedItems = [...filteredItems];
      const [removed] = reorderedItems.splice(draggedIndex, 1);
      reorderedItems.splice(targetIndex, 0, removed);

      // Update display_order for all affected items
      const updates = reorderedItems.map((item, index) => ({
        id: item.id,
        display_order: index + 1,
      }));

      for (const update of updates) {
        await supabase
          .from('menu_items')
          .update({ display_order: update.display_order })
          .eq('id', update.id);
      }

      await refetchData();
    } catch (error) {
      console.error('Error reordering menu items:', error);
    }

    setDraggedItem(null);
  };

  // Category Drag Handlers
  const handleCategoryDragStart = (category: Category) => {
    setDraggedCategory(category);
  };

  const handleCategoryDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setCategoryDragOverIndex(index);
  };

  const handleCategoryDragLeave = () => {
    setCategoryDragOverIndex(null);
  };

  const handleCategoryDrop = async (
    e: React.DragEvent,
    targetIndex: number
  ) => {
    e.preventDefault();
    setCategoryDragOverIndex(null);

    if (!draggedCategory) return;

    const draggedIndex = categories.findIndex(
      (cat) => cat.id === draggedCategory.id
    );

    if (draggedIndex === targetIndex) return;

    try {
      // Reorder categories
      const reorderedCategories = [...categories];
      const [removed] = reorderedCategories.splice(draggedIndex, 1);
      reorderedCategories.splice(targetIndex, 0, removed);

      // Update display_order for all categories
      const updates = reorderedCategories.map((category, index) => ({
        id: category.id,
        display_order: index + 1,
      }));

      for (const update of updates) {
        await supabase
          .from('categories')
          .update({ display_order: update.display_order })
          .eq('id', update.id);
      }

      await refetchData();
    } catch (error) {
      console.error('Error reordering categories:', error);
    }

    setDraggedCategory(null);
  };

  return {
    // State
    draggedItem,
    dragOverIndex,
    draggedCategory,
    categoryDragOverIndex,

    // Menu Item Handlers
    handleMenuItemDragStart,
    handleMenuItemDragOver,
    handleMenuItemDragLeave,
    handleMenuItemDrop,

    // Category Handlers
    handleCategoryDragStart,
    handleCategoryDragOver,
    handleCategoryDragLeave,
    handleCategoryDrop,
  };
};
