
import { Client } from 'pg';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables from server/.env
dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function migrate() {
    console.log('🔌 Connecting to database...');

    if (!process.env.DATABASE_URL) {
        console.error('❌ Error: DATABASE_URL is missing in .env');
        console.error('Please add DATABASE_URL="postgresql://postgres:[PASSWORD]@[HOST]:[PORT]/postgres" to server/.env');
        process.exit(1);
    }

    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false } // Required for Supabase
    });

    try {
        await client.connect();
        console.log('✅ Connected.');

        // Path to schema file (server/scripts/../.. -> root -> supabase/schema.sql)
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
