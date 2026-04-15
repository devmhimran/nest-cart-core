import { Request } from 'express';
import { IncomingHttpHeaders } from 'http';

export interface RequestWithCookies extends Request {
  cookies: { [key: string]: string };
}

export interface ResponseWithCookie extends Response {
  cookie(name: string, value: string, options?: any): this;
}

export interface RequestWithAuth extends Request {
  headers: {
    authorization?: string;
  } & IncomingHttpHeaders;
}
