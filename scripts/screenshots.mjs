// Visual QA helper: serves the existing `dist/` and screenshots every page.
// Usage: npm run build && npm run screenshots   (first time: npx playwright install chromium)
import { mkdir, readdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, relative, sep } from 'node:path';
import { preview } from 'astro';
import { chromium } from 'playwright';

const VIEWPORTS = [
  { name: 'mobile-320', width: 320, height: 640 },
  { name: 'mobile-390', width: 390, height: 844 },
  { name: 'desktop', width: 1280, height: 800 },
];
const outDir = join(tmpdir(), 'stringatelier-shots');

async function findPages(dir, root = dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map((entry) => {
      const path = join(dir, entry.name);
      if (entry.isDirectory()) return findPages(path, root);
      if (entry.name !== 'index.html') return [];
      const route = relative(root, dir).split(sep).join('/');
      return [route ? `/${route}/` : '/'];
    }),
  );
  return nested.flat();
}

const server = await preview({ server: { port: 4399 }, logLevel: 'silent' });
const browser = await chromium.launch();

try {
  await mkdir(outDir, { recursive: true });
  const pages = await findPages('dist');
  const base = 'http://localhost:4399/stringatelier';

  for (const viewport of VIEWPORTS) {
    const context = await browser.newContext({ viewport });
    const page = await context.newPage();
    for (const route of pages) {
      await page.goto(base + route, { waitUntil: 'networkidle' });
      const overflow = await page.evaluate(
        () =>
          document.documentElement.scrollWidth >
          document.documentElement.clientWidth,
      );
      const name = `${viewport.name}-${route.replace(/\//g, '_') || '_'}.png`;
      await page.screenshot({ path: join(outDir, name), fullPage: true });
      console.log(
        `${overflow ? 'OVERFLOW ' : 'ok       '}${viewport.name} ${route}`,
      );
    }
    await context.close();
  }
  console.log(`Screenshots: ${outDir}`);
} finally {
  await browser.close();
  await server.stop();
}
