-- Add Secure Handover fields to orders table
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS delivery_method TEXT DEFAULT 'shipping' CHECK (delivery_method IN ('shipping', 'pickup')),
ADD COLUMN IF NOT EXISTS pickup_code VARCHAR(6),
ADD COLUMN IF NOT EXISTS pickup_verified_at TIMESTAMP WITH TIME ZONE;

-- Add index for performance on order lookups
CREATE INDEX IF NOT EXISTS idx_orders_pickup_code ON public.orders(pickup_code) WHERE delivery_method = 'pickup';

-- Protect pickup_code visibility via RLS (optional, but good practice if RLS was strict on columns)
-- Ideally, only the buyer should see the pickup_code. 
-- However, standard RLS applies to rows. We handle column visibility in API logic mostly, 
-- but we can ensure that updates to this column are restricted.
