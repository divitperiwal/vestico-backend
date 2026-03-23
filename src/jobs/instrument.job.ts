import { DEFAULT_USERID } from "@/constant.js";
import { MstockService } from "@/modules/broker/mstock/mstock.service.js";
import cron from "node-cron";

export const loadInstrumentsJob = () => {
    // Schedule to run every day at 8:30 AM
    cron.schedule('30 8 * * 1-5', async () => {
        await loadInstruments(true);
    })
}

export const loadInstruments = async (refresh = false) => {
    console.log('Running instrument job');
    const accessToken = await MstockService.getAccessToken(DEFAULT_USERID, refresh);

    await MstockService.getInstruments(accessToken.apiKey, accessToken.accessToken);
    console.log('Finished instrument job');
}