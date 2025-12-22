import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

// Retrieve keys from the environment file. For server-side operations we prefer
// the service role key which bypasses row-level security for storage inserts.
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_KEY; // public/anon key
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY; // preferred for server

if (!SUPABASE_URL) {
  throw new Error("Missing SUPABASE_URL environment variable in .env file");
}

// Use service role key when available on the server. Fall back to anon key
// (existing behavior) only if service role isn't provided. Ensure you set
// SUPABASE_SERVICE_ROLE_KEY in your environment for safe server uploads.
const chosenKey = SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY;

if (!chosenKey) {
  throw new Error(
    "Missing SUPABASE_SERVICE_ROLE_KEY or SUPABASE_KEY environment variable in .env file"
  );
}

// Log which key type is being used for server-side operations (helpful for debugging RLS)
if (typeof process !== 'undefined' && process.env) {
  const keyType = SUPABASE_SERVICE_ROLE_KEY ? 'SERVICE_ROLE_KEY' : (SUPABASE_ANON_KEY ? 'ANON_KEY' : 'NONE');
  // Avoid printing the key itself to logs
  // eslint-disable-next-line no-console
  console.debug(`[supabaseClient] Using ${keyType} for server-side Supabase client`);
}

export const supabase = createClient(SUPABASE_URL, chosenKey);