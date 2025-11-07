import { test, expect } from '@playwright/test';

test.describe('VoIP Game Manager', () => {
  test('should execute a VoIP task', async ({ page }) => {
    const voipTask = {
      id: 'voip-1',
      name: 'Test VoIP Task',
      description: 'This is a test VoIP task',
      streamUrl: 'https://example.com/stream.mp3',
    };
    await page.request.post('/voip-game-manager/tasks', {
      data: voipTask,
    });
  });
});
