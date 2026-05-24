import { beforeAll, describe, expect, test } from 'bun:test';

import { apiRequest, cleanDB, createUser, getCookieValue, uniqueUsername } from '../helper';

describe('Auth integration', () => {
  let username: string;

  beforeAll(async () => {
    await cleanDB();
    username = uniqueUsername('login');
    await createUser({ username, password: 'password123', name: 'Login User' });
  });

  describe('POST /api/v1/auth/login', () => {
    test('logs in with valid credentials and sets auth cookies', async () => {
      const response = await apiRequest('POST', '/api/v1/auth/login', {
        username,
        password: 'password123',
      });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Login Successfull');
      expect(response.body.data).toMatchObject({
        username,
        name: 'Login User',
        role: 'user',
      });
      expect(response.body.data.userId).toBeString();
      expect(response.body.data.password).toBeUndefined();
      expect(getCookieValue(response.setCookie, 'session')).toBeTruthy();
      expect(getCookieValue(response.setCookie, 'csrf_token')).toBeTruthy();
    });

    test('normalizes username casing and surrounding spaces', async () => {
      const response = await apiRequest('POST', '/api/v1/auth/login', {
        username: `  ${username.toUpperCase()}  `,
        password: 'password123',
      });

      expect(response.status).toBe(200);
      expect(response.body.data.username).toBe(username);
    });

    test('rejects an unknown username', async () => {
      const response = await apiRequest('POST', '/api/v1/auth/login', {
        username: uniqueUsername('missing'),
        password: 'password123',
      });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid Credentials');
    });

    test('rejects an invalid password', async () => {
      const response = await apiRequest('POST', '/api/v1/auth/login', {
        username,
        password: 'wrong-password',
      });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid Credentials');
    });

    test('rejects missing username', async () => {
      const response = await apiRequest('POST', '/api/v1/auth/login', {
        password: 'password123',
      });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test('rejects missing password', async () => {
      const response = await apiRequest('POST', '/api/v1/auth/login', {
        username,
      });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test('rejects a short password', async () => {
      const response = await apiRequest('POST', '/api/v1/auth/login', {
        username,
        password: '123',
      });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Password must be at least 6 characters long');
    });

    test('rejects unknown fields', async () => {
      const response = await apiRequest('POST', '/api/v1/auth/login', {
        username,
        password: 'password123',
        role: 'admin',
      });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/auth/logout', () => {
    test('logs out an active session and clears auth cookies', async () => {
      const login = await apiRequest('POST', '/api/v1/auth/login', {
        username,
        password: 'password123',
      });
      const sessionId = getCookieValue(login.setCookie, 'session');

      const response = await apiRequest('GET', '/api/v1/auth/logout', undefined, {
        Cookie: `session=${sessionId}`,
      });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Logout Successful');
      expect(response.setCookie.some((cookie) => cookie.startsWith('session=;'))).toBe(true);
      expect(response.setCookie.some((cookie) => cookie.startsWith('csrf_token=;'))).toBe(true);
    });

    test('logout succeeds even when no session cookie is present', async () => {
      const response = await apiRequest('GET', '/api/v1/auth/logout');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.setCookie.some((cookie) => cookie.startsWith('session=;'))).toBe(true);
      expect(response.setCookie.some((cookie) => cookie.startsWith('csrf_token=;'))).toBe(true);
    });
  });
});
