-- Security Fix: Replace Permissive Cart Policies
-- Current policies use USING (true) which allows any user to modify any cart
-- This creates secure policies that restrict access to cart owners only

-- Fix: Add missing user_id column to cart table if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='cart' AND column_name='user_id') THEN
        ALTER TABLE public.cart ADD COLUMN user_id uuid REFERENCES auth.users(id);
    END IF;
END $$;

-- Drop existing overly permissive policies on cart table
DROP POLICY IF EXISTS "Users can update their cart" ON public.cart;
DROP POLICY IF EXISTS "Users can delete their cart" ON public.cart;
DROP POLICY IF EXISTS "Users can insert into cart" ON public.cart;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.cart;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON public.cart;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON public.cart;
DROP POLICY IF EXISTS "Allow all operations" ON public.cart;

-- Create secure policies for cart table
-- Users can only view their own cart
CREATE POLICY "Users can view own cart"
ON public.cart FOR SELECT
USING (auth.uid() = user_id);

-- Users can only insert their own cart
CREATE POLICY "Users can create own cart"
ON public.cart FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can only update their own cart
CREATE POLICY "Users can update own cart"
ON public.cart FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Users can only delete their own cart
CREATE POLICY "Users can delete own cart"
ON public.cart FOR DELETE
USING (auth.uid() = user_id);

-- Drop existing overly permissive policies on cart_line_item table
DROP POLICY IF EXISTS "Users can manage cart items" ON public.cart_line_item;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.cart_line_item;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON public.cart_line_item;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON public.cart_line_item;
DROP POLICY IF EXISTS "Allow all operations" ON public.cart_line_item;

-- Create secure policies for cart_line_item table
-- Users can view items in their own cart
CREATE POLICY "Users can view own cart items"
ON public.cart_line_item FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.cart
        WHERE cart.id = cart_line_item.cart_id
        AND cart.user_id = auth.uid()
    )
);

-- Users can insert items into their own cart
CREATE POLICY "Users can add items to own cart"
ON public.cart_line_item FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.cart
        WHERE cart.id = cart_line_item.cart_id
        AND cart.user_id = auth.uid()
    )
);

-- Users can update items in their own cart
CREATE POLICY "Users can update own cart items"
ON public.cart_line_item FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM public.cart
        WHERE cart.id = cart_line_item.cart_id
        AND cart.user_id = auth.uid()
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.cart
        WHERE cart.id = cart_line_item.cart_id
        AND cart.user_id = auth.uid()
    )
);

-- Users can delete items from their own cart
CREATE POLICY "Users can delete own cart items"
ON public.cart_line_item FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM public.cart
        WHERE cart.id = cart_line_item.cart_id
        AND cart.user_id = auth.uid()
    )
);
