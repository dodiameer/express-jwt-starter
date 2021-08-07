import jwt from "jsonwebtoken"

/**
 * Generates an access & refresh token pair.
 * 
 * @param {any} user The user object.
 * @returns {[string, string]} The access & refresh token pair. `[access, refresh]`
 */
export const generateTokenPair = (user: any): [string, string] => {
  const accessToken = jwt.sign(
    {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    "secret",
    {
      expiresIn: "15m",
    }
  );

  const refreshToken = jwt.sign(
    {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    "secret",
    {
      expiresIn: "1d",
    }
  );

  return [accessToken, refreshToken];
};

/**
 * Verifies a JWT token
 * 
 * @param {string} token The token to verify.
 * @returns {[boolean, jwt.JwtPayload | Error]} The result of the verification. `[validity, payload | Error]`
 */
export const verifyToken = (
  token: string
): [true, jwt.JwtPayload] | [false, Error] => {
  try {
    return [true, jwt.verify(token, "secret") as jwt.JwtPayload];
  } catch (err) {
    return [false, err];
  }
};