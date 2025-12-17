import { generateSessionId } from "@/utils/sessionId.js";
import { SESSION_DURATION_MS } from "@/constant.js";
import { saveSession } from "@/database/auth.database.js";

export const createSession = async (userId: string) => {
  const sessionId = generateSessionId();
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);
  const save = await saveSession(sessionId, userId, expiresAt);

  return { sessionId, expiresAt };
};  


export const validateSession = async (sessionId : string) => {
    
}