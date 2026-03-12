import YahooFinance from 'yahoo-finance2';

export class YFClient {
    private static yahooFinance = new YahooFinance({ suppressNotices: ['ripHistorical'] });

    static async getHistoricalData(ticker: string, fromDate: string, toDate: string) {
        const history = await this.yahooFinance.historical(`${ticker}.NS`, {
            period1: fromDate,
            period2: toDate,
            interval: '1d'
        })

        return history;
    }

    static async getFundamentals(ticker: string) {
        const data = await this.yahooFinance.quoteSummary(`${ticker}.NS`, {
            modules: [
                "price",
                "summaryDetail",
                "defaultKeyStatistics",
                "financialData",
                "assetProfile",
                "majorHoldersBreakdown",
            ]
        })

        return {
            name: data.price?.longName,
            marketCap: data.price?.marketCap,
            peRatio: data.summaryDetail?.trailingPE,
            pbRatio: data.defaultKeyStatistics?.priceToBook,
            epsTTM: data.defaultKeyStatistics?.trailingEps,
            bookValue: data.defaultKeyStatistics?.bookValue,
            dividendYield: data.summaryDetail?.dividendYield,
            beta: data.defaultKeyStatistics?.beta,
            sector: data.assetProfile?.sector,
            industry: data.assetProfile?.industry,
            breakdown: data.majorHoldersBreakdown,
        };
    }

    static async getPeers(ticker: string) {
        const data: any = await this.yahooFinance.recommendationsBySymbol(`${ticker}.NS`);
        console.log(data)
        return data.recommendedSymbols
            .slice(0, 4)
            .map((p: any) =>
                p.symbol?.replace(/\.(NS|BO)$/, "")
            );
    }
}