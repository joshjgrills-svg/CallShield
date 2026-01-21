import { createClient } from '@supabase/supabase-js';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '@shared/schema';

if (!process.env.VITE_SUPABASE_URL || !process.env.VITE_SUPABASE_ANON_KEY) {
  throw new Error('Missing Supabase environment variables');
}

export const supabaseUrl = process.env.VITE_SUPABASE_URL;
export const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

const connectionString = `${supabaseUrl}/rest/v1`;
const client = postgres(connectionString, { max: 1 });

export const db = drizzle(client, { schema });
