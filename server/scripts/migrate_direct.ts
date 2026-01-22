
import { Client } from 'pg';
import fs from 'fs';
import path from 'path';

// HARDCODED CREDENTIALS (Temporary for migration)
const DB_URL = "postgresql://postgres:StrongPass_Nelo_2026!@db.heaeqcjmmrrvambmuysu.supabase.co:5432/postgres";

async function migrate() {
    console.log('🔌 Connecting to database (Direct)...');

    const client = new Client({
        connectionString: DB_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        console.log('✅ Connected.');

        const schemaPath = path.resolve(__dirname, '../../supabase/schema.sql');
        console.log(`📂 Reading schema from: ${schemaPath}`);

        if (!fs.existsSync(schemaPath)) {
            throw new Error(`Schema file not found at ${schemaPath}`);
        }

        const sql = fs.readFileSync(schemaPath, 'utf8');

        console.log('🚀 Executing migration...');
        await client.query(sql);

        console.log('✅ Migration successful! Database schema applied.');

    } catch (err) {
        console.error('❌ Migration failed:', err);
    } finally {
        await client.end();
    }
}

migrate();
