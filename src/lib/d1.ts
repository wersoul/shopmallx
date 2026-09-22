/**
 * Lightweight D1 binding wrapper. Replaces Prisma for Cloudflare Pages.
 *
 * Cloudflare Workers Free plan limits CPU time to 10ms/request, which Prisma
 * initialization can't fit in. Using D1's native prepared statement API is
 * dramatically faster (no client init, no schema validation) and runs well
 * inside the limit.
 */
import type { D1Database, D1PreparedStatement } from '@cloudflare/workers-types';

const CF_CONTEXT_SYMBOL = Symbol.for('__cloudflare-request-context__') as symbol;

function getD1(): D1Database | undefined {
  try {
    const ctx = (globalThis as any)[CF_CONTEXT_SYMBOL];
    if (ctx && typeof ctx === 'object') {
      return ctx?.env?.DB as D1Database | undefined;
    }
  } catch {
    // not on CF
  }
  return undefined;
}

/**
 * Get the R2 bucket binding (added when [[r2_buckets]] is configured in
 * wrangler.toml). Returns undefined when not running on Cloudflare Pages.
 */
type R2BucketLike = {
  put(key: string, value: ArrayBuffer | ArrayBufferView | Blob | string | ReadableStream | null, options?: { httpMetadata?: { contentType?: string }; customMetadata?: Record<string, string> }): Promise<any>;
  get(key: string): Promise<any>;
  delete(key: string): Promise<void>;
};

export function getR2(): R2BucketLike | undefined {
  try {
    const ctx = (globalThis as any)[CF_CONTEXT_SYMBOL];
    if (ctx && typeof ctx === 'object') {
      return ctx?.env?.R2 as R2BucketLike | undefined;
    }
  } catch {
    // not on CF
  }
  return undefined;
}

/**
 * Public base URL for R2 objects (configured as Pages secret R2_PUBLIC_BASE).
 * Falls back to a self-referencing `/api/r2/` proxy when no public host
 * is configured. The proxy route streams the object from R2 via the binding,
 * so uploaded images still display even before you wire up a public hostname.
 */
export function getR2PublicBase(): string {
  try {
    const ctx = (globalThis as any)[CF_CONTEXT_SYMBOL];
    if (ctx && typeof ctx === 'object' && ctx?.env?.R2_PUBLIC_BASE) {
      return String(ctx.env.R2_PUBLIC_BASE).replace(/\/+$/, '');
    }
  } catch {}
  // Fallback: build from the request's origin so URLs work both locally
  // and in production. Stored in a global by the proxy route at request time.
  try {
    const o: string | undefined = (globalThis as any).__shopmallxRequestOrigin;
    if (o) return `${o.replace(/\/+$/, '')}/api/r2`;
  } catch {}
  return '';
}

/**
 * The Next.js edge runtime makes the request URL available via the standard
 * Request global in route handlers, but `r2.ts` runs in helpers that don't
 * always have direct access. Each route should call `setRequestOrigin(url)`
 * once at the top so the upload helper can build proxy URLs.
 */
export function setRequestOrigin(origin: string): void {
  try {
    (globalThis as any).__shopmallxRequestOrigin = String(origin || '').replace(/\/+$/, '');
  } catch {}
}

/**
 * Run a SELECT and return all rows. Use `?` for placeholders.
 */
export async function d1All<T = any>(
  sql: string,
  binds: any[] = []
): Promise<T[]> {
  const db = getD1();
  if (!db) throw new Error('D1 binding not available');
  let stmt: D1PreparedStatement = db.prepare(sql);
  if (binds.length) stmt = stmt.bind(...binds);
  const res = await stmt.all<T>();
  return (res.results || []) as T[];
}

/**
 * Run a SELECT and return the first row, or null.
 */
export async function d1First<T = any>(
  sql: string,
  binds: any[] = []
): Promise<T | null> {
  const db = getD1();
  if (!db) throw new Error('D1 binding not available');
  let stmt: D1PreparedStatement = db.prepare(sql);
  if (binds.length) stmt = stmt.bind(...binds);
  const res = await stmt.first<T>();
  return (res as T | null) ?? null;
}

/**
 * Run an INSERT/UPDATE/DELETE and return meta info.
 */
export async function d1Run(
  sql: string,
  binds: any[] = []
): Promise<{ changes: number; lastRowId: number }> {
  const db = getD1();
  if (!db) throw new Error('D1 binding not available');
  let stmt: D1PreparedStatement = db.prepare(sql);
  if (binds.length) stmt = stmt.bind(...binds);
  const res = await stmt.run();
  return { changes: res.meta?.changes ?? 0, lastRowId: res.meta?.last_row_id ?? 0 };
}

/**
 * Serialize Date and BigInt values into JSON-safe primitives, like Prisma's
 * `serialize()` helper.
 */
export function serialize<T = any>(input: T): T {
  if (input == null) return input;
  if (input instanceof Date) return input.toISOString() as any;
  if (typeof input === 'bigint') return input.toString() as any;
  if (Array.isArray(input)) return input.map(serialize) as any;
  if (typeof input === 'object') {
    const ctor = (input as any).constructor?.name;
    if (ctor && /^(Buffer|Stream|Readable)/.test(ctor)) return input;
    const out: any = {};
    for (const k of Object.keys(input as object)) out[k] = serialize((input as any)[k]);
    return out;
  }
  return input;
}