import { describe, expect, test } from 'bun:test';

import {
  clearCsrfCookie,
  clearSessionCookie,
  createCsrfCookie,
  createSessionCookie,
  readCsrfCookie,
  readSessionCookie,
} from '@/utils/response/cookies';

describe('cookie utilities', () => {
  test('creates and reads a session cookie', () => {
    const cookie = createSessionCookie('session-123');

    expect(cookie).toContain('session=session-123');
    expect(cookie).toContain('HttpOnly');
    expect(cookie).toContain('SameSite=Lax');
    expect(readSessionCookie(cookie)).toBe('session-123');
  });

  test('returns null when session cookie is missing', () => {
    expect(readSessionCookie()).toBeNull();
    expect(readSessionCookie('theme=dark')).toBeNull();
  });

  test('creates and reads a csrf cookie', () => {
    const cookie = createCsrfCookie('csrf-123');

    expect(cookie).toContain('csrf_token=csrf-123');
    expect(readCsrfCookie(cookie)).toBe('csrf-123');
  });

  test('returns null when csrf cookie is missing', () => {
    expect(readCsrfCookie()).toBeNull();
    expect(readCsrfCookie('session=session-123')).toBeNull();
  });

  test('clear cookies expire the expected names', () => {
    expect(clearSessionCookie()).toContain('session=;');
    expect(clearSessionCookie()).toContain('Max-Age=0');
    expect(clearCsrfCookie()).toContain('csrf_token=;');
    expect(clearCsrfCookie()).toContain('Max-Age=0');
  });
});
