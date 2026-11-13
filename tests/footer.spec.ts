import { test, expect } from '@playwright/test';

test('footer reveals the panorama, follows the theme, and keeps its links usable', async ({ page }, info) => {
  await page.goto('/');
  const footer = page.getByRole('contentinfo');
  const artwork = footer.locator('canvas');
  await footer.locator('.footer-art').scrollIntoViewIfNeeded();
  await expect.poll(() => artwork.evaluate((canvas: HTMLCanvasElement) => {
    const pixel = canvas.getContext('2d')!.getImageData(canvas.width - 20, canvas.height - 20, 1, 1);
    return pixel.data[3];
  })).toBeGreaterThan(0);
  await expect(footer.getByRole('link', { name: 'Let’s talk' })).toHaveAttribute('href', 'mailto:mdakbarhussain550@gmail.com');
  await expect(footer.getByRole('link', { name: '+91 9347066720' })).toHaveAttribute('href', 'tel:+919347066720');
  await footer.screenshot({ path: `test-results/footer-${info.project.name}-cream.png` });
  const cream = await footer.evaluate(element => getComputedStyle(element).backgroundColor);
  await page.getByRole('button', { name: 'Switch to pale red theme' }).click();
  await footer.locator('.footer-art').scrollIntoViewIfNeeded();
  expect(await footer.evaluate(element => getComputedStyle(element).backgroundColor)).not.toBe(cream);
  await footer.screenshot({ path: `test-results/footer-${info.project.name}-rose.png` });
  await footer.getByRole('link', { name: 'BACK TO TOP' }).click();
  await expect(page.locator('.hero h1')).toBeInViewport();

  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.reload();
  await footer.locator('.footer-art').scrollIntoViewIfNeeded();
  await expect.poll(() => artwork.evaluate((canvas: HTMLCanvasElement) =>
    canvas.getContext('2d')!.getImageData(canvas.width - 20, canvas.height - 20, 1, 1).data[3]
  )).toBeGreaterThan(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
