-- URGENT SECURITY FIXES FOR YOUR SUPABASE DATABASE
-- Run these commands in your Supabase SQL Editor

-- 1. Create admin_accounts table for proper admin management
CREATE TABLE IF NOT EXISTS admin_accounts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    display_name TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Add update trigger for admin_accounts
CREATE TRIGGER admin_accounts_set_updated_at
    BEFORE UPDATE ON admin_accounts
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- 3. Insert your admin account (REPLACE WITH YOUR ACTUAL ADMIN EMAIL)
INSERT INTO admin_accounts (email, display_name, is_active) 
VALUES ('theshiplapshopcoffeehouse@gmail.com', 'Main Admin', true)
ON CONFLICT (email) DO NOTHING;

-- 4. Enable RLS on admin_accounts
ALTER TABLE admin_accounts ENABLE ROW LEVEL SECURITY;

-- 5. Create admin accounts policies
CREATE POLICY "Only authenticated admins can read admin accounts" ON admin_accounts
    FOR SELECT 
    TO authenticated 
    USING (
        EXISTS (
            SELECT 1 FROM admin_accounts 
            WHERE email = ((current_setting('request.jwt.claims', true))::jsonb ->> 'email')
            AND is_active = true
        )
    );

CREATE POLICY "Only authenticated admins can manage admin accounts" ON admin_accounts
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM admin_accounts 
            WHERE email = ((current_setting('request.jwt.claims', true))::jsonb ->> 'email')
            AND is_active = true
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM admin_accounts 
            WHERE email = ((current_setting('request.jwt.claims', true))::jsonb ->> 'email')
            AND is_active = true
        )
    );

-- 6. UPDATE ALL EXISTING RLS POLICIES TO USE admin_accounts TABLE
-- Categories
DROP POLICY IF EXISTS "admin_write_categories" ON categories;
CREATE POLICY "admin_write_categories" ON categories
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM admin_accounts 
            WHERE email = ((current_setting('request.jwt.claims', true))::jsonb ->> 'email')
            AND is_active = true
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM admin_accounts 
            WHERE email = ((current_setting('request.jwt.claims', true))::jsonb ->> 'email')
            AND is_active = true
        )
    );

-- Menu Items
DROP POLICY IF EXISTS "admin_write_menu_items" ON menu_items;
CREATE POLICY "admin_write_menu_items" ON menu_items
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM admin_accounts 
            WHERE email = ((current_setting('request.jwt.claims', true))::jsonb ->> 'email')
            AND is_active = true
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM admin_accounts 
            WHERE email = ((current_setting('request.jwt.claims', true))::jsonb ->> 'email')
            AND is_active = true
        )
    );

-- Sizes
DROP POLICY IF EXISTS "admin_write_sizes" ON sizes;
CREATE POLICY "admin_write_sizes" ON sizes
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM admin_accounts 
            WHERE email = ((current_setting('request.jwt.claims', true))::jsonb ->> 'email')
            AND is_active = true
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM admin_accounts 
            WHERE email = ((current_setting('request.jwt.claims', true))::jsonb ->> 'email')
            AND is_active = true
        )
    );

-- Attributes
DROP POLICY IF EXISTS "admin_write_attributes" ON attributes;
CREATE POLICY "admin_write_attributes" ON attributes
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM admin_accounts 
            WHERE email = ((current_setting('request.jwt.claims', true))::jsonb ->> 'email')
            AND is_active = true
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM admin_accounts 
            WHERE email = ((current_setting('request.jwt.claims', true))::jsonb ->> 'email')
            AND is_active = true
        )
    );

-- Menu Item Sizes
DROP POLICY IF EXISTS "admin_write_menu_item_sizes" ON menu_item_sizes;
CREATE POLICY "admin_write_menu_item_sizes" ON menu_item_sizes
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM admin_accounts 
            WHERE email = ((current_setting('request.jwt.claims', true))::jsonb ->> 'email')
            AND is_active = true
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM admin_accounts 
            WHERE email = ((current_setting('request.jwt.claims', true))::jsonb ->> 'email')
            AND is_active = true
        )
    );

-- Menu Item Attributes
DROP POLICY IF EXISTS "admin_write_menu_item_attributes" ON menu_item_attributes;
CREATE POLICY "admin_write_menu_item_attributes" ON menu_item_attributes
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM admin_accounts 
            WHERE email = ((current_setting('request.jwt.claims', true))::jsonb ->> 'email')
            AND is_active = true
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM admin_accounts 
            WHERE email = ((current_setting('request.jwt.claims', true))::jsonb ->> 'email')
            AND is_active = true
        )
    );

-- 7. UPDATE STORAGE POLICIES
-- Delete old hardcoded policies for storage
DROP POLICY IF EXISTS "Admins can delete images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can write images" ON storage.objects;

-- Create new storage policies using admin_accounts
CREATE POLICY "Admins can delete images" ON storage.objects
    FOR DELETE
    TO authenticated
    USING (
        bucket_id = 'product-images' AND 
        EXISTS (
            SELECT 1 FROM admin_accounts 
            WHERE email = ((current_setting('request.jwt.claims', true))::jsonb ->> 'email')
            AND is_active = true
        )
    );

CREATE POLICY "Admins can update images" ON storage.objects
    FOR UPDATE
    TO authenticated
    USING (
        bucket_id = 'product-images' AND 
        EXISTS (
            SELECT 1 FROM admin_accounts 
            WHERE email = ((current_setting('request.jwt.claims', true))::jsonb ->> 'email')
            AND is_active = true
        )
    );

CREATE POLICY "Admins can write images" ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'product-images' AND 
        EXISTS (
            SELECT 1 FROM admin_accounts 
            WHERE email = ((current_setting('request.jwt.claims', true))::jsonb ->> 'email')
            AND is_active = true
        )
    );

-- 8. Add index for better performance
CREATE INDEX IF NOT EXISTS idx_admin_accounts_email_active 
ON admin_accounts (email, is_active) 
WHERE is_active = true;

-- VERIFICATION QUERIES (Run these to verify everything is working)
-- SELECT * FROM admin_accounts;
-- SELECT policy_name, policy FROM pg_policies WHERE table_name = 'categories';
