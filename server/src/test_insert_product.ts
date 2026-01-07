
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

async function testInsert() {
    console.log('Attempting to insert test product...');

    // 1. Get a category ID
    const { data: catData, error: catError } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', 'men')
        .single();

    if (catError || !catData) {
        console.error('Failed to get category:', catError);
        return;
    }

    // 2. Get a user profile (seller)
    const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .limit(1)
        .single();

    if (profileError || !profileData) {
        console.error('Failed to get profile (make sure a user exists):', profileError);
        return;
    }

    console.log(`Using Category ID: ${catData.id}, Seller ID: ${profileData.id}`);

    // 3. Insert Product
    const payload = {
        title: 'Backend Test Product',
        price: 5000,
        currency: 'XAF',
        image: 'https://placehold.co/400',
        category_id: catData.id,
        brand: 'TestBrand',
        condition_status: 'New',
        description: 'Inserted via script',
        seller_id: profileData.id
    };

    const { data, error } = await supabase
        .from('products')
        .insert([payload])
        .select()
        .single();

    if (error) {
        console.error('Insert Error:', error);
    } else {
        console.log('Insert Success:', data);
    }
}

testInsert();
