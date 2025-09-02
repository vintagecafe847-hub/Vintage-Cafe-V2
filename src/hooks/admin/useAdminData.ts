import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import type {
  Category,
  MenuItem,
  Size,
  Attribute,
  AdminDataState,
  AdminAccount,
} from '../../types/admin';

export const useAdminData = (
  isAuthorized: boolean
): AdminDataState & {
  refetchData: () => Promise<void>;
} => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [sizes, setSizes] = useState<Size[]>([]);
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [accounts, setAccounts] = useState<AdminAccount[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  // Fetch admin accounts
  const fetchAccounts = useCallback(async () => {
    const { data, error } = await supabase
      .from('admin_accounts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching accounts:', error);
      return [] as AdminAccount[];
    }

    return (data as AdminAccount[]) || [];
  }, []);

  const fetchData = useCallback(async () => {
    if (!isAuthorized) {
      setCategories([]);
      setMenuItems([]);
      setSizes([]);
      setAttributes([]);
      setAccounts([]);
      setDataLoading(false);
      return;
    }

    setDataLoading(true);
    try {
      // Fetch categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .order('display_order', { ascending: true });
      if (categoriesError) throw categoriesError;

      // Fetch menu items with categories
      const { data: menuItemsData, error: menuItemsError } = await supabase
        .from('menu_items')
        .select(
          `
          *,
          category:categories(*),
          menu_item_sizes(*, size:sizes(*))
        `
        )
        .order('display_order', { ascending: true });
      if (menuItemsError) throw menuItemsError;

      // Fetch sizes
      const { data: sizesData, error: sizesError } = await supabase
        .from('sizes')
        .select('*')
        .order('display_order', { ascending: true });
      if (sizesError) throw sizesError;

      // Fetch attributes
      const { data: attributesData, error: attributesError } = await supabase
        .from('attributes')
        .select('*')
        .order('display_order', { ascending: true });
      if (attributesError) throw attributesError;

      setCategories(categoriesData || []);
      setMenuItems(menuItemsData || []);
      setSizes(sizesData || []);
      setAttributes(attributesData || []);
      // fetch accounts and set
      const accountsData = await fetchAccounts();
      setAccounts(accountsData || []);
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setDataLoading(false);
    }
  }, [isAuthorized, fetchAccounts]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    categories,
    menuItems,
    sizes,
    attributes,
    accounts,
    dataLoading,
    refetchData: fetchData,
  };
};
