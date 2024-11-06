// app/api/aggregated-results/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getAggregatedResults } from "@/lib/data";
import { verifyApiToken } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const apiToken = req.headers.get("api-token");

  if (!apiToken) {
    return NextResponse.json(
      { error: "API token is missing" },
      { status: 401 }
    );
  }

  const user = await verifyApiToken(apiToken);

  if (!user) {
    return NextResponse.json({ error: "Invalid API token" }, { status: 401 });
  }

  const results = await getAggregatedResults(user.id);

  return NextResponse.json({ results }, { status: 200 });
}
