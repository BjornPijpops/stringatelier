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

      const select = (page: Page) => page.getByLabel('Kies een snaar');
      const addButton = (page: Page) =>
        page.getByRole('button', { name: 'Toevoegen' });
      const line = (page: Page, name: string) =>
        page.locator('#calc-lines li').filter({ hasText: name });
      const plus = (page: Page, name: string) =>
        page.getByRole('button', { name: `Eén ${name} meer` });
      const status = (page: Page) => page.locator('#calc-status');

      async function addString(page: Page, value: string) {
        await select(page).selectOption(value);
        await addButton(page).click();
      }

      test('offers own string first, then strings grouped by family', async ({
        page,
      }) => {
        const options = select(page).locator('option');
        await expect(options).toHaveCount(7);
        await expect(options.nth(0)).toHaveText('Kies een snaar…');
        await expect(options.nth(0)).toHaveAttribute('value', '');
        await expect(options.nth(1)).toHaveText(
          'Eigen snaar (alleen besnaren) · € 12,00',
        );
        await expect(select(page).locator('optgroup')).toHaveCount(3);
        await expect(
          select(page).locator('optgroup').first().locator('option').first(),
        ).toHaveText('BG-65 wit · € 16,50');
        await expect(options.last()).toHaveText('BG-80 Power wit · € 18,00');
      });

      test('starts empty without a misleading €0,00 total', async ({
        page,
      }) => {
        await expect(page.locator('#calc-empty')).toContainText(
          'Eén racket met je eigen snaar? Dat is € 12,00. Kies hierboven een snaar om je totaal te zien.',
        );
        await expect(page.locator('#calc-lines li')).toHaveCount(0);
        await expect(page.locator('#calc-cart')).toBeHidden();
        await expect(page.locator('#calculator')).not.toContainText('0,00');
      });

      test('asks for a string when nothing is selected', async ({ page }) => {
        await addButton(page).click();

        await expect(page.getByRole('alert')).toHaveText(
          'Kies eerst een snaar.',
        );
        await expect(select(page)).toHaveAttribute('aria-invalid', 'true');
        await expect(select(page)).toHaveAttribute(
          'aria-describedby',
          'calc-error',
        );
        await expect(select(page)).toBeFocused();
        await expect(page.locator('#calc-lines li')).toHaveCount(0);

        await select(page).selectOption('own');
        await expect(page.locator('#calc-error')).toBeEmpty();
        await expect(select(page)).not.toHaveAttribute('aria-invalid', 'true');
      });

      test('adds a line, resets the picker and announces the result', async ({
        page,
      }) => {
        await addString(page, 'bg-65-wit');

        const added = line(page, 'BG-65 wit');
        await expect(added).toContainText('€ 16,50 per racket');
        await expect(added.locator('output')).toHaveText('1');
        await expect(page.locator('#calc-total')).toHaveText('€ 16,50');
        await expect(page.locator('#calc-count')).toHaveText('1 racket');
        await expect(page.locator('#calc-empty')).toBeHidden();
        await expect(select(page)).toHaveValue('');
        await expect(select(page)).toBeFocused();
        await expect(status(page)).toHaveText(
          'BG-65 wit toegevoegd. 1 racket, totaal € 16,50.',
        );
      });

      test('merges a duplicate into one line', async ({ page }) => {
        await addString(page, 'bg-65-wit');
        await addString(page, 'bg-65-wit');

        await expect(page.locator('#calc-lines li')).toHaveCount(1);
        await expect(line(page, 'BG-65 wit').locator('output')).toHaveText('2');
        await expect(page.locator('#calc-total')).toHaveText('€ 33,00');
        await expect(status(page)).toHaveText(
          'BG-65 wit toegevoegd. 2 rackets, totaal € 33,00.',
        );
      });

      test('keeps lines in the order they were added', async ({ page }) => {
        await addString(page, 'own');
        await addString(page, 'bg-65-wit');
        await addString(page, 'bg-80-zwart');
        await addString(page, 'bg-80-zwart');

        await expect(page.locator('#calc-lines li')).toHaveCount(3);
        await expect(page.locator('#calc-lines li').nth(0)).toContainText(
          'Eigen snaar',
        );
        await expect(page.locator('#calc-lines li').nth(2)).toContainText(
          'BG-80 zwart',
        );
        await expect(page.locator('#calc-total')).toHaveText('€ 64,50');
        await expect(page.locator('#calc-count')).toHaveText('4 rackets');
      });

      test('plus and minus change the quantity of one line', async ({
        page,
      }) => {
        await addString(page, 'bg-80-wit');
        const minus = line(page, 'BG-80 wit').getByRole('button', {
          name: 'Verwijder BG-80 wit',
        });
        await expect(minus).toBeVisible();

        await plus(page, 'BG-80 wit').click();
        await expect(plus(page, 'BG-80 wit')).toBeFocused();
        await expect(page.locator('#calc-total')).toHaveText('€ 36,00');

        await page
          .getByRole('button', { name: 'Eén BG-80 wit minder' })
          .click();
        await expect(page.locator('#calc-total')).toHaveText('€ 18,00');
        await expect(
          page.getByRole('button', { name: 'Verwijder BG-80 wit' }),
        ).toBeVisible();
      });

      test('trash removes the line and returns to the empty state', async ({
        page,
      }) => {
        await addString(page, 'bg-65-wit');
        await page.getByRole('button', { name: 'Verwijder BG-65 wit' }).click();

        await expect(page.locator('#calc-lines li')).toHaveCount(0);
        await expect(page.locator('#calc-cart')).toBeHidden();
        await expect(page.locator('#calc-empty')).toBeVisible();
        await expect(page.locator('#calculator')).not.toContainText('0,00');
        await expect(select(page)).toBeFocused();
        await expect(status(page)).toHaveText(
          'BG-65 wit verwijderd. Je totaal is leeg.',
        );
      });

      test('removing one of several lines keeps the others and the total', async ({
        page,
      }) => {
        await addString(page, 'own');
        await addString(page, 'bg-65-wit');
        await page
          .getByRole('button', { name: 'Verwijder Eigen snaar' })
          .click();

        await expect(page.locator('#calc-lines li')).toHaveCount(1);
        await expect(page.locator('#calc-total')).toHaveText('€ 16,50');
        await expect(
          page.getByRole('button', { name: 'Verwijder BG-65 wit' }),
        ).toBeFocused();
        await expect(status(page)).toHaveText(
          'Eigen snaar verwijderd. 1 racket, totaal € 16,50.',
        );
      });

      test('removing the last of several lines focuses the previous line', async ({
        page,
      }) => {
        await addString(page, 'own');
        await addString(page, 'bg-65-wit');
        await page.getByRole('button', { name: 'Verwijder BG-65 wit' }).click();

        await expect(
          page.getByRole('button', { name: 'Verwijder Eigen snaar' }),
        ).toBeFocused();
      });

      test('stops at the maximum quantity', async ({ page }) => {
        await addString(page, 'bg-65-wit');
        for (let i = 1; i < 20; i++) await plus(page, 'BG-65 wit').click();

        await expect(plus(page, 'BG-65 wit')).toBeDisabled();
        await expect(line(page, 'BG-65 wit')).toContainText('Maximaal bereikt');
        await expect(line(page, 'BG-65 wit').locator('output')).toHaveText(
          '20',
        );

        await addString(page, 'bg-65-wit');
        await expect(line(page, 'BG-65 wit').locator('output')).toHaveText(
          '20',
        );
        await expect(status(page)).toHaveText('Maximum bereikt voor BG-65 wit');
      });

      test('picker and cart lines are easy to tap and read', async ({
        page,
      }) => {
        await addString(page, 'own');
        await addString(page, 'bg-65-wit');
        await addString(page, 'bg-65-wit');

        expect(await findSmallTapTargets(page)).toEqual([]);
        const size = await select(page).evaluate((el) =>
          parseFloat(getComputedStyle(el).fontSize),
        );
        expect(size).toBeGreaterThanOrEqual(MIN_INPUT_TEXT_PX);
        const tooSmall = await page
          .locator('#calculator')
          .locator('p, li, label')
          .evaluateAll(
            (elements, min) =>
              elements
                .filter((el) => (el.textContent ?? '').trim())
                .filter((el) => parseFloat(getComputedStyle(el).fontSize) < min)
                .map((el) => (el.textContent ?? '').trim().slice(0, 30)),
            MIN_BODY_TEXT_PX,
          );
        expect(tooSmall).toEqual([]);
      });
    });
    test.describe('prijzen string cards', () => {
      test.beforeEach(async ({ page }) => {
        await page.goto('prijzen/');
      });

      test('show the all-in price with its breakdown on every card', async ({
        page,
      }) => {
        await expect(page.locator('article h3')).toHaveText([
          'BG-65',
          'BG-80',
          'BG-80 Power',
        ]);
        const cards = page.locator('article');
        await expect(cards.nth(0)).toContainText('€ 16,50');
        await expect(cards.nth(0)).toContainText('per racket');
        await expect(cards.nth(0)).toContainText(
          'besnaren € 12,00 + snaar € 4,50',
        );
        await expect(cards.nth(1)).toContainText('€ 18,00');
        await expect(cards.nth(2)).toContainText('€ 18,00');
        for (const card of await cards.all()) {
          await expect(card).toContainText('Ideaal voor');
        }
      });

      test('merge feel and thickness into one line', async ({ page }) => {
        const card = page.locator('article').first();
        await expect(card).toContainText('Zacht en vergevingsgezind · 0,70 mm');
        await expect(card).toContainText('Kleur: wit of zwart');
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

    test('prijzen puts the price in the intro, strings before the calculator', async ({
      page,
    }) => {
      await page.goto('prijzen/');
      await expect(page.locator('#service-price')).toHaveCount(0);
      const intro = page.locator('main p').first();
      await expect(intro).toContainText(
        'Besnaren kost € 12 per racket, plus de snaar die je kiest. Eigen snaar? Dan betaal je alleen die € 12.',
      );
      await expect(intro.locator('strong')).toHaveText('€ 12');

      const strings = (await page.locator('article').first().boundingBox())!;
      const calculator = (await page.locator('#calculator').boundingBox())!;
      const cta = (await page
        .getByRole('link', { name: 'Contact en afgifte' })
        .boundingBox())!;
      expect(strings.y + strings.height).toBeLessThanOrEqual(calculator.y);
      expect(calculator.y + calculator.height).toBeLessThanOrEqual(cta.y);
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

test.describe('large system font (150% root size)', () => {
  for (const width of [320, 390]) {
    for (const { name, path } of PAGES) {
      test(`${name} does not overflow horizontally at ${width}px`, async ({
        page,
      }) => {
        await page.setViewportSize({ width, height: 700 });
        await page.goto(path);
        await page.addStyleTag({ content: 'html { font-size: 24px; }' });
        const overflow = await page.evaluate(
          () =>
            document.documentElement.scrollWidth -
            document.documentElement.clientWidth,
        );
        expect(overflow).toBeLessThanOrEqual(0);
      });
    }

    test(`prijzen calculator with 3 lines does not overflow at ${width}px`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 700 });
      await page.goto('prijzen/');
      await page.addStyleTag({ content: 'html { font-size: 24px; }' });
      for (const value of ['own', 'bg-65-wit', 'bg-80-zwart', 'bg-80-zwart']) {
        await page.getByLabel('Kies een snaar').selectOption(value);
        await page.getByRole('button', { name: 'Toevoegen' }).click();
      }
      await expect(page.locator('#calc-lines li')).toHaveCount(3);

      const overflow = await page.evaluate(
        () =>
          document.documentElement.scrollWidth -
          document.documentElement.clientWidth,
      );
      expect(overflow).toBeLessThanOrEqual(0);
      const boxes = [
        ...(await page.locator('#calculator li *').all()),
        page.locator('#calc-total'),
      ];
      for (const element of boxes) {
        const box = await element.boundingBox();
        if (!box) continue;
        expect(box.x).toBeGreaterThanOrEqual(0);
        expect(box.x + box.width).toBeLessThanOrEqual(width);
      }
    });
  }
});

test.describe('desktop prijzen', () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test('string cards sit side by side above a full-width calculator', async ({
    page,
  }) => {
    await page.goto('prijzen/');
    const cards = await page.locator('article').all();
    const boxes = await Promise.all(cards.map((card) => card.boundingBox()));
    expect(new Set(boxes.map((box) => Math.round(box!.y))).size).toBe(1);
    expect(new Set(boxes.map((box) => Math.round(box!.height))).size).toBe(1);

    const calculator = (await page.locator('#calculator').boundingBox())!;
    expect(calculator.y).toBeGreaterThan(boxes[0]!.y + boxes[0]!.height);
  });
});

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('prijzen hides the calculator but keeps the cards', async ({ page }) => {
    await page.goto('prijzen/');
    await expect(page.locator('#calculator')).toBeHidden();
    await expect(page.locator('article')).toHaveCount(3);
    await expect(page.locator('article').first()).toContainText('€ 16,50');
  });

  test('prijzen still lists the all-in prices', async ({ page }) => {
    await page.goto('prijzen/');
    await expect(
      page.getByRole('heading', { name: 'Prijs per racket' }),
    ).toBeVisible();
    const list = page.locator('noscript li');
    await expect(list).toHaveCount(6);
    await expect(list.first()).toContainText('Eigen snaar (alleen besnaren)');
    await expect(list.first()).toContainText('12,00');
    await expect(list.nth(1)).toContainText('BG-65 wit');
    await expect(list.nth(1)).toContainText('16,50');
    await expect(list.last()).toContainText('BG-80 Power wit');
    await expect(list.last()).toContainText('18,00');
  });
});
