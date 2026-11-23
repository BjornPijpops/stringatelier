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

      const row = (page: Page, name: string) =>
        page.getByRole('group', { name, exact: true });
      const plus = (page: Page, name: string) =>
        page.getByRole('button', { name: `Eén ${name} meer` });
      const minus = (page: Page, name: string) =>
        page.getByRole('button', { name: `Eén ${name} minder` });

      test('lists one row per string type, own string first', async ({
        page,
      }) => {
        await expect(page.locator('#calc-rows [data-row]')).toHaveCount(6);
        await expect(
          page.locator('#calc-rows [data-row]').first(),
        ).toContainText('Eigen snaar');
        await expect(row(page, 'Eigen snaar')).toContainText(
          '12,00 per racket · alleen service',
        );
        await expect(row(page, 'BG-65 wit')).toContainText('16,50 per racket');
        await expect(row(page, 'BG-80 Power wit')).toContainText('18,00');
      });

      test('starts empty without a misleading €0,00 total', async ({
        page,
      }) => {
        await expect(page.locator('#calc-empty')).toContainText(
          'Kies hierboven je snaar en aantal.',
        );
        await expect(page.locator('#calc-empty')).toContainText(
          'Eigen snaar? Dan betaal je enkel € 12,00 per racket.',
        );
        await expect(page.locator('#calc-summary')).toBeHidden();
        await expect(page.locator('#calculator')).not.toContainText('0,00');
        await expect(row(page, 'BG-65 wit').locator('output')).toHaveText('0');
        await expect(minus(page, 'BG-65 wit')).toBeDisabled();
      });

      test('steppers are at least 44px and quantities readable', async ({
        page,
      }) => {
        for (const button of await page.locator('[data-step]').all()) {
          const box = (await button.boundingBox())!;
          expect(box.width).toBeGreaterThanOrEqual(MIN_TAP_TARGET_PX);
          expect(box.height).toBeGreaterThanOrEqual(MIN_TAP_TARGET_PX);
        }
        const size = await page
          .locator('[data-quantity]')
          .first()
          .evaluate((el) => parseFloat(getComputedStyle(el).fontSize));
        expect(size).toBeGreaterThanOrEqual(MIN_INPUT_TEXT_PX);
      });

      test('shows the total for a single row without a breakdown', async ({
        page,
      }) => {
        await plus(page, 'BG-80 wit').click();
        await plus(page, 'BG-80 wit').click();

        await expect(page.locator('#calc-total')).toHaveText(/36,00/);
        await expect(page.locator('#calc-summary')).toContainText('2 rackets');
        await expect(page.locator('#calc-empty')).toBeHidden();
        await expect(page.locator('#calc-breakdown')).toBeHidden();
      });

      test('combines different strings in one total', async ({ page }) => {
        await plus(page, 'BG-65 wit').click();
        await plus(page, 'BG-80 Power wit').click();

        await expect(page.locator('#calc-breakdown li')).toHaveText([
          /1 × BG-65 wit.*16,50/,
          /1 × BG-80 Power wit.*18,00/,
        ]);
        await expect(page.locator('#calc-total')).toHaveText(/34,50/);
        await expect(page.locator('#calc-summary')).toContainText('2 rackets');
      });

      test('minus returns to the empty state and stops at zero', async ({
        page,
      }) => {
        await plus(page, 'Eigen snaar').click();
        await expect(page.locator('#calc-total')).toHaveText(/12,00/);
        await expect(page.locator('#calc-summary')).toContainText('1 racket');

        await minus(page, 'Eigen snaar').click();
        await expect(minus(page, 'Eigen snaar')).toBeDisabled();
        await expect(page.locator('#calc-summary')).toBeHidden();
        await expect(page.locator('#calc-empty')).toBeVisible();
      });

      test('plus stops at the maximum quantity', async ({ page }) => {
        const add = plus(page, 'BG-65 wit');
        for (let i = 0; i < 20; i++) await add.click();

        await expect(add).toBeDisabled();
        await expect(row(page, 'BG-65 wit').locator('output')).toHaveText('20');
      });

      test('keeps the last row reachable above the sticky total', async ({
        page,
      }) => {
        await plus(page, 'BG-65 wit').click();
        const lastPlus = plus(page, 'BG-80 Power wit');
        await lastPlus.evaluate((el) =>
          el.scrollIntoView({ block: 'center', behavior: 'instant' }),
        );

        const buttonBox = (await lastPlus.boundingBox())!;
        const footerBox = (await page.locator('#calc-summary').boundingBox())!;
        expect(buttonBox.y + buttonBox.height).toBeLessThanOrEqual(
          footerBox.y + 1,
        );
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
    });

    test('prijzen shows the price card before the calculator', async ({
      page,
    }) => {
      await page.goto('prijzen/');
      const card = (await page.locator('#service-price').boundingBox())!;
      const calculator = (await page.locator('#calculator').boundingBox())!;
      expect(card.y + card.height).toBeLessThanOrEqual(calculator.y);
      expect(card.height).toBeLessThan(260);
      await expect(page.locator('#service-price')).not.toContainText(
        'Dat is ons tarief',
      );
      await expect(page.locator('#service-price')).toContainText(
        'Eigen snaar bij? Dan betaal je enkel € 12,00.',
      );
    });

    test('contact lists each person with call and WhatsApp buttons', async ({
      page,
    }) => {
      await page.goto('contact/');
      await expect(
        page.getByRole('heading', { level: 2, name: 'Bereik ons' }),
      ).toBeVisible();
      await expect(page.locator('#reach-heading ~ ul h3')).toHaveText([
        'Bjorn',
        'Neal',
      ]);
      await expect(page.locator('main a[href^="mailto:"]')).toHaveCount(1);
      await expect(page.locator('main a[href^="tel:+32"]')).toHaveCount(2);
      await expect(
        page.locator('main a[href^="https://wa.me/32"]'),
      ).toHaveCount(2);

      const call = page.getByRole('link', { name: 'Bel Bjorn' });
      const whatsApp = page.getByRole('link', { name: 'WhatsApp Bjorn' });
      await expect(call).toHaveText('Bel');
      await expect(whatsApp).toHaveText('WhatsApp');
      await expect(whatsApp).toHaveAttribute(
        'href',
        'https://wa.me/32477191385',
      );
      await expect(
        page.getByRole('link', { name: 'Bel Neal' }),
      ).toHaveAttribute('href', 'tel:+32470630288');

      const callBox = (await call.boundingBox())!;
      const whatsAppBox = (await whatsApp.boundingBox())!;
      expect(Math.abs(callBox.width - whatsAppBox.width)).toBeLessThanOrEqual(
        1,
      );
      expect(Math.abs(callBox.height - whatsAppBox.height)).toBeLessThanOrEqual(
        1,
      );
      await expect(page.getByText('0477 19 13 85')).not.toHaveAttribute(
        'href',
        /.+/,
      );
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

test.describe('desktop prijzen', () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test('price card sits beside the calculator without stretching', async ({
    page,
  }) => {
    await page.goto('prijzen/');
    const card = (await page.locator('#service-price').boundingBox())!;
    const calculator = (await page.locator('#calculator').boundingBox())!;

    expect(card.x + card.width).toBeLessThanOrEqual(calculator.x);
    expect(card.height).toBeLessThan(calculator.height / 2);
  });
});

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('prijzen keeps a single column next to the price list', async ({
    page,
  }) => {
    await page.goto('prijzen/');
    await expect(page.locator('#service-price')).toBeVisible();
    await expect(page.locator('#calculator')).toBeHidden();
  });

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
