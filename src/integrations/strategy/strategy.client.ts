import { ApiError } from "@/utils/response/error";
import axios from "axios";

const URL = process.env.STRATEGY_SERVICE_URL || 'http://localhost:8001';

export const StrategyClient = {
    getRecommendations: async (strategyId: string, portfolio: string[]) => {
        const response = await axios.post(`${URL}/api/v1/strategy/recommend`, {
            strategyId,
            portfolio
        });
        return response.data.data;
    },
    getETFList: async () => {
        const response = await axios.get(`${URL}/api/v1/strategy/etf`);
        return response.data.data;
    },

    getReports: async (day: string) => {
        if (!day) throw new ApiError('Day parameter is required', 400);
        const response = await axios.get(`${URL}/api/v1/strategy/reports/${day}`);
        return response.data.data;
    },

    generateReport: async (day: string, date: Date) => {
        if (!day) throw new ApiError('Day parameter is required', 400);
        if (!date) throw new ApiError('Date parameter is required', 400);
        const response = await axios.post(`${URL}/api/v1/strategy/generate/report`, {
            day,
            date
        });
        return response.data.data;
    }
}