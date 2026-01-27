<?php
require_once __DIR__ . '/config/database.php';

try {
    $db = getDB();
    echo "🔐 Applying Security Hardening (RLS Policies)...\n";

    // 1. Enable RLS on Orders
    echo "-> Enabling RLS on 'orders'\n";
    $db->exec("ALTER TABLE orders ENABLE ROW LEVEL SECURITY");

    // 2. Drop existing policies to avoid conflicts
    $db->exec("DROP POLICY IF EXISTS \"Users can view own orders\" ON orders");
    $db->exec("DROP POLICY IF EXISTS \"Users can create own orders\" ON orders");
    $db->exec("DROP POLICY IF EXISTS \"Sellers can update own orders\" ON orders");

    // 3. Create Policies
    // Note: We cast to text to handle potential BigInt vs UUID mismatch between auth.uid() and table columns
    
    // VIEW: Buyer or Seller can view
    $db->exec("
        CREATE POLICY \"Users can view own orders\" 
        ON orders FOR SELECT 
        USING (
            auth.uid()::text = buyer_id::text OR 
            auth.uid()::text = seller_id::text
        )
    ");

    // INSERT: Buyer can insert
    $db->exec("
        CREATE POLICY \"Users can create own orders\" 
        ON orders FOR INSERT 
        WITH CHECK (
            auth.uid()::text = buyer_id::text
        )
    ");
    
    // UPDATE: Only Seller or Buyer can update (status for seller, proof for both)
    // Ideally we'd restrict strictly which columns, but RLS applies to row access.
    $db->exec("
        CREATE POLICY \"Users can update own orders\" 
        ON orders FOR UPDATE 
        USING (
            auth.uid()::text = buyer_id::text OR 
            auth.uid()::text = seller_id::text
        )
    ");

    echo "✅ RLS Policies Applied to 'orders'!\n";

    // 4. Rate Limiting Table Check
    echo "-> Checking Rate Limit table...\n";
    $db->exec("
        CREATE TABLE IF NOT EXISTS public.rate_limits (
            key text primary key,
            attempts int default 0,
            reset_at timestamp with time zone
        )
    ");
    echo "✅ Rate Limit table verified.\n";

} catch (PDOException $e) {
    echo "❌ Error applying security policies: " . $e->getMessage() . "\n";
}
?>
