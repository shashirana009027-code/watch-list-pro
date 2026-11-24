import { logout } from '../../../controllers/authController';
export default function handler(req, res) { if (req.method !== 'POST') return res.status(405).json({ success: false, message: 'Method not allowed.' }); return logout(req, res); }
