-- ==============================================================================
-- MIGRATION: 007_enforce_moderation.sql
-- PURPOSE: Prevent sellers from bypassing moderation by inserting 'approved' status directly.
-- ==============================================================================

-- 1. Create a function to force status to 'pending' on insert
CREATE OR REPLACE FUNCTION public.force_product_moderation()
RETURNS TRIGGER AS $$
BEGIN
    -- Ignore what the user sent. Force 'pending'.
    -- Exception: Maybe Admins can set it? For now, SAFETY FIRST: Everyone starts pending.
    NEW.status := 'pending';
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Create the Trigger
DROP TRIGGER IF EXISTS on_product_insert_moderation ON public.products;
CREATE TRIGGER on_product_insert_moderation
BEFORE INSERT ON public.products
FOR EACH ROW EXECUTE FUNCTION public.force_product_moderation();

-- 3. Verify
SELECT 'Moderation Trigger Applied: Products will always be created as pending.' as status;
