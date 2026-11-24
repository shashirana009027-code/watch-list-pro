import { login } from '../../../controllers/authController';
export default function handler(req, res) { if (req.method !== 'POST') return res.status(405).json({ success: false, message: 'Method not allowed.' }); return login(req, res); }
