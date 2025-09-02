// Base types from your existing supabase types
export interface Category {
  id: string;
  name: string;
  description?: string;
  image_url?: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface Size {
  id: string;
  name: string;
  description?: string;
  price_adjustment: number;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface Attribute {
  id: string;
  name: string;
  description?: string;
  color?: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface MenuItemSize {
  id: string;
  menu_item_id: string;
  size_id: string;
  price_override?: number;
  is_active: boolean;
  size: Size;
}

export interface CustomSize {
  name: string;
  price: number;
}

export interface MenuItemAttribute {
  id: string;
  menu_item_id: string;
  attribute_id: string;
  is_active: boolean;
  attribute: Attribute;
}

export interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  category_id: string;
  tags?: string[];
  pricing_type?: 'fixed' | 'consistent_size' | 'custom_size';
  custom_sizes?: CustomSize[];
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
  category?: Category;
  menu_item_sizes?: MenuItemSize[];
  menu_item_attributes?: MenuItemAttribute[];
}

// Admin-specific types
export interface AdminAuthState {
  user: any | null;
  loading: boolean;
  isAuthorized: boolean;
}
// AdminDataState and AdminUIState are defined later with account support

export interface DragState {
  draggedItem: MenuItem | null;
  dragOverIndex: number | null;
  draggedCategory: Category | null;
  categoryDragOverIndex: number | null;
}

export interface MenuItemFormState {
  pricingType: 'fixed' | 'consistent_size' | 'custom_size';
  selectedSizes: Array<{ size_id: string; price: number }>;
  customSizes: Array<{ name: string; price: number }>;
  saving: boolean;
}

// Add these types to your existing types/admin.ts file

export interface AdminAccount {
  id: string;
  email: string;
  display_name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AccountFormData {
  email: string;
  display_name: string;
}

// Update your AdminDataState interface to include accounts
export interface AdminDataState {
  categories: Category[];
  menuItems: MenuItem[];
  sizes: Size[];
  attributes: Attribute[];
  accounts: AdminAccount[]; // Add this line
  dataLoading: boolean;
}

// Update your AdminUIState interface to include account loading
export interface AdminUIState {
  activeTab: string;
  isDarkMode: boolean;
  mobileSidebarOpen: boolean;
  isDialogOpen: boolean;
  editingItem: Category | MenuItem | Size | Attribute | AdminAccount | null; // Add AdminAccount here
  updatingCategories: Set<string>;
  updatingMenuItems: Set<string>;
  updatingSizes: Set<string>;
  updatingAttributes: Set<string>;
  updatingAccounts: Set<string>; // Add this line
  currentPage: number;
}

// Update your DeleteDialogState interface
export interface DeleteDialogState {
  isOpen: boolean;
  target: {
    id: string;
    name?: string;
    type: 'size' | 'attribute' | 'menu_item' | 'category' | 'account'; // Add 'account'
  } | null;
  loading: boolean;
}
