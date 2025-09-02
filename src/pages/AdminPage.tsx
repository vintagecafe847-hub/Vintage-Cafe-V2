import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '../lib/supabase';

// Layout Components
import { AdminLayout } from '../components/admin/layout/AdminLayout';

// Tab Components
import { CategoriesTab } from '../components/admin/tabs/CategoriesTab';
import { MenuItemsTab } from '../components/admin/tabs/MenuItemsTab';
import { SizesTab } from '../components/admin/tabs/SizesTab';
import { AttributesTab } from '../components/admin/tabs/AttributesTab';
import { AccountsTab } from '../components/admin/tabs/AccountsTab';

// Form Components
import { CategoryFormComponent } from '../components/admin/forms/CategoryForm';
import { MenuItemFormComponent } from '../components/admin/forms/MenuItemForm';
import { SizeFormComponent } from '../components/admin/forms/SizeForm';
import { AttributeFormComponent } from '../components/admin/forms/AttributeForm';
import { AccountFormComponent } from '../components/admin/forms/AccountForm';

// UI Components
import { DeleteConfirmDialog } from '../components/admin/ui/DeleteConfirmDialog';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import { Button } from '../components/ui/button';

// Hooks
import { useAdminAuth } from '../hooks/admin/useAdminAuth';
import { useAdminData } from '../hooks/admin/useAdminData';
import { useDragAndDrop } from '../hooks/admin/useDragAndDrop';
import { useImageUpload } from '../hooks/admin/useImageUpload';

// Utils
import { isDarkModeEnabled, setDarkMode } from '../utils/admin';

// Types
import type {
  Category,
  MenuItem,
  Size,
  Attribute,
  AdminAccount,
  DeleteDialogState,
  MenuItemFormState,
} from '../types/admin';

const AdminPage = () => {
  const navigate = useNavigate();

  // Auth and data
  const { user, loading: authLoading, isAuthorized, signOut } = useAdminAuth();
  const {
    categories,
    menuItems,
    sizes,
    attributes,
    accounts,
    dataLoading,
    refetchData,
  } = useAdminData(isAuthorized);

  // Image upload
  const {
    uploading: imageUploading,
    updateCategoryImage,
    deleteCategoryImage,
  } = useImageUpload();

  // Drag and drop
  const dragHandlers = useDragAndDrop(menuItems, categories, refetchData);

  // UI State
  const [activeTab, setActiveTab] = useState('categories');
  const [isDarkMode, setIsDarkModeState] = useState(() => isDarkModeEnabled());
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<
    Category | MenuItem | Size | Attribute | AdminAccount | null
  >(null);

  // Loading states
  const [updatingCategories, setUpdatingCategories] = useState<Set<string>>(
    new Set()
  );
  const [updatingMenuItems, setUpdatingMenuItems] = useState<Set<string>>(
    new Set()
  );
  const [updatingSizes, setUpdatingSizes] = useState<Set<string>>(new Set());
  const [updatingAttributes, setUpdatingAttributes] = useState<Set<string>>(
    new Set()
  );
  const [updatingAccounts, setUpdatingAccounts] = useState<Set<string>>(
    new Set()
  );

  // Form loading states
  const [categoryFormLoading, setCategoryFormLoading] = useState(false);
  const [menuItemFormLoading, setMenuItemFormLoading] = useState(false);
  const [sizeFormLoading, setSizeFormLoading] = useState(false);
  const [attributeFormLoading, setAttributeFormLoading] = useState(false);
  const [accountFormLoading, setAccountFormLoading] = useState(false);

  // Delete dialog state
  const [deleteDialog, setDeleteDialog] = useState<DeleteDialogState>({
    isOpen: false,
    target: null,
    loading: false,
  });

  // Menu item form state
  const [menuItemFormState, setMenuItemFormState] = useState<MenuItemFormState>(
    {
      pricingType: 'fixed',
      selectedSizes: [],
      customSizes: [],
      saving: false,
    }
  );

  // Category image confirmation states
  const [confirmingDeleteImageCategory, setConfirmingDeleteImageCategory] =
    useState<string | null>(null);
  const [confirmingDeleteCategory, setConfirmingDeleteCategory] = useState<
    string | null
  >(null);

  // Dark mode effect
  useEffect(() => {
    setDarkMode(isDarkMode);
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkModeState(newMode);
    setDarkMode(newMode);
  };

  // CRUD Operations
  const handleCreateCategory = async (data: any) => {
    setCategoryFormLoading(true);
    try {
      // Get next display order
      const { data: maxOrderData } = await supabase
        .from('categories')
        .select('display_order')
        .order('display_order', { ascending: false })
        .limit(1);

      const nextOrder =
        maxOrderData && maxOrderData.length > 0
          ? maxOrderData[0].display_order + 1
          : 1;

      const { error } = await supabase.from('categories').insert([
        {
          ...data,
          image_url: null,
          is_active: true,
          display_order: nextOrder,
        },
      ]);

      if (error) throw error;

      await refetchData();
      setIsDialogOpen(false);
      setEditingItem(null);
    } catch (error) {
      console.error('Error creating category:', error);
    } finally {
      setCategoryFormLoading(false);
    }
  };

  const handleUpdateCategory = async (data: any) => {
    if (!editingItem || !('image_url' in editingItem)) return;

    setCategoryFormLoading(true);
    try {
      const { error } = await supabase
        .from('categories')
        .update(data)
        .eq('id', editingItem.id);

      if (error) throw error;

      await refetchData();
      setIsDialogOpen(false);
      setEditingItem(null);
    } catch (error) {
      console.error('Error updating category:', error);
    } finally {
      setCategoryFormLoading(false);
    }
  };

  const handleCategorySubmit = async (data: any) => {
    if (editingItem && 'image_url' in editingItem) {
      await handleUpdateCategory(data);
    } else {
      await handleCreateCategory(data);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      setUpdatingCategories((prev) => new Set(prev).add(id));

      const { error } = await supabase.from('categories').delete().eq('id', id);
      if (error) throw error;

      await refetchData();
    } catch (error) {
      console.error('Error deleting category:', error);
    } finally {
      setUpdatingCategories((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      setConfirmingDeleteCategory(null);
    }
  };

  const handleCategoryImageUpdate = async (categoryId: string, file: File) => {
    const category = categories.find((c) => c.id === categoryId);
    if (!category) return;

    try {
      setUpdatingCategories((prev) => new Set(prev).add(categoryId));
      await updateCategoryImage(
        categoryId,
        file,
        category.image_url || undefined
      );
      await refetchData();
    } catch (error) {
      console.error('Error updating category image:', error);
    } finally {
      setUpdatingCategories((prev) => {
        const next = new Set(prev);
        next.delete(categoryId);
        return next;
      });
    }
  };

  const handleCategoryImageDelete = async (categoryId: string) => {
    const category = categories.find((c) => c.id === categoryId);
    if (!category?.image_url) return;

    try {
      setUpdatingCategories((prev) => new Set(prev).add(categoryId));
      await deleteCategoryImage(categoryId, category.image_url);
      await refetchData();
    } catch (error) {
      console.error('Error deleting category image:', error);
    } finally {
      setUpdatingCategories((prev) => {
        const next = new Set(prev);
        next.delete(categoryId);
        return next;
      });
      setConfirmingDeleteImageCategory(null);
    }
  };

  // Account CRUD Operations
  const handleAccountSubmit = async (data: {
    email: string;
    display_name: string;
  }) => {
    setAccountFormLoading(true);
    try {
      if (editingItem && 'email' in editingItem) {
        // Update existing account
        const { error } = await supabase
          .from('admin_accounts')
          .update({ display_name: data.display_name })
          .eq('id', editingItem.id);

        if (error) throw error;
      } else {
        // Create new account
        const { error } = await supabase.from('admin_accounts').insert([
          {
            email: data.email.toLowerCase(),
            display_name: data.display_name,
            is_active: true,
          },
        ]);

        if (error) throw error;
      }

      await refetchData();
      setIsDialogOpen(false);
      setEditingItem(null);
    } catch (error) {
      console.error('Error saving account:', error);
      // You might want to show a toast error here
    } finally {
      setAccountFormLoading(false);
    }
  };

  const handleDeleteAccount = (id: string, email: string) => {
    setDeleteDialog({
      isOpen: true,
      target: { id, name: email, type: 'account' },
      loading: false,
    });
  };

  const handleEditAccount = (account: AdminAccount) => {
    setEditingItem(account);
    setIsDialogOpen(true);
  };

  const handleCreateNewAccount = () => {
    setEditingItem(null);
    setIsDialogOpen(true);
  };

  // Menu Item CRUD
  const handleMenuItemSubmit = async (
    data: any,
    pricingType: string,
    selectedSizes: any[],
    customSizes: any[]
  ) => {
    setMenuItemFormLoading(true);
    try {
      const formattedData = {
        name: data.name,
        description: data.description,
        category_id: data.category_id,
        tags: data.tags || null,
        pricing_type: pricingType,
        custom_sizes: pricingType === 'custom_size' ? customSizes : null,
        price:
          pricingType === 'fixed'
            ? data.price
            : pricingType === 'consistent_size' && selectedSizes.length > 0
            ? Math.min(...selectedSizes.map((s) => s.price))
            : pricingType === 'custom_size' && customSizes.length > 0
            ? Math.min(...customSizes.map((s) => s.price))
            : data.price,
      };

      let menuItemId: string;

      if (editingItem && 'category_id' in editingItem) {
        // Update
        const { error } = await supabase
          .from('menu_items')
          .update(formattedData)
          .eq('id', editingItem.id);
        if (error) throw error;

        menuItemId = editingItem.id;

        if (pricingType !== 'consistent_size') {
          await supabase
            .from('menu_item_sizes')
            .delete()
            .eq('menu_item_id', menuItemId);
        }
      } else {
        // Create
        const { data: maxOrderData } = await supabase
          .from('menu_items')
          .select('display_order')
          .eq('category_id', data.category_id)
          .order('display_order', { ascending: false })
          .limit(1);

        const nextOrder =
          maxOrderData && maxOrderData.length > 0
            ? maxOrderData[0].display_order + 1
            : 1;

        const { data: insertData, error } = await supabase
          .from('menu_items')
          .insert([
            { ...formattedData, is_active: true, display_order: nextOrder },
          ])
          .select('id')
          .single();

        if (error) throw error;
        menuItemId = insertData.id;
      }

      // Handle consistent sizes
      if (pricingType === 'consistent_size' && selectedSizes.length > 0) {
        await supabase
          .from('menu_item_sizes')
          .delete()
          .eq('menu_item_id', menuItemId);

        const menuItemSizes = selectedSizes.map((size) => ({
          menu_item_id: menuItemId,
          size_id: size.size_id,
          price_override: size.price,
          is_active: true,
        }));

        const { error: sizesError } = await supabase
          .from('menu_item_sizes')
          .insert(menuItemSizes);
        if (sizesError) throw sizesError;
      }

      await refetchData();
      setIsDialogOpen(false);
      setEditingItem(null);
      setMenuItemFormState({
        pricingType: 'fixed',
        selectedSizes: [],
        customSizes: [],
        saving: false,
      });
    } catch (error) {
      console.error('Error saving menu item:', error);
    } finally {
      setMenuItemFormLoading(false);
    }
  };

  const handleDeleteMenuItem = (id: string, name?: string) => {
    // Open the in-app delete confirmation dialog for menu items
    setDeleteDialog({
      isOpen: true,
      target: { id, name, type: 'menu_item' },
      loading: false,
    });
  };

  // Size CRUD
  const handleSizeSubmit = async (data: any) => {
    setSizeFormLoading(true);
    try {
      if (editingItem && 'price_adjustment' in editingItem) {
        // Update
        const { error } = await supabase
          .from('sizes')
          .update(data)
          .eq('id', editingItem.id);
        if (error) throw error;
      } else {
        // Create
        const { data: maxOrderData } = await supabase
          .from('sizes')
          .select('display_order')
          .order('display_order', { ascending: false })
          .limit(1);

        const nextOrder =
          maxOrderData && maxOrderData.length > 0
            ? maxOrderData[0].display_order + 1
            : 1;

        const { error } = await supabase
          .from('sizes')
          .insert([{ ...data, is_active: true, display_order: nextOrder }]);
        if (error) throw error;
      }

      await refetchData();
      setIsDialogOpen(false);
      setEditingItem(null);
    } catch (error) {
      console.error('Error saving size:', error);
    } finally {
      setSizeFormLoading(false);
    }
  };

  // Attribute CRUD
  const handleAttributeSubmit = async (data: any) => {
    setAttributeFormLoading(true);
    try {
      if (editingItem && 'color' in editingItem) {
        // Update
        const { error } = await supabase
          .from('attributes')
          .update(data)
          .eq('id', editingItem.id);
        if (error) throw error;
      } else {
        // Create
        const { data: maxOrderData } = await supabase
          .from('attributes')
          .select('display_order')
          .order('display_order', { ascending: false })
          .limit(1);

        const nextOrder =
          maxOrderData && maxOrderData.length > 0
            ? maxOrderData[0].display_order + 1
            : 1;

        const { error } = await supabase
          .from('attributes')
          .insert([{ ...data, is_active: true, display_order: nextOrder }]);
        if (error) throw error;
      }

      await refetchData();
      setIsDialogOpen(false);
      setEditingItem(null);
    } catch (error) {
      console.error('Error saving attribute:', error);
    } finally {
      setAttributeFormLoading(false);
    }
  };

  // Generic delete function
  const handleDeleteConfirm = async () => {
    if (!deleteDialog.target) return;

    const { id, type } = deleteDialog.target;
    try {
      setDeleteDialog((prev) => ({ ...prev, loading: true }));
      const table =
        type === 'size'
          ? 'sizes'
          : type === 'attribute'
          ? 'attributes'
          : type === 'menu_item'
          ? 'menu_items'
          : type === 'category'
          ? 'categories'
          : type === 'account'
          ? 'admin_accounts'
          : null;

      if (!table) throw new Error('Unsupported delete type: ' + type);

      const { error } = await supabase.from(table).delete().eq('id', id);
      if (error) throw error;
      await refetchData();
    } catch (error) {
      console.error('Error deleting item:', error);
    } finally {
      setDeleteDialog({ isOpen: false, target: null, loading: false });
    }
  };

  // Toggle item status
  const handleToggleItemStatus = async (
    id: string,
    isActive: boolean,
    type: 'category' | 'menu_item' | 'size' | 'attribute' | 'account'
  ) => {
    const setters = {
      category: setUpdatingCategories,
      menu_item: setUpdatingMenuItems,
      size: setUpdatingSizes,
      attribute: setUpdatingAttributes,
      account: setUpdatingAccounts,
    };

    const setter = setters[type];
    setter((prev) => new Set(prev).add(id));

    try {
      const table = {
        category: 'categories',
        menu_item: 'menu_items',
        size: 'sizes',
        attribute: 'attributes',
        account: 'admin_accounts',
      }[type];

      const { error } = await supabase
        .from(table)
        .update({ is_active: isActive })
        .eq('id', id);
      if (error) throw error;
      await refetchData();
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setter((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  // Edit handlers
  const handleEditMenuItem = (item: MenuItem) => {
    setEditingItem(item);
    setMenuItemFormState({
      pricingType: item.pricing_type || 'fixed',
      selectedSizes:
        item.pricing_type === 'consistent_size' && item.menu_item_sizes
          ? item.menu_item_sizes.map((mis) => ({
              size_id: mis.size_id,
              price: mis.price_override || 0,
            }))
          : [],
      customSizes:
        item.pricing_type === 'custom_size' && item.custom_sizes
          ? item.custom_sizes
          : [],
      saving: false,
    });
    setIsDialogOpen(true);
  };

  const handleEditCategory = (category: Category) => {
    setEditingItem(category);
    setIsDialogOpen(true);
  };

  const handleEditSize = (size: Size) => {
    setEditingItem(size);
    setIsDialogOpen(true);
  };

  const handleEditAttribute = (attribute: Attribute) => {
    setEditingItem(attribute);
    setIsDialogOpen(true);
  };

  // Create new handlers
  const handleCreateNewCategory = () => {
    setEditingItem(null);
    setIsDialogOpen(true);
  };

  const handleCreateNewMenuItem = () => {
    setEditingItem(null);
    setMenuItemFormState({
      pricingType: 'fixed',
      selectedSizes: [],
      customSizes: [],
      saving: false,
    });
    setIsDialogOpen(true);
  };

  const handleCreateNewSize = () => {
    setEditingItem(null);
    setIsDialogOpen(true);
  };

  const handleCreateNewAttribute = () => {
    setEditingItem(null);
    setIsDialogOpen(true);
  };

  const handleDialogCancel = () => {
    setIsDialogOpen(false);
    setEditingItem(null);
    setMenuItemFormState({
      pricingType: 'fixed',
      selectedSizes: [],
      customSizes: [],
      saving: false,
    });
  };

  // Loading screen
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white dark:bg-zinc-950">
        <div className="w-32 h-32 border-b-2 rounded-full animate-spin border-emerald-500"></div>
      </div>
    );
  }

  // Login screen
  if (!user) {
    const redirectToUrl =
      typeof window !== 'undefined'
        ? `${window.location.origin}/admin`
        : '/admin';

    return (
      <div className="min-h-screen bg-white dark:bg-zinc-950">
        <div className="container px-4 py-16 mx-auto">
          <div className="max-w-md mx-auto">
            <Card className="p-6 bg-white border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800">
              <CardHeader className="pb-2">
                <div className="flex flex-col items-center">
                  <img
                    src="/white-logo.png"
                    alt="Shiplap Shop"
                    className="object-contain w-20 h-20 mb-3"
                  />
                  <CardTitle className="text-center text-zinc-900 dark:text-zinc-100">
                    Admin Login
                  </CardTitle>
                  <p className="max-w-xs mt-2 text-sm text-center text-zinc-600 dark:text-zinc-400">
                    Sign in with the Google account authorized for the admin
                    panel.
                  </p>
                </div>
              </CardHeader>
              <CardContent>
                <div className="w-full mx-auto">
                  <Auth
                    supabaseClient={supabase}
                    appearance={{ theme: ThemeSupa }}
                    providers={['google']}
                    redirectTo={redirectToUrl}
                  />
                  <p className="mt-4 text-xs text-center text-zinc-500 dark:text-zinc-400">
                    Only Google sign-in is allowed here.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Access denied screen (user is logged in but not authorized)
  if (user && !isAuthorized) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white dark:bg-zinc-950">
        <Card className="max-w-md mx-auto bg-white border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800">
          <CardHeader>
            <CardTitle className="text-red-600 dark:text-red-400">Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-zinc-700 dark:text-zinc-300">
              You don't have permission to access the admin panel.
            </p>
            <Button
              onClick={signOut}
              variant="outline"
              className="text-zinc-700 border-zinc-300 dark:border-zinc-600 dark:text-zinc-300"
            >
              Sign Out
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <AdminLayout
        user={user}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
        mobileSidebarOpen={mobileSidebarOpen}
        setMobileSidebarOpen={setMobileSidebarOpen}
        onSignOut={signOut}
      >
        {activeTab === 'categories' && (
          <CategoriesTab
            categories={categories}
            dataLoading={dataLoading}
            updatingCategories={updatingCategories}
            confirmingDeleteCategory={confirmingDeleteCategory}
            confirmingDeleteImageCategory={confirmingDeleteImageCategory}
            onEditCategory={handleEditCategory}
            onDeleteCategory={handleDeleteCategory}
            onToggleStatus={(id, isActive) =>
              handleToggleItemStatus(id, isActive, 'category')
            }
            onAddCategory={handleCreateNewCategory}
            onUpdateCategoryImage={(file, category) =>
              handleCategoryImageUpdate(category.id, file)
            }
            onDeleteCategoryImage={(category) =>
              handleCategoryImageDelete(category.id)
            }
            setConfirmingDeleteCategory={setConfirmingDeleteCategory}
            setConfirmingDeleteImageCategory={setConfirmingDeleteImageCategory}
            onCategoryDragStart={dragHandlers.handleCategoryDragStart}
            onCategoryDragOver={dragHandlers.handleCategoryDragOver}
            onCategoryDragLeave={dragHandlers.handleCategoryDragLeave}
            onCategoryDrop={dragHandlers.handleCategoryDrop}
            categoryDragOverIndex={dragHandlers.categoryDragOverIndex}
          />
        )}

        {activeTab === 'menu-items' && (
          <MenuItemsTab
            menuItems={menuItems}
            categories={categories}
            dataLoading={dataLoading}
            updatingMenuItems={updatingMenuItems}
            onEditMenuItem={handleEditMenuItem}
            onDeleteMenuItem={handleDeleteMenuItem}
            onToggleItemStatus={handleToggleItemStatus}
            onCreateNew={handleCreateNewMenuItem}
            onDragStart={dragHandlers.handleMenuItemDragStart}
            onDragOver={dragHandlers.handleMenuItemDragOver}
            onDragLeave={dragHandlers.handleMenuItemDragLeave}
            onDrop={(e, index) => dragHandlers.handleMenuItemDrop(e, index, '')}
            dragOverIndex={dragHandlers.dragOverIndex}
          />
        )}

        {activeTab === 'sizes' && (
          <SizesTab
            sizes={sizes}
            dataLoading={dataLoading}
            updatingSizes={updatingSizes}
            onEditSize={handleEditSize}
            onDeleteSize={(id, name) =>
              setDeleteDialog({
                isOpen: true,
                target: { id, name, type: 'size' },
                loading: false,
              })
            }
            onToggleItemStatus={handleToggleItemStatus}
            onCreateNew={handleCreateNewSize}
          />
        )}

        {activeTab === 'attributes' && (
          <AttributesTab
            attributes={attributes}
            dataLoading={dataLoading}
            updatingAttributes={updatingAttributes}
            onEditAttribute={handleEditAttribute}
            onDeleteAttribute={(id, name) =>
              setDeleteDialog({
                isOpen: true,
                target: { id, name, type: 'attribute' },
                loading: false,
              })
            }
            onToggleItemStatus={handleToggleItemStatus}
            onCreateNew={handleCreateNewAttribute}
          />
        )}
        {activeTab === 'accounts' && (
          <AccountsTab
            accounts={accounts}
            dataLoading={dataLoading}
            updatingAccounts={updatingAccounts}
            onEditAccount={handleEditAccount}
            onDeleteAccount={handleDeleteAccount}
            onToggleStatus={(id, isActive) =>
              handleToggleItemStatus(id, isActive, 'account')
            }
            onCreateNew={handleCreateNewAccount}
          />
        )}
      </AdminLayout>

      {/* Form Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle>
              {editingItem
                ? `Edit ${
                    activeTab === 'categories'
                      ? 'Category'
                      : activeTab === 'menu-items'
                      ? 'Menu Item'
                      : activeTab === 'sizes'
                      ? 'Size'
                      : activeTab === 'attributes'
                      ? 'Attribute'
                      : activeTab === 'accounts'
                      ? 'Account'
                      : 'Item'
                  }`
                : `Add New ${
                    activeTab === 'categories'
                      ? 'Category'
                      : activeTab === 'menu-items'
                      ? 'Menu Item'
                      : activeTab === 'sizes'
                      ? 'Size'
                      : activeTab === 'attributes'
                      ? 'Attribute'
                      : activeTab === 'accounts'
                      ? 'Account'
                      : 'Item'
                  }`}
            </DialogTitle>
          </DialogHeader>

          {activeTab === 'categories' && (
            <CategoryFormComponent
              editingItem={editingItem as Category | null}
              isLoading={categoryFormLoading}
              onSubmit={handleCategorySubmit}
              onCancel={handleDialogCancel}
            />
          )}

          {activeTab === 'menu-items' && (
            <MenuItemFormComponent
              editingItem={editingItem as MenuItem | null}
              categories={categories}
              sizes={sizes}
              attributes={attributes}
              isLoading={menuItemFormLoading}
              onSubmit={handleMenuItemSubmit}
              onCancel={handleDialogCancel}
            />
          )}

          {activeTab === 'sizes' && (
            <SizeFormComponent
              editingItem={editingItem as Size | null}
              isLoading={sizeFormLoading}
              onSubmit={handleSizeSubmit}
              onCancel={handleDialogCancel}
            />
          )}

          {activeTab === 'attributes' && (
            <AttributeFormComponent
              editingItem={editingItem as Attribute | null}
              isLoading={attributeFormLoading}
              onSubmit={handleAttributeSubmit}
              onCancel={handleDialogCancel}
            />
          )}

          {activeTab === 'accounts' && (
            <AccountFormComponent
              editingItem={editingItem as AdminAccount | null}
              isLoading={accountFormLoading}
              onSubmit={handleAccountSubmit}
              onCancel={handleDialogCancel}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        isOpen={deleteDialog.isOpen}
        onOpenChange={(open) =>
          setDeleteDialog((prev) => ({ ...prev, isOpen: open }))
        }
        itemName={deleteDialog.target?.name}
        itemType={deleteDialog.target?.type || 'size'}
        isLoading={deleteDialog.loading}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
};

export default AdminPage;
