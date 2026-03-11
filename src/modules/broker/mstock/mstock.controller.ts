import { asyncHandler } from '@/utils/constants/asyncHandler.js';
import { MstockService } from './mstock.service.js';
import { sendSuccess } from '@/utils/helper/response.js';
import { BrokerService } from '../broker.service.js';

export const handleGetPortfolio = asyncHandler(async (req, res) => {
  const portfolio = await MstockService.getPortfolio(
    req.apiKey!,
    req.accessToken!,
    req.user?.userId!,
  );
  return sendSuccess(res, 200, 'Fetched Mstock Portfolio Successfully', portfolio);
});

export const handleGetFunds = asyncHandler(async (req, res) => {
  const funds = await MstockService.getFunds(req.apiKey!, req.accessToken!, req.user?.userId!);
  return sendSuccess(res, 200, 'Fetched Mstock Funds Successfully', funds);
});

export const handleGetEtfPortfolio = asyncHandler(async (req, res) => {
  const portfolio = await MstockService.getPortfolio(
    req.apiKey!,
    req.accessToken!,
    req.user?.userId!,
  );
  const etf = BrokerService.getETFs(portfolio);
  return sendSuccess(res, 200, 'Fetched Mstock ETF Portfolio Successfully', etf);
});

export const handleLogout = asyncHandler(async (req, res) => {
  await MstockService.logout(req.user?.userId!, req.apiKey!, req.accessToken!);
  return sendSuccess(res, 200, 'Logged out from Mstock successfully');
});

export const handleGetStockPortfolio = asyncHandler(async (req, res) => {
  const portfolio = await MstockService.getPortfolio(
    req.apiKey!,
    req.accessToken!,
    req.user?.userId!,
  );
  const stock = await BrokerService.getStocks(portfolio);
  return sendSuccess(res, 200, 'Fetched Mstock Stock Portfolio Successfully', stock);
});

export const handleGetPositions = asyncHandler(async (req, res) => {
  const position = await MstockService.getPositions(
    req.apiKey!,
    req.accessToken!,
    req.user?.userId!,
  );
  return sendSuccess(res, 200, 'Fetched Mstock Positions Successfully', position);
})

export const handleOlhcData = asyncHandler(async (req, res) => {
  const { ticker } = req.params;
  const data = await MstockService.getOlhcData(req.apiKey!, req.accessToken!, ticker);
  return sendSuccess(res, 200, 'Fetched OHLC data successfully', data);
})

export const handleGetWsConnection = asyncHandler(async (req, res) => {
  const connection = await MstockService.getWsConnection(req.apiKey!, req.accessToken!);
  return sendSuccess(res, 200, 'Websocket connection established successfully', connection);
})


export const handleIntradayData = asyncHandler(async (req, res) => {
  const { ticker } = req.params;
  const data = await MstockService.getIntradayData(req.apiKey!, req.accessToken!, ticker);
  return sendSuccess(res, 200, 'Fetched intraday data successfully', data);
})

export const handleGetInstruments = asyncHandler(async (req, res) => {
  await MstockService.getInstruments(req.apiKey!, req.accessToken!);
  return sendSuccess(res, 200, 'Fetched instruments data and added to cache');
})