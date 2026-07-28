import { readFileSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";
import type { ServerSessionContextClient } from "./server-session-context";

vi.mock("server-only", () => ({}));

type TableName =
  | "user_profiles"
  | "organization_memberships"
  | "clinic_memberships"
  | "user_role_assignments";

type QueryRow = Record<string, unknown>;

class MockQuery {
  readonly calls: string[] = [];

  constructor(
    private readonly row: QueryRow | null,
    private readonly rows: QueryRow[] | null,
    private readonly error: { message: string } | null = null,
  ) {}

  select(columns?: string) {
    this.calls.push(`select:${columns ?? ""}`);
    return this;
  }

  eq(column: string, value: string | boolean) {
    this.calls.push(`eq:${column}:${String(value)}`);
    return this;
  }

  is(column: string, value: null) {
    this.calls.push(`is:${column}:${String(value)}`);
    return this;
  }

  in(column: string, values: string[]) {
    this.calls.push(`in:${column}:${values.join(",")}`);
    return this;
  }

  or(filters: string) {
    this.calls.push(`or:${filters}`);
    return this;
  }

  async maybeSingle() {
    return { data: this.row, error: this.error };
  }

  async returns() {
    return { data: this.rows, error: this.error };
  }
}

function createClientFixture(options?: {
  authUserId?: string | null;
  profile?: QueryRow | null;
  organizations?: QueryRow[] | null;
  clinics?: QueryRow[] | null;
  roles?: QueryRow[] | null;
  authError?: boolean;
}) {
  const profile: QueryRow | null =
    options && "profile" in options
      ? (options.profile ?? null)
      : {
          id: "profile-auth-user",
          organization_id: "org-a",
          primary_clinic_id: "clinic-a",
          is_active: true,
          deleted_at: null,
        };
  const queries: Partial<Record<TableName, MockQuery>> = {
    user_profiles: new MockQuery(profile, null),
    organization_memberships: new MockQuery(
      null,
      options?.organizations ?? [
        {
          organization_id: "org-a",
          is_active: true,
          membership_status: "active",
          deleted_at: null,
        },
      ],
    ),
    clinic_memberships: new MockQuery(
      null,
      options?.clinics ?? [
        {
          organization_id: "org-a",
          clinic_id: "clinic-a",
          is_active: true,
          membership_status: "active",
          deleted_at: null,
        },
      ],
    ),
    user_role_assignments: new MockQuery(
      null,
      options?.roles ?? [
        {
          organization_id: "org-a",
          clinic_id: "clinic-a",
          is_active: true,
          assignment_status: "active",
          revoked_at: null,
          expires_at: null,
          roles: {
            name: "doctor",
            role_permissions: [
              {
                permissions: {
                  permission_key: "patient.view",
                },
              },
              {
                permissions: {
                  permission_key: "visit.view",
                },
              },
              {
                permissions: {
                  permission_key: "claim.read",
                },
              },
              {
                permissions: {
                  permission_key: "claim.clinical.read",
                },
              },
              {
                permissions: {
                  permission_key: "claim.evidence.read",
                },
              },
              {
                permissions: {
                  permission_key: "claim.medical_coding.read",
                },
              },
            ],
          },
        },
      ],
    ),
  };
  const from = vi.fn((table: TableName) => queries[table]);
  const client = {
    auth: {
      getUser: vi.fn(async () => ({
        data: {
          user: options?.authUserId === null ? null : { id: options?.authUserId ?? "auth-user" },
        },
        error: options?.authError ? { message: "invalid jwt" } : null,
      })),
    },
    from,
  } as unknown as ServerSessionContextClient;

  return { client, from, queries };
}

describe("resolveServerSessionContext", () => {
  it("returns trusted server-derived context for an authenticated session", async () => {
    const { resolveServerSessionContext } = await import("./server-session-context");
    const { client } = createClientFixture();

    const result = await resolveServerSessionContext({ client });

    expect(result.status).toBe("authenticated");
    if (result.status !== "authenticated") {
      throw new Error("expected authenticated context");
    }
    expect(result.context).toMatchObject({
      authUserId: "auth-user",
      profileId: "profile-auth-user",
      activeOrganizationId: "org-a",
      activeClinicId: "clinic-a",
      authorizedOrganizationIds: ["org-a"],
      authorizedClinicIds: ["clinic-a"],
      roles: ["doctor"],
      permissions: [
        "patient.view",
        "visit.view",
        "claim.read",
        "claim.clinical.read",
        "claim.evidence.read",
        "claim.medical_coding.read",
      ],
      sessionState: "authenticated",
    });
  });

  it("resolves the canonical Batch E doctor auth UID from trusted Supabase session state", async () => {
    const { resolveServerSessionContext } = await import("./server-session-context");
    const canonicalDoctorAuthUserId = "7fd2c338-fc8b-414f-9d47-47e0a50dfe3e";
    const { client } = createClientFixture({
      authUserId: canonicalDoctorAuthUserId,
      profile: {
        id: canonicalDoctorAuthUserId,
        organization_id: "org-a",
        primary_clinic_id: "clinic-a",
        is_active: true,
        deleted_at: null,
      },
    });

    const result = await resolveServerSessionContext({ client });

    expect(result.status).toBe("authenticated");
    if (result.status !== "authenticated") {
      throw new Error("expected authenticated context");
    }
    expect(result.context.authUserId).toBe(canonicalDoctorAuthUserId);
    expect(result.context.profileId).toBe(canonicalDoctorAuthUserId);
  });

  it("returns unauthenticated and performs no domain query when no session exists", async () => {
    const { resolveServerSessionContext } = await import("./server-session-context");
    const { client, from } = createClientFixture({ authUserId: null });

    await expect(resolveServerSessionContext({ client })).resolves.toEqual({
      status: "unauthenticated",
      reason: "missing_or_invalid_session",
    });
    expect(from).not.toHaveBeenCalled();
  });

  it("fails closed for invalid or expired authenticated evidence", async () => {
    const { resolveServerSessionContext } = await import("./server-session-context");
    const invalid = createClientFixture({ authError: true });

    await expect(resolveServerSessionContext({ client: invalid.client })).resolves.toEqual({
      status: "unauthenticated",
      reason: "missing_or_invalid_session",
    });

    const expired = createClientFixture({
      roles: [
        {
          organization_id: "org-a",
          clinic_id: "clinic-a",
          is_active: true,
          assignment_status: "active",
          revoked_at: null,
          expires_at: "2026-01-01T00:00:00.000Z",
          roles: { name: "doctor", role_permissions: [] },
        },
      ],
    });

    await expect(
      resolveServerSessionContext({
        client: expired.client,
        now: new Date("2026-07-27T00:00:00.000Z"),
      }),
    ).resolves.toEqual({
      status: "session_expired",
      reason: "expired_role_assignment",
    });
  });

  it("propagates authenticated identity and ignores client-supplied user identity", async () => {
    const { resolveServerSessionContext } = await import("./server-session-context");
    const { client, queries } = createClientFixture();

    const result = await resolveServerSessionContext({
      client,
      requestedScope: {
        userId: "spoofed-user",
        role: "Admin",
        permissions: ["admin:*"],
      },
    });

    expect(result.status).toBe("authenticated");
    expect(queries.user_profiles?.calls).toContain("eq:id:auth-user");
    expect(JSON.stringify(result)).not.toContain("spoofed-user");
    expect(JSON.stringify(result)).not.toContain("admin:*");
  });

  it("rejects requested organization outside trusted memberships", async () => {
    const { resolveServerSessionContext } = await import("./server-session-context");
    const { client, from } = createClientFixture();

    await expect(
      resolveServerSessionContext({
        client,
        requestedScope: { organizationId: "org-b" },
      }),
    ).resolves.toEqual({
      status: "forbidden",
      reason: "unauthorized_organization",
    });
    expect(from).not.toHaveBeenCalledWith("clinic_memberships");
  });

  it("rejects requested clinic outside trusted clinic memberships", async () => {
    const { resolveServerSessionContext } = await import("./server-session-context");
    const { client, from } = createClientFixture();

    await expect(
      resolveServerSessionContext({
        client,
        requestedScope: { organizationId: "org-a", clinicId: "clinic-b" },
      }),
    ).resolves.toEqual({
      status: "forbidden",
      reason: "unauthorized_clinic",
    });
    expect(from).not.toHaveBeenCalledWith("user_role_assignments");
  });

  it("returns forbidden when the authenticated user has no active profile", async () => {
    const { resolveServerSessionContext } = await import("./server-session-context");
    const { client } = createClientFixture({ profile: null });

    await expect(resolveServerSessionContext({ client })).resolves.toEqual({
      status: "forbidden",
      reason: "missing_or_inactive_profile",
    });
  });

  it("does not serialize raw tokens or privileged credentials in context output", async () => {
    const { resolveServerSessionContext } = await import("./server-session-context");
    const { client } = createClientFixture();

    const result = await resolveServerSessionContext({ client });
    const serialized = JSON.stringify(result);

    expect(serialized).not.toContain("service_role");
    expect(serialized).not.toContain("SECRET");
    expect(serialized).not.toContain("access_token");
    expect(readFileSync("lib/auth/server-session-context.ts", "utf8")).not.toContain(
      "SUPABASE_SERVICE_ROLE",
    );
  });
});
