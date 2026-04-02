import { test, expect } from '@playwright/test';

test('debug logout click', { timeout: 60000 }, async ({ page }) => {
  // Set valid auth tokens
  const futureExpiry = Date.now() + 1000 * 60 * 60;
  await page.goto('http://localhost:3005/auth/signin');
  await page.evaluate((expiry) => {
    localStorage.setItem('fingerprint', 'test-fingerprint');
    localStorage.setItem('tokens', JSON.stringify({
      accessToken: 'test-access-token',
      refreshToken: 'test-refresh-token',
      expiresAt: expiry,
      remember: true,
    }));
    localStorage.setItem('user', JSON.stringify({
      user: { id: 1, username: 'admin' },
      expiresAt: expiry,
    }));
  }, futureExpiry);

  // Capture all console logs and errors
  const logs: { type: string; text: string }[] = [];
  page.on('console', msg => logs.push({ type: msg.type(), text: msg.text() }));

  await page.goto('http://localhost:3005/admin/wallpaper');
  await page.waitForSelector('.ant-table', { timeout: 10000 });

  // Find all logout-related elements
  const logoutButtons = await page.locator('button').filter({ hasText: /logout/i }).all();
  console.log(`Found ${logoutButtons.length} logout buttons`);
  for (let i = 0; i < logoutButtons.length; i++) {
    const b = logoutButtons[i];
    const text = await b.textContent();
    const cls = await b.getAttribute('class');
    const disabled = await b.getAttribute('disabled');
    const ariaLabel = await b.getAttribute('aria-label');
    console.log(`Button ${i}: text="${text}" class="${cls}" disabled=${disabled} aria-label=${ariaLabel}`);
  }

  // Click the first one and wait
  if (logoutButtons.length > 0) {
    const urlBefore = page.url();
    console.log(`URL before click: ${urlBefore}`);
    await logoutButtons[0].click();
    console.log('Clicked logout button');

    // Wait a bit for any action
    await page.waitForTimeout(3000);

    const urlAfter = page.url();
    console.log(`URL after click: ${urlAfter}`);

    // Check localStorage
    const tokens = await page.evaluate(() => localStorage.getItem('tokens'));
    console.log(`Tokens after click: ${tokens}`);

    // Print all console logs
    for (const log of logs) {
      console.log(`[${log.type}] ${log.text}`);
    }

    await page.screenshot({ path: '/tmp/logout-debug.png' });
    console.log('Screenshot saved');
  }
});
