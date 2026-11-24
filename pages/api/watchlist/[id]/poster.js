import fs from 'fs';
import path from 'path';
import connectDB from '../../../../config/db';
import Movie from '../../../../models/Movie';
import { requireUser } from '../../../../middlewares/authMiddleware';
import { upload, root } from '../../../../middlewares/uploadMiddleware';

export const config = { api: { bodyParser: false } };
function runMiddleware(req, res, fn) { return new Promise((resolve, reject) => fn(req, res, error => error ? reject(error) : resolve())); }
export default async function handler(req, res) {
  if (req.method !== 'PATCH') return res.status(405).json({ success: false, message: 'Method not allowed.' });
  const userId = requireUser(req, res); if (!userId) return;
  try {
    await runMiddleware(req, res, upload.single('poster'));
    if (!req.file) return res.status(400).json({ success: false, message: 'Choose an image to upload.' });
    await connectDB(); const movie = await Movie.findOne({ _id: req.query.id, userId });
    if (!movie) { fs.unlinkSync(req.file.path); return res.status(404).json({ success: false, message: 'Movie not found.' }); }
    if (movie.posterSource === 'custom' && movie.posterUrl) { const old = path.basename(movie.posterUrl); const oldPath = path.join(root, old); if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath); }
    movie.posterUrl = `/api/posters/${encodeURIComponent(req.file.filename)}`; movie.posterSource = 'custom'; await movie.save();
    return res.status(200).json({ success: true, movie });
  } catch (error) { if (req.file?.path && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path); const tooLarge = error.code === 'LIMIT_FILE_SIZE'; return res.status(tooLarge ? 400 : 400).json({ success: false, message: tooLarge ? 'Image must be 2 MB or smaller.' : error.message || 'Could not upload this image.' }); }
}
