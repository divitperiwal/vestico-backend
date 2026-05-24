import { describe, expect, test } from 'bun:test';

import { RegisterUserSchema, UpdateUserParamsSchema } from '@/modules/admin/admin.validation';
import { LoginUserSchema } from '@/modules/auth/auth.validation';
import { changePasswordSchema } from '@/modules/users/user.validation';

describe('validation schemas', () => {
  test('LoginUserSchema trims and lowercases usernames', () => {
    const result = LoginUserSchema.parse({
      username: '  USER_NAME  ',
      password: 'password123',
    });

    expect(result.username).toBe('user_name');
  });

  test('LoginUserSchema rejects short passwords and unknown fields', () => {
    expect(() => LoginUserSchema.parse({ username: 'user', password: '123' })).toThrow();
    expect(() =>
      LoginUserSchema.parse({ username: 'user', password: 'password123', role: 'admin' }),
    ).toThrow();
  });

  test('RegisterUserSchema accepts a complete valid user', () => {
    const result = RegisterUserSchema.parse({
      username: 'new_user',
      email: 'new@example.com',
      password: 'password123',
      name: 'New User',
      broker: 'dhan',
      strategy: 'MOMETF0508FR',
    });

    expect(result.username).toBe('new_user');
  });

  test('RegisterUserSchema rejects invalid username, email, broker, and strategy', () => {
    expect(() =>
      RegisterUserSchema.parse({
        username: 'bad user',
        email: 'not-email',
        password: 'password123',
        name: 'Bad User',
        broker: 'unknown',
        strategy: 'bad-strategy',
      }),
    ).toThrow();
  });

  test('UpdateUserParamsSchema allows partial updates and rejects unknown fields', () => {
    expect(UpdateUserParamsSchema.parse({ name: 'Updated User' })).toEqual({ name: 'Updated User' });
    expect(() => UpdateUserParamsSchema.parse({ role: 'admin' })).toThrow();
  });

  test('changePasswordSchema requires both passwords', () => {
    expect(changePasswordSchema.parse({
      oldPassword: 'password123',
      newPassword: 'new-password123',
    })).toEqual({
      oldPassword: 'password123',
      newPassword: 'new-password123',
    });

    expect(() => changePasswordSchema.parse({ oldPassword: 'password123' })).toThrow();
  });
});
