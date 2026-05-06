import { WebSocketServer } from "ws";
import { subscriptionManager } from "@/modules/market/subscription.ws.js";
import { runAuthMiddlewareWS } from "@/utils/response/response.js";

export const startClientSocketServer = (server: any) => {

    const wss = new WebSocketServer({ noServer: true });

    // Upgrade HTTP connection to WebSocket
    server.on("upgrade", async (request: any, socket: any, head: any) => {
        try {
            await runAuthMiddlewareWS(request);

            wss.handleUpgrade(request, socket, head, (ws) => {
                (ws as any).userId = request.user.userId;
                wss.emit("connection", ws, request);
            });

        } catch (error) {
            socket.write(
                "HTTP/1.1 401 Unauthorized\r\n" +
                "Connection: close\r\n" +
                "\r\n"
            );
            socket.destroy();
            return;
        }
    })


    wss.on("connection", (client) => {

        console.log(`Client connected: ${(client as any).userId}`);

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

            console.log(`Client disconnected: ${(client as any).userId}`);
            subscriptionManager.removeClient(client);

        });

        client.on("error", (err) => {
            subscriptionManager.removeClient(client);
        })

    });

};