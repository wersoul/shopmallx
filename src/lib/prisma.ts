import { PrismaClient } from '@prisma/client';
import { PrismaD1 } from '@prisma/adapter-d1';

const globalForPrisma = global as unknown as {
  prisma?: PrismaClient;
  initPromise?: Promise<PrismaClient>;
};

if (!globalForPrisma.prisma) {
  globalForPrisma.prisma = new PrismaClient();
}

// On Cloudflare Pages, the request context is set on globalThis under a known
// Symbol right before each handler runs. We can grab it directly without
// importing @cloudflare/next-on-pages (which has 'server-only').
const CF_CONTEXT_SYMBOL = Symbol.for('__cloudflare-request-context__') as symbol;

function getD1FromContext(): any | undefined {
  try {
    const ctx = (globalThis as any)[CF_CONTEXT_SYMBOL];
    if (ctx && typeof ctx === 'object') {
      return ctx?.env?.DB;
    }
  } catch {
    // not on CF
  }
  return undefined;
}

/**
 * Recursively convert Date objects into ISO strings so they can be safely
 * passed from Server Component → Client Component (RSC serialization only
 * supports plain serializable values). Also revive ISO date strings back
 * into Date so server templates can keep using `new Date(x)` etc.
 */
export function serialize<T = any>(input: T): T {
  if (input == null) return input;
  if (input instanceof Date) return input.toISOString() as any;
  if (Array.isArray(input)) return input.map(serialize) as any;
  if (typeof input === 'string') {
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(input)) {
      const d = new Date(input);
      if (!isNaN(d.getTime())) return d as any;
    }
    return input;
  }
  if (typeof input === 'object') {
    const out: any = {};
    for (const k of Object.keys(input as object)) out[k] = serialize((input as any)[k]);
    return out;
  }
  return input;
}

/**
 * Wrap the Prisma client with a Proxy that auto-serializes every query
 * result so Date → ISO string before it leaves the server. This way
 * server pages don't have to manually call `serialize()`.
 *
 * Important: We only intercept `get` (property access), not `has`/`apply`/etc.
 * Prisma uses internal `Object.hasOwnProperty.call(...)` checks which would
 * trip if we returned non-objects. We return a Promise of serialized data
 * from each method call.
 */
function wrapClient(client: PrismaClient): PrismaClient {
  return new Proxy(client as any, {
    get(target, prop, receiver) {
      const val = Reflect.get(target, prop, receiver);
      if (typeof prop === 'symbol' || typeof val !== 'function') {
        return val;
      }
      // If the value is a model namespace (e.g. target.user, target.product),
      // wrap each method inside it.
      if (/^[a-z]/.test(String(prop)) && !String(prop).startsWith('$') && !String(prop).startsWith('_')) {
        // Heuristic: model accessors are camelCase and not $-prefixed.
        // Don't wrap non-model methods like $connect/$disconnect/$queryRaw.
        // Check by trying to detect this is a model proxy by looking for findMany.
        if (typeof (val as any).findMany === 'function' || typeof (val as any).create === 'function') {
          return new Proxy(val, {
            get(modelTarget, modelProp, modelReceiver) {
              const method = Reflect.get(modelTarget, modelProp, modelReceiver);
              if (typeof method !== 'function') return method;
              // Wrap method calls so any returned object is serialized.
              return new Proxy(method, {
                apply(fn, thisArg, args) {
                  const out = Reflect.apply(fn, thisArg, args);
                  if (out && typeof (out as any).then === 'function') {
                    return (out as Promise<any>).then(serialize);
                  }
                  return serialize(out);
                }
              });
            }
          });
        }
      }
      // Top-level methods like $transaction, $connect, etc. — just return as-is.
      return val;
    }
  });
}

// Upgrade the singleton to a D1-bound client if running on Cloudflare.
// Returns the live PrismaClient.
export async function ensurePrisma(): Promise<PrismaClient> {
  // If we already have a D1-bound client, return it.
  if (globalForPrisma.prisma && (globalForPrisma.prisma as any)._d1Bound) {
    return globalForPrisma.prisma;
  }
  // De-dupe concurrent initialization (multiple parallel handlers can race).
  if (globalForPrisma.initPromise) {
    return globalForPrisma.initPromise;
  }
  globalForPrisma.initPromise = (async () => {
    const d1 = getD1FromContext();
    if (d1) {
      const adapter = new PrismaD1(d1);
      const client = new PrismaClient({ adapter });
      (client as any)._d1Bound = true;
      globalForPrisma.prisma = wrapClient(client);
    }
    return globalForPrisma.prisma!;
  })();
  try {
    return await globalForPrisma.initPromise;
  } finally {
    // Don't reset initPromise — once D1-bound, always D1-bound.
  }
}

// Legacy export. Keep it returning the local client so that existing
// `prisma.user.findMany(...)` calls continue to work in local dev. On
// Cloudflare, call `await ensurePrisma()` first to get the D1-bound client.
export const prisma: PrismaClient = globalForPrisma.prisma!;