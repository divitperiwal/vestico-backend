import { z } from 'zod';
import { strategyEnum } from '@/database/schema/enums.schema.js';

export const RegisterUserSchema = z
  .object({
    username: z.string().min(2, 'Username must be at least 2 characters long').max(100, 'Username is too long').trim().regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
    email: z.email('Invalid email address').trim(),
    password: z.string().min(6, 'Password must be at least 6 characters long').max(100, 'Password is too long'),
    name: z.string().min(1, 'Name cannot be empty').max(50, 'Name is too long').trim(),
    broker: z.enum(['dhan', 'mstock'], 'Invalid broker'),
    strategy: z.enum(strategyEnum.enumValues, 'Invalid strategy'),
  })
export const UserParamsSchema = z
  .object({
    id: z.uuid('Invalid user ID').trim(),
  })
  .strict();

export const UpdateUserParamsSchema = z
  .object({
    name: z.string().min(1, 'Name cannot be empty').max(50, 'Name is too long').trim().optional(),
    email: z.email('Invalid email address').trim().optional(),
    strategy: z.enum(strategyEnum.enumValues, 'Invalid strategy').optional(),
  })
  .strict();

export const DhanCredentialsSchema = z
  .object({
    clientId: z.string().min(1, 'Client ID cannot be empty').trim().optional(),
    pin: z.string().min(1, 'PIN cannot be empty').trim().optional(),
    totpKey: z.string().min(1, 'TOTP Key cannot be empty').trim().optional(),
  })

export const MstockCredentialsSchema = z
  .object({
    apiKey: z.string().min(1, 'API Key cannot be empty').trim().optional(),
    totpKey: z.string().min(1, 'TOTP Key cannot be empty').trim().optional(),
  })
  .strict();
