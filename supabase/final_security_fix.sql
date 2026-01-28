-- =================================================================
-- FINAL SECURITY & SCHEMA FIX SCRIPT
-- =================================================================
-- PREVENTS: "RLS Disabled" Errors (Security Risk)
-- FIXES: "100 Errors" in Application (Schema Mismatch)
-- =================================================================

-- 1. FIX APPLICATION SCHEMA (MESSAGES TABLE)
-- Ensure messages table supports product context and optional conversation_id
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS product_id BIGINT REFERENCES public.products(id) ON DELETE SET NULL;
ALTER TABLE public.messages ALTER COLUMN conversation_id DROP NOT NULL;
CREATE INDEX IF NOT EXISTS idx_messages_product_id ON public.messages(product_id);

-- 2. ENABLE ROW LEVEL SECURITY (RLS) ON ALL TABLES
-- This removes the "100 Errors" in the Supabase Security Dashboard
ALTER TABLE public.stock_location_address ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_location ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promotion_campaign ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promotion_promotion_rule ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.application_method_target_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.application_method_buy_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promotion_rule_value ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_item ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservation_item ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.region_country ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_currency ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_tag ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_category_product ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_group ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_address ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_group_customer ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tax_rate_rule ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tax_provider ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promotion ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promotion_campaign_budget_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promotion_application_method ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_line ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_line_item ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_line_item_adjustment ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_summary ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_level ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_collection ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promotion_campaign_budget ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.region ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_line_item_adjustment ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_provider ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.link_module_migrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_admin ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_fulfillment ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_type ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_option ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_option_value ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variant_option ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_category ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.image ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_channel ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_key ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_payment_collection ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variant_product_image ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variant ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_address ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.price_set ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.price_list ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_shipping_method ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_shipping_method_adjustment ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.price_list_rule ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.price_preference ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.price_rule ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_line_item_tax_line ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.price ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tax_region ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tax_rate ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_shipping_method_tax_line ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promotion_rule ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.currency ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_collection_payment_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.capture ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_session ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.refund ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_provider ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.account_holder ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_collection ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.refund_reason ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.return_reason ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_transaction ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_shipping ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_change ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_change_action ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_helpful ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_exchange_item ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_claim_item ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_claim_item_image ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_shipping_method_tax_line ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_shipping_method_adjustment ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_line_item_tax_line ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.return ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_exchange ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_claim ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.return_item ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_shipping_method ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_item ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_address ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_line_item ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_credit_line ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preference ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.view_configuration ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auth_identity ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.provider_identity ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invite ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fulfillment_set ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_zone ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.geo_zone ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipping_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipping_option_type ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipping_option_rule ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fulfillment_address ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fulfillment_label ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fulfillment_item ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipping_option ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fulfillment ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fulfillment_provider ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_execution ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.location_fulfillment_provider ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_promotion ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_account_holder ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_promotion ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.location_fulfillment_set ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_cart ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.return_fulfillment ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_sales_channel ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_payment_collection ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_vendor_order_order ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variant_inventory_item ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variant_price_set ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketplace_vendor_product_product ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.publishable_api_key_sales_channel ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_channel_stock_location ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.region_payment_provider ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipping_option_price_set ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_shipping_profile ENABLE ROW LEVEL SECURITY;

-- 3. CREATE POLICIES (Allow Access so App doesn't break)

-- A. PUBLIC READ (Catalog, Settings)
-- Applies to: Products, Categories, Regions, Currencies, Shipping Options
CREATE POLICY "Public Read Access" ON public.product FOR SELECT USING (true);
CREATE POLICY "Public Read Access" ON public.product_variant FOR SELECT USING (true);
CREATE POLICY "Public Read Access" ON public.image FOR SELECT USING (true);
CREATE POLICY "Public Read Access" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Public Read Access" ON public.region FOR SELECT USING (true);
CREATE POLICY "Public Read Access" ON public.currency FOR SELECT USING (true);
CREATE POLICY "Public Read Access" ON public.product_option FOR SELECT USING (true);
CREATE POLICY "Public Read Access" ON public.product_option_value FOR SELECT USING (true);
CREATE POLICY "Public Read Access" ON public.product_collection FOR SELECT USING (true);
CREATE POLICY "Public Read Access" ON public.product_type FOR SELECT USING (true);
CREATE POLICY "Public Read Access" ON public.product_tags FOR SELECT USING (true);
CREATE POLICY "Public Read Access" ON public.sales_channel FOR SELECT USING (true);
CREATE POLICY "Public Read Access" ON public.shipping_option FOR SELECT USING (true);
CREATE POLICY "Public Read Access" ON public.shipping_profile FOR SELECT USING (true);
CREATE POLICY "Public Read Access" ON public.store FOR SELECT USING (true);
CREATE POLICY "Public Read Access" ON public.store_currency FOR SELECT USING (true);
CREATE POLICY "Public Read Access" ON public.tax_rate FOR SELECT USING (true);
CREATE POLICY "Public Read Access" ON public.tax_region FOR SELECT USING (true);

-- B. AUTHENTICATED ACCESS (Private User Data)
-- For all other tables, we start with "Authenticated Users Only" safely.
-- (Ideally should be owner-only, but this matches typical early-stage MVP security)
-- Since we enabled RLS on EVERYTHING, we need a default fallback or the app will 403.
-- NOTE: We are NOT adding a blanket policy. Tables without a policy differ from disabled RLS.
-- Disabled RLS = Everyone sees all.
-- Enabled RLS + No Policy = No one sees anything (except Service Role).
-- This means your ADMIN BACKEND (using Service Role) will still work perfectly.
-- The Frontend (Anon/User) will only see the Public Tables listed above.
-- THIS IS THE SECURE DEFAULT. If your frontend needs access to Orders/Carts, you must add specific policies.

-- Simple 'Open' Policy for Carts (so Checkout works)
CREATE POLICY "Public Cart Access" ON public.cart FOR ALL USING (true);
CREATE POLICY "Public Cart Lines" ON public.cart_line_item FOR ALL USING (true);

-- Done.
