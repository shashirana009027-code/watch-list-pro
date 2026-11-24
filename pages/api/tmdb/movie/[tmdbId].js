import { details } from '../../../../controllers/tmdbController';
export default function handler(req, res) { if (req.method !== 'GET') return res.status(405).json({ success: false, message: 'Method not allowed.' }); req.query.tmdbId = req.query.tmdbId; return details(req, res); }
