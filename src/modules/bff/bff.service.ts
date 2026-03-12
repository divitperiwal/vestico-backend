import type { User } from "@/types/common.js";
import { ApiError } from "@/utils/constants/ApiError.js";
import { MstockService } from "../broker/mstock/mstock.service.js";
import { UserService } from "../users/user.service.js";
import { InstrumentCache } from "@/cache/instrument.cache.js";
import { YFClient } from "@/lib/yahoo-finance.js";
import { transformFundsData, transformHistoricalData, transformOlhcData, transformPortfolioData, transformPositionsData, transformTopMoversData } from "@/utils/constants/transform.js";

export class BFFService {
    static async getWebDashboardData(user: User | undefined, accessToken: string | undefined, apiKey: string | undefined) {
        if (!user) throw new ApiError("User is required", 400);
        if (!accessToken) throw new ApiError("Access Token is required", 400);
        if (!apiKey) throw new ApiError("Api Key is required", 400);
        // Fetch and aggregate data for the web dashboard based on the user ID

        //Holdings
        //Top Gainers/Losers
        //User Profile
        const [profile, portfolio, topMovers] = await Promise.all([
            UserService.getUserProfile(user.userId),
            MstockService.getPortfolio(apiKey, accessToken, user.userId),
            MstockService.getTopMovers(apiKey, accessToken)
        ])

        return {
            profile,
            holdings: transformPortfolioData((portfolio ?? []).slice(0, 5)),
            movers: {
                gainers: transformTopMoversData((topMovers.gainers ?? []).slice(0, 5)),
                losers: transformTopMoversData((topMovers.losers ?? []).slice(0, 5))
            }
        }

        //Most Active
        //52 Week High/Low
        //Market Insights
        //Activity Feed
    }

    static async getTickerData(user: User | undefined, accessToken: string | undefined, apiKey: string | undefined, ticker: string) {
        if (!user) throw new ApiError("User is required", 400);
        if (!accessToken) throw new ApiError("Access Token is required", 400);
        if (!apiKey) throw new ApiError("Api Key is required", 400);
        if (!ticker) throw new ApiError("Ticker is required", 400);

        const instrument = InstrumentCache.getByTicker(ticker);
        if (!instrument) throw new ApiError("Invalid Ticker", 400);

        //Fetch and aggregate data for the specific ticker
        const today = new Date();
        const fromDate = (new Date(today.getFullYear() - 1, today.getMonth(), today.getDate())).toISOString().split('T')[0];

        //LTP, OLHC
        //Intraday Chart
        //1Y historical data
        //Fundamentals
        //Peers
        const [olhc, intradayChart, historicalData, fundamentals, peers] = await Promise.all([
            MstockService.getOlhcData(apiKey, accessToken, `NSE:${instrument.ticker}`),
            MstockService.getIntradayData(apiKey, accessToken, String(instrument.token)),
            YFClient.getHistoricalData(ticker, fromDate, today.toISOString().split('T')[0]),
            YFClient.getFundamentals(ticker),
            YFClient.getPeers(ticker)
        ])

        return { olhc: transformOlhcData(olhc[`NSE:${instrument.ticker}`] ?? {}), intradayChart, historicalData: transformHistoricalData(historicalData), peers };

    }

    static async getWebPortfolioData(user: User | undefined, accessToken: string | undefined, apiKey: string | undefined) {
        if (!user) throw new ApiError("User is required", 400);
        if (!accessToken) throw new ApiError("Access Token is required", 400);
        if (!apiKey) throw new ApiError("Api Key is required", 400);

        const [portfolio, recommendation] = await Promise.all([
            MstockService.getPortfolio(apiKey, accessToken, user.userId),
            UserService.getUserRecommendation(user.userId)
        ])

        return { portfolio: transformPortfolioData((portfolio ?? [])), recommendation }
    }

    static async getWebPositionData(user: User | undefined, accessToken: string | undefined, apiKey: string | undefined) {
        if (!user) throw new ApiError("User is required", 400);
        if (!accessToken) throw new ApiError("Access Token is required", 400);
        if (!apiKey) throw new ApiError("Api Key is required", 400);

        const rawPositions = await MstockService.getPositions(apiKey, accessToken, user.userId);
        const positions = transformPositionsData(rawPositions.net);
        return positions;
    }

    static async getWebOrderData(user: User | undefined, accessToken: string | undefined, apiKey: string | undefined) {
        if (!user) throw new ApiError("User is required", 400);
        if (!accessToken) throw new ApiError("Access Token is required", 400);
        if (!apiKey) throw new ApiError("Api Key is required", 400);

        const [orderBook, tradeBook] = await Promise.all([
            MstockService.getOrderBook(apiKey, accessToken),
            MstockService.getTradeBook(apiKey, accessToken)
        ])

        return { orderBook, tradeBook }
    }

    static async getWebFundsData(user: User | undefined, accessToken: string | undefined, apiKey: string | undefined) {
        if (!user) throw new ApiError("User is required", 400);
        if (!accessToken) throw new ApiError("Access Token is required", 400);
        if (!apiKey) throw new ApiError("Api Key is required", 400);

        const rawFunds = await MstockService.getFunds(apiKey, accessToken, user.userId);
        const funds = transformFundsData(rawFunds[0]);
        return funds;
    }
}