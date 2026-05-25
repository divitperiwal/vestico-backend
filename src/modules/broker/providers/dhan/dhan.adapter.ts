import type { Funds, Portfolio } from '@/modules/broker/broker.types';
import { classifyAssetType } from '@/utils/parsers/asset-classification';
import { ApiError } from '@/utils/response/error';
import type { DhanFunds, DhanHolding } from './dhan.type';

export const DhanAdapter = {
  normalizeHoldings: (data: DhanHolding[]) => {
    if (!Array.isArray(data)) throw new ApiError('Invalid data format for holdings', 502);
    const holdings = data.map((item) => {
      if (typeof item !== 'object' || item === null) throw new ApiError('Invalid holding item format', 502);
      return {
        securityId: item['securityId'],
        symbol: item.tradingSymbol,
        type: classifyAssetType(item.isin),
        avgPrice: item.avgCostPrice,
        quantity: item.totalQty,
        ltp: item.lastTradedPrice,
        investedValue: Number((item.avgCostPrice * item.totalQty).toFixed(2)),
        currentValue: Number((item.lastTradedPrice * item.totalQty).toFixed(2)),
        pnl: Number(((item.lastTradedPrice - item.avgCostPrice) * item.totalQty).toFixed(2)),
      };
    })

    return {
      broker: 'dhan',
      holdings
    } as Portfolio;
  },

  normalizePositions: (data: unknown) => {
    
  },

  normalizeFunds: (data: DhanFunds) => {
    if (!data) throw new ApiError('Invalid data format for funds', 502);
    return {
      broker: 'dhan',
      available: data.availabelBalance,
      withdrawable: data.withdrawableBalance,
      utilized: data.utilizedAmount,
      receivable: data.receiveableAmount,
    } as Funds;
  }
}