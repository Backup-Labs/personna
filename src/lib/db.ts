import { MongoClient, type Db } from "mongodb";
import { ensureIndexes } from "@/server/db/indexes";
import { getEnvironment } from "@/lib/env";

declare global {
  var personnaMongoClient: Promise<MongoClient> | undefined;
  var personnaDatabase: Promise<Db> | undefined;
}

export async function getDatabase(): Promise<Db> {
  const env = getEnvironment();
  globalThis.personnaDatabase ??= (async () => {
    const client = await (globalThis.personnaMongoClient ??= new MongoClient(env.MONGODB_URI).connect());
    const db = client.db(env.MONGODB_DB);
    await ensureIndexes(db);
    return db;
  })();
  return globalThis.personnaDatabase;
}
