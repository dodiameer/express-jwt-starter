import express from "express"
import jwt from "jsonwebtoken";
import { verifyToken } from "./utils/tokens"
import { users } from "./data/users"

/**
 * Global middleware
 * 
 * Sets `req.user`, `req.token` and `req.refreshToken`
 */
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

  // You can remove these lines and rely on the payload to be set
  // if you want to use the token as the source of truth.
  const user = users.find((u) => u.id === (payload as jwt.JwtPayload).id);
  if (!user) {
    req.user = null;
    req.token = null;
    return next();
  }

  // Sets the user and token
  req.user = user;
  req.token = token;
  next();
};

/**
 * Route middleware
 * 
 * Ensures that the user is authenticated
 */
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

/**
 * Route middleware
 * 
 * Ensures that the user is *not* authenticated 
 * 
 * Useful for things like logging in and registering
 */
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

/**
 * Route middleware
 * 
 * Ensures that there is a refresh token, but does not
 * ensure that the user is authenticated (doesn't check
 * for an auth header)
 * 
 * Useful for a refresh token endpoint, where the user
 * is not authenticated, but the refresh token is
 * still valid and the user can be authenticated through
 * it, allowing for a "Remember me" feature.
 */
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

/**
 * Route middleware factory (call as a function to return the middleware)
 * 
 * Ensures that `req.user.role` one of the supplied roles
 * @param {string | string[]} roles The role(s) to check against
 */
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
