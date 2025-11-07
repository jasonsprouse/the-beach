import { test, expect } from '@playwright/test';

test.describe('VR Game Manager', () => {
  test('should execute a VR task', async ({ page }) => {
    const vrTask = {
      id: 'vr-1',
      name: 'Test VR Task',
      description: 'This is a test VR task',
      assetUrl: 'https://example.com/asset.glb',
    };
    await page.request.post('/vr-game-manager/tasks', {
      data: vrTask,
    });
  });
});
