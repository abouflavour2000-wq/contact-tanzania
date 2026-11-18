import { createClient } from "@supabase/supabase-js";

type SupabaseAdminClient = ReturnType<typeof createClient>;

let client: SupabaseAdminClient | null = null;

function getClient(): SupabaseAdminClient {
  if (client) return client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error("Missing Supabase server environment variables.");
  }

  client = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  return client;
}

// Defer client creation until a route actually uses Supabase. This prevents
// Next.js from failing while collecting route data during build when the
// server-only environment variables are not available at build time.
export const supabaseAdmin = new Proxy({} as SupabaseAdminClient, {
  get(_target, property) {
    const value = Reflect.get(getClient(), property);
    return typeof value === "function" ? value.bind(getClient()) : value;
  },
});
