-- Fix foreign key constraints to allow cascade delete
-- This will automatically delete related records when a menu item is deleted

-- First, check current foreign key constraints
SELECT 
    tc.table_name, 
    tc.constraint_name, 
    tc.constraint_type, 
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    rc.delete_rule
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
LEFT JOIN information_schema.referential_constraints AS rc
  ON tc.constraint_name = rc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND (tc.table_name = 'menu_item_attributes' OR tc.table_name = 'menu_item_sizes')
AND ccu.table_name = 'menu_items';

-- Drop and recreate the foreign key constraints with CASCADE DELETE

-- For menu_item_attributes table
ALTER TABLE menu_item_attributes 
DROP CONSTRAINT IF EXISTS menu_item_attributes_menu_item_id_fkey;

ALTER TABLE menu_item_attributes 
ADD CONSTRAINT menu_item_attributes_menu_item_id_fkey 
FOREIGN KEY (menu_item_id) 
REFERENCES menu_items(id) 
ON DELETE CASCADE;

-- For menu_item_sizes table  
ALTER TABLE menu_item_sizes 
DROP CONSTRAINT IF EXISTS menu_item_sizes_menu_item_id_fkey;

ALTER TABLE menu_item_sizes 
ADD CONSTRAINT menu_item_sizes_menu_item_id_fkey 
FOREIGN KEY (menu_item_id) 
REFERENCES menu_items(id) 
ON DELETE CASCADE;

-- Verify the changes
SELECT 
    tc.table_name, 
    tc.constraint_name, 
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    rc.delete_rule
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
LEFT JOIN information_schema.referential_constraints AS rc
  ON tc.constraint_name = rc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND (tc.table_name = 'menu_item_attributes' OR tc.table_name = 'menu_item_sizes')
AND ccu.table_name = 'menu_items';
