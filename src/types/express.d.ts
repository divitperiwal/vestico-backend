declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
        sessionId: string;
        role: string;
        broker?: string;
      };
      accessToken?: string;
      apiKey?: string;
    }
  }
}

export {};
