import { MstockService } from "@/modules/broker/mstock/mstock.service.js";
import cron from "node-cron";

export const loadInstrumentsJob = () => {
    // Schedule to run every day at 5:00 AM
    cron.schedule('0 5 * * 1-5', async () => {
        await loadInstruments();
    })
}

export const loadInstruments = async () => {
    console.log('Running instrument job');
    const userId = '9cda69d0-3387-4e11-a162-5c0082d19b3c';
    const accessToken = await MstockService.getAccessToken(userId);

    await MstockService.getInstruments(accessToken.apiKey, accessToken.accessToken);
    console.log('Finished instrument job');
}