#!/bin/bash
# Migrate every `import { prisma } from '@/lib/prisma'` to also import `ensurePrisma`
# and rename `prisma` references to `db` inside server-only contexts.
# Server components / API routes call `const db = await ensurePrisma()` first.

cd "$(dirname "$0")/.."
ROOT="$PWD"

FILES=$(grep -rln "from '@/lib/prisma'" "$ROOT/src")

for f in $FILES; do
  # Check if ensurePrisma is already used
  if grep -q 'ensurePrisma' "$f"; then continue; fi

  # Add ensurePrisma to import (only if not already imported)
  if ! grep -q 'ensurePrisma' "$f"; then
    sed -i '' "s/import { prisma } from '@\/lib\/prisma';/import { ensurePrisma } from '@\/lib\/prisma';/" "$f"
  fi

  # Replace `prisma.` with `db.` ONLY in server-side files
  case "$f" in
    */api/*|*/admin/*|*/account/*|*/checkout/*|*/api.tsx|src/lib/*|src/components/SiteShell.tsx|src/components/ContentPage.tsx|src/app/page.tsx|src/app/contact/page.tsx|src/app/products/page.tsx|src/app/products/*)
      # All occurrences of `prisma.` → `db.`
      sed -i '' 's/\bprisma\./db./g' "$f"

      # Add `const db = await ensurePrisma();` after the import lines
      # Find first non-import line and insert before it
      awk '
        NR==1 { print; next }
        /ensurePrisma/ && !ins { print; print ""; print "const db = await ensurePrisma();"; ins=1; next }
        { print }
      ' "$f" > "$f.tmp" && mv "$f.tmp" "$f"
      ;;
  esac
done
echo "Done."