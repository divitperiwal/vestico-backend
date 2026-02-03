import { asyncHandler } from '@/utils/constants/asyncHandler.js';
import { sendSuccess } from '@/utils/helper/response.js';
import { DhanService } from './dhan.service.js';
import { BrokerService } from '../broker.service.js';

export const handleDhanCallback = asyncHandler(async (req, res) => {
  const { id: userId } = req.params;
  const { tokenId } = req.query;
  const result = await DhanService.consumeConsentToken(userId, tokenId as string);
  sendSuccess(res, 200, 'Done', result);
});
export const handleGenerateConsentToken = asyncHandler(async (req, res) => {
  const userId = req.user?.userId;
  const url = await DhanService.generateAccessToken(userId!);
  sendSuccess(res, 200, 'Dhan Consent Token generated successfully', { url });
});
export const handleGetPortfolio = asyncHandler(async (req, res) => {
  const userId = req.user?.userId;
  const portfolio = await DhanService.getPortfolio(userId!, req.accessToken!);
  sendSuccess(res, 200, 'Dhan Portfolio fetched successfully', portfolio);
});

export const handleGetStockPortfolio = asyncHandler(async (req, res) => {
  const userId = req.user?.userId;
  const portfolio = await DhanService.getPortfolio(userId!, req.accessToken!);
  const stock = await BrokerService.getStocks(portfolio);
  sendSuccess(res, 200, 'Dhan stock portfolio fetched successfully', stock);
});

export const handleGetEtfPortfolio = asyncHandler(async (req, res) => {
  const userId = req.user?.userId;
  const portfolio = await DhanService.getPortfolio(userId!, req.accessToken!);
  const etf = await BrokerService.getETFs(portfolio);
  sendSuccess(res, 200, 'Dhan ETF portfolio fetched successfully', etf);
});
