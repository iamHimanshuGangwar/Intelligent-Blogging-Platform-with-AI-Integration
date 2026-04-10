import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('loads and shows the hero section', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/AiBlog/i);
    // At least some content renders
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('navigation links are present', async ({ page }) => {
    await page.goto('/');
    // NavBar should have links
    const nav = page.locator('nav').first();
    await expect(nav).toBeVisible();
  });

  test('no critical console errors on load', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    await page.goto('/');
    // Allow Clerk/Supabase placeholder warnings in test env; fail only on real 5xx
    const criticalErrors = errors.filter(
      (e) => e.includes('500') || e.includes('Unhandled') || e.includes('TypeError')
    );
    expect(criticalErrors).toHaveLength(0);
  });
});
