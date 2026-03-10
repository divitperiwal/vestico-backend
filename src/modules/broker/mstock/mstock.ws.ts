import WebSocket from "ws";
import { subscriptionManager } from "@/modules/market/subscription.ws.js";
import { ApiError } from "@/utils/constants/ApiError.js";
import { decodePackets, decodeQuotePacket } from "@/utils/helper/binary.js";

let mstockSocket: WebSocket | null = null;

export const connectMstock = (apiKey: string, token: string) => {

    const URL = `wss://ws.mstock.trade?API_KEY=${apiKey}&ACCESS_TOKEN=${token}`;
    if (mstockSocket && (mstockSocket.readyState === WebSocket.OPEN || mstockSocket.readyState === WebSocket.CONNECTING)) throw new ApiError("Already connected to mStock", 400);

    mstockSocket = new WebSocket(URL);

    mstockSocket.on("open", () => {
        mstockSocket!.send(`LOGIN:${token}`);
        mstockSocket!.send(JSON.stringify({ a: "mode", v: ["full"] }))
        console.log("Connected to mStock");

    });

    mstockSocket.on("message", (data: WebSocket.RawData) => {
        try {
            const buffer = Buffer.isBuffer(data) ? data : Buffer.from(data);
            const packets = decodePackets(buffer);



            for (const packet of packets) {
                if (packet.length < 200) continue;
                const quote = decodeQuotePacket(packet);
                subscriptionManager.broadcast(quote.token, quote);


            }

        } catch (err) {

            console.error("Failed to decode market data", err);

        }

    })

    mstockSocket.on("close", () => {
        console.log("Disconnected from mStock");
        mstockSocket = null;
    })

    mstockSocket.on("error", (err) => {
        console.error("Error in mStock WebSocket connection", err);
        mstockSocket = null;
    });


};

export const getMstockSocket = () => mstockSocket;

export const subscribeTokens = (tokens: number[]) => {

    mstockSocket?.send(JSON.stringify({
        a: "subscribe",
        v: tokens
    }));
    console.log("Subscribed to tokens:", tokens);

};

export const unsubscribeTokens = (tokens: number[]) => {

    mstockSocket?.send(JSON.stringify({
        a: "unsubscribe",
        v: tokens
    }));

};