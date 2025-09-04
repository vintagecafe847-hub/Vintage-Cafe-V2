import { supabase } from '../lib/supabase';
import type { Category, MenuItem, Size, Attribute } from '../types/admin';

export interface StaticMenuData {
  categories: Category[];
  menuItems: MenuItem[];
  sizes: Size[];
  attributes: Attribute[];
  lastUpdated: string;
  version: string;
}

/**
 * Exports all menu data from Supabase to a static format
 */
export const exportMenuDataToStatic = async (): Promise<StaticMenuData> => {
  try {
    console.log('🔄 Starting static data export...');

    // Fetch all data in parallel
    const [
      categoriesResponse,
      menuItemsResponse,
      sizesResponse,
      attributesResponse,
    ] = await Promise.all([
      supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true }),

      supabase
        .from('menu_items')
        .select(
          `
          *,
          category:categories(id, name),
          menu_item_sizes(
            id,
            price_override,
            size:sizes(id, name)
          ),
          menu_item_attributes(
            id,
            attribute:attributes(id, name, description, color)
          )
        `
        )
        .eq('is_active', true)
        .order('display_order', { ascending: true }),

      supabase
        .from('sizes')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true }),

      supabase
        .from('attributes')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true }),
    ]);

    // Check for errors
    if (categoriesResponse.error) throw categoriesResponse.error;
    if (menuItemsResponse.error) throw menuItemsResponse.error;
    if (sizesResponse.error) throw sizesResponse.error;
    if (attributesResponse.error) throw attributesResponse.error;

    // Process the data
    const categories = categoriesResponse.data || [];
    const menuItems = menuItemsResponse.data || [];
    const sizes = sizesResponse.data || [];
    const attributes = attributesResponse.data || [];

    console.log(
      `📊 Exported: ${categories.length} categories, ${menuItems.length} menu items, ${sizes.length} sizes, ${attributes.length} attributes`
    );

    const staticData: StaticMenuData = {
      categories,
      menuItems,
      sizes,
      attributes,
      lastUpdated: new Date().toISOString(),
      version: `${Date.now()}`, // Simple versioning
    };

    return staticData;
  } catch (error) {
    console.error('❌ Error exporting static data:', error);
    throw new Error(`Failed to export menu data: ${error}`);
  }
};

/**
 * Saves static menu data to the public directory
 */
export const saveStaticDataToFile = async (
  data: StaticMenuData
): Promise<void> => {
  try {
    // In a real implementation, this would save to the file system
    // For now, we'll store it in localStorage for development
    const jsonData = JSON.stringify(data, null, 2);

    // Save to localStorage for development purposes
    localStorage.setItem('static-menu-data', jsonData);

    console.log('💾 Static data saved successfully');
    console.log(`📝 Data size: ${(jsonData.length / 1024).toFixed(2)} KB`);
  } catch (error) {
    console.error('❌ Error saving static data:', error);
    throw new Error(`Failed to save static data: ${error}`);
  }
};

/**
 * Main function to export and save static menu data
 */
export const generateStaticMenuData = async (): Promise<StaticMenuData> => {
  const data = await exportMenuDataToStatic();
  await saveStaticDataToFile(data);
  return data;
};

/**
 * Load static menu data (for development)
 */
export const loadStaticMenuData = (): StaticMenuData | null => {
  try {
    const stored = localStorage.getItem('static-menu-data');
    if (!stored) return null;

    return JSON.parse(stored) as StaticMenuData;
  } catch (error) {
    console.error('❌ Error loading static data:', error);
    return null;
  }
};
