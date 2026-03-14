import redis from "@/config/redis.config.js"

export class MarketCache {
    static async get(key: string) {
        return await redis.get(`market:${key}`);
    }
    static async set(key: string, value: any, ex: number) {
        await redis.set(`market:${key}`, value, "EX", ex);
    }
}