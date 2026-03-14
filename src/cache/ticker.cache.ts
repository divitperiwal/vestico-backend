import redis from '@/config/redis.config.js';
import { getSecondsUntilMarketOpen } from '@/utils/helper/expiry.js';
type TickerCacheData = Partial<{
    historical: any;
    intraday: any;
    olhc: any;
    fundamentals: any;
    peers: any;
}>;

export class TickerCache {
    static async get(ticker: string, type: string) {
        return await redis.get(`ticker:${ticker}:${type}`);
    }


    static async set(
        ticker: string,
        data: TickerCacheData,
        isMarketOpen: boolean
    ) {
        const pipeline = redis.multi();

        const ttlUntilOpen = getSecondsUntilMarketOpen();

        const ttlMap: Record<string, number> = {
            historical: 21600,     // 6 hours
            fundamentals: 86400 * 2,   // 48 hours
            peers: 86400 * 2,          // 48 hours
            intraday: isMarketOpen ? 60 : ttlUntilOpen,
            olhc: isMarketOpen ? 30 : ttlUntilOpen
        };

        for (const [key, value] of Object.entries(data)) {
            if (value == null) continue;
            console.log(`Setting cache for ticker:${ticker}:${key} with TTL ${ttlMap[key] ?? 3600}s`);
            pipeline.set(
                `ticker:${ticker}:${key}`,
                JSON.stringify(value),
                "EX",
                ttlMap[key] ?? 3600
            );
        }

        await pipeline.exec();
    }

    static async mget(ticker: string,) {
        const [historical, intraday, olhc, fundamentals, peers] = await redis.mget(
            `ticker:${ticker}:historical`,
            `ticker:${ticker}:intraday`,
            `ticker:${ticker}:olhc`,
            `ticker:${ticker}:fundamentals`,
            `ticker:${ticker}:peers`
        );
        return {
            historical: historical ? JSON.parse(historical) : null,
            intraday: intraday ? JSON.parse(intraday) : null,
            olhc: olhc ? JSON.parse(olhc) : null,
            fundamentals: fundamentals ? JSON.parse(fundamentals) : null,
            peers: peers ? JSON.parse(peers) : null
        };
    }

}