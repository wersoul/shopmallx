// Migration script: convert `import { prisma } from '@/lib/prisma'` usages
// to `await ensurePrisma()` calls in server components / API routes.
//
// Strategy:
// 1. Find all files that import prisma.
// 2. For server-side files (no 'use client'), replace `prisma.X.Y(...)` with
//    `(await ensurePrisma()).X.Y(...)` and add `const prisma = await ensurePrisma();`
//    at the top of each function that uses it.
// 3. For client-side files, just swap the import to `ensurePrisma`.
//
// To keep things safe, this script only does the import swap. The wrapping of
// call sites is done by sed below in bash.

import fs from 'fs';
import path from 'path';

const ROOT = path.resolve(process.argv[2] || './src');

function walk(dir, files = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walk(full, files);
    else if (/\.(ts|tsx)$/.test(e.name)) files.push(full);
  }
  return files;
}

const files = walk(ROOT);
let count = 0;

for (const f of files) {
  let src = fs.readFileSync(f, 'utf8');
  if (!src.includes("from '@/lib/prisma'")) continue;

  // Replace import statement
  src = src.replace(
    /import\s*\{\s*prisma\s*\}\s*from\s*'@\/lib\/prisma'\s*;/,
    "import { ensurePrisma } from '@/lib/prisma';"
  );
  // For files that have BOTH prisma and other named exports, fall back to adding ensurePrisma
  if (!src.includes('ensurePrisma')) {
    src = src.replace(
      /import\s*\{\s*([^}]+)\s*\}\s*from\s*'@\/lib\/prisma'\s*;/,
      (m, names) => {
        if (names.includes('ensurePrisma')) return m;
        return `import { ${names.trim()}, ensurePrisma } from '@/lib/prisma';`;
      }
    );
  }

  // Skip 'use client' files — they can't use async top-level
  if (/^\s*['"]use client['"]/.test(src)) {
    fs.writeFileSync(f, src);
    count++;
    console.log(`  (client) ${f}`);
    continue;
  }

  // Find every function/handler that calls prisma.* and prepend ensurePrisma().
  // We do a simple regex-based pass:
  //   1) Replace `prisma.` with `db.` everywhere
  //   2) Insert `const db = await ensurePrisma();` at the top of any async function
  //      (heuristic: lines starting with "export async function" / "async function")
  src = src.replace(/\bprisma\./g, 'db.');

  // Insert into async function declarations
  src = src.replace(
    /(export\s+)?async\s+function\s+(\w+)\s*\([^)]*\)\s*\{/g,
    (m, exp, name) => {
      return `${exp || ''}async function ${name}(...) {\n  const db = await ensurePrisma();`;
    }
  );
  // Insert into arrow functions: const x = async (...) => {  or  const x = async function (
  src = src.replace(
    /=\s*async\s*\([^)]*\)\s*=>\s*\{/g,
    '= async (...) => {\n  const db = await ensurePrisma();'
  );
  src = src.replace(
    /=\s*async\s+function\s*\([^)]*\)\s*\{/g,
    '= async function (...) {\n  const db = await ensurePrisma();'
  );

  fs.writeFileSync(f, src);
  count++;
  console.log(`  ${f}`);
}

console.log(`Migrated ${count} files.`);