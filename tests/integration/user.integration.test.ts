import { beforeAll, describe, expect, test } from 'bun:test';

import { apiRequest, cleanDB, createUser, loginAs, uniqueUsername } from '../helper';

describe('User integration', () => {
  let username: string;
  let cookieHeader: string;

  beforeAll(async () => {
    await cleanDB();
    username = uniqueUsername('user');
    await createUser({
      username,
      password: 'password123',
      name: 'User Route',
      email: `${username}@example.com`,
      broker: 'dhan',
    });

    const login = await loginAs(username, 'password123');
    cookieHeader = login.cookieHeader;
  });

  test('GET /api/v1/user/me requires authentication', async () => {
    const response = await apiRequest('GET', '/api/v1/user/me');

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Unauthorized');
  });

  test('GET /api/v1/user/me returns the authenticated user', async () => {
    const response = await apiRequest('GET', '/api/v1/user/me', undefined, {
      Cookie: cookieHeader,
    });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toMatchObject({
      username,
      name: 'User Route',
      role: 'user',
      broker: 'dhan',
      strategy: 'MOMETF0508FR',
    });
    expect(response.body.data.password).toBeUndefined();
  });

  test('change password rejects invalid old password', async () => {
    const response = await apiRequest(
      'POST',
      '/api/v1/user/me/change-password',
      {
        oldPassword: 'wrong-password',
        newPassword: 'new-password123',
      },
      { Cookie: cookieHeader },
    );

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Old password is incorrect');
  });

  test('change password validates required body', async () => {
    const response = await apiRequest(
      'POST',
      '/api/v1/user/me/change-password',
      {
        oldPassword: 'password123',
      },
      { Cookie: cookieHeader },
    );

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  test('change password updates the password and clears session cookie', async () => {
    const response = await apiRequest(
      'POST',
      '/api/v1/user/me/change-password',
      {
        oldPassword: 'password123',
        newPassword: 'new-password123',
      },
      { Cookie: cookieHeader },
    );

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Password changed successfully. Please login again.');
    expect(response.setCookie.some((cookie) => cookie.startsWith('session=;'))).toBe(true);

    const oldLogin = await apiRequest('POST', '/api/v1/auth/login', {
      username,
      password: 'password123',
    });
    expect(oldLogin.status).toBe(401);

    const newLogin = await apiRequest('POST', '/api/v1/auth/login', {
      username,
      password: 'new-password123',
    });
    expect(newLogin.status).toBe(200);
  });
});
