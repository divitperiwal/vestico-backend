type Instrument = {
    token: number,
    ticker: string,
    name: string
}

const tokenMap = new Map<number, Instrument>();
const tickerMap = new Map<string, Instrument>();

export const InstrumentCache = {
    set(instrument: Instrument) {
        tokenMap.set(instrument.token, instrument);
        tickerMap.set(instrument.ticker, instrument);
    },

    getByToken(token: number) {
        return tokenMap.get(token);
    },

    getByTicker(ticker: string) {
        return tickerMap.get(ticker);
    },
    
    getTicker(token: number) {
        return tokenMap.get(token)?.ticker;
    },

    getName(token: number) {
        return tokenMap.get(token)?.name;
    },

    getToken(ticker: string) {
        return tickerMap.get(ticker)?.token;
    }
}