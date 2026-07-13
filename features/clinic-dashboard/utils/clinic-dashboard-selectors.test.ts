import { describe, expect, test } from "vitest";

import { clinicDashboardMock } from "../data/clinic-dashboard.mock";
import { buildAlertAuditPayload, getClinicDashboard } from "../services/clinic-dashboard-service";
import type { ClinicDashboardFilters } from "../types/clinic-dashboard.types";
import { filterQueue, sortQueue } from "./clinic-dashboard-selectors";

const baseFilters: ClinicDashboardFilters = clinicDashboardMock.filters;

describe("clinic dashboard queue selectors", () => {
  test("filters queue by department, status, risk and active clinic flow stage", () => {
    const filters: ClinicDashboardFilters = {
      ...baseFilters,
      department: "General Medicine",
      visitStatus: "Waiting",
      riskLevel: "Medium",
    };

    const result = filterQueue(clinicDashboardMock.queue, filters, "", "Waiting");

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      hn: "HN-02841",
      department: "General Medicine",
      visitStatus: "Waiting",
      clinicalRisk: "Medium",
    });
  });

  test("searches queue by HN case-insensitively", () => {
    const result = filterQueue(clinicDashboardMock.queue, baseFilters, "hn-05917", "all");

    expect(result).toHaveLength(1);
    expect(result[0].patientName).toBe("Arisa M.");
  });

  test("sorts queue by urgency, wait time and patient name", () => {
    expect(sortQueue(clinicDashboardMock.queue, "urgency")[0].id).toBe("VIS-2845");
    expect(sortQueue(clinicDashboardMock.queue, "wait")[0].id).toBe("VIS-2841");
    expect(sortQueue(clinicDashboardMock.queue, "name")[0].patientName).toBe("Arisa M.");
  });
});

describe("clinic dashboard audit payloads", () => {
  test("builds an alert acknowledgement audit payload with before and after state", () => {
    const payload = buildAlertAuditPayload("ALT-1", "Benz Manager");

    expect(payload).toMatchObject({
      module: "clinic_dashboard",
      action: "alert_acknowledged",
      entityId: "ALT-1",
      actor: "Benz Manager",
      reason: "Dashboard alert reviewed by authorized staff.",
      before: { acknowledged: false },
      after: { acknowledged: true },
    });
    expect(Date.parse(payload.timestamp)).not.toBeNaN();
  });
});

describe("clinic dashboard mock service", () => {
  test("returns deterministic mock data with requested filters reflected in the response", async () => {
    const dashboard = await getClinicDashboard({
      department: "Orthopedics",
      riskLevel: "High",
    });

    expect(dashboard.filters.department).toBe("Orthopedics");
    expect(dashboard.filters.riskLevel).toBe("High");
    expect(clinicDashboardMock.filters.department).toBe("all");
  });
});
