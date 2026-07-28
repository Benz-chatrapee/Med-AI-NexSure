"use client";

import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { createSupabaseBrowserClient } from "@/lib/auth/supabase-browser";
import type { LoginFormValues } from "../schemas/login-schema";

type LoginRouter = Pick<AppRouterInstance, "push" | "refresh">;

export async function loginWithSupabase(
  values: LoginFormValues,
  options: { router: LoginRouter },
) {
  const supabase = createSupabaseBrowserClient();

  if (!supabase) {
    throw new Error("AUTH_CONFIGURATION_UNAVAILABLE");
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email: values.email.trim(),
    password: values.password,
  });

  if (error || !data.user) {
    throw new Error("LOGIN_FAILED");
  }

  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError || !session?.user) {
    throw new Error("SESSION_NOT_ESTABLISHED");
  }

  options.router.refresh();
  options.router.push("/dashboard");
}
