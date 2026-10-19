import nextEnv from "@next/env";
import { MongoClient } from "mongodb";

const { loadEnvConfig } = nextEnv;
loadEnvConfig(process.cwd());

const uri = process.env.MONGODB_URI;
const databaseName = process.env.MONGODB_DB || "personna";

if (!uri) {
  console.error("MongoDB connectivity check failed: MONGODB_URI is not configured.");
  process.exitCode = 1;
} else {
  const client = new MongoClient(uri, {
    appName: "Personna connectivity check",
    serverSelectionTimeoutMS: 8_000,
    connectTimeoutMS: 8_000,
  });

  try {
    await client.connect();
    const result = await client.db(databaseName).command({ ping: 1 });
    if (result.ok !== 1) throw new Error("Ping command did not return success.");
    console.log("MongoDB connection and ping succeeded. Connection details were not printed.");
  } catch {
    console.error("MongoDB connectivity check failed. Check the URI, credentials, and database network access rules.");
    process.exitCode = 1;
  } finally {
    await client.close().catch(() => {});
  }
}
