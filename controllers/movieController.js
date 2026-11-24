import connectDB from '../config/db';
import Movie from '../models/Movie';
import { getMovie } from '../services/tmdbService';
import fs from 'fs';
import path from 'path';
import { root as uploadRoot } from '../middlewares/uploadMiddleware';

const fail = (res, status, message) => res.status(status).json({ success: false, message });
export async function listMovies(req, res, userId) {
  try {
    await connectDB();
    if (req.query.countOnly === 'true') {
      const count = await Movie.countDocuments({ userId });
      return res.status(200).json({ success: true, count });
    }
    const query = { userId };
    if (['to_watch', 'watching', 'done'].includes(req.query.status)) query.status = req.query.status;
    if (typeof req.query.search === 'string' && req.query.search.trim()) query.title = { $regex: req.query.search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' };
    const movies = await Movie.find(query).sort({ createdAt: -1 }).limit(200);
    return res.status(200).json({ success: true, movies });
  } catch { return fail(res, 500, 'Could not load your watchlist.'); }
}
export async function addMovie(req, res, userId) {
  const id = Number(req.body?.tmdbId);
  if (!Number.isInteger(id) || id < 1) return fail(res, 400, 'A valid movie id is required.');
  try {
    await connectDB();
    if (await Movie.exists({ userId, tmdbId: id })) return fail(res, 409, 'This movie is already in your watchlist.');
    const item = await getMovie(id);
    const movie = await Movie.create({ userId, tmdbId: item.id, title: item.title, overview: item.overview || '', releaseDate: item.release_date || '', genres: (item.genres || []).map(g => g.name), posterUrl: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : '', posterSource: 'tmdb' });
    return res.status(201).json({ success: true, movie });
  } catch (error) { if (error.code === 11000) return fail(res, 409, 'This movie is already in your watchlist.'); return fail(res, 502, error.message || 'Could not add this movie.'); }
}
export async function oneMovie(req, res, userId) {
  try { await connectDB(); const movie = await Movie.findOne({ _id: req.query.id, userId }); return movie ? res.status(200).json({ success: true, movie }) : fail(res, 404, 'Movie not found.'); }
  catch { return fail(res, 404, 'Movie not found.'); }
}
export async function updateMovie(req, res, userId) {
  const body = req.body || {};
  const update = {};
  if (body.status !== undefined) { if (!['to_watch', 'watching', 'done'].includes(body.status)) return fail(res, 400, 'Choose a valid movie status.'); update.status = body.status; }
  if (body.notes !== undefined) { if (typeof body.notes !== 'string' || body.notes.length > 500) return fail(res, 400, 'Notes must be 500 characters or fewer.'); update.notes = body.notes; }
  if (body.rating !== undefined) { if (body.rating !== null && (!Number.isInteger(body.rating) || body.rating < 1 || body.rating > 10)) return fail(res, 400, 'Rating must be a whole number from 1 to 10.'); update.rating = body.rating; }
  try {
    await connectDB();
    const movie = await Movie.findOne({ _id: req.query.id, userId });
    if (!movie) return fail(res, 404, 'Movie not found.');
    const nextStatus = update.status ?? movie.status;
    if (update.rating != null && nextStatus !== 'done') return fail(res, 400, 'Mark the movie done before adding a rating.');
    if (nextStatus !== 'done') update.rating = null;
    Object.assign(movie, update); await movie.save();
    return res.status(200).json({ success: true, movie });
  } catch { return fail(res, 500, 'Could not update this movie.'); }
}
export async function deleteMovie(req, res, userId) {
  try {
    await connectDB();
    const movie = await Movie.findOneAndDelete({ _id: req.query.id, userId });
    if (!movie) return fail(res, 404, 'Movie not found.');
    if (movie.posterSource === 'custom' && movie.posterUrl) {
      const file = path.join(uploadRoot, path.basename(movie.posterUrl));
      if (fs.existsSync(file)) fs.unlinkSync(file);
    }
    return res.status(200).json({ success: true });
  }
  catch { return fail(res, 500, 'Could not delete this movie.'); }
}
