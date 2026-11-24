import { deleteMovie, oneMovie, updateMovie } from '../../../controllers/movieController';
import { requireUser } from '../../../middlewares/authMiddleware';
export default async function handler(req, res) {
  const userId = requireUser(req, res); if (!userId) return;
  if (req.method === 'GET') return oneMovie(req, res, userId);
  if (req.method === 'PUT') return updateMovie(req, res, userId);
  if (req.method === 'DELETE') return deleteMovie(req, res, userId);
  return res.status(405).json({ success: false, message: 'Method not allowed.' });
}
