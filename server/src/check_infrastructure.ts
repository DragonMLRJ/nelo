
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkInfrastructure() {
    console.log('--- Checking Tables ---');
    const tables = ['messages', 'cart_items', 'wishlists', 'conversations'];

    for (const table of tables) {
        const { count, error } = await supabase.from(table).select('*', { count: 'exact', head: true });
        if (error) {
            console.log(`❌ Table '${table}': Missing or Not Accessible (${error.message})`);
        } else {
            console.log(`✅ Table '${table}': Exists (Rows: ${count})`);
        }
    }

    console.log('\n--- Checking Storage Buckets ---');
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
    if (bucketError) {
        console.error('Error listing buckets:', bucketError);
    } else {
        if (buckets.length === 0) {
            console.log('⚠️ No storage buckets found.');
        } else {
            buckets.forEach(b => console.log(`📦 Bucket: ${b.name} (Public: ${b.public})`));
        }
    }
}

checkInfrastructure();
