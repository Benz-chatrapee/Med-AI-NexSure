import { readFileSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const getAll = vi.fn(() => [{ name: "sb-session", value: "cookie-value" }]);
const set = vi.fn();
const createServerClientMock = vi.fn(() => ({
  auth: {
    getUser: vi.fn(),
  },
}));

vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => ({
    getAll,
    set,
  })),
}));

vi.mock("@supabase/ssr", () => ({
  createServerClient: createServerClientMock,
}));

describe("createSupabaseServerClient", () => {
  it("creates a cookie-aware request-scoped Supabase server client", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "public-anon-key");
    const { createSupabaseServerClient } = await import("./supabase-server");

    const result = await createSupabaseServerClient();

    expect(result.status).toBe("configured");
    expect(createServerClientMock).toHaveBeenCalledWith(
      "https://example.supabase.co",
      "public-anon-key",
      expect.objectContaining({
        cookies: expect.objectContaining({
          getAll: expect.any(Function),
          setAll: expect.any(Function),
        }),
      }),
    );

    const firstCall = createServerClientMock.mock.calls[0] as unknown as [
      string,
      string,
      {
        cookies: {
          getAll(): { name: string; value: string }[];
          setAll(cookiesToSet: { name: string; value: string; options?: object }[]): void;
        };
      },
    ];
    const options = firstCall[2];

    expect(options.cookies.getAll()).toEqual([{ name: "sb-session", value: "cookie-value" }]);
    options.cookies.setAll([{ name: "sb-session", value: "next-cookie" }]);
    expect(set).toHaveBeenCalledWith("sb-session", "next-cookie", undefined);
  });

  it("fails closed when Supabase server configuration is missing", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "public-anon-key");
    const { createSupabaseServerClient } = await import("./supabase-server");

    await expect(createSupabaseServerClient()).resolves.toEqual({
      status: "configuration_error",
      reason: "missing_supabase_url",
    });

    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "");

    await expect(createSupabaseServerClient()).resolves.toEqual({
      status: "configuration_error",
      reason: "missing_supabase_anon_key",
    });
  });

  it("does not expose privileged Supabase credentials from the server helper", () => {
    const source = readFileSync("lib/auth/supabase-server.ts", "utf8");

    expect(source).not.toContain("SUPABASE_SERVICE_ROLE");
    expect(source).not.toContain("service_role");
    expect(source).not.toContain("SECRET");
    expect(source).toContain("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  });
});
