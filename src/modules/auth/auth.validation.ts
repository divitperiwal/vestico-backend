import { z } from 'zod';

export const LoginUserSchema = z
  .object({
    username: z.string().min(1, 'Username is required').trim().toLowerCase(),
    password: z.string().min(6, 'Password must be at least 6 characters long'),
  })
  .strict();

