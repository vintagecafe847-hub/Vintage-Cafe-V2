import { useState, useEffect } from 'react';
import type { StaticMenuData } from '../utils/staticDataExport';

interface UseStaticMenuDataReturn {
  data: StaticMenuData | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to load static menu data from the public JSON file
 */
export const useStaticMenuData = (): UseStaticMenuDataReturn => {
  const [data, setData] = useState<StaticMenuData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStaticData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Try to fetch from the static JSON file first
      try {
        const response = await fetch('/static-menu-data.json');
        if (response.ok) {
          const staticData = (await response.json()) as StaticMenuData;
          console.log('📁 Loaded static menu data:', {
            categories: staticData.categories.length,
            menuItems: staticData.menuItems.length,
            lastUpdated: staticData.lastUpdated,
            version: staticData.version,
          });
          setData(staticData);
          return;
        }
      } catch {
        console.warn('⚠️ Static file not found, checking localStorage...');
      }

      // Fallback to localStorage (for development)
      const localData = localStorage.getItem('static-menu-data');
      if (localData) {
        const parsedData = JSON.parse(localData) as StaticMenuData;
        console.log('💾 Loaded menu data from localStorage (development)');
        setData(parsedData);
        return;
      }

      // If no static data available, throw error
      throw new Error(
        'No static menu data available. Please publish changes from the admin panel.'
      );
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to load menu data';
      console.error('❌ Error loading static menu data:', errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const refetch = async () => {
    await fetchStaticData();
  };

  useEffect(() => {
    fetchStaticData();
  }, []);

  return {
    data,
    loading,
    error,
    refetch,
  };
};

/**
 * Check if static data is available and fresh
 */
export const useStaticDataStatus = () => {
  const [isStale, setIsStale] = useState(false);
  const [lastPublished, setLastPublished] = useState<string | null>(null);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await fetch('/static-menu-data.json');
        if (response.ok) {
          const data = (await response.json()) as StaticMenuData;
          setLastPublished(data.lastUpdated);

          // Check if data is older than 24 hours (considered stale)
          const lastUpdate = new Date(data.lastUpdated);
          const now = new Date();
          const hoursDiff =
            (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60);
          setIsStale(hoursDiff > 24);
        }
      } catch (error) {
        console.warn('Could not check static data status:', error);
      }
    };

    checkStatus();
  }, []);

  return {
    isStale,
    lastPublished,
  };
};
