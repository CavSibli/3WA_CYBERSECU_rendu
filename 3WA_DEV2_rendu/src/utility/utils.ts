import "dotenv/config";

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
