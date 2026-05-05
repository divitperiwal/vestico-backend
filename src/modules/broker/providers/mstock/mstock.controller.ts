import { asyncHandler } from "@/utils/constants/asyncHandler";
import type { Request, Response } from "express";
import { MstockService } from "./mstock.service";
import { ApiError } from "@/utils/constants/ApiError";
import { sendSuccess } from "@/utils/helper/response";


export const MstockController = {
  getPortfolio: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.userId
    const { apiKey, accessToken } = req
    if (!userId || !apiKey || !accessToken) throw new ApiError("Missing required parameters", 400)

    const portfolio = await MstockService.getPortfolio(apiKey, accessToken, userId)
    sendSuccess(res, 200, "Fetched Portfolio Successfully", portfolio)
  }),

  getFunds: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.userId
    const { apiKey, accessToken } = req
    if (!userId || !apiKey || !accessToken) throw new ApiError("Missing required parameters", 400)

    const funds = await MstockService.getFunds(apiKey, accessToken, userId)
    sendSuccess(res, 200, "Fetched Funds Successfully", funds)
  }),

  getOLHCData: asyncHandler(async (req: Request, res: Response) => {
    const { ticker } = req.params;
    if (!ticker) throw new ApiError("Atleast 1 ticker is required", 401);

    const { apiKey, accessToken } = req;
    if (!apiKey || !accessToken) throw new ApiError("Missing Required Parameters", 400)

    const tickerArray = Array.isArray(ticker)
      ? ticker.map(t => t.trim().toUpperCase())
      : ticker.split(',').map(t => t.trim().toUpperCase());

    const data = await MstockService.getOLHCData(apiKey, accessToken, tickerArray)
    sendSuccess(res, 200, "Fetched OHLC data successfully", data)
  }),

  //Fix with proper param type
  getIntradayData: asyncHandler(async (req: Request, res: Response) => {
    const ticker = (req.params.ticker as string)?.trim().toUpperCase();
    if (!ticker) throw new ApiError("Ticker is required", 401);
    const { apiKey, accessToken } = req;
    if (!apiKey || !accessToken) throw new ApiError("Missing Required Parameters", 400);

    const data = await MstockService.getIntradayData(apiKey, accessToken, ticker)
    sendSuccess(res, 200, "Fetched Intraday data successfully", data)
  }),

  //Data

  getInstruments: asyncHandler(async (req: Request, res: Response) => {
    const { apiKey, accessToken } = req;
    if (!apiKey || !accessToken) throw new ApiError("Missing Required Parameters", 400);

    const data = await MstockService.getInstruments(apiKey, accessToken)
    sendSuccess(res, 200, "Fetched Instruments data successfully", data)
  })

}