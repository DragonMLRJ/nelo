const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

// Project Credentials
const PROJECT_ID = 'nzyuwfxghaujzzfjewze';
const PASSWORD = process.env.DATABASE_PASSWORD || process.argv[2] || PROJECT_ID;

// Connection string
const DB_URL = `postgresql://postgres:${PASSWORD}@db.${PROJECT_ID}.supabase.co:5432/postgres`;

async function migrate() {
    const maskedUrl = DB_URL.replace(`:${PASSWORD}@`, ':****@');
    console.log(`Connecting to ${maskedUrl}...`);

    const client = new Client({
        connectionString: DB_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        console.log('Connected successfully!');

        const migrationPath = path.join(__dirname, '../../supabase/migrations/004_storage_policies.sql');
        const migrationSql = fs.readFileSync(migrationPath, 'utf8');

        console.log('Running Storage Policies Migration...');
        await client.query(migrationSql);

        console.log('Migration complete!');
    } catch (err) {
        console.error('Migration failed:', err.message);
        // Don't kill process if it fails, just log
    } finally {
        await client.end();
    }
}

migrate();
