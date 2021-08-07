# Express JWT starter

*Super* simple starter repo for building an API with JWT authentication, including middleware for ensuring a user is authenticated, not authenticated, etc. Uses Typescript and ESBuild!

This is intentionally super simple and has no opinions about where you data comes from. This way it can be easily built however you want without having to remove anything you don't want. You can even turn this into a GraphQL API if you want.

Also, with the exception of generating the tokens, it's completely stateless, using the JWT as the source for setting `req.user`, That way it can easily be used as a microservice that handles authentication and can decide to not even use a database for user information. You'll only need to get the user data in `data/users.ts validateCredentials()` and return the user object that will be used through the rest of the app, as well as change `middleware.ts FetchuserMiddleware` and replace `const user = users.find(...)` with however you want to get the user object, or even remove it completely and rely on the payload returned by `verifyToken()`

## Setup

```bash
git clone https://github.com/dodiameer/express-jwt-starter
cd express-jwt-starter
pnpm install
pnpm dev
```
