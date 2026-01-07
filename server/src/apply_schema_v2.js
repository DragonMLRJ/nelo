const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const PROJECT_ID = 'nzyuwfxghaujzzfjewze';
// Attempt to pick up password if set in env, otherwise fail gracefully
const PASSWORD = process.env.DATABASE_PASSWORD;

if (!PASSWORD) {
    console.error("❌ DATABASE_PASSWORD is not set in .env. Cannot run migration automatically.");
    console.log("👉 Please copy the contents of 'supabase/migrations/005_professional_schema_v2.sql' and run it in your Supabase SQL Editor.");
    process.exit(1);
}

const DB_URL = `postgresql://postgres:${PASSWORD}@db.${PROJECT_ID}.supabase.co:5432/postgres`;

async function migrate() {
    console.log('Connecting to database...');
    const client = new Client({
        connectionString: DB_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        const migrationPath = path.join(__dirname, '../../supabase/migrations/005_professional_schema_v2.sql');
        const migrationSql = fs.readFileSync(migrationPath, 'utf8');

        console.log('Running v2 Schema Migration...');
        await client.query(migrationSql);
        console.log('✅ v2 Schema Applied Successfully!');
    } catch (err) {
        console.error('Migration failed:', err.message);
    } finally {
        await client.end();
    }
}

migrate();
