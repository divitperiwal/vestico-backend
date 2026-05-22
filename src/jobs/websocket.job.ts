import { DEFAULT_USERID } from "@/constant.js";
import { MstockService } from "@/modules/broker/providers/mstock/mstock.service.js";
import { connectMstock, getMstockSocket } from "@/modules/broker/providers/mstock/mstock.ws.js";


export const runConnectWebSocket = async () => {
    const { accessToken, apiKey } = await MstockService.getAccessToken(DEFAULT_USERID);
    connectMstock(apiKey, accessToken);
    return;
}

export const runDisconnectWebSocket = async () => {
    const ws = getMstockSocket()
    if (ws) ws.close();
    return;
}


