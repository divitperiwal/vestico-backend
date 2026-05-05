import { DEFAULT_USERID } from '@/constant.js';
import { MstockService } from '@/modules/broker/providers/mstock/mstock.service';
import cron from 'node-cron';

export const loadAccessTokenJob = () => {
    cron.schedule('0 6 * * 1-5', async () => {
        console.log('Running access token job');
        await MstockService.getAccessToken(DEFAULT_USERID);
        console.log('Finished access token job');
    }, { timezone: 'Asia/Kolkata' });
}