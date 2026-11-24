import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { toast } from 'react-hot-toast';
import Layout from '../../components/Layout';

function formatDate(value) {
  if (!value) return 'Not available';
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
}

export default function MovieOverview() {
  const router = useRouter();
  const { tmdbId } = router.query;
  const [user, setUser] = useState(null);
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [savedMovieId, setSavedMovieId] = useState('');

  useEffect(() => {
    if (!router.isReady || typeof tmdbId !== 'string') return;
    let active = true;
    setLoading(true);
    Promise.all([
      fetch('/api/auth/me').then(response => response.json()).catch(() => ({ user: null })),
      fetch(`/api/tmdb/movie/${encodeURIComponent(tmdbId)}`).then(async response => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Could not load movie details.');
        return data.movie;
      }),
    ]).then(([account, movieData]) => {
      if (!active) return;
      setUser(account.user || null);
      setMovie(movieData);
      setError('');
    }).catch(loadError => {
      if (active) setError(loadError.message || 'Could not load movie details.');
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, [router.isReady, tmdbId]);

  async function addToWatchlist() {
    if (!user) {
      router.push(`/login?returnTo=${encodeURIComponent(`/movie/${tmdbId}`)}`);
      return;
    }
    setAdding(true);
    try {
      const response = await fetch('/api/watchlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tmdbId: Number(tmdbId) }),
      });
      const data = await response.json();
      if (response.status === 401) {
        router.push(`/login?returnTo=${encodeURIComponent(`/movie/${tmdbId}`)}`);
        return;
      }
      if (!response.ok) throw new Error(data.message || 'Could not add this movie.');
      setAdded(true);
      setSavedMovieId(data.movie?._id || '');
      window.dispatchEvent(new Event('watchlist:updated'));
      toast.success('Added to your watchlist.');
    } catch (addError) {
      toast.error(addError.message || 'Could not add this movie.');
    } finally {
      setAdding(false);
    }
  }

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  }

  return <Layout user={user} onLogout={logout}>
    <div className="page-wrap detail-wrap">
      <Link href="/search" className="back-link">Back to Discover</Link>
      {loading ? <div className="loading-screen">Loading movie...</div> : error ? <div className="empty-state"><h2>Could not load movie</h2><p>{error}</p><Link href="/search" className="text-link">Return to search</Link></div> : movie && <section className="detail-hero movie-overview-page">
        <div className="detail-poster">{movie.poster_path ? <img src={`https://image.tmdb.org/t/p/w780${movie.poster_path}`} alt={`${movie.title} poster`} /> : <div className="poster-placeholder"><span>&#x25C6;</span><small>NO POSTER</small></div>}</div>
        <div className="detail-info">
          <div className="eyebrow">MOVIE OVERVIEW</div>
          <h1>{movie.title}{movie.release_date?.slice(0, 4) ? ` (${movie.release_date.slice(0, 4)})` : ''}</h1>
          {movie.tagline && <p className="movie-page-tagline">{movie.tagline}</p>}
          <div className="movie-page-facts">
            <div><span>Release date</span><strong>{formatDate(movie.release_date)}</strong></div>
            <div><span>Genres</span><strong>{movie.genres?.map(genre => genre.name).join(', ') || 'Not available'}</strong></div>
            <div><span>Runtime</span><strong>{movie.runtime ? `${movie.runtime} minutes` : 'Not available'}</strong></div>
            <div><span>TMDB rating</span><strong>{movie.vote_average ? `${movie.vote_average.toFixed(1)} / 10` : 'Not rated'}</strong></div>
            <div><span>Original language</span><strong>{movie.original_language?.toUpperCase() || 'Not available'}</strong></div>
            <div><span>Status</span><strong>{movie.status || 'Not available'}</strong></div>
          </div>
          <h2 className="movie-overview-heading">Overview</h2>
          <p className="detail-overview">{movie.overview || 'No overview is available for this movie.'}</p>
          {savedMovieId ? <Link className="primary-button" href={`/watchlist/${savedMovieId}`}>Manage status &amp; rating</Link> : <button className="primary-button" onClick={addToWatchlist} disabled={adding || added}>{added ? 'Added to watchlist' : adding ? 'Adding...' : 'Add to watchlist'}</button>}
        </div>
      </section>}
    </div>
  </Layout>;
}
