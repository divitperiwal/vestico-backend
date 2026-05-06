import WebSocket from "ws";
import { subscriptionManager } from "@/modules/market/subscription.ws.js";
import { ApiError } from "@/utils/response/error.js";
import { decodeIndexPacket, decodePackets, decodeQuotePacket } from "@/utils/parsers/binary.js";
import { isMarketOpen } from "@/jobs/websocket.job.js";

let mstockSocket: WebSocket | null = null;
let reconnectTimeout: NodeJS.Timeout | null = null;
let heartbeatInterval: NodeJS.Timeout | null = null;

export const connectMstock = (apiKey: string, token: string) => {

    const URL = `wss://ws.mstock.trade?API_KEY=${apiKey}&ACCESS_TOKEN=${token}`;
    if (mstockSocket && (mstockSocket.readyState === WebSocket.OPEN || mstockSocket.readyState === WebSocket.CONNECTING)) throw new ApiError("Already connected to mStock", 400);

    mstockSocket = new WebSocket(URL);

    mstockSocket.on("open", () => {
        mstockSocket!.send(`LOGIN:${token}`);
        mstockSocket!.send(JSON.stringify({ a: "mode", v: ["full"] }))
        console.log("Connected to mStock");

        heartbeatInterval = setInterval(() => {
            if (mstockSocket?.readyState === WebSocket.OPEN) {
                mstockSocket.ping();
            }
        }, 30000);

    });

    mstockSocket.on("message", (data: WebSocket.RawData) => {
        try {
            const buffer = Buffer.isBuffer(data) ? data : Buffer.from(data as any);
            const packets = decodePackets(buffer);

            for (const packet of packets) {
                if (packet.length === 48) {
                    // Index packet
                    const quote = decodeIndexPacket(packet);
                    subscriptionManager.broadcast(quote.token, quote);
                } else if (packet.length >= 200) {
                    // Full quote packet
                    const quote = decodeQuotePacket(packet);
                    subscriptionManager.broadcast(quote.token, quote);
                }

            }
        } catch (err) {
            console.error("Failed to decode market data", err);
        }
    });

    mstockSocket.on("close", (err) => {
        console.log("Disconnected from mStock");
        clearTimers();
        mstockSocket = null;

        if (isMarketOpen()) {
            console.log("Attempting to reconnect to mStock in 5 seconds...");
            reconnectTimeout = setTimeout(() => connectMstock(apiKey, token), 5000);
        } else {
            console.log("Market is closed. Will attempt to reconnect to mStock when market opens.");
        }

    })

    mstockSocket.on("pong", () => {
        // console.log("Received pong from mStock");
    })

    mstockSocket.on("error", (err) => {
        console.error("Error in mStock WebSocket connection", err);
        mstockSocket = null;
        clearTimers();

        if (isMarketOpen()) {
            console.log("Attempting to reconnect to mStock in 5 seconds...");
            reconnectTimeout = setTimeout(() => connectMstock(apiKey, token), 5000);
        } else {
            console.log("Market is closed. Will attempt to reconnect to mStock when market opens.");
        }
    });


};

const clearTimers = () => {
    if (heartbeatInterval) { clearInterval(heartbeatInterval); heartbeatInterval = null; }
    if (reconnectTimeout) { clearTimeout(reconnectTimeout); reconnectTimeout = null; }
}
export const getMstockSocket = () => mstockSocket;

export const subscribeTokens = (tokens: number[]) => {

    mstockSocket?.send(JSON.stringify({
        a: "subscribe",
        v: tokens
    }));

};

export const unsubscribeTokens = (tokens: number[]) => {

    mstockSocket?.send(JSON.stringify({
        a: "unsubscribe",
        v: tokens
    }));

};