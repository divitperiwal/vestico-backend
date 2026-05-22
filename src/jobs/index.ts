import cron from "node-cron";
import { isMarketOpen } from "@/utils/helpers/market-open";
import { runHydrateInstruments, runLoadAccessToken, runLoadInstruments } from "./mstock.job";
import { runConnectWebSocket, runDisconnectWebSocket } from "./websocket.job";

const IST = { timezone: "Asia/Kolkata" };

const safeRun = async (name: string, fn: () => Promise<void> | void) => {
    console.log(`[job:${name}] Starting`);
    try {
        await fn();
        console.log(`[job:${name}] Completed`);
    } catch (error) {
        console.error(`[job:${name}] Error:`, error);
    }
}

export const initJobs = async () => {
    try {
        if (isMarketOpen()) await runConnectWebSocket();
        await runHydrateInstruments();

        console.log("[job:init] Completed");
    } catch (error) {
        console.error(`[job:init] Error:`, error);
        process.exit(1)
    }
}

export const startJobs = () => {
    cron.schedule("0 6 * * 1-5", () => safeRun('access-token', runLoadAccessToken), IST);
    cron.schedule("30 8 * * 1-5", () => safeRun('instruments', runLoadInstruments), IST);
    cron.schedule("15 9 * * 1-5", () => safeRun('ws-connect', runConnectWebSocket), IST);
    cron.schedule("30 15 * * 1-5", () => safeRun('ws-disconnect', runDisconnectWebSocket), IST);
    console.log("[jobs] scheduled");
}



