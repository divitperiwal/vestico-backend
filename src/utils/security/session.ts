import { SESSION_DURATION_MS } from "@/constant";
import { AuthCache } from "@/modules/auth/auth.cache";
import { generateSessionId } from "../response/token";

export async function createSession(userId: string) {
    const sessionId = generateSessionId();
    const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);
    const ttl = Math.floor(SESSION_DURATION_MS / 1000);

    await AuthCache.storeSession(sessionId, userId, ttl);

    return { sessionId, expiresAt };
}