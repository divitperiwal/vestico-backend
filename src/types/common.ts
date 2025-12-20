export interface SuccessResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data?: any;
}

export interface ErrorResponse {
  success:boolean, 
  statusCode:number,
  message:string,
  errors?: any
}

export interface ApiErrorResponse {
  success: boolean;
  statusCode: number;
  message: string;
  code: number;
  details?: any;
}

export interface BaseBrokerCredentials {
  accessToken?: string;
  accessTokenExpiry?: string;
} 

export interface DhanCredentials extends BaseBrokerCredentials {
  clientId: string;
  apiKey: string;
  apiSecret: string;
}
export interface MstockCredentials extends BaseBrokerCredentials {
  apiKey: string;
  totpSecret: string;
}