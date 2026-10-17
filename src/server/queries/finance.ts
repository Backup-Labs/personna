import type { Db, ObjectId } from "mongodb";
import type { AccountDocument, TransactionDocument } from "@/server/db/collections";

export async function getAccountBalances(db: Db, userId: ObjectId, accounts: AccountDocument[]): Promise<Map<string, number>> {
  const totals = await db.collection<TransactionDocument>("transactions").aggregate<{ _id: ObjectId; total: number }>([
    { $match: { userId, deletedAt: null, type: { $in: ["INCOME", "EXPENSE"] } } },
    { $group: { _id: "$accountId", total: { $sum: { $multiply: ["$amountMinor", { $cond: [{ $eq: ["$type", "INCOME"] }, 1, -1] }] } } } },
  ]).toArray();
  const byId = new Map(totals.map(row => [row._id.toHexString(), row.total]));
  return new Map(accounts.map(account => [account._id!.toHexString(), account.openingBalanceMinor + (byId.get(account._id!.toHexString()) ?? 0)]));
}
