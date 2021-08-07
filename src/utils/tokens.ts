import jwt from "jsonwebtoken"

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

export const verifyToken = (
  token: string
): [true, jwt.JwtPayload] | [false, Error] => {
  try {
    return [true, jwt.verify(token, "secret") as jwt.JwtPayload];
  } catch (err) {
    return [false, err];
  }
};