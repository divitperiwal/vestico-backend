import { classifyAssetType } from "@/utils/parsers/asset-classification";
import type { Funds, Portfolio } from "../../broker.types";
import { ApiError } from "@/utils/response/error";
import type { MstockFunds, MstockHolding } from "./mstock.type";

export const MstockAdapter = {
    normalizeHoldings: (data: MstockHolding[]) => {
        if (!Array.isArray(data)) throw new ApiError('Invalid data format for holdings', 502);
        const holdings = data.map((item) => {
            if (typeof item !== 'object' || item === null) throw new ApiError('Invalid holding item format', 502);
            return {
                securityId: item.instrument_token.toString(),
                symbol: item.tradingsymbol,
                type: classifyAssetType(item.isin),
                avgPrice: item.average_price,
                quantity: item.quantity,
                ltp: item.last_price,
                investedValue: Number((item.average_price * item.quantity).toFixed(2)),
                currentValue: Number((item.last_price * item.quantity).toFixed(2)),
                pnl: Number(((item.last_price - item.average_price) * item.quantity).toFixed(2)),
            };
        })

        return {
            broker: 'mstock',
            holdings
        } as Portfolio;
    },

    normalizeFunds: (data: MstockFunds) => {
        if (!data) throw new ApiError('Invalid data format for funds', 502);
        console.log(data)
        return {
            broker: 'mstock',
            available: Number(data.AVAILABLE_BALANCE),
            withdrawable: Number(data.CLEAR_BALANCE),
            utilized: Number(data.AMOUNT_UTILIZED),
            receivable: Number(data.RECEIVABLES),
        } as Funds;
    },

    normalizePositions: (data: any) => { return data }
}
