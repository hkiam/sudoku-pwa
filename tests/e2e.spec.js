import { test, expect } from '@playwright/test';

test.describe('Sudoku PWA', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/sudoku-pwa/');
  });

  test('shows menu screen with difficulty buttons', async ({ page }) => {
    await expect(page.getByText('Sudoku')).toBeVisible();
    await expect(page.getByText('Classic Number Puzzle')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Easy' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Medium' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Hard' })).toBeVisible();
  });

  test('starts easy game when clicking Easy button', async ({ page }) => {
    await page.getByRole('button', { name: 'Easy' }).click();
    
    // Should show game screen
    await expect(page.getByText('Sudoku')).toBeVisible();
    await expect(page.getByRole('button', { name: '← Menu' })).toBeVisible();
    
    // Should show game info
    await expect(page.getByText('Difficulty:')).toBeVisible();
    await expect(page.getByText('Time:')).toBeVisible();
  });

  test('starts medium game when clicking Medium button', async ({ page }) => {
    await page.getByRole('button', { name: 'Medium' }).click();
    
    await expect(page.getByText('Difficulty:')).toBeVisible();
    await expect(page.getByText('Medium')).toBeVisible();
  });

  test('starts hard game when clicking Hard button', async ({ page }) => {
    await page.getByRole('button', { name: 'Hard' }).click();
    
    await expect(page.getByText('Difficulty:')).toBeVisible();
    await expect(page.getByText('Hard')).toBeVisible();
  });

  test('can return to menu from game', async ({ page }) => {
    await page.getByRole('button', { name: 'Easy' }).click();
    await page.getByRole('button', { name: '← Menu' }).click();
    
    // Should be back at menu
    await expect(page.getByRole('button', { name: 'Easy' })).toBeVisible();
  });

  test('displays correct version number', async ({ page }) => {
    // Check version in footer
    await expect(page.getByText('Sudoku PWA v1.1.0')).toBeVisible();
    
    // Check version in manifest
    const manifestResponse = await page.goto('/sudoku-pwa/manifest.json');
    if (manifestResponse) {
      const manifest = await manifestResponse.json();
      expect(manifest.version).toBe('1.1.0');
    }
  });

});