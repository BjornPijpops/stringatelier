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
      test('stepper buttons change the quantity within its limits', async ({
        page,
      }) => {
        const quantity = page.locator('#calc-quantity');
        await page.getByRole('button', { name: 'Eén racket meer' }).click();
        await expect(quantity).toHaveValue('2');
        await expect(page.locator('#calc-total')).toContainText('24,00');

        await page.getByRole('button', { name: 'Eén racket minder' }).click();
        await page.getByRole('button', { name: 'Eén racket minder' }).click();
        await expect(quantity).toHaveValue('1');
      });
    });

    test.describe('prijzen string cards', () => {
      test.beforeEach(async ({ page }) => {
        await page.goto('prijzen/');
      });

      test('explain each string type without repeating prices', async ({
        page,
      }) => {
        await expect(page.locator('article h3')).toHaveText([
          'BG-65',
          'BG-80',
          'BG-80 Power',
        ]);
        for (const card of await page.locator('article').all()) {
          await expect(card).toContainText('Ideaal voor');
          await expect(card).not.toContainText('€');
        }
      });

      test('shows each recommendation once', async ({ page }) => {
        const text = await page.locator('article').first().innerText();
        expect(text.match(/Beginners, clubspelers/g)).toHaveLength(1);
      });

      test('rating dots are readable by screen readers', async ({ page }) => {
        await expect(
          page.locator('article').first().getByText('5 van 5'),
        ).toHaveCount(1);
      });

      test('the calculator dropdown shows all-in prices per string', async ({
        page,
      }) => {
        await expect(
          page.locator('#calc-string option[value="bg-65-wit"]'),
        ).toContainText('16,50');
        await expect(
          page.locator('#calc-string option[value="bg-80-power-wit"]'),
        ).toContainText('18,00');
      });
    });

    test('contact links are tappable mailto and tel links', async ({
      page,
    }) => {
      await page.goto('contact/');
      await expect(page.locator('main a[href^="mailto:"]')).toHaveCount(1);
      await expect(page.locator('main a[href^="tel:+32"]')).toHaveCount(2);
    });

    test('home gives clear next steps and the key facts', async ({ page }) => {
      await page.goto('');
      const main = page.locator('main');
      await expect(
        main.getByRole('link', { name: 'Bekijk de prijzen' }),
      ).toBeVisible();
      await expect(
        main.getByRole('link', { name: 'Contact', exact: true }),
      ).toBeVisible();
      await expect(main).toContainText('Sporthal Herkules');
      await expect(main).toContainText('12,00');
      await expect(main).toContainText('16,50');

      await main.getByRole('link', { name: 'Bekijk de prijzen' }).click();
      await expect(page).toHaveURL(/\/prijzen\/?$/);
    });

    test('favicon and touch icon are declared and load', async ({
      page,
      request,
    }) => {
      await page.goto('');
      for (const rel of ['icon', 'apple-touch-icon']) {
        const href = await page
          .locator(`link[rel="${rel}"]`)
          .getAttribute('href');
        expect(href).toBeTruthy();
        const response = await request.get(new URL(href!, page.url()).href);
        expect(response.ok()).toBe(true);
        expect(response.headers()['content-type']).toContain('image/png');
      }
    });
    test('footer repeats the navigation', async ({ page }) => {
      await page.goto('prijzen/');
      const footer = page.locator('footer');
      await expect(footer.getByRole('link')).toHaveCount(3);
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

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('prijzen still lists the all-in prices', async ({ page }) => {
    await page.goto('prijzen/');
    await expect(page.locator('#calculator')).toBeHidden();
    const list = page.locator('noscript li');
    await expect(list).toHaveCount(5);
    await expect(list.first()).toContainText('BG-65 wit');
    await expect(list.first()).toContainText('16,50');
    await expect(list.last()).toContainText('BG-80 Power wit');
    await expect(list.last()).toContainText('18,00');
  });
});
