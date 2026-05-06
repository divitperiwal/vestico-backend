import type { User } from "./common";

declare global {
  namespace Express {
    interface Request {
      user?: User
      accessToken?: string;
      apiKey?: string;
    }
  }
}

export {};
