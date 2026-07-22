const { test, expect } = require('@playwright/test');

test.describe('Login flows', () => {
  test('Manager login requires branch and stores branchName', async ({ page }) => {
    await page.goto('/login');
    // choose Manager role
    await page.click('text=Manager');
    // ensure branch input visible and autofilled if session exists
    // For test, we'll use demo credentials present in the seeded users
    await page.fill('input[type="email"]', 'saisujan@mail.com');
    await page.fill('input[type="password"]', 'password123');
    // enter branch id
    await page.fill('input[placeholder="Enter branch ID"]', '101');
    await page.click('button:has-text("Enter as Manager")');
    await page.waitForURL('**/manager/**');
    // check localStorage has restroaudit.currentUser with branchId
    const stored = await page.evaluate(() => localStorage.getItem('restroaudit.currentUser'));
    const cu = JSON.parse(stored);
    expect(cu.branchId).toBe(101);
    expect(cu.branchName).toBeTruthy();
  });
});
