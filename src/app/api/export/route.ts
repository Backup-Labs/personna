import { NextResponse } from "next/server";
import { getDatabase } from "@/lib/db";
import { requireUserId } from "@/server/authenticated-user";
import { AuthenticationRequiredError } from "@/server/authenticated-user";

export const runtime = "nodejs";
const collections = ["settings", "tasks", "projects", "goals", "notes", "timeBlocks", "timeEntries", "accounts", "categories", "transactions", "budgets", "savingsGoals", "debts", "habits", "habitLogs", "learningItems", "reviews"] as const;
const csvEscape = (value: unknown) => `"${String(value ?? "").replace(/"/g, '""')}"`;

export async function GET(request: Request) {
  try {
    const userId = await requireUserId(); const db = await getDatabase(); const format = new URL(request.url).searchParams.get("format");
    if (format === "csv") {
      const rows = await db.collection("transactions").find({ userId, deletedAt: null }).sort({ occurredAt: -1 }).toArray();
      const csv = ["date,type,amountMinor,currency,note,accountId", ...rows.map(row => [row.occurredAt, row.type, row.amountMinor, row.currency, row.note, row.accountId].map(csvEscape).join(","))].join("\r\n");
      return new Response(csv, { headers: { "content-type": "text/csv; charset=utf-8", "content-disposition": 'attachment; filename="personna-transactions.csv"', "cache-control": "private, no-store" } });
    }
    if (format !== "json") return NextResponse.json({ error: "Set format=json or format=csv." }, { status: 400 });
    const result: Record<string, unknown[]> = {};
    for (const collection of collections) result[collection] = await db.collection(collection).find({ userId, deletedAt: null }).limit(50_000).toArray();
    return new Response(JSON.stringify({ exportedAt: new Date().toISOString(), data: result }), { headers: { "content-type": "application/json; charset=utf-8", "content-disposition": 'attachment; filename="personna-backup.json"', "cache-control": "private, no-store" } });
  } catch (error) {
    if (error instanceof AuthenticationRequiredError) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    return NextResponse.json({ error: "Export could not be completed." }, { status: 500 });
  }
}
