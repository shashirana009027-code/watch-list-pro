const API = 'https://api.themoviedb.org/3';
const REQUEST_TIMEOUT_MS = 8000;
const MAX_ATTEMPTS = 3;

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function tmdb(path) {
  const headers = process.env.TMDB_READ_ACCESS_TOKEN ? { Authorization: `Bearer ${process.env.TMDB_READ_ACCESS_TOKEN}` } : {};
  const url = new URL(`${API}${path}`);
  if (!headers.Authorization && process.env.TMDB_API_KEY) url.searchParams.set('api_key', process.env.TMDB_API_KEY);
  if (!headers.Authorization && !process.env.TMDB_API_KEY) throw new Error('TMDB credentials are not configured');

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    try {
      const response = await fetch(url, { headers, signal: controller.signal });
      if (response.ok) return await response.json();

      const retryable = response.status === 429 || response.status >= 500;
      if (!retryable || attempt === MAX_ATTEMPTS) {
        throw new Error('Movie database is temporarily unavailable');
      }

      const retryAfter = Number(response.headers.get('retry-after'));
      const backoff = Number.isFinite(retryAfter) && retryAfter > 0
        ? Math.min(retryAfter * 1000, 3000)
        : 300 * (2 ** (attempt - 1));
      await wait(backoff);
    } catch (error) {
      if (attempt === MAX_ATTEMPTS || error.message === 'Movie database is temporarily unavailable') {
        throw new Error('Movie database is temporarily unavailable. Please try again shortly.');
      }
      await wait(300 * (2 ** (attempt - 1)));
    } finally {
      clearTimeout(timeout);
    }
  }
}
export const searchMovies = (query, page = 1) => tmdb(`/search/movie?query=${encodeURIComponent(query)}&include_adult=false&page=${page}`);
export const getNowPlayingMovies = (page = 1) => tmdb(`/movie/now_playing?page=${page}`);
export const getMovie = (id) => tmdb(`/movie/${encodeURIComponent(id)}`);
