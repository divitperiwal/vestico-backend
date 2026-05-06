import YahooFinance from 'yahoo-finance2';

export class YFClient {
    private static yahooFinance = new YahooFinance({ suppressNotices: ['ripHistorical'] });

    static async isMarketOpen() {
        const { marketState } = await this.yahooFinance.quote('RELIANCE.NS');
        return marketState === 'REGULAR';
    }
    static async marketState() {
        const { marketState } = await this.yahooFinance.quote('RELIANCE.NS');
        return marketState;
    }
    static async getIntradayData(ticker: string) {
        const now = new Date();

        for (let i = 0; i < 5; i++) {
            const date = new Date(now);
            date.setDate(now.getDate() - i);

            // Market open 9:15 IST
            const period1 = new Date(date);
            period1.setUTCHours(3, 45, 0, 0);

            // Market close 15:30 IST
            const period2 = new Date(date);
            period2.setUTCHours(10, 0, 0, 0);

            const chart = await this.yahooFinance.chart(`${ticker}.NS`, {
                interval: "1m",
                period1,
                period2
            });

            if (chart.quotes && chart.quotes.length > 0) {
                return chart.quotes;
            }
        }

        return [];
    }


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
        return data.recommendedSymbols
            .slice(0, 4)
            .map((p: any) =>
                p.symbol?.replace(/\.(NS|BO)$/, "")
            );
    }

    static async getIndicesLTP(indices: string[]) {
        const quote = await this.yahooFinance.quote(indices);

        return quote
    }
}