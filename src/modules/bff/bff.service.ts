import type { User } from "@/types/common.js";
import { ApiError } from "@/utils/constants/ApiError.js";
import { MstockService } from "../broker/mstock/mstock.service.js";
import { UserService } from "../users/user.service.js";
import { InstrumentCache } from "@/cache/instrument.cache.js";
import { YFClient } from "@/lib/yahoo-finance.js";
import { transformFundsData, transformHistoricalData, transformOlhcData, transformPortfolioData, transformPositionsData, transformTopMoversData } from "@/utils/constants/transform.js";
import { TickerCache } from "@/cache/ticker.cache.js";
import { MarketCache } from "@/cache/market.cache.js";
import { getNextMarketChangeTTL } from "@/utils/helper/expiry.js";

export class BFFService {
    static async getWebDashboardData(user: User | undefined, accessToken: string | undefined, apiKey: string | undefined) {
        if (!user) throw new ApiError("User is required", 400);
        if (!accessToken) throw new ApiError("Access Token is required", 400);
        if (!apiKey) throw new ApiError("Api Key is required", 400);
        // Fetch and aggregate data for the web dashboard based on the user ID

        //Holdings
        //Top Gainers/Losers
        //User Profile
        const [marketState, ltp, profile, portfolio, topMovers] = await Promise.all([
            this.isMarketOpen(),
            this.getDashboardLTP(),
            UserService.getUserProfile(user.userId),
            MstockService.getPortfolio(apiKey, accessToken, user.userId),
            MstockService.getTopMovers(apiKey, accessToken)
        ])

        return {
            profile,
            marketState,
            dashboardLTP: ltp,
            holdings: transformPortfolioData((portfolio ?? [])),
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

        ticker = ticker.toUpperCase();

        const instrument = InstrumentCache.getByTicker(ticker);
        if (!instrument) throw new ApiError("Invalid Ticker", 400);



        // Read cache
        const cached = (await TickerCache.mget(ticker)) ?? {};
        let { olhc, intraday, historical, fundamentals, peers } = cached;

        if (historical && intraday && olhc && fundamentals && peers) {
            return {
                olhc,
                intraday,
                historical,
                fundamentals,
                peers
            }
        }


        const isMarketOpen = await this.isMarketOpen();


        const today = new Date();
        const fromDate = new Date(
            today.getFullYear() - 1,
            today.getMonth(),
            today.getDate()
        ).toISOString().split("T")[0];

        const todayStr = today.toISOString().split("T")[0];

        // Create promises only for missing data
        const historicalPromise = !historical
            ? YFClient.getHistoricalData(ticker, fromDate, todayStr)
            : null;

        const fundamentalsPromise = !fundamentals
            ? YFClient.getFundamentals(ticker)
            : null;

        const peersPromise = !peers
            ? YFClient.getPeers(ticker)
            : null;

        const intradayPromise = !intraday
            ? isMarketOpen
                ? MstockService.getIntradayData(apiKey, accessToken, String(instrument.token))
                : YFClient.getIntradayData(ticker)
            : null;

        const olhcPromise = !olhc
            ? isMarketOpen
                ? MstockService.getOlhcData(apiKey, accessToken, [ticker])
                : null
            : null;


        // Fetch missing data in parallel
        const [
            historicalData,
            fundamentalsData,
            peersData,
            intradayData,
            olhcData
        ] = await Promise.all([
            historicalPromise,
            fundamentalsPromise,
            peersPromise,
            intradayPromise,
            olhcPromise
        ]);


        if (historicalData) historical = transformHistoricalData(historicalData);
        if (fundamentalsData) fundamentals = fundamentalsData;
        if (peersData) peers = peersData;
        if (intradayData) intraday = intradayData;
        if (olhcData) olhc = transformOlhcData(olhcData);

        if (!olhc && historical) {
            olhc = historical[historical.length - 1];
        }
        // Cache new values (skip null)
        const cacheData: any = {};

        if (historicalData) cacheData.historical = historical;
        if (intradayData) cacheData.intraday = intraday;
        if (olhcData) cacheData.olhc = olhc;
        if (fundamentalsData) cacheData.fundamentals = fundamentals;
        if (peersData) cacheData.peers = peers;

        if (Object.keys(cacheData).length > 0) {
            await TickerCache.set(ticker, cacheData, isMarketOpen);
        }

        return {
            olhc: olhc,
            intradayChart: intraday,
            fundamentals,
            historicalData: historical,
            peers
        };
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
        if (!rawPositions || !rawPositions.net) return [];
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


    static async isMarketOpen() {
        const cached = await MarketCache.get("status");
        if (cached === "open") return true;
        if (cached === "closed") return false;

        const isOpen = await YFClient.isMarketOpen();
        if (isOpen) {
            MarketCache.set("status", "open", getNextMarketChangeTTL());
        } else {
            MarketCache.set("status", "closed", getNextMarketChangeTTL());

        }
        return isOpen;
    }

    //Private Functions
    private static async getDashboardLTP() {
        const cached = await MarketCache.get("dashboard:tickers");
        if (cached) return JSON.parse(cached);

        const INDEX_MAP: Record<string, string> = {
            "^NSEI": "NIFTY50",
            "^NSEBANK": "BANKNIFTY",
            "^CNXFINANCE": "FINNIFTY",
            "^INDIAVIX": "INDIAVIX",
            "^NSEMDCP50": "NIFTYMIDCAP",
            "^NSMIDCP": "NIFTYNEXT50",
            "^BSESN": "SENSEX",
            "BSE-BANK.BO": "BANKEX"
        };

        const symbols = Object.keys(INDEX_MAP);

        //Fetch data and market open
        const [data, isMarketOpen] = await Promise.all([
            await YFClient.getIndicesLTP(symbols),
            await this.isMarketOpen()
        ])

        const formatted = data.map((d: any) => ({
            ticker: INDEX_MAP[d.symbol] ?? d.symbol,
            price: d.regularMarketPrice,
            change: d.regularMarketChange,
            changePercent: d.regularMarketChangePercent
        }));


        const ttl = isMarketOpen ? 5 : getNextMarketChangeTTL();

        MarketCache.set("dashboard:tickers", JSON.stringify(formatted), ttl);

        return formatted;
    }
}