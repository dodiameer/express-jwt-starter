import express from "express"
import jwt from "jsonwebtoken";
import { verifyToken } from "./utils/tokens"
import { users } from "./data/users"

export const FetchUserMiddleware = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  // A refresh token might exist without the user being authenticated.
  // So we set it here just in case it does exist.
  req.refreshToken = req.cookies["refresh-token"] ?? null;
  
  const [, token] = req.headers?.authorization?.split(" ") ?? [null, null];
  if (!token) {
    // No token, no user fetched - return
    req.user = null;
    req.token = null;
    return next();
  }

  const [validToken, payload] = verifyToken(token);
  if (!validToken) {
    req.user = null;
    req.token = null;
    return next();
  }

  const user = users.find((u) => u.id === (payload as jwt.JwtPayload).id);
  if (!user) {
    req.user = null;
    req.token = null;
    return next();
  }

  req.user = user;
  req.token = token;
  next();
};

export const EnsureAuthMiddleware = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  if (!req.user) {
    res.status(401).send("Unauthorized");
    return
  }
  next();
};

export const EnsureNoAuthMiddleware = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  if (req.user) {
    res.status(403).send("Must be unauthenticated");
    return
  }
  next();
};

export const EnsureRefreshTokenMiddleware = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  if (!req.refreshToken) {
    res.status(401).send("Unauthorized");
    return
  }
  next();
};

export const EnsureRole = (role: string | string[]) => (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) => {
  let isValid = false;
  if (role instanceof Array) {
    role.forEach((r) => {
      if (req.user?.role === r) {
        isValid = true;
      }
    })
  } else {
    isValid = req.user?.role === role;
  }
  if (!isValid) {
    res.status(403).send("You don't have permission to view this resource");
    return
  }
  next();
}
