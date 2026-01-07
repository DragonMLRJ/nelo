
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

const categories = [
    { name: 'Men', slug: 'men' },
    { name: 'Women', slug: 'women' },
    { name: 'Kids', slug: 'kids' },
    { name: 'Tech', slug: 'tech' },
    { name: 'Home', slug: 'home' },
    { name: 'Entertainment', slug: 'ent' },
    { name: 'Beauty', slug: 'beauty' }
];

async function seedCategories() {
    console.log('Checking categories...');

    // Check existing
    const { data: existing, error: fetchError } = await supabase.from('categories').select('*');

    if (fetchError) {
        // Table might not exist if 003 assumed it was there but it wasn't
        console.error('Error fetching categories (table might be missing):', fetchError);
        // Attempt to create table? No, better to use SQL migration if missing.
        return;
    }

    console.log(`Found ${existing.length} categories.`);

    if (existing.length === 0) {
        console.log('Seeding categories...');
        const { error: insertError } = await supabase.from('categories').insert(categories);
        if (insertError) {
            console.error('Error seeding categories:', insertError);
        } else {
            console.log('Categories seeded successfully.');
        }
    } else {
        console.log('Categories already exist, skipping seed.');
    }
}

seedCategories();
