import { NextResponse } from "next/server";
import { executiveDashboardService } from "@/features/executive-dashboard/server/service";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const response = await executiveDashboardService.getDashboard(
    Object.fromEntries(searchParams.entries()),
  );

  return NextResponse.json(response, {
    status: response.success ? 200 : statusForError(response.error.code),
  });
}

function statusForError(code: string) {
  if (code === "VALIDATION_ERROR") return 400;
  if (code === "FORBIDDEN" || code === "TENANT_SCOPE_MISMATCH") return 403;
  return 500;
}
