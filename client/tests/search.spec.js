import { test, expect } from '@playwright/test';

test('Search the value stomach', async ({ page }) => {
  await page.goto('http://localhost:3000/');
  await page.getByRole('textbox', { name: 'keywords' }).click();
  await page.getByRole('textbox', { name: 'keywords' }).fill('stomach');
  await page.getByRole('button', { name: 'Search' }).click();
  await page.getByLabel('Values', { exact: true }).locator('div').filter({ hasText: /^Fundus Of Stomach$/ }).nth(1).click();
});

test('Search the value blood', async ({ page }) => {
  await page.goto('http://localhost:3000/');
  await page.getByRole('textbox', { name: 'keywords' }).click();
  await page.getByRole('textbox', { name: 'keywords' }).fill('blood');
  await page.getByRole('button', { name: 'Search' }).click();
  await page.getByLabel('Values', { exact: true }).locator('div').filter({ hasText: /^Blood Draw$/ }).nth(1).click();
});