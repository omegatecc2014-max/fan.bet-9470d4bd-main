import { test, expect } from '@playwright/test';

test.describe('Admin Dashboard', () => {
  test('Admin page renders appropriately', async ({ page }) => {
    // Navigate directly to admin page
    await page.goto('/admin');
    
    // Check if Admin Dashboard heading is visible (or login redirect if unauthorized)
    if (page.url().includes('login') || (await page.locator('text=Entrar').count() > 0)) {
       await expect(page.locator('text=Entre para fazer previsões').first()).toBeVisible();
    } else {
       await expect(page.locator('text=Top Influenciadores').first()).toBeVisible();
    }
  });
});
