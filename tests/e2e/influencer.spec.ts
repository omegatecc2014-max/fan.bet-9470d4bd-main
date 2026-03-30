import { test, expect } from '@playwright/test';

test.describe('Influencer Features', () => {
  test('Camera hints or permissions text exist on Influencer Post page', async ({ page }) => {
    await page.goto('/influencer/post');
    // If it redirects to login
    if (page.url().includes('login') || (await page.locator('text=Entrar').count() > 0)) {
       await expect(page.locator('text=Entre para fazer').first()).toBeVisible();
    } else {
       // Expecting Postar Dica text
       await expect(page.locator('text=Postar Dica do Dia')).toBeVisible();
    }
  });

  test('Questionnaire page loads', async ({ page }) => {
    await page.goto('/influencer/questionnaire');
    if (page.url().includes('login') || (await page.locator('text=Entrar').count() > 0)) {
       await expect(page.locator('text=Entre para fazer').first()).toBeVisible();
    } else {
       // Look for questionnaire title
       await expect(page.locator('text=Questionário Diário')).toBeVisible();
    }
  });
});
