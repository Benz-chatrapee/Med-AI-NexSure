"use client";

import { useEffect, useState } from "react";
import type { DatabaseHealth } from "@/types/database";

const stateLabel: Record<DatabaseHealth["state"], string> = {
  connected: "Database Connected",
  missing_configuration: "Database Config Required",
  connection_failed: "Database Unavailable",
};

export function DatabaseStatus() {
  const [health, setHealth] = useState<DatabaseHealth | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadDatabaseHealth() {
      try {
        const response = await fetch("/api/database/health", {
          cache: "no-store",
        });
        const data = (await response.json()) as DatabaseHealth;

        if (isMounted) {
          setHealth(data);
        }
      } catch {
        if (isMounted) {
          setHealth({
            state: "connection_failed",
            provider: "supabase",
            checkedAt: new Date().toISOString(),
            message: "Database health endpoint could not be reached.",
          });
        }
      }
    }

    void loadDatabaseHealth();

    return () => {
      isMounted = false;
    };
  }, []);

  const state = health?.state ?? "connection_failed";
  const isConnected = state === "connected";

  return (
    <div className="mt-4 rounded-2xl border border-blue-100 bg-white p-3 text-xs leading-5 text-slate-600">
      <div className="flex items-center justify-between gap-3">
        <span className="font-bold text-slate-800">Database</span>
        <span
          className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-[.12em] ${
            isConnected
              ? "bg-emerald-50 text-emerald-700"
              : "bg-amber-50 text-amber-700"
          }`}
        >
          {health ? stateLabel[state] : "Checking"}
        </span>
      </div>
      <p className="mt-2">{health?.message ?? "Checking Supabase connection..."}</p>
    </div>
  );
}
