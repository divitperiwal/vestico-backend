import { DEFAULT_USERID } from '@/constant.js';
import { MstockService } from '@/modules/broker/mstock/mstock.service.js';
import cron from 'node-cron';

export const loadAccessTokenJob = () => {
    cron.schedule('0 6 * * 1-5', async () => {
        console.log('Running access token job');
        await MstockService.getAccessToken(DEFAULT_USERID, true);
        console.log('Finished access token job');
    }, { timezone: 'Asia/Kolkata' });
}