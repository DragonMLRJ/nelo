-- Security Fix: Enable RLS on Migration and Test Tables
-- These tables should not be accessible via the public API

-- Enable RLS on mikro_orm_migrations (if exists)
ALTER TABLE IF EXISTS public.mikro_orm_migrations ENABLE ROW LEVEL SECURITY;

-- Enable RLS on test_table (if exists)
ALTER TABLE IF EXISTS public.test_table ENABLE ROW LEVEL SECURITY;

-- Enable RLS on script_migrations (if exists)
ALTER TABLE IF EXISTS public.script_migrations ENABLE ROW LEVEL SECURITY;

-- No policies are added intentionally - these tables should not be accessible via API
-- Only direct database access or service role can interact with these tables
