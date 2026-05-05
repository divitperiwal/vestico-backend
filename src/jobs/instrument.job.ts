import { DEFAULT_USERID } from "@/constant";
import { MstockService } from "@/modules/broker/providers/mstock/mstock.service";
import cron from "node-cron";

export const loadInstrumentsJob = () => {
    // Schedule to run every day at 8:30 AM
    cron.schedule('30 8 * * 1-5', async () => {
        await loadInstruments();
    }, { timezone: "Asia/Kolkata" });
}

export const loadInstruments = async () => {
    try {
        console.log('Running instrument job');
        const response = await MstockService.getAccessToken(DEFAULT_USERID);
        await MstockService.getInstruments(response.apiKey, response.accessToken);
        console.log('Finished instrument job');

    } catch (error) {
        console.log('Error in instrument job', error);
    }

}