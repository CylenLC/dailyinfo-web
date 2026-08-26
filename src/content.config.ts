import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { briefingSchema, itemSchema } from './lib/schemas.ts';

const items = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/items' }),
  schema: itemSchema,
});

const briefings = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/briefings' }),
  schema: briefingSchema,
});

export const collections = { items, briefings };
