import { describe, expect, test } from 'bun:test';

import { comparePassword, hashPassword } from '@/utils/security/hashing';
import { decryptData, encryptData } from '@/utils/security/encryption';

describe('security utilities', () => {
  test('hashPassword creates a bcrypt hash that comparePassword accepts', async () => {
    const hash = await hashPassword('password123');

    expect(hash).not.toBe('password123');
    expect(await comparePassword('password123', hash)).toBe(true);
    expect(await comparePassword('wrong-password', hash)).toBe(false);
  });

  test('encryptData and decryptData round trip text safely', () => {
    const payload = JSON.stringify({ clientId: 'client-1', pin: '1234' });
    const encrypted = encryptData(payload);

    expect(encrypted).not.toBe(payload);
    expect(encrypted.split(':')).toHaveLength(3);
    expect(decryptData(encrypted)).toBe(payload);
  });

  test('decryptData rejects malformed encrypted payloads', () => {
    expect(() => decryptData('not-valid')).toThrow('Invalid encrypted data format');
  });
});
