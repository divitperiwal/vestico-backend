import { CSRF_COOKIE_NAME } from "@/constant.js"

//Session Cookie Utilities
export const createSessionCookie = (sessionId: string) => {
  const secure = process.env.NODE_ENV === 'production';
  return `session=${sessionId}; HttpOnly; Path=/; SameSite=Lax; ${secure ? 'Secure;' : ''}`;
};

export const clearSessionCookie = () => {
  return `session=;HttpOnly; Path=/; Max-Age=0; SameSite=Lax;`;
};

export const readSessionCookie = (cookieHeader?: string): string | null => {
  if (!cookieHeader) return null;
  const cookies = Object.fromEntries(cookieHeader.split(';').map((c) => c.trim().split('=')));

  return cookies['session'] || null;
};

//CSRF Token Utilities
export const createCsrfCookie = (token: string) => {
  const secure = process.env.NODE_ENV === 'production';
  return `${CSRF_COOKIE_NAME}=${token}; Path=/; SameSite=Lax ; ${secure ? 'Secure;' : ''}`;
};

export const readCsrfCookie = (cookieHeader?: string): string | null => {
  if (!cookieHeader) return null;

  const cookies = Object.fromEntries(
    cookieHeader.split(';').map((c) => {
      const [key, value] = c.split('=');
      return [key.trim(), value?.trim()];
    })
  );

  return cookies[CSRF_COOKIE_NAME] || null;
};

export const clearCsrfCookie = () => {
  return `${CSRF_COOKIE_NAME}=; Path=/; Max-Age=0; SameSite=Lax ;`;
};