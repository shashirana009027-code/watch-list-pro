import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { serialize } from 'cookie';

const COOKIE = 'movie_session';
export function createSession(userId) {
  if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET is not configured');
  const token = jwt.sign({ sub: String(userId) }, process.env.JWT_SECRET, { expiresIn: '7d' });
  return serialize(COOKIE, token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: 60 * 60 * 24 * 7 });
}
export function clearSession() {
  return serialize(COOKIE, '', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: 0 });
}
export async function hashPassword(password) { return bcrypt.hash(password, 12); }
export async function verifyPassword(password, hash) { return bcrypt.compare(password, hash); }
