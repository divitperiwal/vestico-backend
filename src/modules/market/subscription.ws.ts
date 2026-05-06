import { WebSocket } from "ws";
import { subscribeTokens, unsubscribeTokens } from "@/modules/broker/providers/mstock/mstock.ws.js";
import { InstrumentCache } from "@/cache/instrument.cache.js";

class SubscriptionManager {

    private tokenSubscribers = new Map<number, Set<WebSocket>>();
    private clientSubscriptions = new Map<WebSocket, Set<number>>();

    private static readonly MAX_TICKERS_PER_REQUEST = 100;
    private static readonly MAX_SUBSCRIPTIONS_PER_CLIENT = 200;



    registerClient(client: WebSocket) {
        this.clientSubscriptions.set(client, new Set());
    }

    removeClient(client: WebSocket) {

        const tokens = this.clientSubscriptions.get(client);
        //Force Cleanup
        if (!tokens) {
            for (const [token, subs] of this.tokenSubscribers) {
                if (subs.delete(client) && subs.size === 0) {
                    unsubscribeTokens([token]);
                    this.tokenSubscribers.delete(token);
                }
            }
            return;
        };

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

    subscribe(client: WebSocket, tickers: string[]) {
        if (!this.clientSubscriptions.has(client)) {
            this.registerClient(client);
        }

        const uniqueTickers = [...new Set(tickers)].slice(0, SubscriptionManager.MAX_TICKERS_PER_REQUEST);
        const clientSet = this.clientSubscriptions.get(client)!;

        uniqueTickers.forEach((ticker) => {
            if (typeof ticker !== "string" || ticker.length > 32) return;

            const token = InstrumentCache.getByTicker(ticker)?.token;
            if (!token) return;

            if (clientSet.size >= SubscriptionManager.MAX_SUBSCRIPTIONS_PER_CLIENT) return;
            clientSet.add(token);

            if (!this.tokenSubscribers.has(token)) {
                this.tokenSubscribers.set(token, new Set());
                subscribeTokens([token]);
            }

            this.tokenSubscribers.get(token)!.add(client);
        });
    }

    unsubscribe(client: WebSocket, tickers: string[]) {
        const uniqueTickers = [...new Set(tickers)].slice(0, SubscriptionManager.MAX_TICKERS_PER_REQUEST);

        uniqueTickers.forEach((ticker) => {
            const token = InstrumentCache.getByTicker(ticker)?.token;
            if (!token) return;

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
        if (!subscribers || subscribers.size === 0) return;

        const payload = JSON.stringify({
            ticker: InstrumentCache.getByToken(token)?.ticker, // fixed
            ...data,
        });

        for (const client of subscribers) {
            if (client.readyState === WebSocket.OPEN) {
                client.send(payload);
            }
        }
    }

}

export const subscriptionManager = new SubscriptionManager();