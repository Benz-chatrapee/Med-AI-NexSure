import { describe, expect, it, vi } from "vitest";

const createBrowserClientMock = vi.fn(() => ({
  auth: {
    signInWithPassword: vi.fn(),
  },
}));

vi.mock("@supabase/ssr", () => ({
  createBrowserClient: createBrowserClientMock,
}));

describe("createSupabaseBrowserClient", () => {
  it("creates the Supabase SSR browser client so login sessions persist to server-readable cookies", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "http://127.0.0.1:54321");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "local-anon-key");
    const { createSupabaseBrowserClient } = await import("./supabase-browser");

    const client = createSupabaseBrowserClient();

    expect(client).not.toBeNull();
    expect(createBrowserClientMock).toHaveBeenCalledWith(
      "http://127.0.0.1:54321",
      "local-anon-key",
      expect.objectContaining({
        auth: expect.objectContaining({
          autoRefreshToken: true,
          detectSessionInUrl: true,
          flowType: "pkce",
          persistSession: true,
        }),
      }),
    );
  });

  it("does not expose or use service-role credentials in the browser helper", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "http://127.0.0.1:54321");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "local-anon-key");
    const source = await import("./supabase-browser");

    expect(source.createSupabaseBrowserClient()).not.toBeNull();
    expect(JSON.stringify(createBrowserClientMock.mock.calls)).not.toContain("service_role");
    expect(JSON.stringify(createBrowserClientMock.mock.calls)).not.toContain("SUPABASE_SERVICE_ROLE");
  });
});
