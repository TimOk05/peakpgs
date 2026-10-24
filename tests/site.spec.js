const { test, expect } = require('@playwright/test');

const sizes = [
  { name: 'mobile', width: 390, height: 844 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1440, height: 1000 }
];

for (const size of sizes) {
  test(`${size.name} layout has no horizontal overflow`, async ({ page }) => {
    await page.setViewportSize({ width: size.width, height: size.height });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h1')).toContainText('Bring your property');
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(1);
    await expect(page.locator('img')).toHaveCount(6);
  });
}

test('mobile navigation opens, links and closes', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const menuButton = page.locator('[data-menu-button]');
  await menuButton.click();
  await expect(menuButton).toHaveAttribute('aria-expanded', 'true');
  await expect(page.locator('[data-nav]')).toHaveClass(/is-open/);
  await page.locator('[data-nav] a[href="#services"]').click();
  await expect(menuButton).toHaveAttribute('aria-expanded', 'false');
  await expect(page).toHaveURL(/#services$/);
});

test('quote form validates and prepares an enquiry without sending data', async ({ page }) => {
  await page.goto('/#quote');
  await page.locator('[data-quote-form] button[type="submit"]').click();
  await expect(page.locator('#name')).toBeFocused();
  await page.locator('#name').fill('Sarah');
  await page.locator('#service').selectOption({ label: 'Garden care' });
  await page.locator('#postcode').fill('S40 1AA');
  await page.locator('#details').fill('Please quote for an overgrown back garden tidy.');
  await page.locator('[data-quote-form] button[type="submit"]').click();
  await expect(page.locator('[data-dialog]')).toBeVisible();
  await expect(page.locator('[data-message-preview]')).toContainText('S40 1AA');
  await page.keyboard.press('Escape');
  await expect(page.locator('[data-dialog]')).toBeHidden();
});

test('page has useful metadata and no broken local assets', async ({ page }) => {
  const failed = [];
  page.on('response', (response) => {
    if (response.url().startsWith('http://127.0.0.1') && response.status() >= 400) failed.push(`${response.status()} ${response.url()}`);
  });
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  await expect(page).toHaveTitle(/Peak Property Gardening Services/);
  await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /Chesterfield/);
  expect(failed).toEqual([]);
});
