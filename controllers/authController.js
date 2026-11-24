import connectDB from '../config/db';
import User from '../models/User';
import { clearSession, createSession, hashPassword, verifyPassword } from '../services/authService';
import { getUserId } from '../middlewares/authMiddleware';
import { loginSchema, registerSchema } from '../utils/authSchemas';

function authFailure(res, error, action) {
  const code = error?.code || error?.cause?.code;
  const name = error?.name || error?.constructor?.name || 'Error';
  console.error(`${action} failed`, { name, code });
  if (['ECONNREFUSED', 'ETIMEDOUT', 'ENOTFOUND', 'ECONNRESET'].includes(code) || /MongooseServerSelection|Mongo(ServerSelection|Network)/.test(name)) {
    return res.status(503).json({ success: false, message: 'Could not reach MongoDB. Check DNS resolution, your Atlas URI, outbound access to port 27017, and that this machine is allowed in Atlas Network Access.' });
  }
  return res.status(500).json({ success: false, message: action === 'Registration' ? 'Could not create your account. Please try again.' : 'Could not sign in right now.' });
}

export async function register(req, res) {
  const parsed = registerSchema.safeParse(req.body || {});
  if (!parsed.success) return res.status(400).json({ success: false, message: parsed.error.issues[0].message });
  const { name, email, password } = parsed.data;
  if (!process.env.MONGODB_URI) return res.status(500).json({ success: false, message: 'Database is not configured. Set MONGODB_URI in .env and restart the server.' });
  if (!process.env.JWT_SECRET) return res.status(500).json({ success: false, message: 'Session signing is not configured. Set JWT_SECRET in .env and restart the server.' });
  try {
    await connectDB();
    const normalized = email.trim().toLowerCase();
    if (await User.exists({ email: normalized })) return res.status(409).json({ success: false, message: 'An account with that email already exists.' });
    const user = await User.create({ name: name.trim(), email: normalized, password: await hashPassword(password) });
    res.setHeader('Set-Cookie', createSession(user._id));
    return res.status(201).json({ success: true, user: { id: user._id, name: user.name, email: user.email } });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ success: false, message: 'An account with that email already exists.' });
    return authFailure(res, error, 'Registration');
  }
}
export async function login(req, res) {
  const parsed = loginSchema.safeParse(req.body || {});
  if (!parsed.success) return res.status(400).json({ success: false, message: parsed.error.issues[0].message });
  const { email, password } = parsed.data;
  if (!process.env.MONGODB_URI) return res.status(500).json({ success: false, message: 'Database is not configured. Set MONGODB_URI in .env and restart the server.' });
  if (!process.env.JWT_SECRET) return res.status(500).json({ success: false, message: 'Session signing is not configured. Set JWT_SECRET in .env and restart the server.' });
  try {
    await connectDB();
    const user = await User.findOne({ email: email.trim().toLowerCase() }).select('+password');
    if (!user || !(await verifyPassword(password, user.password))) return res.status(401).json({ success: false, message: 'Email or password is incorrect.' });
    res.setHeader('Set-Cookie', createSession(user._id));
    return res.status(200).json({ success: true, user: { id: user._id, name: user.name, email: user.email } });
  } catch (error) { return authFailure(res, error, 'Login'); }
}
export async function logout(req, res) { res.setHeader('Set-Cookie', clearSession()); return res.status(200).json({ success: true }); }
export async function me(req, res) {
  const userId = getUserId(req);
  if (!userId) return res.status(200).json({ success: true, user: null });
  try { await connectDB(); const user = await User.findById(userId).select('name email'); return res.status(200).json({ success: true, user }); }
  catch (error) {
    console.error('Account lookup failed', { name: error?.name, code: error?.code, causeCode: error?.cause?.code });
    return res.status(500).json({ success: false, message: 'Could not load your account.' });
  }
}
