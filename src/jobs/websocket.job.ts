import { DEFAULT_USERID } from "@/constant.js";
import { MstockService } from "@/modules/broker/mstock/mstock.service.js";
import { connectMstock, getMstockSocket } from "@/modules/broker/mstock/mstock.ws.js";
import cron from "node-cron";




export const connectMstockJob = () => {
    // Schedule to run every day at 9:15 AM
    cron.schedule('15 9 * * 1-5', () => connectMstockWebSocket(true), { timezone: "Asia/Kolkata" });
    cron.schedule('30 15 * * 1-5', () => disconnectMstockWebSocket(), { timezone: "Asia/Kolkata" });
}

export const connectMstockWebSocket = async (cron = false) => {
    if (cron) {
        const { accessToken, apiKey } = await MstockService.getAccessToken(DEFAULT_USERID);
        connectMstock(apiKey, accessToken);
    }
    if (isMarketOpen() && !cron) {
        const { accessToken, apiKey } = await MstockService.getAccessToken(DEFAULT_USERID);
        connectMstock(apiKey, accessToken);
    }
}

export const disconnectMstockWebSocket = () => {
    const ws = getMstockSocket()
    if (ws) ws.close();
    return;
}

export function isMarketOpen() {
    const now = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
    const day = now.getDay();
    if (day === 0 || day === 6) return false;

    const open = new Date(); open.setHours(9, 14, 0, 0);
    const close = new Date(); close.setHours(15, 30, 0, 0);
    return now >= open && now <= close;
}
