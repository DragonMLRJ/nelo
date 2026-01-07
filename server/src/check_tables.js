
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('Checking database connection...');
console.log('URL:', supabaseUrl);

if (!supabaseKey) {
    console.error('Error: SUPABASE_SERVICE_ROLE_KEY is missing.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTables() {
    console.log('Attempting to fetch users...');
    // 'users' table in public schema
    const { data: users, error: usersError } = await supabase.from('users').select('*').limit(1);

    if (usersError) {
        console.error('Error fetching users:', usersError.message);
        if (usersError.message.includes('does not exist')) {
            console.log('CONCLUSION: Tables do NOT exist.');
        } else {
            console.log('CONCLUSION: Connection successful, but other error:', usersError.message);
        }
    } else {
        console.log('Success! Users table exists.');
        console.log('Data:', users);
        console.log('CONCLUSION: Tables EXIST.');
    }

    console.log('---');
    console.log('Attempting to fetch products...');
    const { data: products, error: prodError } = await supabase.from('products').select('*').limit(1);
    if (prodError) {
        console.error('Error fetching products:', prodError.message);
    } else {
        console.log('Success! Products table exists.');
    }
}

checkTables();
