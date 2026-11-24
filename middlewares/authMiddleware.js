import jwt from 'jsonwebtoken';
import { parse } from 'cookie';

export function getUserId(req) {
  const token = parse(req.headers.cookie || '').movie_session;
  if (!token || !process.env.JWT_SECRET) return null;
  try { return jwt.verify(token, process.env.JWT_SECRET).sub; } catch { return null; }
}
export function requireUser(req, res) {
  const userId = getUserId(req);
  if (!userId) { res.status(401).json({ success: false, message: 'Please sign in to continue.' }); return null; }
  return userId;
}
