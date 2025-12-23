// import {
//   getEtfFromPortfolio,
//   getMstockFunds,
//   getMstockPortfolio,
//   getStockFromPortfolio,
// } from '@/broker/mstock/mstock.service.js';
// import { asyncHandler } from '@/utils/asyncHandler.js';
// import { sendSuccess } from '@/utils/helper/response.js';

import { asyncHandler } from '@/utils/constants/asyncHandler.js';
import { MstockService } from './mstock.service.js';
import { sendSuccess } from '@/utils/helper/response.js';
import { BrokerService } from '../broker.service.js';

// export const handleGetMstockPortfolio = asyncHandler(async (req, res) => {
//   const portfolio = await getMstockPortfolio(req.user?.userId!, req.accessToken!, req.apiKey!);
//   return sendSuccess(res, 200, 'Fetched Mstock Profile Successfully', portfolio);
// });

// export const handleGetMstockFunds = asyncHandler(async (req, res) => {
//   const funds = await getMstockFunds(req.user?.userId!, req.accessToken!, req.apiKey!);
//   return sendSuccess(res, 200, 'Fetched Mstock Funds Successfully', funds);
// });

// export const handleGetMstockPortfolioEtf = asyncHandler(async (req, res) => {
//   const portfolio = await getMstockPortfolio(req.user?.userId!, req.accessToken!, req.apiKey!);
//   const etf = await getEtfFromPortfolio(portfolio);
//   return sendSuccess(res, 200, 'Fetched Mstock ETF Portfolio Successfully', etf);
// });

// export const handleGetMstockPortfolioStock = asyncHandler(async (req, res) => {
//   const portfolio = await getMstockPortfolio(req.user?.userId!, req.accessToken!, req.apiKey!);
//   const stock = await getStockFromPortfolio(portfolio);
//   return sendSuccess(res, 200, 'Fetched Mstock Stock Portfolio Successfully', stock);
// });

export const handleGetPortfolio = asyncHandler(async (req, res) => {
  const portfolio = await MstockService.getPortfolio(req.apiKey!, req.accessToken!, req.user?.userId!);
  return sendSuccess(res, 200, 'Fetched Mstock Portfolio Successfully', portfolio);
});

export const handleGetFunds = asyncHandler(async (req, res) => {
  const funds = await MstockService.getFunds(req.apiKey!, req.accessToken!, req.user?.userId!);
  return sendSuccess(res, 200, 'Fetched Mstock Funds Successfully', funds);
});

export const handleGetEtfPortfolio = asyncHandler (async (req, res) => {
  const portfolio = await MstockService.getPortfolio(req.apiKey!, req.accessToken!, req.user?.userId!);
  const etf = BrokerService.getETFs(portfolio)
  return sendSuccess(res, 200, 'Fetched Mstock ETF Portfolio Successfully', etf);
});

export const handleGetStockPortfolio = asyncHandler (async (req, res) => {
  const portfolio = await MstockService.getPortfolio(req.apiKey!, req.accessToken!, req.user?.userId!);
  const stock = await BrokerService.getStocks(portfolio)
  return sendSuccess(res, 200, 'Fetched Mstock Stock Portfolio Successfully', stock);
})

