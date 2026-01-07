const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

// Project Credentials
const PROJECT_ID = 'nzyuwfxghaujzzfjewze';
// specific password if known, else default to project ID which was used before?
// If this fails, we ask user.
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

        const migrationPath = path.join(__dirname, '../../supabase/migrations/003_fix_user_ids.sql');
        const migrationSql = fs.readFileSync(migrationPath, 'utf8');

        console.log('Running UUID Fix Migration...');
        await client.query(migrationSql);

        console.log('Migration complete!');
    } catch (err) {
        console.error('Migration failed:', err.message);
    } finally {
        await client.end();
    }
}

migrate();
