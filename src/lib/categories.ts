/**
 * Canonical Category Definition — the single source of truth.
 *
 * Routes, feeds, navigation, archive, daily pages and the zod schemas all
 * derive from this definition. Adding a category means adding exactly one
 * entry here (plus content); no other file hardcodes the category list.
 *
 * `id`    — internal identifier used in content frontmatter (underscore form)
 * `slug`  — public URL segment (hyphen form), e.g. ai_news -> /ai-news/
 */
export const CATEGORIES = [
  {
    id: 'papers',
    slug: 'papers',
    label: 'Papers',
    description: '经过筛选与摘要的科研论文（会议、期刊与评审平台）。',
  },
  {
    id: 'ai_news',
    slug: 'ai-news',
    label: 'AI News',
    description: 'AI 领域的动态、发布与行业新闻。',
  },
  {
    id: 'code',
    slug: 'code',
    label: 'Code',
    description: '值得关注的开源项目与代码发布。',
  },
  {
    id: 'resource',
    slug: 'resource',
    label: 'Resource',
    description: '数据集、工具与科研资源。',
  },
  {
    id: 'arxiv',
    slug: 'arxiv',
    label: 'arXiv',
    description: 'arXiv 新论文速览。',
  },
] as const;

export type Category = (typeof CATEGORIES)[number];
export type CategoryId = Category['id'];

/** Non-empty tuple of category ids — feeds the zod enum in schemas.ts. */
export const CATEGORY_IDS = CATEGORIES.map((c) => c.id) as [CategoryId, ...CategoryId[]];

export const CATEGORY_BY_ID = Object.fromEntries(
  CATEGORIES.map((c) => [c.id, c] as const),
) as Record<CategoryId, Category>;

export const CATEGORY_BY_SLUG = Object.fromEntries(
  CATEGORIES.map((c) => [c.slug, c] as const),
) as Record<string, Category>;

export function categoryById(id: CategoryId): Category {
  return CATEGORY_BY_ID[id];
}

export function categoryBySlug(slug: string): Category | undefined {
  return CATEGORY_BY_SLUG[slug];
}
