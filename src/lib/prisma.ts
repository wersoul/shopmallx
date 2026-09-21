import { PrismaClient } from '@prisma/client';
import { PrismaD1 } from '@prisma/adapter-d1';

const globalForPrisma = global as unknown as {
  prisma?: PrismaClient;
  cfModule?: Promise<typeof import('@cloudflare/next-on-pages')> | null;
  initPromise?: Promise<void>;
};

function getCfModule(): Promise<typeof import('@cloudflare/next-on-pages')> | null {
  if (globalForPrisma.cfModule !== undefined) return globalForPrisma.cfModule;
  try {
    const dyn = new Function('m', 'return import(m)') as (m: string) => Promise<any>;
    globalForPrisma.cfModule = dyn('@cloudflare/next-on-pages');
    return globalForPrisma.cfModule;
  } catch {
    globalForPrisma.cfModule = null;
    return null;
  }
}

if (!globalForPrisma.prisma) {
  globalForPrisma.prisma = new PrismaClient();
}

// MUST be awaited before any DB query on Cloudflare. Returns the real
// PrismaClient instance — uses D1 adapter when running on Cloudflare Pages.
export async function ensurePrisma(): Promise<PrismaClient> {
  if (globalForPrisma.prisma && (globalForPrisma.prisma as any)._d1Bound) {
    return globalForPrisma.prisma;
  }
  if (globalForPrisma.initPromise) {
    await globalForPrisma.initPromise;
    return globalForPrisma.prisma!;
  }
  globalForPrisma.initPromise = (async () => {
    const mod = await getCfModule();
    if (mod) {
      try {
        const ctx = mod.getOptionalRequestContext();
        const d1 = ctx?.env?.DB;
        if (d1) {
          const adapter = new PrismaD1(d1);
          const client = new PrismaClient({ adapter });
          (client as any)._d1Bound = true;
          globalForPrisma.prisma = client;
        }
      } catch {
        // not on CF
      }
    }
  })();
  await globalForPrisma.initPromise;
  return globalForPrisma.prisma!;
}

// Legacy export — returns the plain (local SQLite) client on first import.
// On Cloudflare this should NOT be used directly; call `await ensurePrisma()`
// first to get the D1-bound client.
export const prisma: PrismaClient = globalForPrisma.prisma!;