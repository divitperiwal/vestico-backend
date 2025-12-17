export const createSessionCookie = (sessionId: string) => {
  const secure = process.env.NODE_ENV === "production";
  return `session=${sessionId}; HttpOnly; Path=/; SameSite=Lax; ${secure ? "Secure;" : ""}`;
};

export const clearSessionCookie = () => {
    return `session=;HttpOnly; Path=/; Max-Age=0; SameSite=Lax;`;
}

export const readSessionCookie = (cookieHeader?: string) : string | null => {
    if (!cookieHeader) return null;
    const cookies = Object.fromEntries(cookieHeader.split(';').map((c) => c.split('=')));

    return cookies['session'] || null;
}
