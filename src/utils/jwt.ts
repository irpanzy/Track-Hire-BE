import jwt, { SignOptions } from "jsonwebtoken";
import { TokenPayload } from "../models/auth.model";

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const ACCESS_TOKEN_EXPIRY = (process.env.ACCESS_TOKEN_EXPIRY ||
  "15m") as string;
const REFRESH_TOKEN_EXPIRY = (process.env.REFRESH_TOKEN_EXPIRY ||
  "7d") as string;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is not set");
}

if (!JWT_REFRESH_SECRET) {
  throw new Error("JWT_REFRESH_SECRET environment variable is not set");
}

export const generateAccessToken = (payload: TokenPayload): string => {
  const options: SignOptions = {
    expiresIn: ACCESS_TOKEN_EXPIRY as any,
    algorithm: "HS256",
  };
  return jwt.sign(payload, JWT_SECRET as string, options);
};

export const generateRefreshToken = (payload: TokenPayload): string => {
  const options: SignOptions = {
    expiresIn: REFRESH_TOKEN_EXPIRY as any,
    algorithm: "HS256",
  };
  return jwt.sign(payload, JWT_REFRESH_SECRET as string, options);
};

export const verifyAccessToken = (token: string): TokenPayload | null => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET as string, {
      algorithms: ["HS256"],
    });
    return decoded as unknown as TokenPayload;
  } catch (error) {
    return null;
  }
};

export const verifyRefreshToken = (token: string): TokenPayload | null => {
  try {
    const decoded = jwt.verify(token, JWT_REFRESH_SECRET as string, {
      algorithms: ["HS256"],
    });
    return decoded as unknown as TokenPayload;
  } catch (error) {
    return null;
  }
};

export const decodeToken = (token: string) => {
  return jwt.decode(token);
};
