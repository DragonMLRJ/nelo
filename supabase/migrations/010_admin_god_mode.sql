-- ==============================================================================
-- MIGRATION: 010_admin_god_mode.sql
-- PURPOSE: Grant Admins unrestricted access via RLS (The "God Mode" Switch)
-- ==============================================================================

-- Helper function to check if current user is admin
-- NOTE: We use SECURITY DEFINER to bypass RLS on the users table for this check itself
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid()::int 
    AND is_admin = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 1. UPDATE PRODUCTS POLICY -> Admins can Delete/Update ANYTHING
DROP POLICY IF EXISTS "Manage products" ON public.products;
CREATE POLICY "Manage products" ON public.products
FOR ALL USING (
  auth.uid()::text = seller_id::text 
  OR public.is_admin() = true -- GOD MODE
);

-- 2. UPDATE USERS POLICY -> Admins can Update ANY Profile (Ban users, etc)
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Manage profiles" ON public.users
FOR UPDATE USING (
  auth.uid()::text = id::text 
  OR public.is_admin() = true -- GOD MODE
);

-- 3. UPDATE ORDERS POLICY -> Admins can View/Manage ANY Order
DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
CREATE POLICY "View orders" ON public.orders
FOR SELECT USING (
  auth.uid()::text = buyer_id::text OR 
  auth.uid()::text = seller_id::text OR
  public.is_admin() = true
);

-- Verify
SELECT 'Admin God Mode Enabled' as status;
