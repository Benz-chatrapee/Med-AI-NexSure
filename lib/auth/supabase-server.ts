import "server-only";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";

export type SupabaseServerClient = SupabaseClient<Database>;

export type SupabaseServerClientResult =
  | {
      status: "configured";
      client: SupabaseServerClient;
    }
  | {
      status: "configuration_error";
      reason: "missing_supabase_url" | "missing_supabase_anon_key";
    };

export async function createSupabaseServerClient(): Promise<SupabaseServerClientResult> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl) {
    return { status: "configuration_error", reason: "missing_supabase_url" };
  }

  if (!supabaseAnonKey) {
    return { status: "configuration_error", reason: "missing_supabase_anon_key" };
  }

  const cookieStore = await cookies();

  return {
    status: "configured",
    client: createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Server Components cannot set cookies; Route Handlers and Actions can.
          }
        },
      },
    }),
  };
}
