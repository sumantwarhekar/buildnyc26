import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { createBrowserClient as createSSRBrowserClient } from "@supabase/ssr";

// Singleton SSR-compatible browser client — stores session in cookies so
// the server middleware can read it (not localStorage which middleware can't see)
let browserClient: ReturnType<typeof createSSRBrowserClient> | null = null;

export const createBrowserClient = () => {
  if (!browserClient) {
    browserClient = createSSRBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }
  return browserClient;
};

// Admin client (service role — server only, never import in client components)
export const getSupabaseAdmin = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
