-- Comprehensive fix for menu_items delete policies
-- Run this in your Supabase SQL editor to fix the delete permission issue

-- 1. First, let's check the current policies
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  cmd as command,
  roles,
  qual as using_expr,
  with_check as check_expr
FROM pg_policies 
WHERE tablename = 'menu_items' 
AND cmd = 'DELETE'
ORDER BY policyname;

-- 2. Drop all existing DELETE policies for menu_items to start clean
DROP POLICY IF EXISTS "Allow delete access to menu_items" ON menu_items;
DROP POLICY IF EXISTS "menu_items_admin_delete_policy" ON menu_items;
DROP POLICY IF EXISTS "admin_write_menu_items" ON menu_items; -- This one is for ALL operations

-- 3. Create a single, clear admin delete policy that should work
CREATE POLICY "admin_can_delete_menu_items" 
ON menu_items 
FOR DELETE 
TO authenticated
USING (
  -- User must be authenticated
  auth.uid() IS NOT NULL 
  AND 
  -- User's email must be in the admin_accounts table and be active
  (auth.jwt() ->> 'email') IN (
    SELECT email 
    FROM admin_accounts 
    WHERE is_active = true
  )
);

-- 4. Also ensure we have proper policies for other operations
-- Update policy (if it doesn't exist)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'menu_items' 
    AND policyname = 'admin_can_update_menu_items'
  ) THEN
    CREATE POLICY "admin_can_update_menu_items" 
    ON menu_items 
    FOR UPDATE 
    TO authenticated
    USING (
      auth.uid() IS NOT NULL 
      AND (auth.jwt() ->> 'email') IN (
        SELECT email FROM admin_accounts WHERE is_active = true
      )
    );
  END IF;
END $$;

-- Insert policy (if it doesn't exist)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'menu_items' 
    AND policyname = 'admin_can_insert_menu_items'
  ) THEN
    CREATE POLICY "admin_can_insert_menu_items" 
    ON menu_items 
    FOR INSERT 
    TO authenticated
    WITH CHECK (
      auth.uid() IS NOT NULL 
      AND (auth.jwt() ->> 'email') IN (
        SELECT email FROM admin_accounts WHERE is_active = true
      )
    );
  END IF;
END $$;

-- 5. Check the final policies
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  cmd as command,
  roles,
  qual as using_expr,
  with_check as check_expr
FROM pg_policies 
WHERE tablename = 'menu_items' 
ORDER BY cmd, policyname;

-- 6. Test function to debug admin access (run this to test)
CREATE OR REPLACE FUNCTION test_admin_access(test_email text DEFAULT NULL)
RETURNS TABLE(
  current_user_id uuid,
  current_user_email text,
  test_email_param text,
  admin_exists boolean,
  admin_active boolean,
  can_access boolean
) 
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    auth.uid() as current_user_id,
    auth.jwt() ->> 'email' as current_user_email,
    COALESCE(test_email, auth.jwt() ->> 'email') as test_email_param,
    EXISTS(
      SELECT 1 FROM admin_accounts 
      WHERE email = COALESCE(test_email, auth.jwt() ->> 'email')
    ) as admin_exists,
    EXISTS(
      SELECT 1 FROM admin_accounts 
      WHERE email = COALESCE(test_email, auth.jwt() ->> 'email') 
      AND is_active = true
    ) as admin_active,
    (
      auth.uid() IS NOT NULL 
      AND (auth.jwt() ->> 'email') IN (
        SELECT email FROM admin_accounts WHERE is_active = true
      )
    ) as can_access;
$$;

-- Usage: SELECT * FROM test_admin_access(); 
-- Or: SELECT * FROM test_admin_access('your-email@gmail.com');
