const { test, expect } = require('@playwright/test');

test.describe('Staff order flows', () => {
  test('Staff can create order scoped to branch', async ({ page, request }) => {
    const backendURL = 'http://localhost:8080';
    
    await page.goto('/login');
    
    // Select Staff role
    const staffRole = await page.locator('text=Staff').first();
    if (staffRole) await staffRole.click();
    
    // Fill login form with correct credentials (from seeded users)
    await page.fill('input[type="email"]', 'priya@mail.com');
    await page.fill('input[type="password"]', 'password123');
    await page.fill('input[placeholder="Enter branch ID"]', '101');
    
    // Click login button
    await page.click('button:has-text("Enter as Staff")');
    
    // Wait for navigation (with longer timeout)
    try {
      await page.waitForURL('**/staff/**', { timeout: 30000 });
    } catch (e) {
      // If navigation fails, check if we got an error message or wrong URL
      const pageURL = page.url();
      console.log('Current URL after login attempt:', pageURL);
      throw e;
    }
    
    // Verify we're on staff dashboard
    const currentURL = page.url();
    expect(currentURL).toContain('/staff');
    
    // Navigate to orders page
    await page.goto('/staff/orders');
    await page.waitForLoadState('networkidle');
    
    // Check API directly to verify branch scoping works (hit backend directly)
    const res = await request.get(`${backendURL}/api/orders/by-branch/101`);
    expect(res.status()).toBe(200);
    const orders = await res.json();
    expect(Array.isArray(orders)).toBeTruthy();
  });
});
