#!/usr/bin/env node
/**
 * CLI content validation gate: `npm run validate`
 *
 * Reads all Markdown files under src/content directly from disk (always
 * fresh — no Astro content cache involved) and runs the SHARED validation core from
 * src/lib/validate-content.ts, so the CLI gate and the build gate
 * (src/lib/content.ts → loadSiteContent) enforce exactly the same rules.
 *
 * Ownership: see docs/contracts/publication-v1.md ("Validation Ownership").
 * Any violation exits non-zero (fail closed). No database, no network, no
 * secrets required.
 */
import { readFile, readdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse as parseYaml } from 'yaml';
import {
  parseItemFrontmatter,
  parseBriefingFrontmatter,
  validateParsedCollections,
} from '../src/lib/validate-content.ts';
import { CATEGORY_IDS } from '../src/lib/categories.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

async function readCollection(dir) {
  const base = join(root, 'src/content', dir);
  let files;
  try {
    files = await readdir(base, { recursive: true });
  } catch {
    console.error(`✗ content directory "src/content/${dir}" is missing`);
    process.exit(1);
  }
  const out = [];
  for (const file of files.filter((f) => String(f).endsWith('.md')).map(String).sort()) {
    const raw = await readFile(join(base, file), 'utf8');
    const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    const label = `${dir}/${file}`;
    if (!match) {
      out.push({ label, raw: null });
      continue;
    }
    out.push({ label, raw: parseYaml(match[1]) });
  }
  return out;
}

const itemFiles = await readCollection('items');
const briefingFiles = await readCollection('briefings');

// --- schema validation (zod, via shared core) ---------------------------
const schemaProblems = [];
const items = [];
const briefings = [];

for (const { label, raw } of itemFiles) {
  if (raw === null) {
    schemaProblems.push(`${label}: missing YAML frontmatter`);
    continue;
  }
  const { data, issues } = parseItemFrontmatter(raw, label);
  if (data) items.push({ file: label, data });
  schemaProblems.push(...issues.map((i) => `${i.file}: ${i.path ? `${i.path}: ` : ''}${i.message}`));
}

for (const { label, raw } of briefingFiles) {
  if (raw === null) {
    schemaProblems.push(`${label}: missing YAML frontmatter`);
    continue;
  }
  const { data, issues } = parseBriefingFrontmatter(raw, label);
  if (data) briefings.push({ file: label, data });
  schemaProblems.push(...issues.map((i) => `${i.file}: ${i.path ? `${i.path}: ` : ''}${i.message}`));
}

// --- shared integrity validation (same core as astro build) --------------
const problems = [...schemaProblems, ...validateParsedCollections(items, briefings)];

// --- Phase 1 fixture sanity (CLI-only, not part of the publication contract)
if (items.length < 10) problems.push(`expected >= 10 fixture items, found ${items.length}`);
if (briefings.length < 5) problems.push(`expected >= 5 fixture briefings, found ${briefings.length}`);
const itemDates = new Set(items.map((i) => i.data.published_at.slice(0, 10)));
if (itemDates.size < 2) problems.push(`expected >= 2 distinct dates, found ${[...itemDates]}`);
const missingCategories = CATEGORY_IDS.filter((id) => !items.some((i) => i.data.category === id));
if (missingCategories.length) {
  problems.push(`categories without fixture items: ${missingCategories.join(', ')}`);
}

if (problems.length > 0) {
  console.error(`✗ content validation FAILED (${problems.length} problem(s)):\n`);
  for (const problem of problems) console.error(`  - ${problem}`);
  process.exit(1);
}

console.log(
  `✓ content validation passed: ${items.length} items, ${briefings.length} briefings, ` +
    `${itemDates.size} dates, all categories covered, all references resolve.`,
);
