import type { AxiosInstance } from "axios";
import { ApiError } from "./error";
import axios from "axios";

const attachErrorInterceptor = (client: AxiosInstance, message: string): AxiosInstance => {
    client.interceptors.response.use(
        (response) => response,
        (error) => Promise.reject(new ApiError(message, 500, { cause: error }))
    );
    return client;
}

export const dhanAuthClient = attachErrorInterceptor(
    axios.create({
        baseURL: 'https://auth.dhan.co',
        headers: { 'Content-Type': 'application/json' },
    }),
    'Failed to generate access token for Dhan'
)

export const dhanApiClient = (accessToken: string, errorMessage: string) => attachErrorInterceptor(
    axios.create({
        baseURL: 'https://api.dhan.co/v2',
        headers: { 'Content-Type': 'application/json', 'access-token': accessToken },
    }),
    errorMessage
)
export const mstockAuthClient = attachErrorInterceptor(
    axios.create({
        baseURL: 'https://api.mstock.trade/openapi/typea',
        headers: {
            'X-Mirae-Version': '1',
            'Content-Type': 'application/x-www-form-urlencoded',
        },
    }),
    'Failed to generate access token for Mstock'
);

export const mstockApiClient = (apiKey: string, token: string, errorMessage: string) => attachErrorInterceptor(
    axios.create({
        baseURL: 'https://api.mstock.trade/openapi/typea',
        headers: {
            'X-Mirae-Version': '1',
            'Content-Type': 'application/json',
            'Authorization': `token ${apiKey}:${token}`,
        },
    }),
    errorMessage
);