import pg from 'pg';

const { Pool } = pg;

async function run() {
    console.log('Connecting to Supabase to fix Schema...');

    const pool = new Pool({
        host: 'db.nzyuwfxghaujzzfjewze.supabase.co',
        port: 5432,
        user: 'postgres',
        password: 'StrongPass_Nelo_2026!',
        database: 'postgres',
        ssl: { rejectUnauthorized: false }
    });

    try {
        const client = await pool.connect();
        console.log('Connected! Applying fixes...');

        const sql = `
            -- 1. Add product_id to messages table
            ALTER TABLE public.messages 
            ADD COLUMN IF NOT EXISTS product_id BIGINT REFERENCES public.products(id) ON DELETE SET NULL;

            -- 2. Make conversation_id OPTIONAL
            ALTER TABLE public.messages 
            ALTER COLUMN conversation_id DROP NOT NULL;

            -- 3. Add index
            CREATE INDEX IF NOT EXISTS idx_messages_product_id ON public.messages(product_id);
        `;

        await client.query(sql);
        console.log('✅ Success! The "100 Errors" should be gone.');

        client.release();
        await pool.end();

    } catch (error) {
        console.error('❌ Failed:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
    }
}

run();
