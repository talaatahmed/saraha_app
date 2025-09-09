import jwt from "jsonwebtoken";

export const generateToken = (payload, secret, option) => {
  return jwt.sign(payload, secret, option);
};

export const verifyToken = (token, secret) => {
  return jwt.verify(token, secret);
};
