import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { Pool } = pg;

async function run() {
    console.log('Connecting to Supabase Postgres...');
    try {
        const pool = new Pool({
            host: 'db.nzyuwfxghaujzzfjewze.supabase.co',
            port: 5432,
            user: 'postgres',
            password: 'admin123',
            database: 'postgres',
            ssl: { rejectUnauthorized: false } // Required for Supabase
        });

        const client = await pool.connect();
        console.log('Connected!');

        const files = [
            '../supabase/migrations/11_create_disputes_table.sql',
            '../supabase/migrations/12_add_secure_handover.sql'
        ];

        for (const file of files) {
            const filePath = path.join(__dirname, file);
            console.log(`Reading ${file}...`);
            const sql = fs.readFileSync(filePath, 'utf8');
            console.log(`Executing ${file}...`);
            await client.query(sql);
            console.log(`Success: ${file}`);
        }

        client.release();
        await pool.end();
        console.log('All migrations applied successfully.');

    } catch (error) {
        console.error('Migration execution failed:', error);
        process.exit(1);
    }
}

run();
