import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from '@/database/schema/index.js';

dotenv.config();

const sql = neon(process.env.DATABASE_URL as string);
export const db = drizzle(sql, { schema });
