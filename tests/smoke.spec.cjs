const { test, expect } = require('@playwright/test');
const path = require('path');

test('WebGL race loads, renders, starts and responds to acceleration', async ({ page }) => {
  const pageErrors = [];
  page.on('pageerror', error => pageErrors.push(error.message));
  await page.goto('file://' + path.resolve(__dirname, '../index.html'));
  await expect(page.locator('#go')).toBeVisible();

  const webgl = await page.locator('#c').evaluate(canvas => {
    const gl = canvas.getContext('webgl');
    return !!gl && gl.getParameter(gl.VERSION);
  });
  expect(webgl).toBeTruthy();

  await page.screenshot({ path: 'test-results/neon-rush-before-start.png' });
  await page.locator('#go').click();
  await expect(page.locator('#cover')).toHaveClass(/hide/);
  await page.locator('#c').focus();

  await page.keyboard.down('ArrowUp');
  await page.waitForTimeout(900);
  await page.keyboard.up('ArrowUp');
  await expect(page.locator('#speed')).not.toHaveText('0');
  await expect(page.locator('#timer')).not.toHaveText('00:00.000');

  await page.screenshot({ path: 'test-results/neon-rush-driving.png' });
  expect(pageErrors).toEqual([]);
});
