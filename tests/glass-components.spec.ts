import { test, expect } from '@playwright/test';

test('evening name and glass actions retain readable contrast after theme changes', async ({ page }, info) => {
  await page.goto('/');
  const name = page.locator('.particle-name');
  await expect(name).toHaveClass(/particles-ready/);
  await page.getByRole('button', { name: 'Switch to evening theme' }).click();
  await expect(page.locator('.portfolio')).toHaveCSS('background-color', 'rgb(37, 43, 38)');
  await expect(name).toHaveCSS('color', 'rgb(238, 238, 222)');
  // Inspect the actual canvas pixels: inherited transition colors once left the name dark.
  await expect.poll(() => name.locator('canvas').evaluate((canvas: HTMLCanvasElement) => {
    const pixels = canvas.getContext('2d')!.getImageData(0, 0, canvas.width, canvas.height).data;
    for (let i = 0; i < pixels.length; i += 4) {
      if (pixels[i + 3] > 240) return Array.from(pixels.slice(i, i + 3));
    }
    return [];
  })).toEqual([238, 238, 222]);

  async function checkActions() {
    for (const action of await page.locator('.liquid-glass-link:visible').all()) {
      await expect(action).toHaveCSS('color', 'rgb(32, 49, 39)');
      // The pale base is opaque, so neither the dark page nor the bright lens
      // can reduce contrast below this base-color measurement.
      const ratio = await action.evaluate(element => {
        const luminance = (color: string) => {
          const rgb = color.match(/[\d.]+/g)!.slice(0, 3).map(Number).map(v => {
            const s = v / 255; return s <= .04045 ? s / 12.92 : ((s + .055) / 1.055) ** 2.4;
          });
          return rgb[0] * .2126 + rgb[1] * .7152 + rgb[2] * .0722;
        };
        const style = getComputedStyle(element);
        return (luminance(style.backgroundColor) + .05) / (luminance(style.color) + .05);
      });
      expect(ratio).toBeGreaterThanOrEqual(4.5);
      await action.focus();
      await expect(action).toHaveCSS('color', 'rgb(32, 49, 39)');
      if (info.project.name === 'desktop') {
        await action.hover();
        await expect(action).toHaveCSS('color', 'rgb(32, 49, 39)');
      }
    }
  }
  await checkActions();
  await page.locator('#home').screenshot({ path: `test-results/contrast-${info.project.name}-evening.png` });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(name.locator('.particle-fallback')).toHaveCSS('opacity', '1');
  await page.getByRole('button', { name: 'Open UltraEditX', exact: true }).click();
  await checkActions();
  await page.getByRole('button', { name: 'Back to the doors' }).click();
  await page.getByRole('button', { name: 'Restore cream theme' }).click();
  await expect(name).toHaveCSS('color', 'rgb(36, 38, 33)');
});

test('modern navigation supports mobile disclosure and keyboard closing', async ({ page }, info) => {
  await page.goto('/');
  const nav = page.getByRole('navigation', { name: 'Main navigation', exact: true });
  if (info.project.name === 'mobile') {
    const toggle = page.getByRole('button', { name: 'Open navigation', exact: true });
    await expect(nav.getByRole('link', { name: 'Work', exact: true })).toBeHidden();
    await toggle.click();
    await expect(page.getByRole('button', { name: 'Close navigation' })).toHaveAttribute('aria-expanded', 'true');
    await page.keyboard.press('Escape');
    await expect(toggle).toBeFocused();
    await toggle.click();
    await nav.getByRole('link', { name: 'Work', exact: true }).click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  } else {
    await nav.getByRole('link', { name: 'Work', exact: true }).click();
  }
  await expect(page).toHaveURL(/#work$/);
  await expect(page.locator('.hero-actions .liquid-glass-link')).toHaveAttribute('href', '#contact');
  await expect(nav.getByRole('link', { name: 'Contact' })).toHaveAttribute('href', '#contact');
});

test('each venture folder opens, previews its own project, and closes with Escape', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  for (const name of ['UltraEditX', 'OPCREATORLAB']) {
    await page.getByRole('button', { name: `Open ${name}`, exact: true }).click();
    const folder = page.getByRole('button', { name: `Open ${name} folder`, exact: true });
    const preview = page.getByRole('button', { name: `Expand ${name} preview`, exact: true });
    await expect(preview).toBeDisabled();
    await folder.click();
    expect(await page.locator('.folder-stage').evaluate(element => element.clientWidth)).toBeGreaterThan(200);
    await expect(page.getByRole('button', { name: `Close ${name} folder` })).toHaveAttribute('aria-expanded', 'true');
    await preview.click();
    await expect(page.getByRole('dialog')).toContainText(name);
    await page.getByRole('button', { name: 'Close preview' }).click();
    await expect(preview).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(folder).toBeFocused();
    await expect(folder).toHaveAttribute('aria-expanded', 'false');
    await page.getByRole('button', { name: 'Back to the doors' }).click();
  }
});

test('Akbar particles respond to a mouse and keep readable text with reduced motion', async ({ page }, info) => {
  await page.goto('/');
  const name = page.locator('.particle-name');
  await expect(name).toHaveClass(/particles-ready/);
  await expect(page.locator('h1')).toContainText('Akbar.');
  if (info.project.name === 'desktop') {
    const canvas = name.locator('canvas');
    const before = await canvas.evaluate((element: HTMLCanvasElement) => element.toDataURL());
    const bounds = (await name.boundingBox())!;
    await page.mouse.move(bounds.x + bounds.width * .45, bounds.y + bounds.height * .5);
    await expect.poll(() => canvas.evaluate((element: HTMLCanvasElement) => element.toDataURL())).not.toBe(before);
    await page.mouse.move(5, 5);
  }
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(name.locator('canvas')).toBeHidden();
  await expect(name.locator('.particle-fallback')).toHaveCSS('opacity', '1');
});
