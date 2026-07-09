import { NextResponse } from "next/server";
import { databaseService } from "@/services/database-service";

export async function GET() {
  const health = await databaseService.getHealth();
  const status = health.state === "connected" ? 200 : 503;

  return NextResponse.json(health, { status });
}
