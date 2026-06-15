import { IncomingHttpHeaders } from 'http';
import { Request, Response } from 'express';
import type {
  Session as BetterAuthSession,
  User as BetterAuthUser,
} from 'better-auth/types';

export interface RequestWithCookies extends Request {
  cookies: { [key: string]: string };
}

export interface ResponseWithCookie extends Response {
  cookie(name: string, value: string, options?: any): this;
}

export type AuthUser = BetterAuthUser &
  Partial<{
    role: number;
    isActive: boolean;
    isDelete: boolean;
  }>;

export type AuthSession = BetterAuthSession;

export interface RequestWithAuth extends Request {
  headers: {
    authorization?: string;
  } & IncomingHttpHeaders;
  user?: AuthUser;
  session?: AuthSession;
}

export interface BetterAuthInstance {
  handler: (req: any, res: any) => Promise<void>;
}

export interface BetterAuthConfigShape {
  handler: (request: globalThis.Request) => Promise<globalThis.Response>;
}
