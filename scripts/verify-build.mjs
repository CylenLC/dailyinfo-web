#!/usr/bin/env node
/**
 * Production artifact checks for the GitHub Pages project-site deployment.
 *
 * This deliberately inspects generated files rather than source templates:
 * Astro can type-check and build successfully while a hand-written URL still
 * points at the host root. Run after `astro build` (the npm build script does
 * this automatically).
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { SITE, absoluteUrl, withBase } from '../src/lib/site.ts';
import { briefingRoute, dailyRoute, itemRoute } from '../src/lib/urls.ts';

const repo = new URL('..', import.meta.url).pathname;
const dist = join(repo, 'dist');
let passed = 0;
let failed = 0;

function check(name, condition, detail = '') {
  if (condition) {
    passed++;
    console.log(`  ✓ ${name}`);
  } else {
    failed++;
    console.error(`  ✗ ${name}${detail ? ` — ${detail}` : ''}`);
  }
}

function read(relativePath) {
  try {
    return readFileSync(join(dist, relativePath), 'utf8');
  } catch {
    return '';
  }
}

function collectFiles(directory, suffix) {
  if (!existsSync(directory)) return [];
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const absolute = join(directory, entry.name);
    if (entry.isDirectory()) return collectFiles(absolute, suffix);
    return entry.name.endsWith(suffix) ? [absolute] : [];
  });
}

const home = read('index.html');
const papers = read('papers/index.html');
const daily = read('daily/2026-08-26/index.html');
const briefing = read('daily/2026-08-26/papers/index.html');
const item = read('papers/openreview-example-001/index.html');
const productionRoot = withBase('/');
const itemHref = withBase(itemRoute('papers', 'openreview-example-001'));
const dailyHref = withBase(dailyRoute('2026-08-26'));
const briefingHref = withBase(briefingRoute('2026-08-26', 'papers'));
const itemUrl = absoluteUrl(itemRoute('papers', 'openreview-example-001'));

console.log(`\n[1] Generated HTML (${SITE.publicUrl})`);
check('dist/index.html exists', home.length > 0);
check('dist/favicon.svg exists', existsSync(join(dist, 'favicon.svg')));
check('stylesheet uses deployment base', /href="[^"\s]*\/_astro\/[^"\s]+\.css"/.test(home));
const stylesheetHref = home.match(/<link rel="stylesheet" href="([^"]+)">/)?.[1] ?? '';
check(
  'generated stylesheet exists in dist',
  stylesheetHref.startsWith(productionRoot) &&
    existsSync(join(dist, stylesheetHref.slice(productionRoot.length))),
  stylesheetHref,
);
check('favicon href uses deployment base', home.includes(`href="${withBase('/favicon.svg')}"`));
check('Papers navigation stays under deployment base', home.includes(`href="${withBase('/papers/')}"`));
check('Daily href stays under deployment base', home.includes(`href="${dailyHref}"`));
check('Briefing href stays under deployment base', home.includes(`href="${briefingHref}"`));
check('Item href stays under deployment base', home.includes(`href="${itemHref}"`));
check('global RSS href uses deployment base', home.includes(`href="${withBase('/feed.xml')}"`));

const htmlFiles = collectFiles(dist, '.html');
const internalUrls = htmlFiles.flatMap((file) => {
  const html = readFileSync(file, 'utf8');
  return [...html.matchAll(/(?:href|src)="(\/[^"#?]*)"/g)].map((match) => match[1]);
});
const badInternalUrls = internalUrls.filter((url) => !url.startsWith(productionRoot));
check(
  'all root-relative HTML href/src values stay under deployment base',
  badInternalUrls.length === 0,
  badInternalUrls.slice(0, 5).join(', '),
);

console.log('\n[2] SEO and representative routes');
check(
  'Item canonical URL uses current public URL',
  item.includes(`<link rel="canonical" href="${itemUrl}">`),
);
check('Item og:url uses current public URL', item.includes(`<meta property="og:url" content="${itemUrl}">`));
check('Papers route artifact exists', papers.length > 0);
check('Daily route artifact exists', daily.length > 0);
check('Briefing route artifact exists', briefing.length > 0);
check('Item route artifact exists', item.length > 0);
check('Daily page links to its briefing', daily.includes(`href="${briefingHref}"`));
check('Briefing page links to its Daily page', briefing.includes(`href="${dailyHref}"`));
check('Briefing page links to its Item', briefing.includes(`href="${itemHref}"`));
check('Item page links to its Briefing', item.includes(`href="${briefingHref}"`));

console.log('\n[3] RSS, robots and sitemap');
const feed = read('feed.xml');
const papersFeed = read('feed/papers.xml');
check('global feed artifact exists', feed.length > 0);
check('papers feed artifact exists', papersFeed.length > 0);
check('global feed site link uses current public URL', feed.includes(`<link>${SITE.publicUrl}</link>`));
check('RSS item link uses current public URL', feed.includes(`<link>${itemUrl}</link>`));
check(
  'RSS GUID equals canonical Item URL',
  feed.includes(`<guid isPermaLink="true">${itemUrl}</guid>`,
  ),
);
const robots = read('robots.txt');
check('robots sitemap uses current public URL', robots.includes(`Sitemap: ${absoluteUrl('/sitemap-index.xml')}`));
const sitemapIndex = read('sitemap-index.xml');
check('sitemap index uses current public URL', sitemapIndex.includes(`<loc>${SITE.publicUrl}sitemap-0.xml</loc>`));
const sitemapFiles = [
  join(dist, 'sitemap-index.xml'),
  ...collectFiles(dist, '.xml').filter((file) => /sitemap-\d+\.xml$/.test(file)),
];
const sitemapUrls = sitemapFiles.flatMap((file) => {
  const xml = readFileSync(file, 'utf8');
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
});
check(
  'all sitemap URLs use current public URL',
  sitemapUrls.length > 0 && sitemapUrls.every((url) => url.startsWith(SITE.publicUrl)),
  sitemapUrls.find((url) => !url.startsWith(SITE.publicUrl)),
);
check('sitemap contains representative Item URL', sitemapUrls.includes(itemUrl));

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
