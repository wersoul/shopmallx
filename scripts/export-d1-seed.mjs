// Export local Prisma data → SQL INSERT statements for Cloudflare D1
// Usage: node scripts/export-d1-seed.mjs > migrations/0002_seed.sql
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();
const esc = (v) => (v == null ? 'NULL' : `'${String(v).replace(/'/g, "''")}'`);

const out = [];
const log = (...a) => { process.stderr.write(a.join(' ') + '\n'); };

// PBKDF2-SHA256 with 100k iterations — matches src/lib/password.ts
const ITERATIONS = 100_000;
const SALT_BYTES = 16;
const HASH_BITS = 256;

function toHex(buf) {
  return buf.toString('hex');
}

function pbkdf2Sync(password, salt, iterations) {
  return crypto.pbkdf2Sync(password, salt, iterations, HASH_BITS / 8, 'sha256');
}

function hashPassword(password) {
  const salt = crypto.randomBytes(SALT_BYTES);
  const derived = pbkdf2Sync(password, salt, ITERATIONS);
  return `pbkdf2$${ITERATIONS}$${toHex(salt)}$${toHex(derived)}`;
}

const adminHash = hashPassword('admin1234');
const demoHash = hashPassword('12345678');

out.push('-- Seed data for shopmallx D1');
out.push('-- Generated: ' + new Date().toISOString());
out.push('');

const tables = [
  { name: 'User', get: () => prisma.user.findMany() },
  { name: 'Category', get: () => prisma.category.findMany() },
  { name: 'Product', get: () => prisma.product.findMany() },
  { name: 'Banner', get: () => prisma.banner.findMany() },
  { name: 'Promotion', get: () => prisma.promotion.findMany() },
  { name: 'Content', get: () => prisma.content.findMany() },
  { name: 'Setting', get: () => prisma.setting.findMany() }
];

for (const { name: t, get } of tables) {
  const rows = await get();
  log(`  ${t}: ${rows.length} rows`);
  if (rows.length === 0) continue;
  const cols = Object.keys(rows[0]);
  const colList = cols.map(c => `"${c}"`).join(', ');
  for (const r of rows) {
    const vals = cols.map(c => {
      let v = r[c];
      if (t === 'User' && c === 'password') {
        if (r.email === 'admin@shopmallx.com') v = adminHash;
        else if (r.email === 'demo@shopmallx.com') v = demoHash;
      }
      if (v === null || v === undefined) return 'NULL';
      if (typeof v === 'boolean') return v ? '1' : '0';
      if (typeof v === 'number') return String(v);
      if (v instanceof Date) return esc(v.toISOString());
      return esc(v);
    }).join(', ');
    out.push(`INSERT INTO "${t}" (${colList}) VALUES (${vals});`);
  }
  out.push('');
}

await prisma.$disconnect();
process.stdout.write(out.join('\n'));