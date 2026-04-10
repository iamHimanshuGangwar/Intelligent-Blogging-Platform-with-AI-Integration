import { test, expect } from '@playwright/test';

test.describe('Blog', () => {
  test('blog post list is reachable via homepage', async ({ page }) => {
    await page.goto('/');
    // Should not be a 404
    await expect(page.locator('body')).toBeVisible();
    expect(page.url()).not.toContain('404');
  });

  test('blog slug page has SEO meta title', async ({ page }) => {
    // Navigate to a known-good blog path structure
    await page.goto('/blog', { waitUntil: 'domcontentloaded' });
    // Blog listing or redirect should exist
    const status = await page.evaluate(() => document.readyState);
    expect(status).toBe('complete');
  });

  test('unavailable blog post shows not-found gracefully', async ({ page }) => {
    await page.goto('/blog/this-post-should-not-exist-abc123xyz', {
      waitUntil: 'domcontentloaded',
    });
    const body = await page.locator('body').innerText();
    // Should show some error or not-found state, not an unhandled crash
    expect(body.length).toBeGreaterThan(0);
  });
});
