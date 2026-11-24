import { addMovie, listMovies } from '../../../controllers/movieController';
import { requireUser } from '../../../middlewares/authMiddleware';
export default async function handler(req, res) {
  const userId = requireUser(req, res); if (!userId) return;
  if (req.method === 'GET') return listMovies(req, res, userId);
  if (req.method === 'POST') return addMovie(req, res, userId);
  return res.status(405).json({ success: false, message: 'Method not allowed.' });
}
