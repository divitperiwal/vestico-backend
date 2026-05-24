import { describe, expect, test } from 'bun:test';

import { apiRequest } from '../helper';

describe('Health integration', () => {
  test('GET / returns welcome response', async () => {
    const response = await apiRequest('GET', '/');

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      success: true,
      message: 'Welcome to the API',
    });
  });

  test('GET /health returns health response with timestamp', async () => {
    const response = await apiRequest('GET', '/health');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('Server is healthy');
    expect(response.body.data.timestamp).toBeNumber();
  });

  test('unknown route returns 404', async () => {
    const response = await apiRequest('GET', '/not-a-real-route');

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('Route Not Found');
  });
});
