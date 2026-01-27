-- ==============================================================================
-- MIGRATION: 008_add_stock_management.sql
-- PURPOSE: Enable inventory tracking to prevent overselling.
-- ==============================================================================

-- 1. Add stock_quantity column with default 1 (assuming unique items for existing data)
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS stock_quantity INT DEFAULT 1;

-- 2. Add constraint to prevent negative stock
ALTER TABLE public.products 
ADD CONSTRAINT check_stock_non_negative CHECK (stock_quantity >= 0);

-- 3. Verify
SELECT 'Stock Management Enabled' as status;
