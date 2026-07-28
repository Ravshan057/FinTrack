import jwt from 'jsonwebtoken';
import config from '../config/env';

export function signToken(userId: number): string {
  return jwt.sign({ sub: userId }, config.JWT_SECRET, {
    expiresIn: config.JWT_EXPIRES_IN,
  } as jwt.SignOptions);
}

export function verifyToken(token: string): { sub: number } {
  const decoded = jwt.verify(token, config.JWT_SECRET) as jwt.JwtPayload;
  return { sub: Number(decoded.sub) };
}