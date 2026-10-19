import { MongoClient, type Db } from "mongodb";
import { cache } from "react";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { ensureIndexes } from "@/server/db/indexes";
import { getEnvironment } from "@/lib/env";

declare global {
  var personnaMongoClient: Promise<MongoClient> | undefined;
  var personnaDatabase: Promise<Db> | undefined;
}

export async function getDatabase(): Promise<Db> {
  if (isCloudflareWorker()) return getWorkerDatabase();

  const env = getEnvironment();
  const clientPromise = globalThis.personnaMongoClient ??= new MongoClient(env.MONGODB_URI, {
      appName: "Personna",
      maxPoolSize: 20,
      serverSelectionTimeoutMS: 5_000,
      connectTimeoutMS: 10_000,
      socketTimeoutMS: 45_000,
    }).connect();
  const databasePromise = globalThis.personnaDatabase ??= clientPromise.then(async client => {
    const db = client.db(env.MONGODB_DB);
    await ensureIndexes(db);
    return db;
  });

  try {
    return await databasePromise;
  } catch (error) {
    // Do not leave a rejected connection/index promise cached for the lifetime
    // of the Node process. A transient Atlas/network failure can then recover
    // on the next request instead of breaking every subsequent page load.
    if (globalThis.personnaDatabase === databasePromise) globalThis.personnaDatabase = undefined;
    if (globalThis.personnaMongoClient === clientPromise) {
      globalThis.personnaMongoClient = undefined;
      void clientPromise.then(client => client.close()).catch(() => undefined);
    }
    throw error;
  }
}

export async function closeDatabase(): Promise<void> {
  const clientPromise = globalThis.personnaMongoClient;
  globalThis.personnaMongoClient = undefined;
  globalThis.personnaDatabase = undefined;
  if (clientPromise) {
    const client = await clientPromise.catch(() => null);
    if (client) await client.close();
  }
}

// Cloudflare Workers cannot safely reuse MongoDB sockets between requests.
// React's request cache lets Server Components share a client within the same
// render while keeping the connection scoped to that request.
const getWorkerDatabase = cache(async (): Promise<Db> => {
  const env = getEnvironment();
  const client = new MongoClient(env.MONGODB_URI, {
    appName: "Personna",
    maxPoolSize: 1,
    minPoolSize: 0,
    maxIdleTimeMS: 20_000,
    serverSelectionTimeoutMS: 5_000,
    connectTimeoutMS: 10_000,
    socketTimeoutMS: 45_000,
  });
  await client.connect();
  const db = client.db(env.MONGODB_DB);
  // Cloudflare creates a fresh client per invocation. Index creation is
  // deployment/setup work (also performed by db:seed), not request work.
  return db;
});

function isCloudflareWorker(): boolean {
  try {
    getCloudflareContext();
    return true;
  } catch {
    return false;
  }
}
