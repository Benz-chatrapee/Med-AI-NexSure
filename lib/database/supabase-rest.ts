import "server-only";

import type { DatabaseHealth } from "@/types/database";
import { getSupabaseDatabaseConfig } from "./env";

export async function checkSupabaseConnection(): Promise<DatabaseHealth> {
  const checkedAt = new Date().toISOString();
  const config = getSupabaseDatabaseConfig();

  if (!config) {
    return {
      state: "missing_configuration",
      provider: "supabase",
      checkedAt,
      message:
        "Supabase environment variables are not configured on the server.",
    };
  }

  try {
    const headers: Record<string, string> = {
      apikey: config.anonKey,
    };

    if (!config.anonKey.startsWith("sb_publishable_")) {
      headers.Authorization = `Bearer ${config.anonKey}`;
    }

    const response = await fetch(`${config.url}/rest/v1/`, {
      method: "GET",
      headers,
      cache: "no-store",
    });

    if (!response.ok) {
      return {
        state: "connection_failed",
        provider: "supabase",
        checkedAt,
        message: `Supabase health check failed with status ${response.status}.`,
      };
    }

    return {
      state: "connected",
      provider: "supabase",
      checkedAt,
      message: "Supabase database connection is available.",
    };
  } catch {
    return {
      state: "connection_failed",
      provider: "supabase",
      checkedAt,
      message: "Supabase database connection could not be reached.",
    };
  }
}
