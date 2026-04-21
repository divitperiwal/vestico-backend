import axios from "axios";

export class StrategyClient {
    private static URL = process.env.STRATEGY_SERVICE_URL || 'http://localhost:8001';
    static async getRecommendations(strategyId: string, portfolio: string[]) {
        const response = await axios.post(`${this.URL}/api/v1/strategy/recommend`, {
            strategyId,
            portfolio
        });
        return response.data.data;
    }
    static async getETFList() {
        const response = await axios.get(`${this.URL}/api/v1/strategy/etf`);
        return response.data.data;
    }
}
StrategyClient.getETFList()