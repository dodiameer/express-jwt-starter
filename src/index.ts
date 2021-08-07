import express from "express";
//@ts-expect-error - "kill-port" has no type defs
import killPort from "kill-port";
import cookieParser from "cookie-parser";
import {
  EnsureAuthMiddleware,
  EnsureRefreshTokenMiddleware,
  EnsureNoAuthMiddleware,
  FetchUserMiddleware,
  EnsureRole,
} from "./middleware";
import { generateTokenPair, verifyToken } from "./utils/tokens"
import { validateCredentials } from "./data/users"
import { Roles } from "./types";

const PROD = process.env.NODE_ENV === "production";

const main = async () => {
  const app = express();
  app.use(express.json());
  app.use(cookieParser());
  app.use(FetchUserMiddleware);

  const tokenResponse = (res: express.Response, user: any) => {
    const [accessToken, refreshToken] = generateTokenPair(user);

    res.cookie("refresh-token", refreshToken, {
      httpOnly: true,
      secure: PROD,
    });

    res.json({
      accessToken,
    });
  };

  app.get("/public", (req: express.Request, res: express.Response) => {
    res.send(
      `Hello ${req.user?.name ?? "user"}! &lt;${(
        req.user?.role ?? "anonymous"
      ).toUpperCase()}&gt;`
    );
  });

  app.get(
    "/protected",
    EnsureAuthMiddleware,
    (req: express.Request, res: express.Response) => {
      res.send(
        `Hello ${req.user?.name}! &lt;${(
          req.user?.role as string
        ).toUpperCase()}&gt;`
      );
    }
  );

  app.get(
    "/admin-area",
    EnsureAuthMiddleware,
    EnsureRole([Roles.ADMIN, Roles.SUPERUSER]),
    (req: express.Request, res: express.Response) => {
      res.send(
        `Hello ${req.user?.name}! &lt;${(
          req.user?.role as string
        ).toUpperCase()}&gt;`
      );
    }
  );

  app.get(
    "/superuser-area",
    EnsureAuthMiddleware,
    EnsureRole(Roles.SUPERUSER),
    (req: express.Request, res: express.Response) => {
      res.send(`Hello ${req.user?.name}! &lt;SUPERUSER&gt;`);
    }
  );

  app.post(
    "/login",
    EnsureNoAuthMiddleware,
    (req: express.Request, res: express.Response) => {
      const user = validateCredentials(req.body.email, req.body.password);
      if (!user) {
        res.status(401).send("Invalid credentials");
      }

      tokenResponse(res, user);
    }
  );

  app.delete(
    "/logout",
    EnsureAuthMiddleware,
    (req: express.Request, res: express.Response) => {
      res.clearCookie("refresh-token");
      res.status(204).send();
    }
  );

  app.post(
    "/refresh",
    EnsureRefreshTokenMiddleware,
    (req: express.Request, res: express.Response) => {
      const tokenToVerify = req.refreshToken ?? "";
      const [valid, payload] = verifyToken(tokenToVerify);
      if (!valid) {
        res.status(401).send("Invalid refresh token");
        return;
      }
      tokenResponse(res, payload);
    }
  );

  const port = process.env.PORT || 4000;
  !PROD && (await killPort(port));

  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
};

main().catch((e) => console.error(e));
