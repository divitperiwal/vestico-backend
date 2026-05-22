import { DEFAULT_USERID } from "@/constant";
import { MstockService } from "@/modules/broker/providers/mstock/mstock.service";

export const runLoadAccessToken = async () => {
    await MstockService.getAccessToken(DEFAULT_USERID);
    return
}

export const runLoadInstruments = async () => {
    const { apiKey, accessToken } = await MstockService.getAccessToken(DEFAULT_USERID);
    await MstockService.getInstruments(apiKey, accessToken);
    return;
}