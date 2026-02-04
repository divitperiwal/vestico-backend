import { brokerEnum, strategyEnum } from '@/database/schema/enums.schema.js';
import { z } from 'zod';

export const LoginUserSchema = z
  .object({
    username: z.string().min(1, 'Username is required').trim().toLowerCase(),
    password: z.string().min(6, 'Password must be at least 6 characters long'),
  })
  .strict();

export const RegisterUserSchema = z
  .object({
    username: z.string().min(1, 'Username is required').trim().toLowerCase(),
    email: z.email('Invalid email address').trim().toLowerCase(),
    password: z
      .string()
      .min(6, 'Password must be at least 6 characters long')
      .max(50, 'Password is too long')
      .trim(),
    name: z.string().min(1, 'Name is required').trim().max(50, 'Name is too long'),
    broker: z.enum(brokerEnum.enumValues, { message: 'Broker must be either "dhan" or "mstock"' }),
    strategy: z.enum(strategyEnum.enumValues, {
      message: 'Please enter correct strategy',
    }),
  })
  .strict();
