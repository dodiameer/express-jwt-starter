declare namespace Express {
  export interface Request {
     user?: {[key: string]: any} | null;
     token?: string | null;
     refreshToken?: string | null;
  }
}
