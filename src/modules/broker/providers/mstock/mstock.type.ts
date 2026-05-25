export type MstockHolding = {
    tradingsymbol: string;
    exchange: string;
    instrument_token: number;
    isin: string;
    product: string;
    price: number;
    quantity: number;
    used_quantity: number;
    t1_quantity: number;
    realised_quantity: number;
    authorised_quantity: number;
    authorised_date: Date | null;
    opening_quantity: number;
    collateral_quantity: number;
    collateral_type: string;
    discrepancy: boolean;
    average_price: number;
    last_price: number;
    close_price: number;
    pnl: number;
    day_change: number;
    day_change_percentage: number;
}

export type MstockFunds = {
    ADDITIONAL_MARGIN: string | null;
    ADHOC_LIMIT: string;
    AMOUNT_UTILIZED: string;
    AVAILABLE_BALANCE: string;
    BANK_HOLDING: string | null;
    CLEAR_BALANCE: string;
    COLLATERALS: string | null;
    LIMIT_SOD: string;
    LIMIT_TYPE: string;
    MF_COLLATERAL: string;
    MTF_AVAILABLE_BALANCE: string;
    MTF_COLLATERAL: string;
    MTF_UTILIZE: string;
    MTM_COMBINED: string | null;
    OFS_UTILIZED: string | null;
    OPT_BUY_PRIMIUM_UTILIZE: string;
    PAY_OUT_AMT: string;
    PEAK_MARGIN: string | null;
    PHYSICAL_MARGIN: string | null;
    REALISED_PROFITS: string | null;
    RECEIVABLES: string | null;
    SEG: string;
    SUM_OF_ALL: string;
    UNCLEAR_BALANCE: string | null;
}