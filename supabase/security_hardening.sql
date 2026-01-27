-- ==============================================================================
-- NELO MARKETPLACE SECURITY HARDENING (RLS)
-- Run this in your Supabase Dashboard -> SQL Editor
-- ==============================================================================

-- 1. Enable Row Level Security
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- 2. ORDERS Table Policies
-- Allow users to view their own orders (either as buyer or seller)
CREATE POLICY "Users can view own orders" ON public.orders
FOR SELECT USING (
  auth.uid()::text = buyer_id::text OR 
  auth.uid()::text = seller_id::text
);

-- Allow users to create orders where they are the buyer
CREATE POLICY "Users can create orders" ON public.orders
FOR INSERT WITH CHECK (
  auth.uid()::text = buyer_id::text
);

-- Allow sellers to update status, and buyers/sellers to update proofs
-- (Refined update logic would be better, but this secures row access)
CREATE POLICY "Participants can update orders" ON public.orders
FOR UPDATE USING (
  auth.uid()::text = buyer_id::text OR 
  auth.uid()::text = seller_id::text
);

-- 3. USERS Table Policies (Profile)
-- Everyone can read basics (needed for product listings)
CREATE POLICY "Public profiles are viewable" ON public.users
FOR SELECT USING (true);

-- Only user can update their own profile
CREATE POLICY "Users can update own profile" ON public.users
FOR UPDATE USING (
  auth.uid()::text = id::text
);

-- Only user (or admin system) can insert (User creation is largely handled by Auth trigger usually)
CREATE POLICY "Users can insert own profile" ON public.users
FOR INSERT WITH CHECK (
  auth.uid()::text = id::text
);

-- 4. MESSAGES Table Policies
-- Participants can view messages
CREATE POLICY "View messages" ON public.messages
FOR SELECT USING (
  auth.uid()::text = sender_id::text OR 
  auth.uid()::text = receiver_id::text
);

-- Sender can insert
CREATE POLICY "Send messages" ON public.messages
FOR INSERT WITH CHECK (
  auth.uid()::text = sender_id::text
);

-- 5. PRODUCTS Table Policies
-- Everyone can view products
CREATE POLICY "Public products" ON public.products
FOR SELECT USING (true);

-- Authenticated users can create products
CREATE POLICY "Create products" ON public.products
FOR INSERT WITH CHECK (
  auth.uid() = seller_id::uuid  -- Assuming seller_id is UUID here for products, casting just in case
  OR auth.uid()::text = seller_id::text
);

-- Seller can update/delete their products
CREATE POLICY "Manage products" ON public.products
FOR ALL USING (
  auth.uid()::text = seller_id::text
);

-- Verify Success
SELECT 'Security Policies Applied Successfully' as status;
