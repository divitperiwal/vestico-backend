import { WebSocketServer } from "ws";
import { subscriptionManager } from "@/modules/market/subscription.ws.js";

export const startClientSocketServer = (server: any) => {

    const wss = new WebSocketServer({ server });

    wss.on("connection", (client) => {

        console.log("Client connected");

        subscriptionManager.registerClient(client);

        client.on("message", (msg) => {

            try {

                const data = JSON.parse(msg.toString());

                if (data.type === "subscribe") {
                    subscriptionManager.subscribe(client, data.tokens);
                }

                if (data.type === "unsubscribe") {
                    subscriptionManager.unsubscribe(client, data.tokens);
                }

            } catch (err) {
                console.error("Invalid message", err);
            }

        });

        client.on("close", () => {

            console.log("Client disconnected");
            subscriptionManager.removeClient(client);

        });

    });

};