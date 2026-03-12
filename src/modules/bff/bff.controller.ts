import { asyncHandler } from "@/utils/constants/asyncHandler.js";
import { BFFService } from "./bff.service.js";
import { sendSuccess } from "@/utils/helper/response.js";

export const webDashboardHandler = asyncHandler(async (req, res) => {
    const user = req.user;
    const data = await BFFService.getWebDashboardData(user, req.accessToken, req.apiKey);
    return sendSuccess(res, 200, 'Fetched Web Dashboard Data Successfully', data);
})

export const tickerDataHandler = asyncHandler(async (req, res) => {
    const user = req.user;
    const ticker = req.params.ticker;
    const data = await BFFService.getTickerData(user, req.accessToken, req.apiKey, ticker);
    return sendSuccess(res, 200, "Fetched Ticker Data Successfully", data)
})

export const webPortfolioHandler = asyncHandler(async (req, res) => {
    const user = req.user;
    const data = await BFFService.getWebPortfolioData(user, req.accessToken, req.apiKey);
    return sendSuccess(res, 200, 'Fetched Web Portfolio Data Successfully', data);
})

export const webPositionHandler = asyncHandler(async (req, res) => {
    const user = req.user;
    const data = await BFFService.getWebPositionData(user, req.accessToken, req.apiKey);
    return sendSuccess(res, 200, 'Fetched Web Position Data Successfully', data)
})

export const webOrderHandler = asyncHandler(async (req, res) => {
    const user = req.user;
    const data = await BFFService.getWebOrderData(user, req.accessToken, req.apiKey);
    return sendSuccess(res, 200, 'Fetched Web Order Data Successfully', data)
})

export const webFundsHandler = asyncHandler(async (req, res) => {
    const user = req.user;
    const data = await BFFService.getWebFundsData(user, req.accessToken, req.apiKey);
    return sendSuccess(res, 200, 'Fetched Web Funds Data Successfully', data)
})

