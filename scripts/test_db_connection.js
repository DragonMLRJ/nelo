import pg from 'pg';
const { Client } = pg;
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '../.env') });

// Supabase Connection Details
const PROJECT_ID = 'nzyuwfxghaujzzfjewze';
const PASSWORD = process.env.DATABASE_PASSWORD || 'StrongPass_Nelo_2026!';
const DB_URL = `postgresql://postgres:${PASSWORD}@db.${PROJECT_ID}.supabase.co:5432/postgres`;

async function testConnection() {
    const maskedUrl = DB_URL.replace(`:${PASSWORD}@`, ':****@');
    console.log(`\n🔌 Testing connection to ${maskedUrl}...\n`);

    const client = new Client({
        connectionString: DB_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        console.log('✅ Connection successful!\n');

        // Test query to check database
        const result = await client.query('SELECT current_database(), current_user, version()');
        console.log('📊 Database Info:');
        console.log(`   Database: ${result.rows[0].current_database}`);
        console.log(`   User: ${result.rows[0].current_user}`);
        console.log(`   Version: ${result.rows[0].version.split(',')[0]}\n`);

        // List all tables
        const tables = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            ORDER BY table_name
        `);

        console.log('📋 Existing Tables:');
        if (tables.rows.length === 0) {
            console.log('   (No tables found)\n');
        } else {
            tables.rows.forEach(row => {
                console.log(`   - ${row.table_name}`);
            });
            console.log('');
        }

        console.log('🎉 Database is ready!\n');
    } catch (err) {
        console.error('❌ Connection failed:', err.message);
        console.error('\n💡 Troubleshooting:');
        console.error('   1. Check if DATABASE_PASSWORD in .env is correct');
        console.error('   2. Verify Supabase project is active');
        console.error('   3. Check network connection\n');
        process.exit(1);
    } finally {
        await client.end();
    }
}

testConnection();
