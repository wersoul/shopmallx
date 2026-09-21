import { PrismaClient } from '@prisma/client';
import { PrismaD1 } from '@prisma/adapter-d1';

const globalForPrisma = global as unknown as { prisma?: PrismaClient };

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

// Upgrade the singleton to a D1-bound client if running on Cloudflare.
// Returns the live PrismaClient.
export async function ensurePrisma(): Promise<PrismaClient> {
  const d1 = getD1FromContext();
  if (d1) {
    const adapter = new PrismaD1(d1);
    const client = new PrismaClient({ adapter });
    (client as any)._d1Bound = true;
    globalForPrisma.prisma = client;
    return client;
  }
  return globalForPrisma.prisma!;
}

// Legacy export. Keep it returning the local client so that existing
// `prisma.user.findMany(...)` calls continue to work in local dev. On
// Cloudflare, call `await ensurePrisma()` first to get the D1-bound client.
export const prisma: PrismaClient = globalForPrisma.prisma!;