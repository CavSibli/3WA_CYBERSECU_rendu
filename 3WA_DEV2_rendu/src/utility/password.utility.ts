import bcrypt from "bcrypt";

export const generateSalt = async (): Promise<string> => {
  return bcrypt.genSalt();
};

export const hashPassword = async (password: string, salt: string): Promise<string> => {
  return bcrypt.hash(password, salt);
};

export const isValidPassword = async (
  enteredPassword: string,
  savedPassword: string,
  salt: string
): Promise<boolean> => {
  return (await hashPassword(enteredPassword, salt)) === savedPassword;
};
