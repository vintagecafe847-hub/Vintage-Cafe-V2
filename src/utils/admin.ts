// Helper utility functions for admin functionality

export const formatCurrency = (n: number | null | undefined): string => {
  if (n === null || n === undefined || Number.isNaN(Number(n))) {
    return '0.00$';
  }
  try {
    return `${Number(n).toFixed(2)}$`;
  } catch {
    return '0.00$';
  }
};

export const getTabTitle = (activeTab: string): string => {
  switch (activeTab) {
    case 'categories':
      return 'Categories Management';
    case 'menu-items':
      return 'Menu Items Management';
    case 'sizes':
      return 'Sizes Management';
    case 'attributes':
      return 'Attributes Management';
    default:
      return 'Admin Management';
  }
};

export const getTabDescription = (activeTab: string): string => {
  switch (activeTab) {
    case 'categories':
      return 'Organize your menu structure with categories';
    case 'menu-items':
      return 'Manage individual items and their details';
    case 'sizes':
      return 'Configure available sizes and pricing adjustments';
    case 'attributes':
      return 'Manage item attributes like Hot, Iced, Vegan, etc.';
    default:
      return 'Manage your restaurant content';
  }
};

export const calculatePagination = (
  totalItems: number,
  itemsPerPage: number,
  currentPage: number
) => {
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const page = Math.min(Math.max(1, currentPage), totalPages);
  const start = (page - 1) * itemsPerPage;
  const end = start + itemsPerPage;

  return {
    totalPages,
    currentPage: page,
    start,
    end,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
};

export const isDarkModeEnabled = (): boolean => {
  if (typeof window === 'undefined') return false;

  const stored = localStorage.getItem('admin-dark-mode');
  if (stored !== null) {
    return JSON.parse(stored);
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches;
};

export const setDarkMode = (enabled: boolean): void => {
  if (typeof window === 'undefined') return;

  localStorage.setItem('admin-dark-mode', JSON.stringify(enabled));

  if (enabled) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
};

export const extractImagePath = (imageUrl: string): string => {
  if (!imageUrl) return '';

  try {
    const url = new URL(imageUrl);
    const pathParts = url.pathname.split('/');
    return pathParts.slice(-2).join('/'); // Get folder/filename
  } catch {
    return '';
  }
};

export const generateFileName = (originalName: string): string => {
  const fileExt = originalName.split('.').pop();
  const randomId = Math.random().toString(36).substring(2);
  return `${randomId}.${fileExt}`;
};
