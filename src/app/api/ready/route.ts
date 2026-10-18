import { NextResponse } from "next/server";
import { getDatabase } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const db = await getDatabase();
    await db.command({ ping: 1 });
    return NextResponse.json({ status: "ready" }, { headers: { "cache-control": "no-store" } });
  } catch {
    return NextResponse.json({ status: "not_ready" }, { status: 503, headers: { "cache-control": "no-store" } });
  }
}
