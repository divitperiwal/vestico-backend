import redis from "@/config/redis.config";
import type { Instrument } from "@/types/common";

let tokenMap = new Map<number, Instrument>();
let tickerMap = new Map<string, Instrument>();

export const InstrumentCache = {
    setInstruments: async (instruments: any[]) => {
        const pipeline = redis.pipeline()
        pipeline.del("instruments:by-token")
        pipeline.del("instruments:by-ticker")

        for (const instrument of instruments) {
            const normalized = {
                ...instrument,
                ticker: instrument.ticker.toUpperCase(),
            }

            pipeline.hset(`instruments:by-token`, String(normalized.token), JSON.stringify(normalized));

            pipeline.hset(`instruments:by-ticker`, normalized.ticker, JSON.stringify(normalized));
        }
        pipeline.expire("instruments:by-token", 24 * 60 * 60);
        pipeline.expire("instruments:by-ticker", 24 * 60 * 60);

        await pipeline.exec()
    },

    getInstruments: async () => {
        const result = await redis
            .multi()
            .hgetall("instruments:by-token")
            .hgetall("instruments:by-ticker")
            .exec()

        const byTokenRaw = result?.[0]?.[1]
        const byTickerRaw = result?.[1]?.[1]

        const byToken = Object.fromEntries(
            Object.entries(byTokenRaw ?? {}).map(([token, instrument]) => [
                token,
                JSON.parse(instrument),
            ])
        );

        const byTicker = Object.fromEntries(
            Object.entries(byTickerRaw ?? {}).map(([ticker, instrument]) => [
                ticker,
                JSON.parse(instrument),
            ])
        );

        return {
            byToken,
            byTicker,
        };

    },

    hydrateInstruments: async () => {
        const { byToken, byTicker } = await InstrumentCache.getInstruments();

        tokenMap = new Map<number, Instrument>(
            Object.entries(byToken).map(([token, instrument]) => [Number(token), instrument])
        );

        tickerMap = new Map<string, Instrument>(
            Object.entries(byTicker).map(([ticker, instrument]) => [ticker.toUpperCase(), instrument])
        );

        return {
            tokenCount: tokenMap.size,
            tickerCount: tickerMap.size,
        }
    },


    getByToken: (token: number) => {
        return tokenMap.get(token) || null;
    },

    getByTicker: (ticker: string) => {
        return tickerMap.get(ticker.toUpperCase()) || null;
    },

    getToken: (ticker: string) => {
        return tickerMap.get(ticker.toUpperCase())?.token;
    },

    getTicker: (token: number) => {
        return tokenMap.get(token)?.ticker;
    },
}