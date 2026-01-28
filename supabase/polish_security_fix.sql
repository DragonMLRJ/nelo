-- =================================================================
-- FINAL SECURITY POLISH SCRIPT
-- =================================================================
-- Fixes "Function Search Path Mutable" Warnings
-- This prevents malicious users from hijacking function execution
-- by manipulating the search_path.
-- =================================================================

-- 1. Secure function: search_products
ALTER FUNCTION public.search_products SET search_path = public;

-- 2. Secure function: handle_new_user
ALTER FUNCTION public.handle_new_user SET search_path = public;

-- 3. Secure function: update_updated_at_column
ALTER FUNCTION public.update_updated_at_column SET search_path = public;

-- =================================================================
-- NOTES ON OTHER WARNINGS:
-- 1. "Extension in Public":
--    - It is safe to ignore this for now. Moving extensions to a new schema
--      might break your running app if not done carefully.
--
-- 2. "RLS Policy Always True" (Cart):
--    - This is INTENTIONAL. This allows "Guest Checkout" (writing to cart
--      without logging in). Do not change this unless you want to block guests.
--
-- 3. "Leaked Password Protection":
--    - Enable this in Supabase Dashboard: Authentication -> Security -> Leaked Passwords
-- =================================================================
