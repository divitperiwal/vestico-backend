import { beforeAll, describe, expect, test } from 'bun:test';

import { apiRequest, cleanDB, createUser, loginAs, uniqueUsername } from '../helper';

describe('Admin integration', () => {
  let adminCookie: string;
  let userCookie: string;
  let createdUserId: string;

  beforeAll(async () => {
    await cleanDB();

    const adminUsername = uniqueUsername('admin');
    const userUsername = uniqueUsername('regular');

    await createUser({
      username: adminUsername,
      password: 'password123',
      name: 'Admin User',
      role: 'admin',
    });
    await createUser({
      username: userUsername,
      password: 'password123',
      name: 'Regular User',
      role: 'user',
    });

    adminCookie = (await loginAs(adminUsername)).cookieHeader;
    userCookie = (await loginAs(userUsername)).cookieHeader;
  });

  test('admin routes require authentication', async () => {
    const response = await apiRequest('GET', '/api/v1/admin/users');

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Unauthorized');
  });

  test('admin routes reject non-admin users', async () => {
    const response = await apiRequest('GET', '/api/v1/admin/users', undefined, {
      Cookie: userCookie,
    });

    expect(response.status).toBe(403);
    expect(response.body.message).toBe('Forbidden: Admins only');
  });

  test('admin can register a user with a broker row', async () => {
    const username = uniqueUsername('created');
    const response = await apiRequest(
      'POST',
      '/api/v1/admin/users',
      {
        username,
        email: `${username}@example.com`,
        password: 'password123',
        name: 'Created User',
        broker: 'dhan',
        strategy: 'MOMETF0508FR',
      },
      { Cookie: adminCookie },
    );

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.userId).toBeString();
    createdUserId = response.body.data.userId;
  });

  test('admin can list and fetch users', async () => {
    const list = await apiRequest('GET', '/api/v1/admin/users', undefined, {
      Cookie: adminCookie,
    });

    expect(list.status).toBe(200);
    expect(Array.isArray(list.body.data)).toBe(true);
    expect(list.body.data.some((user: any) => user.userId === createdUserId)).toBe(true);

    const single = await apiRequest('GET', `/api/v1/admin/users/${createdUserId}`, undefined, {
      Cookie: adminCookie,
    });

    expect(single.status).toBe(200);
    expect(single.body.data).toMatchObject({
      userId: createdUserId,
      name: 'Created User',
      broker: 'dhan',
      strategy: 'MOMETF0508FR',
    });
  });

  test('admin can update user profile fields', async () => {
    const response = await apiRequest(
      'PATCH',
      `/api/v1/admin/users/${createdUserId}`,
      {
        name: 'Updated User',
        strategy: 'MOMETF0812FR',
      },
      { Cookie: adminCookie },
    );

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('User updated successfully');

    const single = await apiRequest('GET', `/api/v1/admin/users/${createdUserId}`, undefined, {
      Cookie: adminCookie,
    });
    expect(single.body.data).toMatchObject({
      name: 'Updated User',
      strategy: 'MOMETF0812FR',
    });
  });

  test('admin can check and update broker credentials', async () => {
    const beforeUpdate = await apiRequest(
      'GET',
      `/api/v1/admin/users/${createdUserId}/broker-credentials`,
      undefined,
      { Cookie: adminCookie },
    );

    expect(beforeUpdate.status).toBe(200);
    expect(beforeUpdate.body.data.present).toBe(false);

    const update = await apiRequest(
      'PATCH',
      `/api/v1/admin/users/${createdUserId}/broker-credentials`,
      {
        clientId: 'client-1',
        pin: '1234',
        totpKey: 'JBSWY3DPEHPK3PXP',
      },
      { Cookie: adminCookie },
    );

    expect(update.status).toBe(200);
    expect(update.body.message).toBe('Broker credentials updated successfully');

    const afterUpdate = await apiRequest(
      'GET',
      `/api/v1/admin/users/${createdUserId}/broker-credentials`,
      undefined,
      { Cookie: adminCookie },
    );

    expect(afterUpdate.status).toBe(200);
    expect(afterUpdate.body.data.present).toBe(true);
  });

  test('admin routes validate uuid params and update body', async () => {
    const invalidId = await apiRequest('GET', '/api/v1/admin/users/not-a-uuid', undefined, {
      Cookie: adminCookie,
    });
    expect(invalidId.status).toBe(400);

    const invalidBody = await apiRequest(
      'PATCH',
      `/api/v1/admin/users/${createdUserId}`,
      { role: 'admin' },
      { Cookie: adminCookie },
    );
    expect(invalidBody.status).toBe(400);
  });
});
