export type Portfolio = {
    broker: 'dhan' | 'mstock';
    holdings: Holding[];
}

export type Funds = {
    broker: 'dhan' | 'mstock';
    available: number;
    withdrawable: number;
    utilized: number;
    receivable: number;
}

export type Holding = {
    securityId: string;
    symbol: string;
    type: 'stock' | 'mutual fund' | 'etf';
    avgPrice: number;
    quantity: number;
    ltp: number;
    investedValue: number;
    currentValue: number;
    pnl: number;
}