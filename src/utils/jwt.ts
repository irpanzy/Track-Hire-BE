import jwt, { Jwt, JwtPayload, SignOptions } from "jsonwebtoken";
import type { StringValue } from "ms";
import { TokenPayload } from "../models/auth.model";
import { env } from "../config/env";

export const generateAccessToken = (payload: TokenPayload): string => {
  const options: SignOptions = {
    expiresIn: env.ACCESS_TOKEN_EXPIRY as StringValue,
    algorithm: "HS256",
  };
  return jwt.sign(payload, env.JWT_SECRET, options);
};

export const generateRefreshToken = (payload: TokenPayload): string => {
  const options: SignOptions = {
    expiresIn: env.REFRESH_TOKEN_EXPIRY as StringValue,
    algorithm: "HS256",
  };
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, options);
};

export const verifyAccessToken = (token: string): TokenPayload | null => {
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET, {
      algorithms: ["HS256"],
    });
    return decoded as unknown as TokenPayload;
  } catch (error) {
    return null;
  }
};

export const verifyRefreshToken = (token: string): TokenPayload | null => {
  try {
    const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET, {
      algorithms: ["HS256"],
    });
    return decoded as unknown as TokenPayload;
  } catch (error) {
    return null;
  }
};

export const decodeToken = (
  token: string
): string | Jwt | JwtPayload | null => {
  return jwt.decode(token);
};
