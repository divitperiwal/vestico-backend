import { StrategyClient } from "@/integrations/strategy/strategy.client";
import type { Portfolio } from "@/modules/broker/broker.types";
import { ApiError } from "../response/error";

export const filterPortfolio = async (portfolio: Portfolio) => {
    if (!portfolio || !portfolio.holdings || portfolio.holdings.length === 0) return null;
    const etfList = await StrategyClient.getETFList();
    if (!etfList) throw new ApiError('ETF list not found', 404);

    const etfs = etfList.map((etf: any) => etf.ticker);
    const filteredPortfolio = portfolio.holdings.filter(holding => (holding.type === 'etf' && etfs.includes(holding.symbol))).map(holding => holding.symbol);
    return filteredPortfolio
}