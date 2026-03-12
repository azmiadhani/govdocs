import { Redis } from "ioredis";

let redisClient: Redis | null = null;

export function getRedis(): Redis {
  if (redisClient) return redisClient;

  const url = process.env.REDIS_URL;
  if (!url) throw new Error("REDIS_URL is not set");

  redisClient = new Redis(url, {
    maxRetriesPerRequest: 3,
    lazyConnect: true,
  });

  redisClient.on("error", (err) => {
    console.error("[Redis] Connection error:", err);
  });

  return redisClient;
}

export async function cacheGet<T>(key: string): Promise<T | null> {
  try {
    const redis = getRedis();
    const value = await redis.get(key);
    if (!value) return null;
    return JSON.parse(value) as T;
  } catch (err) {
    console.error("[Redis] cacheGet error:", err);
    return null;
  }
}

export async function cacheSet(
  key: string,
  value: unknown,
  ttlSeconds = 3600,
): Promise<void> {
  try {
    const redis = getRedis();
    await redis.set(key, JSON.stringify(value), "EX", ttlSeconds);
  } catch (err) {
    console.error("[Redis] cacheSet error:", err);
  }
}

export async function cacheDel(key: string): Promise<void> {
  try {
    const redis = getRedis();
    await redis.del(key);
  } catch (err) {
    console.error("[Redis] cacheDel error:", err);
  }
}

export async function cacheDelPattern(pattern: string): Promise<void> {
  try {
    const redis = getRedis();
    // Use SCAN instead of KEYS to avoid blocking the Redis event loop on large keyspaces
    let cursor = "0";
    const keys: string[] = [];
    do {
      const [nextCursor, found] = await redis.scan(
        cursor,
        "MATCH",
        pattern,
        "COUNT",
        100,
      );
      cursor = nextCursor;
      keys.push(...found);
    } while (cursor !== "0");
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch (err) {
    console.error("[Redis] cacheDelPattern error:", err);
  }
}

/**
 * Invalidate all caches related to the document list and optionally a specific document.
 * Call this after any create / update / delete / reindex operation on documents.
 *
 * @param docId - Optional document ID. When provided, also clears the per-document
 *                detail cache and its AI summary cache.
 * @param invalidateStats - Set to false to skip public stats cache invalidation (default: true).
 */
export async function invalidateDocumentCaches(
  docId?: string,
  invalidateStats = true,
): Promise<void> {
  const tasks: Promise<void>[] = [
    cacheDelPattern("docs:list:*"),
    cacheDelPattern("public:docs:list:*"),
    cacheDelPattern("smart-search:*"),
  ];

  if (docId) {
    tasks.push(cacheDel(`public:doc:${docId}`));
    tasks.push(cacheDel(`summary:${docId}`));
  }

  if (invalidateStats) {
    tasks.push(cacheDel("public:stats"));
  }

  await Promise.all(tasks);
}
