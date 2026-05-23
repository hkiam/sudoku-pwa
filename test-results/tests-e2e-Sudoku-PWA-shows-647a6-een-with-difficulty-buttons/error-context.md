# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tests/e2e.spec.js >> Sudoku PWA >> shows menu screen with difficulty buttons
- Location: tests/e2e.spec.js:8:3

# Error details

```
Error: page.goto: Protocol error (Page.navigate): Cannot navigate to invalid URL
Call log:
  - navigating to "/sudoku-pwa/", waiting until "load"

```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Sudoku PWA', () => {
  4  |   test.beforeEach(async ({ page }) => {
> 5  |     await page.goto('/sudoku-pwa/');
     |                ^ Error: page.goto: Protocol error (Page.navigate): Cannot navigate to invalid URL
  6  |   });
  7  | 
  8  |   test('shows menu screen with difficulty buttons', async ({ page }) => {
  9  |     await expect(page.getByText('Sudoku')).toBeVisible();
  10 |     await expect(page.getByText('Classic Number Puzzle')).toBeVisible();
  11 |     await expect(page.getByRole('button', { name: 'Easy' })).toBeVisible();
  12 |     await expect(page.getByRole('button', { name: 'Medium' })).toBeVisible();
  13 |     await expect(page.getByRole('button', { name: 'Hard' })).toBeVisible();
  14 |   });
  15 | 
  16 |   test('starts easy game when clicking Easy button', async ({ page }) => {
  17 |     await page.getByRole('button', { name: 'Easy' }).click();
  18 |     
  19 |     // Should show game screen
  20 |     await expect(page.getByText('Sudoku')).toBeVisible();
  21 |     await expect(page.getByRole('button', { name: '← Menu' })).toBeVisible();
  22 |     
  23 |     // Should show game info
  24 |     await expect(page.getByText('Difficulty:')).toBeVisible();
  25 |     await expect(page.getByText('Time:')).toBeVisible();
  26 |   });
  27 | 
  28 |   test('starts medium game when clicking Medium button', async ({ page }) => {
  29 |     await page.getByRole('button', { name: 'Medium' }).click();
  30 |     
  31 |     await expect(page.getByText('Difficulty:')).toBeVisible();
  32 |     await expect(page.getByText('Medium')).toBeVisible();
  33 |   });
  34 | 
  35 |   test('starts hard game when clicking Hard button', async ({ page }) => {
  36 |     await page.getByRole('button', { name: 'Hard' }).click();
  37 |     
  38 |     await expect(page.getByText('Difficulty:')).toBeVisible();
  39 |     await expect(page.getByText('Hard')).toBeVisible();
  40 |   });
  41 | 
  42 |   test('can return to menu from game', async ({ page }) => {
  43 |     await page.getByRole('button', { name: 'Easy' }).click();
  44 |     await page.getByRole('button', { name: '← Menu' }).click();
  45 |     
  46 |     // Should be back at menu
  47 |     await expect(page.getByRole('button', { name: 'Easy' })).toBeVisible();
  48 |   });
  49 | 
  50 |   test('displays correct version number', async ({ page }) => {
  51 |     // Check version in footer
  52 |     await expect(page.getByText('Sudoku PWA v1.1.0')).toBeVisible();
  53 |     
  54 |     // Check version in manifest
  55 |     const manifestResponse = await page.goto('/sudoku-pwa/manifest.json');
  56 |     if (manifestResponse) {
  57 |       const manifest = await manifestResponse.json();
  58 |       expect(manifest.version).toBe('1.1.0');
  59 |     }
  60 |   });
  61 | 
  62 | });
```