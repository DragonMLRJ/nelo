
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

async function syncProfiles() {
    console.log('Syncing profiles...');

    // 1. Fetch all users from auth.users
    const { data: { users }, error: authError } = await supabase.auth.admin.listUsers();

    if (authError) {
        console.error('Error fetching users:', authError);
        return;
    }

    console.log(`Found ${users.length} users in auth.users.`);

    for (const user of users) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', user.id)
            .single();

        if (!profile) {
            console.log(`Creating profile for ${user.email}...`);
            const { error: insertError } = await supabase
                .from('profiles')
                .insert({
                    id: user.id,
                    email: user.email,
                    name: user.user_metadata?.full_name || user.email?.split('@')[0],
                    avatar: user.user_metadata?.avatar_url
                });

            if (insertError) console.error(`Failed to create profile for ${user.email}:`, insertError);
            else console.log(`Profile created for ${user.email}`);
        } else {
            console.log(`Profile exists for ${user.email}`);
        }
    }

    // Check final count
    const { count } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
    console.log(`Total profiles in table: ${count}`);
}

syncProfiles();
