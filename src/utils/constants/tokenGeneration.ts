import crypto from 'crypto';

export const generateSessionId = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

export const generateCsrfToken = (): string => {
  return crypto.randomBytes(32).toString('hex');
};