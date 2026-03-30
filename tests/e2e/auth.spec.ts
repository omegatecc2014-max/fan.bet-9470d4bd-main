import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('User can open login dialog and switch to signup', async ({ page }) => {
    // Go to the main page or directly to login
    await page.goto('/login');
    
    // Check if Sign In page is visible by checking for the login slogan
    await expect(page.locator('text=Entre para fazer previsões e ganhar.').first()).toBeVisible();

    // Check if we can switch to "Sign Up" page
    const signUpLink = page.locator('text=Criar conta');
    if (await signUpLink.isVisible()) {
      await signUpLink.click();
      await expect(page.locator('text=Crie sua conta para começar.').first()).toBeVisible();
    }
  });
});
