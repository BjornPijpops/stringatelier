import { expect, test, type Page } from '@playwright/test';

/** Phone widths: small Android/iPhone SE, common iPhone, large phone. */
const PHONES = [
  { name: '320', width: 320, height: 640 },
  { name: '375', width: 375, height: 667 },
  { name: '414', width: 414, height: 896 },
] as const;

const PAGES = [
  { name: 'home', path: '' },
  { name: 'prijzen', path: 'prijzen/' },
  { name: 'contact', path: 'contact/' },
] as const;

const MIN_TAP_TARGET_PX = 44;
const MIN_BODY_TEXT_PX = 14;
const MIN_INPUT_TEXT_PX = 16; // below this, iOS Safari zooms into focused inputs

const INTERACTIVE = 'a[href], button, select, input, textarea, summary';

async function findSmallTapTargets(page: Page) {
  return page.$$eval(
    INTERACTIVE,
    (elements, min) =>
      elements
        .filter(
          (el) => !el.closest('.sr-only') && !el.classList.contains('sr-only'),
        )
        .map((el) => {
          const rect = el.getBoundingClientRect();
          return {
            text: (el.textContent ?? '').trim().slice(0, 40),
            w: rect.width,
            h: rect.height,
          };
        })
        .filter(
          (box) => box.w > 0 && box.h > 0 && (box.h < min || box.w < min),
        ),
    MIN_TAP_TARGET_PX,
  );
}

/**
 * Phones and CI runners ship different fonts. Verdana/DejaVu Sans are wide, so layouts that
 * pass with them hold up on any device.
 */
async function useWideFont(page: Page) {
  await page.addStyleTag({
    content:
      "* { font-family: Verdana, 'DejaVu Sans', sans-serif !important; }",
  });
}

for (const phone of PHONES) {
  test.describe(`phone ${phone.name}px`, () => {
    test.use({
      viewport: { width: phone.width, height: phone.height },
      hasTouch: true,
      isMobile: true,
    });

    for (const { name, path } of PAGES) {
      test.describe(name, () => {
        test.beforeEach(async ({ page }) => {
          await page.goto(path);
          await useWideFont(page);
        });

        test('has a responsive viewport meta tag', async ({ page }) => {
          await expect(page.locator('meta[name="viewport"]')).toHaveAttribute(
            'content',
            /width=device-width/,
          );
        });

        test('does not scroll horizontally', async ({ page }) => {
          const overflow = await page.evaluate(
            () =>
              document.documentElement.scrollWidth -
              document.documentElement.clientWidth,
          );
          expect(overflow).toBeLessThanOrEqual(0);
        });

        test('keeps all content inside the viewport', async ({ page }) => {
          const offenders = await page.$$eval(
            'main *, header *, footer *',
            (elements, width) =>
              elements
                .filter((el) => !el.closest('.sr-only, [aria-hidden="true"]'))
                .filter((el) => {
                  const rect = el.getBoundingClientRect();
                  return rect.left < -1 || rect.right > width + 1;
                })
                .map((el) => el.tagName.toLowerCase()),
            phone.width,
          );
          expect(offenders).toEqual([]);
        });

        test('has tap targets of at least 44x44px', async ({ page }) => {
          expect(await findSmallTapTargets(page)).toEqual([]);
        });

        test('uses readable text sizes', async ({ page }) => {
          const tooSmall = await page.$$eval(
            'main p, main li, main td, main th, main dd, main dt, main a, main label, footer p, header a',
            (elements, min) =>
              elements
                .map((el) => ({
                  text: (el.textContent ?? '').trim().slice(0, 30),
                  size: parseFloat(getComputedStyle(el).fontSize),
                }))
                .filter((item) => item.text && item.size < min),
            MIN_BODY_TEXT_PX,
          );
          expect(tooSmall).toEqual([]);
        });
      });
    }

    test.describe('prijzen calculator', () => {
      test.beforeEach(async ({ page }) => {
        await page.goto('prijzen/');
      });

      test('uses input text of at least 16px so iOS does not zoom', async ({
        page,
      }) => {
        for (const selector of ['#calc-string', '#calc-quantity']) {
          const size = await page
            .locator(selector)
            .evaluate((el) => parseFloat(getComputedStyle(el).fontSize));
          expect(size, selector).toBeGreaterThanOrEqual(MIN_INPUT_TEXT_PX);
        }
      });

      test('shows the total for own strings and for a chosen string', async ({
        page,
      }) => {
        await expect(page.locator('#calc-total')).toContainText('12,00');

        await page.locator('#calc-string').selectOption('bg-80-wit');
        await page.locator('#calc-quantity').fill('2');
        await expect(page.locator('#calc-total')).toContainText('36,00');
      });

      test('asks for a valid quantity instead of showing a wrong total', async ({
        page,
      }) => {
        await page.locator('#calc-quantity').fill('0');
        await expect(page.locator('#calc-total')).toBeEmpty();
        await expect(page.locator('#calc-breakdown')).toContainText(
          'tussen 1 en',
        );
      });
    });

    test('contact links are tappable mailto and tel links', async ({
      page,
    }) => {
      await page.goto('contact/');
      await expect(page.locator('a[href^="mailto:"]')).toHaveCount(1);
      await expect(page.locator('a[href^="tel:+32"]')).toHaveCount(2);
    });

    test('map loads on demand and fits the screen', async ({ page }) => {
      await page.route('https://www.openstreetmap.org/**', (route) =>
        route.fulfill({ contentType: 'text/html', body: '<p>map</p>' }),
      );
      await page.goto('contact/');
      await expect(page.locator('iframe')).toHaveCount(0);
      await page.getByRole('button', { name: 'Toon kaart' }).click();
      const map = page.locator('iframe[title^="Kaart van"]');
      await expect(map).toBeVisible();
      const box = await map.boundingBox();
      expect(box!.x).toBeGreaterThanOrEqual(0);
      expect(box!.x + box!.width).toBeLessThanOrEqual(phone.width);
      await expect(
        page.getByRole('link', { name: 'Route openen' }),
      ).toHaveAttribute('href', /google\.com\/maps\/dir.*Ursulinenstraat/);
    });

    test('navigation is reachable and the active page is marked', async ({
      page,
    }) => {
      await page.goto('prijzen/');
      const nav = page.getByRole('navigation', { name: 'Hoofdnavigatie' });
      await expect(nav.getByRole('link')).toHaveCount(3);
      await expect(nav.locator('[aria-current="page"]')).toHaveText('Prijzen');
    });
  });
}
