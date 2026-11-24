import { getMovie, getNowPlayingMovies, searchMovies } from '../services/tmdbService';
export async function nowPlaying(req, res) {
  const page = Number(req.query.page || 1);
  if (!Number.isInteger(page) || page < 1 || page > 500) return res.status(400).json({ success: false, message: 'Enter a valid page number.' });
  try {
    const data = await getNowPlayingMovies(page);
    return res.status(200).json({ success: true, results: data.results, page: data.page, totalPages: Math.min(data.total_pages, 500) });
  } catch (error) {
    return res.status(502).json({ success: false, message: error.message || 'Could not load the latest movies.' });
  }
}

export async function search(req, res) {
  const query = String(req.query.query || '').trim();
  const page = Number(req.query.page || 1);
  if (!query || query.length > 120 || !Number.isInteger(page) || page < 1 || page > 500) return res.status(400).json({ success: false, message: 'Enter a movie title and a valid page number.' });
  try { const data = await searchMovies(query, page); return res.status(200).json({ success: true, results: data.results, page: data.page, totalPages: Math.min(data.total_pages, 500) }); }
  catch (error) { return res.status(502).json({ success: false, message: error.message || 'Movie search failed.' }); }
}
export async function details(req, res) {
  if (!/^\d+$/.test(String(req.query.tmdbId || ''))) return res.status(400).json({ success: false, message: 'A valid movie id is required.' });
  try { return res.status(200).json({ success: true, movie: await getMovie(req.query.tmdbId) }); }
  catch { return res.status(502).json({ success: false, message: 'Could not load movie details.' }); }
}
