export const transformPortfolioData = (holdings: any[]) => {
    if (holdings.length === 0) return [];
    return holdings.map((holding) => ({
        ticker: holding.tradingsymbol,
        exchange: holding.exchange,
        instrument_token: holding.instrument_token,
        isin: holding.isin,
        type: holding.product,
        quantity: holding.quantity,
        average_price: holding.average_price,
        close_price: holding.close_price,
        pnl: holding.pnl,
        day_change: holding.day_change,
        day_change_percentage: holding.day_change_percentage
    }));
};

export const transformTopMoversData = (movers: any[]) => {
    if (movers.length === 0) return [];
    return movers.map((item) => ({
        exchange: item.exchange,
        segment: item.series,
        instrument_token: item.security_id,
        ltp: item.ltp,
        volume: item.volume,
        change_percentage: item.per_change,
        change: item.change,
        ticker_name: item.symbol_name,
        ticker: item.symbol
    }))
}

export const transformOlhcData = (olhc: any) => {
    return {
        instrument_token: olhc.instrument_token,
        ltp: olhc.ltp,
        open: olhc.ohlc.open,
        low: olhc.ohlc.low,
        high: olhc.ohlc.high,
        close: olhc.ohlc.close,
    }
}

export const transformHistoricalData = (history: any[]) => {
    return history.map((item) => ({
        ...item,
        adjClose: undefined
    }))
}

export const transformPositionsData = (positions: any[]) => {
    if (positions.length === 0) return [];
    return positions.map((position) => ({
        ticker: position.tradingsymbol,
        exchange: position.exchange,
        instrument_token: position.instrument_token,
        product: position.product,
        quantity: position.quantity,
        average_price: position.average_price,
        last_price: position.last_price,
        pnl: position.pnl,
        value: position.quantity > 0 ? position.buy_value : position.sell_value,
    }))
}

export const transformFundsData = (funds: any) => {
    return {
        total_capital: funds.LIMIT_SOD,
        available: funds.AVAILABLE_BALANCE,
        used_margin: funds.AMOUNT_UTILIZED,
        mtm: funds.MTM_COMBINED,
        peak_margin: funds.PEAK_MARGIN,
        unclear_balance: funds.UNCLEAR_BALANCE,
        clear_balance: funds.CLEAR_BALANCE
    }
}