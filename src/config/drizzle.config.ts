import { neon, Pool } from '@neondatabase/serverless';
import ws from "ws";
import dotenv from 'dotenv';
// import { drizzle } from 'drizzle-orm/neon-http';
import { drizzle } from 'drizzle-orm/neon-serverless';
import * as schema from '@/database/schema/index.js';

dotenv.config();

// const sql = neon(process.env.DATABASE_URL as string);
// export const db = drizzle(sql, { schema });
globalThis.WebSocket = ws as any;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
})

export const db = drizzle(pool, { schema });