-- Fix menu_items delete policies
-- This script will clean up conflicting policies and ensure admin delete works

-- First, drop the conflicting policies
DROP POLICY IF EXISTS "Allow delete access to menu_items" ON menu_items;
DROP POLICY IF EXISTS "admin_write_menu_items" ON menu_items;

-- Keep only the admin-specific delete policy that checks admin_accounts table
-- Make sure it's correctly configured
DROP POLICY IF EXISTS "menu_items_admin_delete_policy" ON menu_items;

-- Create a single, clear admin delete policy
CREATE POLICY "menu_items_admin_delete_policy" 
ON menu_items 
FOR DELETE 
TO authenticated
USING (
  auth.uid() IS NOT NULL 
  AND (
    auth.jwt() ->> 'email'
  ) IN (
    SELECT email 
    FROM admin_accounts 
    WHERE is_active = true
  )
);

-- Verify the policy is working by checking if we can see menu items
-- (This is just for testing - remove in production)
CREATE OR REPLACE FUNCTION debug_admin_check(user_email text)
RETURNS TABLE(
  user_email_param text,
  admin_found boolean,
  admin_email text,
  admin_active boolean
) 
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    user_email as user_email_param,
    EXISTS(SELECT 1 FROM admin_accounts WHERE email = user_email AND is_active = true) as admin_found,
    a.email as admin_email,
    a.is_active as admin_active
  FROM admin_accounts a 
  WHERE a.email = user_email
  LIMIT 1;
$$;
