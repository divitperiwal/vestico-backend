import {
  getEtfFromPortfolio,
  getMstockFunds,
  getMstockPortfolio,
  getStockFromPortfolio,
} from '@/services/mstock.service.js';
import { asyncHandler } from '@/utils/asyncHandler.js';
import { sendSuccess } from '@/utils/response.js';

export const handleGetMstockPortfolio = asyncHandler(async (req, res) => {
  const portfolio = await getMstockPortfolio(req.user?.userId!, req.accessToken!, req.apiKey!);
  return sendSuccess(res, 200, 'Fetched Mstock Profile Successfully', portfolio);
});

export const handleGetMstockFunds = asyncHandler(async (req, res) => {
  const funds = await getMstockFunds(req.user?.userId!, req.accessToken!, req.apiKey!);
  return sendSuccess(res, 200, 'Fetched Mstock Funds Successfully', funds);
});

export const handleGetMstockPortfolioEtf = asyncHandler(async (req, res) => {
  const portfolio = await getMstockPortfolio(req.user?.userId!, req.accessToken!, req.apiKey!);
  const etf = await getEtfFromPortfolio(portfolio);
  return sendSuccess(res, 200, 'Fetched Mstock ETF Portfolio Successfully', etf);
});

export const handleGetMstockPortfolioStock = asyncHandler(async (req, res) => {
  const portfolio = await getMstockPortfolio(req.user?.userId!, req.accessToken!, req.apiKey!);
  const stock = await getStockFromPortfolio(portfolio);
  return sendSuccess(res, 200, 'Fetched Mstock Stock Portfolio Successfully', stock);
});
