import { createBrowserClient } from "@supabase/ssr";

const makeClient = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

let browserClient: ReturnType<typeof makeClient> | null = null;

/**
 * Reuse one browser client for the lifetime of the tab. createBrowserClient is
 * cheap, but a singleton keeps auth subscriptions, Realtime channels and the
 * connection pool stable across components and re-renders.
 */
export function createClient() {
  if (!browserClient) {
    browserClient = makeClient();
  }
  return browserClient;
}
