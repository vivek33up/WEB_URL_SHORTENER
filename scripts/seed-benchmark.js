import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { db } from "../db/index.js";
import { usersTable } from "../models/user.model.js";
import { urlsTable } from "../models/url.model.js";

const TOTAL_URLS = 10_000;
const BATCH_SIZE = 1_000;
const benchmarkEmail = "benchmark@example.com";

// Reuse the benchmark user if this script was run before.
let [user] = await db
  .select({ id: usersTable.id })
  .from(usersTable)
  .where(eq(usersTable.email, benchmarkEmail));

if (!user) {
  [user] = await db
    .insert(usersTable)
    .values({
      firstname: "Benchmark",
      lastname: "User",
      email: benchmarkEmail,
      password: "not-used-for-benchmarking",
      salt: "not-used-for-benchmarking",
    })
    .returning({ id: usersTable.id });
}

// This is the route you will test with Autocannon.
const [existingBenchmarkUrl] = await db
  .select({ id: urlsTable.id })
  .from(urlsTable)
  .where(eq(urlsTable.shortCode, "benchmark"));

if (!existingBenchmarkUrl) {
  await db.insert(urlsTable).values({
    shortCode: "benchmark",
    targetUrl: "https://example.com",
    userId: user.id,
  });
}

// Insert the remaining URLs in batches.
for (let start = 0; start < TOTAL_URLS; start += BATCH_SIZE) {
  const size = Math.min(BATCH_SIZE, TOTAL_URLS - start);

  const urls = Array.from({ length: size }, () => ({
    shortCode: nanoid(10),
    targetUrl: `https://example.com/${nanoid(12)}`,
    userId: user.id,
  }));

  await db.insert(urlsTable).values(urls);
  console.log(`Inserted ${start + size}/${TOTAL_URLS} URLs`);
}

console.log("Benchmark data seeded successfully.");
process.exit(0);