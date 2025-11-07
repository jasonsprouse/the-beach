import { test, expect } from '@playwright/test';

test.describe('IoT Game Manager', () => {
  test('should execute an IoT task', async ({ page }) => {
    const iotTask = {
      id: 'iot-1',
      name: 'Test IoT Task',
      description: 'This is a test IoT task',
      deviceId: 'device-123',
      payload: {
        temperature: 25,
      },
    };
    await page.request.post('/iot-game-manager/tasks', {
      data: iotTask,
    });
  });
});
