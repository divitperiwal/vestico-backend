import { getMstockSocket } from "@/modules/broker/providers/mstock/mstock.ws.js";
import { ApiError } from "@/utils/response/error.js";

export const subscribeTokens = (tickers: number[]) => {
    const socket = getMstockSocket();
    if (!socket || socket.readyState !== socket.OPEN) throw new ApiError('Websocket connection not established', 500);

    socket.send(JSON.stringify({
        a: "subscribe",
        v: tickers
    }))
}

export const unsubscribeTokens = (tickers: number[]) => {
    const socket = getMstockSocket();
    if (!socket || socket.readyState !== socket.OPEN) throw new ApiError('Websocket connection not established', 500);

    socket.send(JSON.stringify({
        a: "unsubscribe",
        v: tickers
    }))
}