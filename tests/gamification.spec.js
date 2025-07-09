const { test, expect } = require('@playwright/test');
const { loginAs } = require('./helpers/auth');

test.describe('Staff Gamification Features', () => {
  test.describe('Admin Configuration', () => {
    test.beforeEach(async ({ page }) => {
      // Login as admin
      await loginAs(page, 'admin');
      // Navigate to gamification config page
      await page.goto('/admin/staff/gamification-config');
      await expect(page.locator('h1:has-text("Gamification Configuration")')).toBeVisible();
    });
    
    test('should create a new achievement', async ({ page }) => {
      // Click on create achievement button
      await page.locator('button:has-text("Create Achievement")').click();
      
      // Fill achievement form
      await page.locator('input[name="name"]').fill('Test Achievement');
      await page.locator('textarea[name="description"]').fill('This is a test achievement');
      await page.locator('input[name="points"]').fill('50');
      
      // Select achievement criteria
      await page.selectOption('select[name="criteria-type"]', 'sales-target');
      await page.locator('input[name="criteria-value"]').fill('1000');
      
      // Upload badge image
      await page.setInputFiles('input[type="file"]', './fixtures/badge.png');
      
      // Submit form
      await page.locator('button:has-text("Save Achievement")').click();
      
      // Verify success message
      await expect(page.locator('div.toast-success:has-text("Achievement created")')).toBeVisible();
      
      // Check if achievement appears in list
      await expect(page.locator('td:has-text("Test Achievement")')).toBeVisible();
    });
    
    test('should configure leaderboard settings', async ({ page }) => {
      // Navigate to leaderboard tab
      await page.locator('button:has-text("Leaderboard Settings")').click();
      
      // Configure leaderboard
      await page.selectOption('select[name="leaderboard-type"]', 'sales');
      await page.selectOption('select[name="time-period"]', 'weekly');
      await page.locator('input[name="top-performers"]').clear();
      await page.locator('input[name="top-performers"]').fill('10');
      
      // Toggle visibility settings
      await page.locator('label:has-text("Public Leaderboard")').click();
      
      // Save settings
      await page.locator('button:has-text("Save Settings")').click();
      
      // Verify success message
      await expect(page.locator('div.toast-success:has-text("Settings saved")')).toBeVisible();
    });
    
    test('should set up rewards system', async ({ page }) => {
      // Navigate to rewards tab
      await page.locator('button:has-text("Rewards System")').click();
      
      // Add new reward
      await page.locator('button:has-text("Add Reward")').click();
      
      // Fill reward form
      await page.locator('input[name="reward-name"]').fill('Test Reward');
      await page.locator('textarea[name="reward-description"]').fill('This is a test reward');
      await page.locator('input[name="points-required"]').fill('500');
      await page.selectOption('select[name="reward-type"]', 'cash-bonus');
      await page.locator('input[name="reward-value"]').fill('50');
      
      // Save reward
      await page.locator('button:has-text("Save Reward")').click();
      
      // Verify success message
      await expect(page.locator('div.toast-success:has-text("Reward added")')).toBeVisible();
      
      // Check if reward appears in list
      await expect(page.locator('td:has-text("Test Reward")')).toBeVisible();
      await expect(page.locator('td:has-text("500 points")')).toBeVisible();
    });
  });
  
  test.describe('Staff Gamification Experience', () => {
    test.beforeEach(async ({ page }) => {
      // Login as staff
      await loginAs(page, 'staff');
      // Navigate to staff dashboard
      await page.goto('/staff/dashboard/performance-overview');
      await expect(page.locator('h1:has-text("Performance Overview")')).toBeVisible();
    });
    
    test('should display current achievements and progress', async ({ page }) => {
      // Navigate to achievement center
      await page.locator('a:has-text("Achievement Center")').click();
      
      // Check if achievements are displayed
      await expect(page.locator('div.achievement-card')).toBeVisible();
      
      // Verify progress indicators
      await expect(page.locator('div.progress-bar')).toBeVisible();
      await expect(page.locator('div.achievement-stats')).toBeVisible();
      
      // Check if points summary is shown
      await expect(page.locator('div.total-points')).toBeVisible();
    });
    
    test('should view and filter leaderboard', async ({ page }) => {
      // Navigate to leaderboard page
      await page.locator('a:has-text("Leaderboard")').click();
      
      // Verify leaderboard is visible
      await expect(page.locator('table.leaderboard-table')).toBeVisible();
      
      // Check ranking columns
      await expect(page.locator('th:has-text("Rank")')).toBeVisible();
      await expect(page.locator('th:has-text("Staff Member")')).toBeVisible();
      await expect(page.locator('th:has-text("Score")')).toBeVisible();
      
      // Filter by time period
      await page.selectOption('select[name="time-period"]', 'monthly');
      
      // Wait for leaderboard to update
      await page.waitForTimeout(1000);
      
      // Filter by metric
      await page.selectOption('select[name="metric"]', 'sales-amount');
      
      // Wait for leaderboard to update again
      await page.waitForTimeout(1000);
    });
    
    test('should complete a challenge and earn points', async ({ page }) => {
      // Navigate to challenge hub
      await page.goto('/staff/gamification/challenge-hub');
      await expect(page.locator('h1:has-text("Challenge Hub")')).toBeVisible();
      
      // Find an active challenge
      const activeChallenge = page.locator('div.challenge-card:not(.completed)').first();
      await activeChallenge.click();
      
      // View challenge details
      await expect(page.locator('div.challenge-details')).toBeVisible();
      
      // Get current points
      await page.goto('/staff/profile/personal-profile');
      const currentPointsText = await page.locator('div.profile-points').textContent();
      const currentPoints = parseInt(currentPointsText.match(/\d+/)[0], 10);
      
      // Complete a challenge (simulation)
      // In a real test, we would perform actions that complete a challenge
      // For this test, we'll directly call an API that simulates challenge completion
      await page.evaluate(() => {
        window.completeChallenge = async () => {
          const response = await fetch('/api/challenges/complete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ challengeId: 'test-challenge-1' })
          });
          return await response.json();
        };
        return window.completeChallenge();
      });
      
      // Refresh profile page to see updated points
      await page.reload();
      
      // Verify points increased
      const newPointsText = await page.locator('div.profile-points').textContent();
      const newPoints = parseInt(newPointsText.match(/\d+/)[0], 10);
      expect(newPoints).toBeGreaterThan(currentPoints);
      
      // Check notification for points earned
      await expect(page.locator('div.notification:has-text("earned points")')).toBeVisible();
    });
    
    test('should redeem points for rewards', async ({ page }) => {
      // Navigate to rewards page
      await page.goto('/staff/gamification/rewards');
      await expect(page.locator('h1:has-text("Rewards")')).toBeVisible();
      
      // Find a reward that can be redeemed
      const availableReward = page.locator('div.reward-card:not(.insufficient-points)').first();
      
      // If no available rewards, skip test
      const hasAvailableRewards = await availableReward.count() > 0;
      test.skip(!hasAvailableRewards, 'No rewards available for redemption');
      
      if (hasAvailableRewards) {
        // Get current points before redemption
        const currentPointsText = await page.locator('div.available-points').textContent();
        const currentPoints = parseInt(currentPointsText.match(/\d+/)[0], 10);
        
        // Get reward points cost
        const rewardCostText = await availableReward.locator('div.points-required').textContent();
        const rewardCost = parseInt(rewardCostText.match(/\d+/)[0], 10);
        
        // Click redeem button
        await availableReward.locator('button:has-text("Redeem")').click();
        
        // Confirm redemption
        await page.locator('button:has-text("Confirm Redemption")').click();
        
        // Verify success message
        await expect(page.locator('div.toast-success:has-text("Reward redeemed")')).toBeVisible();
        
        // Check points were deducted
        const newPointsText = await page.locator('div.available-points').textContent();
        const newPoints = parseInt(newPointsText.match(/\d+/)[0], 10);
        expect(newPoints).toEqual(currentPoints - rewardCost);
        
        // Verify reward appears in redemption history
        await page.locator('a:has-text("Redemption History")').click();
        await expect(page.locator('table.redemption-history')).toBeVisible();
        const firstRedemption = page.locator('table.redemption-history tbody tr').first();
        await expect(firstRedemption).toBeVisible();
      }
    });
  });
}); 