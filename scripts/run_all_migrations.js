import pg from 'pg';
const { Client } = pg;
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '../.env') });

// Supabase Connection Details
const PROJECT_ID = 'nzyuwfxghaujzzfjewze';
const PASSWORD = process.env.DATABASE_PASSWORD || 'StrongPass_Nelo_2026!';
const DB_URL = `postgresql://postgres:${PASSWORD}@db.${PROJECT_ID}.supabase.co:5432/postgres`;

async function runAllMigrations() {
    const maskedUrl = DB_URL.replace(`:${PASSWORD}@`, ':****@');
    console.log(`\n🔌 Connecting to ${maskedUrl}...\n`);

    const client = new Client({
        connectionString: DB_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        console.log('✅ Connected successfully!\n');

        // Create migrations tracking table if not exists
        await client.query(`
            CREATE TABLE IF NOT EXISTS schema_migrations (
                id SERIAL PRIMARY KEY,
                migration_name VARCHAR(255) UNIQUE NOT NULL,
                applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Get list of all migrations
        const migrationsDir = join(__dirname, '../supabase/migrations');
        const files = fs.readdirSync(migrationsDir)
            .filter(f => f.endsWith('.sql'))
            .sort(); // Run in alphabetical order

        let successCount = 0;
        let skipCount = 0;
        let errorCount = 0;

        for (const file of files) {
            const migrationName = file.replace('.sql', '');

            // Check if already applied
            const result = await client.query(
                'SELECT 1 FROM schema_migrations WHERE migration_name = $1',
                [migrationName]
            );

            if (result.rows.length > 0) {
                console.log(`⏭️  Skipped: ${file} (already applied)`);
                skipCount++;
                continue;
            }

            // Read and execute migration
            try {
                const migrationPath = join(migrationsDir, file);
                const migrationSql = fs.readFileSync(migrationPath, 'utf8');

                console.log(`🔄 Running: ${file}...`);
                await client.query(migrationSql);

                // Mark as applied
                await client.query(
                    'INSERT INTO schema_migrations (migration_name) VALUES ($1)',
                    [migrationName]
                );

                console.log(`✅ Success: ${file}\n`);
                successCount++;
            } catch (err) {
                console.error(`❌ Failed: ${file}`);
                console.error(`   Error: ${err.message}\n`);
                errorCount++;
                // Continue with next migration instead of stopping
            }
        }

        console.log('\n' + '='.repeat(50));
        console.log('📊 Migration Summary:');
        console.log(`   ✅ Success: ${successCount}`);
        console.log(`   ⏭️  Skipped: ${skipCount}`);
        console.log(`   ❌ Failed:  ${errorCount}`);
        console.log('='.repeat(50) + '\n');

        if (errorCount === 0) {
            console.log('🎉 All migrations completed successfully!\n');
        } else {
            console.log('⚠️  Some migrations failed. Please review errors above.\n');
        }

    } catch (err) {
        console.error('\n❌ Migration process failed:', err.message);
        process.exit(1);
    } finally {
        await client.end();
    }
}

runAllMigrations();
