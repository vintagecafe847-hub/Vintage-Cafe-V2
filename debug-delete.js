// Debug script to test menu item deletion
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testDelete() {
  try {
    // First, get current user
    const { data: user, error: userError } = await supabase.auth.getUser();
    if (userError) {
      console.error('Error getting user:', userError);
      return;
    }

    console.log('Current user:', user?.user?.email);
    console.log('User role:', user?.user?.role);

    // Test query to see what we can access
    const { data: menuItems, error: selectError } = await supabase
      .from('menu_items')
      .select('id, name')
      .limit(1);

    if (selectError) {
      console.error('Error selecting menu items:', selectError);
    } else {
      console.log('Can read menu items:', menuItems?.length > 0);
    }

    // Check admin account status
    if (user?.user?.email) {
      const { data: adminCheck, error: adminError } = await supabase
        .from('admin_accounts')
        .select('email, is_active')
        .eq('email', user.user.email.toLowerCase())
        .eq('is_active', true)
        .single();

      if (adminError) {
        console.error('Admin check error:', adminError);
      } else {
        console.log('Admin account found:', adminCheck);
      }
    }
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testDelete();
