import { beforeEach, describe, expect, it, vi } from "vitest";
import type { LoginFormValues } from "../schemas/login-schema";

const push = vi.fn();
const refresh = vi.fn();
const signInWithPassword = vi.fn();
const getSession = vi.fn();
const createSupabaseBrowserClient = vi.fn(() => ({
  auth: {
    signInWithPassword,
    getSession,
  },
}));

vi.mock("@/lib/auth/supabase-browser", () => ({
  createSupabaseBrowserClient,
}));

const credentials: LoginFormValues = {
  organization: "NexSure Health Group",
  clinic: "Bangkok CIC",
  email: "doctor.demo@nexsure.local",
  password: "password123",
  rememberMe: true,
};

describe("loginWithSupabase", () => {
  beforeEach(() => {
    push.mockClear();
    refresh.mockClear();
    signInWithPassword.mockReset();
    getSession.mockReset();
    createSupabaseBrowserClient.mockClear();
  });

  it("authenticates with Supabase and redirects only after a session exists", async () => {
    signInWithPassword.mockResolvedValueOnce({
      data: {
        user: { id: "7fd2c338-fc8b-414f-9d47-47e0a50dfe3e" },
        session: { user: { id: "7fd2c338-fc8b-414f-9d47-47e0a50dfe3e" } },
      },
      error: null,
    });
    getSession.mockResolvedValueOnce({
      data: {
        session: { user: { id: "7fd2c338-fc8b-414f-9d47-47e0a50dfe3e" } },
      },
      error: null,
    });
    const { loginWithSupabase } = await import("./login-service");

    await loginWithSupabase(credentials, { router: { push, refresh } });

    expect(signInWithPassword).toHaveBeenCalledWith({
      email: "doctor.demo@nexsure.local",
      password: "password123",
    });
    expect(push).toHaveBeenCalledTimes(1);
    expect(push).toHaveBeenCalledWith("/dashboard");
    expect(signInWithPassword.mock.invocationCallOrder[0]).toBeLessThan(
      getSession.mock.invocationCallOrder[0],
    );
    expect(getSession.mock.invocationCallOrder[0]).toBeLessThan(push.mock.invocationCallOrder[0]);
  });

  it("rejects invalid credentials without creating an application session or redirecting", async () => {
    signInWithPassword.mockResolvedValueOnce({
      data: { user: null, session: null },
      error: { message: "Invalid login credentials" },
    });
    const { loginWithSupabase } = await import("./login-service");

    await expect(loginWithSupabase(credentials, { router: { push, refresh } })).rejects.toThrow(
      "LOGIN_FAILED",
    );
    expect(getSession).not.toHaveBeenCalled();
    expect(push).not.toHaveBeenCalled();
  });

  it("does not redirect when Supabase login returns without a durable browser session", async () => {
    signInWithPassword.mockResolvedValueOnce({
      data: {
        user: { id: "7fd2c338-fc8b-414f-9d47-47e0a50dfe3e" },
        session: null,
      },
      error: null,
    });
    getSession.mockResolvedValueOnce({ data: { session: null }, error: null });
    const { loginWithSupabase } = await import("./login-service");

    await expect(loginWithSupabase(credentials, { router: { push, refresh } })).rejects.toThrow(
      "SESSION_NOT_ESTABLISHED",
    );
    expect(push).not.toHaveBeenCalled();
  });
});
