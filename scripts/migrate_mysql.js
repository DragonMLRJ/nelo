import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function run() {
    console.log('Connecting to MySQL...');
    try {
        const connection = await mysql.createConnection({
            host: 'localhost',
            port: 3306,
            user: 'root',
            password: 'admin123',
            database: 'nelo_marketplace',
            multipleStatements: true
        });

        console.log('Connected!');

        const files = [
            '../database/11_create_disputes_table_mysql.sql',
            '../database/12_add_secure_handover_mysql.sql'
        ];

        for (const file of files) {
            const filePath = path.join(__dirname, file);
            console.log(`Running ${file}...`);
            const sql = fs.readFileSync(filePath, 'utf8');
            await connection.query(sql);
            console.log(`Success: ${file}`);
        }

        await connection.end();
        console.log('All migrations applied successfully.');

    } catch (error) {
        console.error('Migration execution failed:', error);
        process.exit(1);
    }
}

run();
