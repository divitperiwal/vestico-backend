import { SESSION_DURATION_MS } from "@/constant";
import { AuthCache } from "@/modules/auth/auth.cache";
import { generateSessionId } from "../response/token";

export async function createSession(userId: string) {
    const sessionId = generateSessionId();
    const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

    await AuthCache.storeSession(sessionId, userId, expiresAt)
    
    return { sessionId, expiresAt };
}