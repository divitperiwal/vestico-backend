import {
  getBrokerCredentials,
  storeBrokerCredentials,
} from "@/database/broker.database.js";
import { ApiError } from "@/utils/ApiError.js";
import axios from "axios";
import { decryptData, encryptData } from "@/utils/encryption.js";
import { getMiraeTokenExpiry } from "@/utils/expiry.js";

export const getUserAccessToken = async (userId: string) => {
  const credentials = await getDecryptedBrokerCredentials(userId);
  if (
    !credentials.accessToken ||
    !credentials.accessTokenExpiry ||
    new Date() >= new Date(credentials.accessTokenExpiry)
  ) {
    return await generateMStockAccessToken(userId, credentials);
  }

  return { accessToken: credentials.accessToken, apiKey: credentials.apiKey };
};

export const getMstockFunds = async (token: string, apiKey: string) => {
  if (!token) throw new ApiError("Access Token not found", 401);
  if (!apiKey) throw new ApiError("API Key not found", 404);

  const URL = `https://api.mstock.trade/openapi/typea/user/fundsummary`;
  try {
    const response = await axios.get(URL, {
      headers: {
        "X-Mirae-Version": "1",
        "Content-Type": "application/json",
        Authorization: `token ${apiKey}:${token}`,
      },
    });
    const funds = response.data.data;
    return funds;
  } catch (error) {
    throw new ApiError("Failed to fetch Mstock Funds", 500);
  }
};

export const generateMStockAccessToken = async (
  userId: string,
  credentials: any
) => {
  if (!credentials.apiKey) throw new ApiError("API Key not found", 404);
  const totp = await generateTOTP("408657");
  //Generate Access Token Logic
  try {
    const URL = "https://api.mstock.trade/openapi/typea/session/verifytotp";
    const response = await axios.post(
      URL,
      new URLSearchParams({
        api_key: credentials.apiKey as string,
        totp: totp,
      }),
      {
        headers: {
          "X-Mirae-Version": "1",
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );
    const token = response.data.data.access_token;
    const expiry = getMiraeTokenExpiry();
    credentials.accessToken = token;
    credentials.accessTokenExpiry = expiry;
    await encryptStoreBrokerCredentials(userId, credentials);
    return { accessToken: token, apiKey: credentials.apiKey };
  } catch (error: any) {
    throw new ApiError(
      error.response.data?.message || "Failed to generate access token",
      error.response.status || 500
    );
  }
};

//MStock Manage
export const getMstockPortfolio = async (token: string, apiKey: string) => {
  if (!token) throw new ApiError("Access Token not found", 401);
  const URL = `https://api.mstock.trade/openapi/typea/portfolio/holdings`;

  try {
    const response = await axios.get(URL, {
      headers: {
        "X-Mirae-Version": "1",
        "Content-Type": "application/json",
        Authorization: `token ${apiKey}:${token}`,
      },
    });
    return response.data.data;
  } catch (error) {
    throw new ApiError("Failed to fetch Mstock Portfolio", 500);
  }
};

//Helper functions
const generateTOTP = (key: string) => {
  return key;
};

const encryptStoreBrokerCredentials = async (
  userId: string,
  credentials: any
) => {
  const encryptedCredentials = encryptData(JSON.stringify(credentials));
  await storeBrokerCredentials(userId, encryptedCredentials);
};

const getDecryptedBrokerCredentials = async (userId: string) => {
  const response = await getBrokerCredentials(userId);
  if (!response?.credentials)
    throw new ApiError("Broker credentials not found", 404);

  const decryptedCredentials = JSON.parse(decryptData(response.credentials));
  return decryptedCredentials;
};

export const getEtfFromPortfolio = async (portfolio: any) => {
  if (!portfolio) throw new ApiError("Portfolio data not found", 404);
  const etf = portfolio.filter((item: any) => item.isin.startsWith("INF"));
  return etf;
};
export const getStockFromPortfolio = async (portfolio: any) => {
  if (!portfolio) throw new ApiError("Portfolio data not found", 404);
  const stock = portfolio.filter((item: any) => item.isin.startsWith("INE"));
  return stock;
};
