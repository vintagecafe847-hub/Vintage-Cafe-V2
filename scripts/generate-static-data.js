#!/usr/bin/env node

/**
 * Build-time script to generate static menu data
 * This runs during the build process to create static JSON files
 */

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Supabase configuration
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function generateStaticData() {
  try {
    console.log('🚀 Starting build-time static data generation...');

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
      `📊 Fetched: ${categories.length} categories, ${menuItems.length} menu items, ${sizes.length} sizes, ${attributes.length} attributes`
    );

    const staticData = {
      categories,
      menuItems,
      sizes,
      attributes,
      lastUpdated: new Date().toISOString(),
      version: process.env.VERCEL_GIT_COMMIT_SHA || `build-${Date.now()}`,
      buildInfo: {
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        commit: process.env.VERCEL_GIT_COMMIT_SHA || 'local',
        branch: process.env.VERCEL_GIT_COMMIT_REF || 'local',
      },
    };

    // Ensure public directory exists
    const publicDir = join(__dirname, '..', '..', 'public');
    mkdirSync(publicDir, { recursive: true });

    // Write the static data file
    const outputPath = join(publicDir, 'static-menu-data.json');
    writeFileSync(outputPath, JSON.stringify(staticData, null, 2), 'utf8');

    console.log(`✅ Static data generated successfully!`);
    console.log(`📁 Output: ${outputPath}`);
    console.log(
      `📝 Size: ${(JSON.stringify(staticData).length / 1024).toFixed(2)} KB`
    );
    console.log(`🕒 Last updated: ${staticData.lastUpdated}`);

    return staticData;
  } catch (error) {
    console.error('❌ Error generating static data:', error);
    process.exit(1);
  }
}

// Run the script
generateStaticData();
