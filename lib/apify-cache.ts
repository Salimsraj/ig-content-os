import fs from "fs";
import path from "path";

const CACHE_DIR = path.join(process.cwd(), "data", "cache");
const ONE_HOUR_MS = 60 * 60 * 1000;

function cacheFile(name: string) {
  return path.join(CACHE_DIR, `${name}.json`);
}

function readCacheStore(name: string): Record<string, { fetchedAt: number; data: unknown }> {
  try {
    return JSON.parse(fs.readFileSync(cacheFile(name), "utf-8"));
  } catch {
    return {};
  }
}

function writeCacheStore(name: string, store: Record<string, { fetchedAt: number; data: unknown }>) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
  fs.writeFileSync(cacheFile(name), JSON.stringify(store, null, 2), "utf-8");
}

// Returns cached data for `key` if it's younger than `ttlMs` (default 1 hour),
// otherwise null. Used to avoid re-running paid Apify scrapes on every page
// load / tab switch for the same keyword or account.
export function getCached<T>(storeName: string, key: string, ttlMs = ONE_HOUR_MS): T | null {
  const store = readCacheStore(storeName);
  const entry = store[key];
  if (!entry) return null;
  if (Date.now() - entry.fetchedAt > ttlMs) return null;
  return entry.data as T;
}

export function setCached(storeName: string, key: string, data: unknown) {
  const store = readCacheStore(storeName);
  store[key] = { fetchedAt: Date.now(), data };
  writeCacheStore(storeName, store);
}
