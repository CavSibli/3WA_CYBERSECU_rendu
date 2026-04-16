import "dotenv/config";
import type { Request } from "express";

export const getEnvVariable = (variableName: string): string => {
  const value = process.env[variableName];

  if (!value) {
    throw new Error(`Missing environment variable: ${variableName}`);
  }

  return value;
};

export const extractToken = (authorization: string): string | null => {
  if (!authorization) {
    return null;
  }

  const [prefix, token] = authorization.split(" ");

  if (!prefix || !token) {
    return null;
  }

  const authorizationPrefixes = ["Bearer"];

  if (!authorizationPrefixes.includes(prefix)) {
    return null;
  }

  return token;
};

export const isHttpsRequest = (req: Request): boolean => {
  const forwardedProto = req.headers["x-forwarded-proto"];
  const proto = Array.isArray(forwardedProto) ? forwardedProto[0] : forwardedProto;

  return req.secure || proto === "https";
};
