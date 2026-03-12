import { WebSocket } from "ws";
import { subscribeTokens, unsubscribeTokens } from "@/modules/broker/mstock/mstock.ws.js";

class SubscriptionManager {

    private tokenSubscribers = new Map<number, Set<WebSocket>>();
    private clientSubscriptions = new Map<WebSocket, Set<number>>();

    registerClient(client: WebSocket) {
        this.clientSubscriptions.set(client, new Set());
    }

    removeClient(client: WebSocket) {

        const tokens = this.clientSubscriptions.get(client);
        if (!tokens) return;

        tokens.forEach((token) => {

            const subs = this.tokenSubscribers.get(token);
            if (!subs) return;

            subs.delete(client);

            if (subs.size === 0) {
                unsubscribeTokens([token]);
                this.tokenSubscribers.delete(token);
            }

        });

        this.clientSubscriptions.delete(client);
    }

    subscribe(client: WebSocket, tokens: number[]) {

        tokens.forEach((token) => {

            // client → token
            this.clientSubscriptions.get(client)?.add(token);

            // first subscriber
            if (!this.tokenSubscribers.has(token)) {
                this.tokenSubscribers.set(token, new Set());
                subscribeTokens([token]);
            }

            this.tokenSubscribers.get(token)!.add(client);

        });

    }

    unsubscribe(client: WebSocket, tokens: number[]) {

        tokens.forEach((token) => {

            const subs = this.tokenSubscribers.get(token);
            if (!subs) return;

            subs.delete(client);
            this.clientSubscriptions.get(client)?.delete(token);

            if (subs.size === 0) {
                unsubscribeTokens([token]);
                this.tokenSubscribers.delete(token);
            }

        });

    }

    broadcast(token: number, data: any) {

        const subscribers = this.tokenSubscribers.get(token);
        if (!subscribers) return;
        const payload = JSON.stringify(data);

        for (const client of subscribers) {

            if (client.readyState === WebSocket.OPEN) {
                client.send(payload);
            }

        }

    }

}

export const subscriptionManager = new SubscriptionManager();