import { search } from '../../../controllers/tmdbController';
export default function handler(req, res) { if (req.method !== 'GET') return res.status(405).json({ success: false, message: 'Method not allowed.' }); return search(req, res); }
