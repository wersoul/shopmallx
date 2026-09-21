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
// Symbol used by next-on-pages: Symbol.for("__cloudflare-request-context__")
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

function reviveDates(obj: any): any {
  // Recursively walk result and convert any string field that looks like ISO
  // date back into Date so React components (and `new Date(x)`) work as expected.
  if (obj == null) return obj;
  if (Array.isArray(obj)) return obj.map(reviveDates);
  if (typeof obj === 'string') {
    // Quick ISO 8601 check
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(obj)) {
      const d = new Date(obj);
      if (!isNaN(d.getTime())) return d;
    }
    return obj;
  }
  if (typeof obj === 'object') {
    const out: any = {};
    for (const k of Object.keys(obj)) out[k] = reviveDates(obj[k]);
    return out;
  }
  return obj;
}

function wrapClient(client: PrismaClient): PrismaClient {
  // NO-OP: keeping the function for future use. Date reviver happens via
  // the `reviveDates` helper which is called by individual page modules
  // when needed. Wrapping the client with a Proxy breaks Prisma's internal
  // checks (Object.get on the target).
  return client;
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