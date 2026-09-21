// Migration script: convert `prisma.X.Y(...)` calls to use ensurePrisma().
// Only modifies files that already import prisma.
//
// Approach: for each server-side file (no 'use client') that imports prisma,
//   - Replace `import { prisma } from '...'` with `import { prisma, ensurePrisma } from '...'`
//   - At top of each async function that contains `db.X.Y(...)` (we set db = await ensurePrisma())
//
// To make this safe, we ONLY prepend `const prisma = await ensurePrisma();` if
// the function actually contains `prisma.`. We avoid touching async functions
// that don't query the DB.

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

  // Match any of the import paths we use
  const importRe = /import\s*\{\s*prisma\s*\}\s*from\s*('[^']+')\s*;/;
  const m = src.match(importRe);
  if (!m) continue;

  // Replace the import to include ensurePrisma
  src = src.replace(importRe, "import { prisma, ensurePrisma } from $1;");

  // Skip 'use client' files
  if (/^\s*['"]use client['"]/.test(src)) {
    fs.writeFileSync(f, src);
    count++;
    continue;
  }

  // Use a marker comment to find functions that contain `prisma.X.`
  // and inject `const prisma = await ensurePrisma();` at their entry.
  // We do this line-by-line to handle multi-line function declarations.
  const lines = src.split('\n');
  const out = [];
  let i = 0;

  function findOpenBrace(startIdx) {
    // Scan forward from startIdx for the first `{` that opens the function body.
    let depth = 0;
    let seen = false;
    for (let j = startIdx; j < lines.length; j++) {
      for (const ch of lines[j]) {
        if (ch === '{') {
          if (!seen) { seen = true; return { line: j, col: lines[j].indexOf('{') + 1 }; }
          depth++;
        } else if (ch === '}') {
          if (seen) {
            depth--;
            if (depth < 0) return { line: j, col: lines[j].indexOf('}') + 1 };
          }
        }
      }
    }
    return null;
  }

  while (i < lines.length) {
    const line = lines[i];

    // Match start of an async function (anywhere on line, possibly with export)
    const asyncFnRe = /(export\s+default\s+)?async\s+function\s+(\w+)/;
    const asyncArrowRe = /=\s*async\s*\(/;

    let fnMatch = line.match(asyncFnRe);
    let arrowMatch = line.match(asyncArrowRe);
    let fnName = null;
    let insertAt = -1;

    if (fnMatch) {
      fnName = fnMatch[2];
      // Find `{` possibly on next lines
      let foundBrace = line.indexOf('{') >= 0 ? line.indexOf('{') : -1;
      let braceLine = i;
      if (foundBrace < 0) {
        for (let j = i + 1; j < lines.length && j < i + 10; j++) {
          if (lines[j].indexOf('{') >= 0) { braceLine = j; break; }
        }
      }
      // Look ahead in next 30 lines — does this function use `prisma.` ?
      let usesPrisma = false;
      let braceCount = 0;
      for (let j = braceLine; j < Math.min(lines.length, i + 80); j++) {
        if (lines[j].includes('prisma.')) { usesPrisma = true; break; }
        // crude brace counting
        braceCount += (lines[j].match(/\{/g) || []).length - (lines[j].match(/\}/g) || []).length;
        if (braceCount === 0 && j > braceLine) break;
      }
      if (usesPrisma) insertAt = braceLine + 1;
    } else if (arrowMatch) {
      // const x = async (req) => {
      let braceLine = i;
      for (let j = i; j < lines.length && j < i + 5; j++) {
        if (lines[j].indexOf('{') >= 0) { braceLine = j; break; }
      }
      let usesPrisma = false;
      let braceCount = 0;
      for (let j = braceLine; j < Math.min(lines.length, i + 80); j++) {
        if (lines[j].includes('prisma.')) { usesPrisma = true; break; }
        braceCount += (lines[j].match(/\{/g) || []).length - (lines[j].match(/\}/g) || []).length;
        if (braceCount === 0 && j > braceLine) break;
      }
      if (usesPrisma) insertAt = braceLine + 1;
    }

    if (insertAt > 0) {
      // Insert at insertAt
      // Determine indent: use 2 spaces
      const stmt = '  const prisma = await ensurePrisma();';
      // Avoid double-insertion if the same function already has the line just inside
      if (lines[insertAt] && lines[insertAt].trim() === stmt.trim()) {
        // already has it
      } else {
        lines.splice(insertAt, 0, stmt);
      }
      i = insertAt + 2; // skip past insertion
      continue;
    }

    i++;
  }

  fs.writeFileSync(f, lines.join('\n'));
  count++;
}

console.log(`Migrated ${count} files.`);