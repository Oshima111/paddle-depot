-- ============================================================
-- FIX: Add your admin email to the admin_allowlist table
-- ============================================================
-- Run this in the Supabase SQL Editor for the production project:
-- https://supabase.com/dashboard/project/nxkkbzheuoafpdmejlar/sql/new
--
-- After running this, RLS will allow your admin user to:
--   - INSERT products
--   - UPDATE products
--   - DELETE products
--   - Upload/update/delete paddle images in Storage
--   - View and insert activity logs
-- ============================================================

-- STEP 1: First check if any admins already exist
SELECT * FROM admin_allowlist;

-- STEP 2: Insert your admin email
-- IMPORTANT: Replace 'your-admin-email@example.com' with the actual email
-- you use to log in to the Admin Dashboard
INSERT INTO admin_allowlist (email)
VALUES ('your-admin-email@example.com');

-- STEP 3: Verify it was inserted
SELECT * FROM admin_allowlist;

-- STEP 4: Test that is_admin() works for your user
-- Replace with your actual email
SELECT public.is_admin();
-- Expected result: true

-- ============================================================
-- Optional: Check existing RLS policies
-- ============================================================
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename IN ('products', 'admin_log', 'admin_allowlist')
ORDER BY tablename, policyname;

-- ============================================================
-- Optional: Check if the products table exists and has data
-- ============================================================
SELECT count(*) AS product_count FROM products;
