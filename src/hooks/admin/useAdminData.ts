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
    // SECURITY: Clear data immediately if not authorized
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
      // SECURITY: Double-check authorization before any database calls
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user?.email) {
        throw new Error('No authenticated user');
      }

      // Verify user is still in admin_accounts table
      const { data: adminCheck, error: adminError } = await supabase
        .from('admin_accounts')
        .select('is_active')
        .eq('email', user.email.toLowerCase())
        .eq('is_active', true)
        .single();

      if (adminError || !adminCheck) {
        throw new Error('User not authorized for admin access');
      }

      // Now safely fetch admin data
      const [
        { data: categoriesData, error: categoriesError },
        { data: menuItemsData, error: menuItemsError },
        { data: sizesData, error: sizesError },
        { data: attributesData, error: attributesError },
        accountsData,
      ] = await Promise.all([
        supabase
          .from('categories')
          .select('*')
          .order('display_order', { ascending: true }),
        supabase
          .from('menu_items')
          .select(
            `
            *,
            category:categories(*),
            menu_item_sizes(*, size:sizes(*))
          `
          )
          .order('display_order', { ascending: true }),
        supabase
          .from('sizes')
          .select('*')
          .order('display_order', { ascending: true }),
        supabase
          .from('attributes')
          .select('*')
          .order('display_order', { ascending: true }),
        fetchAccounts(),
      ]);

      if (categoriesError) throw categoriesError;
      if (menuItemsError) throw menuItemsError;
      if (sizesError) throw sizesError;
      if (attributesError) throw attributesError;

      setCategories(categoriesData || []);
      setMenuItems(menuItemsData || []);
      setSizes(sizesData || []);
      setAttributes(attributesData || []);
      setAccounts(accountsData || []);
    } catch (error) {
      console.error('Error fetching admin data:', error);
      // SECURITY: Clear all data on any error
      setCategories([]);
      setMenuItems([]);
      setSizes([]);
      setAttributes([]);
      setAccounts([]);
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
