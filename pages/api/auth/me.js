import { me } from '../../../controllers/authController';
export default function handler(req, res) { if (req.method !== 'GET') return res.status(405).json({ success: false, message: 'Method not allowed.' }); return me(req, res); }
