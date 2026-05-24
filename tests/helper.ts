import { db } from "@/config/database.config";
import { broker_credentials, users } from "@/database/schema";
import { hashPassword } from "@/utils/security/hashing";
import { ensureServer } from "./setup";

export const cleanDB = async () => {
    await db.delete(broker_credentials);
    await db.delete(users);
}

export const uniqueUsername = (prefix: string) => {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export const createUser = async (credentials: any) => {
    const { username, password, role, strategy, name, email, broker } = credentials;
    const [user] = await db.insert(users).values({
        name: name ?? username,
        email: email ?? `${username}@example.com`,
        username,
        password: await hashPassword(password || "password123"),
        role: role || 'user',
        strategy: strategy || "MOMETF0508FR",
    }).returning({ userId: users.userId });

    if (!user) throw new Error("Failed to create test user");

    if (broker) {
        await db.insert(broker_credentials).values({
            userId: user.userId,
            broker,
            credentials: null,
        });
    }

    return user;
}

export const getCookieValue = (cookies: string[], name: string) => {
    const cookie = cookies.find((value) => value.startsWith(`${name}=`));
    return cookie?.split(";")[0]?.split("=")[1];
};

export const loginAs = async (username: string, password = "password123") => {
    const response = await apiRequest("POST", "/api/v1/auth/login", { username, password });
    const sessionId = getCookieValue(response.setCookie, "session");
    return {
        ...response,
        sessionId,
        cookieHeader: sessionId ? `session=${sessionId}` : "",
    };
};

export const apiRequest = async (
    method: string,
    path: string,
    body?: unknown,
    headers: Record<string, string> = {},
) => {
    const url = `${await ensureServer()}${path}`;
    const requestHeaders: Record<string, string> = { ...headers };

    if (body !== undefined) requestHeaders["Content-Type"] = "application/json";

    const response = await fetch(url, {
        method,
        headers: requestHeaders,
        body: body === undefined ? undefined : JSON.stringify(body),
    });

    const responseBody = await response.json() as any;
    const getSetCookie = "getSetCookie" in response.headers
        ? (response.headers as Headers & { getSetCookie: () => string[] }).getSetCookie()
        : [];

    return {
        status: response.status,
        body: responseBody,
        headers: response.headers,
        setCookie: getSetCookie.length > 0 ? getSetCookie : response.headers.get("set-cookie")?.split(", ") ?? [],
    };
};
