
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

const buckets = [
    // Standard Assets
    { id: 'products', public: true }, // Keep legacy
    { id: 'avatars', public: true },  // Keep legacy

    // New Professional Assets
    { id: 'public-assets', public: true },
    { id: 'user-avatars', public: true }, // Duplicate of avatars? Keep separate for now or migrate
    { id: 'product-media', public: true },
    { id: 'store-branding', public: true },

    // Restricted/Private Assets
    { id: 'chat-media', public: false },      // Private
    { id: 'verification-docs', public: false } // Private (KYC)
];

async function setupStorage() {
    console.log('Setting up storage buckets...');

    for (const bucket of buckets) {
        const { data, error } = await supabase.storage.createBucket(bucket.id, {
            public: bucket.public,
            fileSizeLimit: 5242880, // 5MB
            allowedMimeTypes: ['image/png', 'image/jpeg', 'image/gif', 'image/webp']
        });

        if (error) {
            if (error.message.includes('already exists')) {
                console.log(`✅ Bucket '${bucket.id}' already exists.`);

                // Update public status just in case
                const { error: updateError } = await supabase.storage.updateBucket(bucket.id, {
                    public: bucket.public
                });
                if (updateError) console.error(`   Warning: Could not update bucket '${bucket.id}':`, updateError.message);

            } else {
                console.error(`❌ Failed to create bucket '${bucket.id}':`, error.message);
            }
        } else {
            console.log(`✅ Bucket '${bucket.id}' created successfully.`);
        }
    }
}

setupStorage();
