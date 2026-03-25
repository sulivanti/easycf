// @contract DOC-ARC-004 §8, DOC-GNP-00-M02
//
// Validates that every route plugin exported from each module index.ts
// is registered in the API entry point (apps/api/src/index.ts).
//
// Usage: node --experimental-strip-types scripts/validate-route-registration.ts
// Exit code: 0 = no gaps, 1 = gaps found

import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const MODULES_DIR = join(ROOT, 'apps', 'api', 'src', 'modules');
const ENTRY_POINT = join(ROOT, 'apps', 'api', 'src', 'index.ts');

// Patterns that identify route plugin exports
const ROUTE_EXPORT_RE = /export\s+(?:async\s+)?function\s+(\w+(?:Routes|Route|Plugin))\b/g;
const REEXPORT_RE = /export\s+\{[^}]*\}/g;
const NAMED_REEXPORT_RE = /(\w+(?:Routes|Route|Plugin))/g;
const STAR_REEXPORT_RE = /export\s+\*\s+from\s+['"]([^'"]+)['"]/g;

// Patterns that identify route registrations in the entry point
const REGISTER_RE = /app\.register\(\s*(\w+)/g;

interface Gap {
  module: string;
  export: string;
}

function extractRouteExports(moduleDir: string, moduleName: string): string[] {
  const indexPath = join(moduleDir, 'index.ts');
  if (!existsSync(indexPath)) return [];

  const content = readFileSync(indexPath, 'utf-8');
  const exports: string[] = [];

  // Direct function exports
  let match: RegExpExecArray | null;
  while ((match = ROUTE_EXPORT_RE.exec(content)) !== null) {
    exports.push(match[1]);
  }

  // Named re-exports: export { xxxRoutes } from '...'
  const namedBlocks = content.match(REEXPORT_RE) ?? [];
  for (const block of namedBlocks) {
    let nameMatch: RegExpExecArray | null;
    while ((nameMatch = NAMED_REEXPORT_RE.exec(block)) !== null) {
      exports.push(nameMatch[1]);
    }
  }

  // Star re-exports: export * from './presentation/index.js'
  // Follow one level deep to find route exports
  while ((match = STAR_REEXPORT_RE.exec(content)) !== null) {
    const relPath = match[1].replace(/\.js$/, '.ts');
    const targetPath = join(moduleDir, relPath);
    if (existsSync(targetPath)) {
      const targetContent = readFileSync(targetPath, 'utf-8');

      // Check direct exports in the target
      let innerMatch: RegExpExecArray | null;
      const innerRe = /export\s+(?:async\s+)?function\s+(\w+(?:Routes|Route|Plugin))\b/g;
      while ((innerMatch = innerRe.exec(targetContent)) !== null) {
        exports.push(innerMatch[1]);
      }

      // Check named re-exports in the target
      const innerNamedBlocks = targetContent.match(REEXPORT_RE) ?? [];
      for (const block of innerNamedBlocks) {
        let nameMatch: RegExpExecArray | null;
        const nameRe = /(\w+(?:Routes|Route|Plugin))/g;
        while ((nameMatch = nameRe.exec(block)) !== null) {
          exports.push(nameMatch[1]);
        }
      }
    }
  }

  return [...new Set(exports)];
}

function extractRegistrations(entryPointPath: string): Set<string> {
  const content = readFileSync(entryPointPath, 'utf-8');
  const registrations = new Set<string>();

  let match: RegExpExecArray | null;
  while ((match = REGISTER_RE.exec(content)) !== null) {
    registrations.add(match[1]);
  }

  // Also check for aliased imports: `engineRoutes as integrationEngineRoutes`
  const aliasRe = /(\w+(?:Routes|Route|Plugin))\s+as\s+(\w+)/g;
  while ((match = aliasRe.exec(content)) !== null) {
    // If the alias is registered, count the original as registered too
    if (registrations.has(match[2])) {
      registrations.add(match[1]);
    }
  }

  return registrations;
}

// ─────────────────────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────────────────────

console.log('🔍 Validating route registration completeness...\n');

// 1. Collect all route exports from modules
const allExports: { module: string; name: string }[] = [];

const moduleDirs = readdirSync(MODULES_DIR, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name);

for (const moduleName of moduleDirs) {
  const moduleDir = join(MODULES_DIR, moduleName);
  const exports = extractRouteExports(moduleDir, moduleName);
  for (const exp of exports) {
    allExports.push({ module: moduleName, name: exp });
  }
}

console.log(`Found ${allExports.length} route exports across ${moduleDirs.length} modules:\n`);
for (const exp of allExports) {
  console.log(`  ${exp.module.padEnd(22)} → ${exp.name}`);
}

// 2. Collect all registrations from entry point
const registrations = extractRegistrations(ENTRY_POINT);

console.log(`\nFound ${registrations.size} registrations in entry point.\n`);

// 3. Diff
const gaps: Gap[] = [];
for (const exp of allExports) {
  if (!registrations.has(exp.name)) {
    gaps.push({ module: exp.module, export: exp.name });
  }
}

if (gaps.length === 0) {
  console.log('✅ All route exports are registered in the entry point. Zero gaps.\n');
  process.exit(0);
} else {
  console.error(`❌ Found ${gaps.length} gap(s) — route exports NOT registered:\n`);
  for (const gap of gaps) {
    console.error(`  ${gap.module.padEnd(22)} → ${gap.export}`);
  }
  console.error('\nFix: import and register these plugins in apps/api/src/index.ts');
  console.error('See: DOC-ARC-004 §2 for registration pattern\n');
  process.exit(1);
}
