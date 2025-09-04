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

  // Publish dialog state
  const [showPublishDialog, setShowPublishDialog] = useState(false);

  // Dark mode effect
  useEffect(() => {
    setDarkMode(isDarkMode);
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkModeState(newMode);
    setDarkMode(newMode);
  };

  const handlePublishChanges = () => {
    setShowPublishDialog(true);
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
      <div className="relative min-h-screen overflow-hidden bg-[#FEF7F3]">
        {/* Top decorative curves - matching the main website */}
        <img
          src="/vro3.svg"
          alt="Decorative curves"
          className="absolute top-0 left-0 z-30 w-full pointer-events-none"
        />

        {/* Decorative elements scattered around the page */}
        <div className="absolute top-20 left-10 z-10 opacity-60 rotate-12">
          <img
            src="/icons/coffee-beans.svg"
            alt="Coffee beans decoration"
            className="w-16 h-16"
          />
        </div>
        <div className="absolute top-40 right-16 z-10 opacity-50 -rotate-45">
          <img
            src="/icons/flower.svg"
            alt="Flower decoration"
            className="w-20 h-20"
          />
        </div>
        <div className="absolute bottom-32 left-20 z-10 opacity-40 rotate-[25deg]">
          <img
            src="/icons/green-leafs.svg"
            alt="Green leaves decoration"
            className="w-24 h-24"
          />
        </div>
        <div className="absolute bottom-20 right-12 z-10 opacity-50">
          <img
            src="/icons/pink-flower2.svg"
            alt="Pink flower decoration"
            className="w-18 h-18"
          />
        </div>

        {/* Main content container */}
        <div className="relative z-20 flex items-center justify-center min-h-screen px-4 py-16">
          <div className="w-full max-w-lg mx-auto">
            
            {/* Main login card */}
            <div className="relative bg-white rounded-3xl shadow-2xl border border-[#D8A24A]/20 overflow-hidden">
              
              {/* Header section with logo and title */}
              <div className="relative px-8 py-12 text-center bg-white">
                {/* Logo */}
                <div className="flex justify-center mb-6">
                  <img
                    src="/dark-logo.png"
                    alt="Vintage Cafe"
                    className="object-contain w-32 h-32"
                  />
                </div>
                
                {/* Title */}
                <h1 
                  className="mb-4 text-4xl font-bold"
                  style={{ 
                    color: '#3B2A20',
                    fontFamily: 'Prata, serif'
                  }}
                >
                  Admin Portal
                </h1>
                
                {/* Golden divider line - matching main website */}
                <div className="w-24 h-1 mx-auto mb-6 bg-[#D8A24A]"></div>
                
                {/* Subtitle */}
                <p className="max-w-md mx-auto text-lg leading-relaxed text-[#3B2A20]/70">
                  Welcome back! Sign in with your authorized Google account to manage your cafe.
                </p>
              </div>

              {/* Authentication section */}
              <div className="px-8 py-8 bg-[#FAFAFA] border-t border-[#D8A24A]/10">
                
                {/* Security badge */}
                <div className="flex items-center justify-center mb-6">
                  <div 
                    className="inline-flex items-center px-6 py-3 text-sm font-medium rounded-full border-2"
                    style={{
                      backgroundColor: '#FEF7F3',
                      borderColor: '#D8A24A',
                      color: '#3B2A20'
                    }}
                  >
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Secure Google Authentication
                  </div>
                </div>

                {/* Google Auth Component */}
                <div className="w-full mx-auto">
                  <Auth
                    supabaseClient={supabase}
                    appearance={{
                      theme: ThemeSupa,
                      style: {
                        button: {
                          borderRadius: '16px',
                          fontSize: '16px',
                          fontWeight: '600',
                          padding: '16px 24px',
                          backgroundColor: '#D8A24A',
                          border: 'none',
                          color: 'white',
                          fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                          transition: 'all 0.3s ease',
                        },
                        container: {
                          fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                        },
                      },
                      variables: {
                        default: {
                          colors: {
                            brand: '#D8A24A',
                            brandAccent: '#B8861D',
                            brandButtonText: 'white',
                            defaultButtonBackground: '#D8A24A',
                            defaultButtonBackgroundHover: '#B8861D',
                            inputBackground: '#ffffff',
                            inputBorder: '#D8A24A',
                            inputBorderHover: '#B8861D',
                            inputBorderFocus: '#D8A24A',
                          },
                        },
                      },
                    }}
                    providers={['google']}
                    onlyThirdPartyProviders={true}
                    redirectTo={redirectToUrl}
                    socialLayout="horizontal"
                  />
                </div>

                {/* Security notice */}
                <div className="mt-8 text-center">
                  <div className="text-sm text-[#3B2A20]/60">
                    <p className="mb-2 flex items-center justify-center">
                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Protected by enterprise-grade security
                    </p>
                    <p>Only authorized Google accounts have access</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer branding */}
            <div className="mt-12 text-center">
              <p className="text-lg font-medium" style={{ color: '#3B2A20' }}>
                ☕ Powered by{' '}
                <span className="font-bold" style={{ color: '#D8A24A' }}>
                  Vintage Cafe
                </span>
              </p>
              <p className="mt-2 text-sm text-[#3B2A20]/60">
                Management System
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Access denied screen (user is logged in but not authorized)
  if (user && !isAuthorized) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-[#FEF7F3]">
        {/* Top decorative curves */}
        <img
          src="/vro3.svg"
          alt="Decorative curves"
          className="absolute top-0 left-0 z-30 w-full pointer-events-none"
        />

        {/* Decorative elements */}
        <div className="absolute top-32 right-16 z-10 opacity-40 rotate-12">
          <img
            src="/icons/coffee-sketch.svg"
            alt="Coffee cup decoration"
            className="w-24 h-24"
          />
        </div>
        <div className="absolute bottom-40 left-12 z-10 opacity-50 -rotate-12">
          <img
            src="/icons/flower2.svg"
            alt="Flower decoration"
            className="w-20 h-20"
          />
        </div>

        {/* Main content */}
        <div className="relative z-20 flex items-center justify-center min-h-screen px-4 py-16">
          <div className="w-full max-w-lg mx-auto">
            
            {/* Access denied card */}
            <div className="relative bg-white rounded-3xl shadow-2xl border border-red-200 overflow-hidden">
              
              {/* Header */}
              <div className="px-8 py-12 text-center bg-white">
                {/* Logo */}
                <div className="flex justify-center mb-6">
                  <img
                    src="/dark-logo.png"
                    alt="Vintage Cafe"
                    className="object-contain w-24 h-24"
                  />
                </div>
                
                {/* Title */}
                <h1 
                  className="mb-4 text-3xl font-bold text-red-600"
                  style={{ fontFamily: 'Prata, serif' }}
                >
                  Access Denied
                </h1>
                
                {/* Red divider line */}
                <div className="w-16 h-1 mx-auto mb-6 bg-red-500"></div>
                
                {/* Message */}
                <p className="max-w-md mx-auto text-lg leading-relaxed text-[#3B2A20]/70">
                  Sorry, you don't have permission to access the admin panel. 
                  Please contact the cafe owner if you believe this is an error.
                </p>
              </div>

              {/* Action section */}
              <div className="px-8 py-8 bg-red-50 border-t border-red-100">
                <div className="text-center">
                  <p className="mb-6 text-sm text-[#3B2A20]/60">
                    Signed in as: <span className="font-medium">{user.email}</span>
                  </p>
                  
                  <Button
                    onClick={signOut}
                    className="px-8 py-3 text-white bg-red-600 rounded-full hover:bg-red-700 transition-colors duration-300 font-medium"
                  >
                    Sign Out & Try Different Account
                  </Button>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-12 text-center">
              <p className="text-lg font-medium" style={{ color: '#3B2A20' }}>
                ☕ Powered by{' '}
                <span className="font-bold" style={{ color: '#D8A24A' }}>
                  Vintage Cafe
                </span>
              </p>
            </div>
          </div>
        </div>
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
        onPublishChanges={handlePublishChanges}
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

      {/* Publish Changes Dialog */}
      <Dialog open={showPublishDialog} onOpenChange={setShowPublishDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Publish Changes</DialogTitle>
          </DialogHeader>
          <div className="text-center py-4">
            <p className="text-gray-600 dark:text-gray-400">
              Changes will be live in 2-3 minutes
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPage;
