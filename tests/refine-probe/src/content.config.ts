import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

/**
 * W1-001 probe — pins Astro 5 content-layer behavior for zod constructs.
 *
 * PROBE_COLLECTIONS: comma list of collection names to activate ('all' = default).
 * PROBE_REFINE: 'off' disables the http(s) refinement (simulates the schema
 *               BEFORE a constraint was tightened).
 *
 * Expected behavior (Astro 5.18.2, verified):
 *   - Fresh sync (empty node_modules/.astro store) enforces EVERYTHING below,
 *     including .refine() — native checks and refinements behave alike.
 *   - Stale store: entries whose file content is unchanged are never
 *     re-parsed, so tightening the schema does NOT re-validate them. This is
 *     the root cause documented in docs/contracts/publication-v1.md.
 */

const active = (process.env.PROBE_COLLECTIONS ?? 'all')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);
const on = (name) => active.includes('all') || active.includes(name);

const useRefine = process.env.PROBE_REFINE !== 'off';
const urlField = useRefine
  ? z.string().url().refine((v) => v.startsWith('https://'), {
      message: 'must be an absolute https URL',
    })
  : z.string().url();

const defs: Record<string, ReturnType<typeof defineCollection>> = {};

function add(name: string, schema: z.ZodTypeAny) {
  if (on(name)) {
    defs[name] = defineCollection({
      loader: glob({ pattern: '**/*.md', base: `./src/content/${name}` }),
      schema,
    });
  }
}

// --- native checks (expected to fail the build on bad.md) ----------------
add('plainurl', z.object({ f: z.string().url() }).strict());
add('regex', z.object({ f: z.string().regex(/^A/) }).strict());
add('literal', z.object({ f: z.literal(1) }).strict());
add('enum', z.object({ f: z.enum(['a', 'b']) }).strict());

// --- refinement checks (also expected to fail the build on bad.md,
//     which proves fresh syncs DO enforce .refine()) ----------------------
add('urlrefine', z.object({ f: urlField }).strict());
add(
  'stringrefine',
  z
    .object({
      f: z.string().refine((v) => v.startsWith('A'), { message: 'must start with A' }),
    })
    .strict(),
);
add('nestedrefine', z.object({ f: z.object({ url: urlField }).strict() }).strict());
add(
  'prerefine',
  z
    .object({
      f: z.preprocess(
        (v) => (typeof v === 'number' ? String(v) : v),
        z.string().refine((v) => v.length <= 3, { message: 'length must be <= 3' }),
      ),
    })
    .strict(),
);

// --- preprocess execution (good.md holds a NUMBER that only parses
//     if the preprocess transform runs → build passes) --------------------
add(
  'preprocess',
  z
    .object({
      f: z.preprocess(
        (v) => (typeof v === 'number' ? `n${v}` : v),
        z.string().regex(/^n\d+$/),
      ),
    })
    .strict(),
);

export const collections = defs;