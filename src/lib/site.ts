/**
 * Canonical site configuration.
 *
 * The production origin is defined exactly once (here). astro.config.ts
 * imports SITE.origin as the Astro `site` value; SEO tags, RSS, robots.txt
 * and sitemap all derive from it via absoluteUrl(). Never hardcode the
 * origin anywhere else.
 */
export const SITE = {
  /** Production origin — no trailing slash. */
  origin: 'https://daily.iheadwater.org',
  name: 'DailyInfo',
  tagline: 'AI for Science Intelligence',
  description:
    'DailyInfo 是自动生成的 AI for Science 科研情报日报：论文、AI 新闻、代码、资源与 arXiv 条目的摘要、点评与导航。',
  language: 'zh-CN',
  /**
   * Reserved interface for a future og:image (absolute URL).
   * Keep `null` until a real image asset exists — no dynamic image service in v1.
   */
  ogImage: null as string | null,
} as const;

/** Build an absolute URL from a root-relative path. */
export function absoluteUrl(path: string): string {
  return new URL(path, SITE.origin).toString();
}

/** Global source-attribution notice (rendered in the footer). */
export const ATTRIBUTION =
  'DailyInfo 提供自动生成的科研信息摘要，用于科研信息发现和研究导航。文章标题、作者及原始内容版权归原作者及对应来源平台所有，请以原始来源为准。';
