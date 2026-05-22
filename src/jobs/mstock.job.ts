import { DEFAULT_USERID } from "@/constant";
import { MstockService } from "@/modules/broker/providers/mstock/mstock.service";
import { InstrumentCache } from "@/modules/market/instrument.cache";

export const runLoadAccessToken = async () => {
    await MstockService.getAccessToken(DEFAULT_USERID);
    return;
}

export const runLoadInstruments = async () => {
    const { apiKey, accessToken } = await MstockService.getAccessToken(DEFAULT_USERID);
    await MstockService.getInstruments(apiKey, accessToken);
    return;
}

export const runHydrateInstruments = async () => {
    const { tokenCount, tickerCount } = await InstrumentCache.hydrateInstruments();
    if (tokenCount > 0 || tickerCount > 0) return true;

    const { apiKey, accessToken } = await MstockService.getAccessToken(DEFAULT_USERID);
    await MstockService.getInstruments(apiKey, accessToken);
    return;

}