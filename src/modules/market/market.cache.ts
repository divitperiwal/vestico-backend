import redis from "@/config/redis.config"
import { isMarketOpen } from "@/utils/helpers/market-open"
import { getSecondsUntilMarketOpen } from "@/utils/parsers/expiry"

const TTL = {
    topMovers: 60 * 15,
    intraday: 60,
    ohlc: 60,
    historical: 6 * 60 * 60,
    fundamentals: 2 * 24 * 60 * 60,
    peers: 2 * 24 * 60 * 60,
}

const getTTL = (key: keyof typeof TTL) => {
    if (isMarketOpen()) return TTL[key]

    const seconds = getSecondsUntilMarketOpen();
    return seconds > 0 ? seconds : TTL[key]
}

export const MarketCache = {
    //TopMovers
    getTopMovers: async () => {
        const data = await redis.get(`market:top-movers`)
        return data ? JSON.parse(data) : null
    },

    setTopMovers: async (data: any) => {
        const ttl = getTTL('topMovers')
        await redis.setex(`market:top-movers`, ttl, JSON.stringify(data))
    },

    //Ticker Data (Add set bundle)

    getTickerData: async (ticker: string, key: string) => {
        const data = await redis.get(`market:ticker:${ticker}:${key}`)
        return data ? JSON.parse(data) : null
    },

    setTickerData: async (ticker: string, key: keyof typeof TTL, data: any) => {
        const ttl = getTTL(key)
        await redis.setex(`market:ticker:${ticker}:${key}`, ttl, JSON.stringify(data))
    },

    getTickerBundle: async (ticker: string) => {
        const [historical, intraday, ohlc, fundamentals, peers] = await redis.mget(
            `market:ticker:${ticker}:historical`,
            `market:ticker:${ticker}:intraday`,
            `market:ticker:${ticker}:ohlc`,
            `market:ticker:${ticker}:fundamentals`,
            `market:ticker:${ticker}:peers`
        )

        return {
            historical: historical ? JSON.parse(historical) : null,
            intraday: intraday ? JSON.parse(intraday) : null,
            ohlc: ohlc ? JSON.parse(ohlc) : null,
            fundamentals: fundamentals ? JSON.parse(fundamentals) : null,
            peers: peers ? JSON.parse(peers) : null
        }
    },

}

