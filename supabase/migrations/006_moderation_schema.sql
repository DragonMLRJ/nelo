-- 6. MODERATION SCHEMA
-- Adds status column to products to allow approval workflow.

ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending'; -- 'pending', 'approved', 'rejected'

-- Index for faster filtering
CREATE INDEX IF NOT EXISTS idx_products_status ON public.products(status);

-- Policy: Public can only see approved products (Optional, if we want to enforce it now)
-- CREATE POLICY "Public view approved" ON public.products FOR SELECT USING (status = 'approved');
