const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

// User provided 'nzyuwfxghaujzzfjewze' as password.
// Project ID is also 'nzyuwfxghaujzzfjewze'.
const PROJECT_ID = 'nzyuwfxghaujzzfjewze';
const PASSWORD = process.argv[2] || PROJECT_ID;

// Connection string
const DB_URL = `postgresql://postgres:${PASSWORD}@db.${PROJECT_ID}.supabase.co:5432/postgres`;

async function migrate() {
    // Mask password in logs
    const maskedUrl = DB_URL.replace(`:${PASSWORD}@`, ':****@');
    console.log(`Connecting to ${maskedUrl}...`);

    // Disable SSL validation for simplicity in this one-off script if needed, 
    // though Supabase usually requires SSL. We use rejectUnauthorized: false to avoid certificate issues.
    const client = new Client({
        connectionString: DB_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        console.log('Connected successfully!');

        const schemaPath = path.join(__dirname, '../../supabase/schema.sql');
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');

        console.log('Running migration...');
        // Split by semicolon to run statements? Usually client.query can handle multiple statements 
        // if they are simple, but sometimes better to run the whole block if using pg.
        // 'pg' library supports multiple statements in one query string.
        await client.query(schemaSql);

        console.log('Migration complete!');
    } catch (err) {
        console.error('Migration failed:', err.message);
        if (err.message.includes('password authentication failed')) {
            console.error('CRITICAL: The password provided is incorrect (it matches the Project ID).');
        }
    } finally {
        await client.end();
    }
}

migrate();
