import { describe, expect, it } from "vitest";

import {
  createCoreFoundationService,
  sanitizeCoreFoundationError,
  type CoreFoundationClient,
  type CoreFoundationDbError,
} from "./core-foundation-service";

type FakeQueryResult<T> = {
  data: T[] | null;
  error: CoreFoundationDbError | null;
};

type FakeSingleResult<T> = {
  data: T | null;
  error: CoreFoundationDbError | null;
};

describe("coreFoundationService", () => {
  it("maps visible Core Foundation rows into clinic users without raw audit metadata", async () => {
    const service = createCoreFoundationService(
      createFakeClient({
        user_profiles: [
          {
            id: "profile-1",
            organization_id: "org-1",
            primary_clinic_id: "clinic-1",
            display_name: "Dr. Mali S.",
            email: "mali@example.test",
            job_title: "Physician",
            department: "General Medicine",
            is_active: true,
            created_at: "2026-07-01T00:00:00.000Z",
            updated_at: "2026-07-02T00:00:00.000Z",
          },
        ],
        clinics: [
          {
            id: "clinic-1",
            organization_id: "org-1",
            name: "Bangkok CIC",
            code: "BKK",
            clinic_type: "clinical",
            lifecycle_status: "active",
            is_active: true,
            updated_at: "2026-07-02T00:00:00.000Z",
          },
        ],
        roles: [
          {
            id: "role-doctor",
            organization_id: "org-1",
            name: "doctor",
            description: "Doctor",
            is_system_role: true,
          },
        ],
        user_role_assignments: [
          {
            id: "assignment-1",
            organization_id: "org-1",
            clinic_id: "clinic-1",
            user_profile_id: "profile-1",
            role_id: "role-doctor",
            assignment_status: "active",
            assignment_reason: "Initial grant",
            assigned_at: "2026-07-03T00:00:00.000Z",
            expires_at: null,
            revoked_at: null,
          },
        ],
        audit_logs: [
          {
            id: "audit-1",
            actor_profile_id: "profile-admin",
            event_type: "role.assigned",
            resource_type: "user_role_assignment",
            resource_id: "assignment-1",
            reason: "Initial grant",
            outcome: "success",
            occurred_at: "2026-07-03T00:00:00.000Z",
            correlation_id: "corr-1",
          },
        ],
      }),
    );

    const users = await service.listClinicUsers();

    expect(users[0]).toMatchObject({
      id: "profile-1",
      fullName: "Dr. Mali S.",
      email: "mali@example.test",
      primaryRole: "doctor",
      clinicScopes: [{ clinicId: "clinic-1", clinicName: "Bangkok CIC" }],
      auditTrail: [
        {
          id: "audit-1",
          event: "role.assigned",
          reason: "Initial grant",
        },
      ],
    });
    expect(JSON.stringify(users[0].auditTrail)).not.toContain("metadata");
  });

  it("uses controlled role assignment and revocation RPCs", async () => {
    const calls: Array<{ fn: string; args: Record<string, unknown> }> = [];
    const service = createCoreFoundationService(createFakeClient({}, calls));

    await service.assignRole({
      organizationId: "org-1",
      clinicId: "clinic-1",
      targetProfileId: "profile-1",
      roleId: "role-doctor",
      reason: "Approved access review",
    });

    await service.revokeRoleAssignment({
      assignmentId: "assignment-1",
      reason: "Access no longer required",
    });

    expect(calls).toEqual([
      {
        fn: "assign_role",
        args: {
          p_organization_id: "org-1",
          p_clinic_id: "clinic-1",
          p_target_profile_id: "profile-1",
          p_role_id: "role-doctor",
          p_reason: "Approved access review",
        },
      },
      {
        fn: "revoke_role_assignment",
        args: {
          p_assignment_id: "assignment-1",
          p_reason: "Access no longer required",
        },
      },
    ]);
  });

  it("sanitizes RLS and permission failures", () => {
    expect(
      sanitizeCoreFoundationError({
        code: "42501",
        message: "new row violates row-level security policy",
      }),
    ).toContain("permission");
  });
});

function createFakeClient(
  rows: Record<string, unknown[]> = {},
  rpcCalls: Array<{ fn: string; args: Record<string, unknown> }> = [],
): CoreFoundationClient {
  return {
    from<T = unknown>(table: string) {
      return {
        select() {
          const tableRows = (rows[table] ?? []) as T[];

          const query = {
            order() {
              return query;
            },

            limit() {
              return query;
            },

            eq() {
              return query;
            },

            single(): PromiseLike<FakeSingleResult<T>> {
              const row = tableRows[0] ?? null;

              return Promise.resolve({
                data: row,
                error: row
                  ? null
                  : {
                      code: "PGRST116",
                      message: "Not found",
                    },
              });
            },

            then<TResult1 = FakeQueryResult<T>, TResult2 = never>(
              onfulfilled?:
                | ((
                    value: FakeQueryResult<T>,
                  ) => TResult1 | PromiseLike<TResult1>)
                | null,
              onrejected?:
                | ((
                    reason: unknown,
                  ) => TResult2 | PromiseLike<TResult2>)
                | null,
            ): PromiseLike<TResult1 | TResult2> {
              return Promise.resolve<FakeQueryResult<T>>({
                data: tableRows,
                error: null,
              }).then(onfulfilled, onrejected);
            },
          };

          return query;
        },
      };
    },

    rpc<T = unknown>(
      fn: string,
      args: Record<string, unknown>,
    ): PromiseLike<{
      data: T | null;
      error: CoreFoundationDbError | null;
    }> {
      rpcCalls.push({ fn, args });

      return Promise.resolve({
        data: `${fn}-audit-id` as T,
        error: null,
      });
    },
  };
}