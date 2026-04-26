import { Request, Response } from 'express';
import { IncomingHttpHeaders } from 'http';

export interface RequestWithCookies extends Request {
  cookies: { [key: string]: string };
}

export interface ResponseWithCookie extends Response {
  cookie(name: string, value: string, options?: any): this;
}

import { UserRole } from '../../generated/prisma/enums';

export interface AuthUser {
  id: number;
  role: UserRole;
  sid: string;
  [key: string]: any;
}

export interface RequestWithAuth extends Request {
  headers: {
    authorization?: string;
  } & IncomingHttpHeaders;
  user?: AuthUser;
}
