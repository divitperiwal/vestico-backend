export type DhanHolding = {
    exchange: string;
    tradingSymbol: string;
    securityId: string;
    isin: string;
    totalQty: number;
    dpQty: number;
    t1Qty: number;
    mtf_t1_qty: number;
    mtf_qty: number;
    availableQty: number;
    collateralQty: number;
    avgCostPrice: number;
    lastTradedPrice: number;
}
export type DhanFunds = {
    dhanClientId: string;
    availabelBalance: number;
    sodLimit: number;
    collateralAmount: number;
    receiveableAmount: number;
    utilizedAmount: number;
    blockedPayoutAmount: number;
    withdrawableBalance: number;
}