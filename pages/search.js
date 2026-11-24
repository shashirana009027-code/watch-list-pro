import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import MovieCard from '../components/MovieCard';
import Toast from '../components/Toast';

export default function SearchPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [query, setQuery] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const [results, setResults] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [added, setAdded] = useState([]);
  const [toast, setToast] = useState('');

  async function loadLatest(requestedPage = 1) {
    setLoading(true);
    setError('');
    setActiveSearch('');
    setPage(requestedPage);
    try {
      const response = await fetch(`/api/tmdb/latest?page=${requestedPage}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Could not load the latest movies.');
      setResults(data.results || []);
      setPages(data.totalPages || 1);
    } catch (loadError) {
      setResults([]);
      setError(loadError.message || 'Could not load the latest movies.');
    } finally {
      setLoading(false);
    }
  }

  async function searchMovies(term, requestedPage = 1) {
    const normalizedTerm = term.trim();
    if (!normalizedTerm) return loadLatest(1);
    setLoading(true);
    setError('');
    setActiveSearch(normalizedTerm);
    setPage(requestedPage);
    try {
      const response = await fetch(`/api/tmdb/search?query=${encodeURIComponent(normalizedTerm)}&page=${requestedPage}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Movie search failed.');
      setResults(data.results || []);
      setPages(data.totalPages || 1);
    } catch (searchError) {
      setResults([]);
      setError(searchError.message || 'Movie search failed.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!router.isReady) return;
    fetch('/api/auth/me')
      .then(response => response.json())
      .then(data => setUser(data.user || null))
      .catch(() => setUser(null));

    const initialQuery = typeof router.query.q === 'string' ? router.query.q.trim() : '';
    if (initialQuery) {
      setQuery(initialQuery);
      searchMovies(initialQuery);
    } else {
      loadLatest();
    }
  }, [router.isReady]);

  async function search(event, requestedPage = 1) {
    event?.preventDefault();
    const term = query.trim();
    if (!term) {
      router.replace('/search', undefined, { shallow: true });
      setQuery('');
      await loadLatest(1);
      return;
    }
    router.replace({ pathname: '/search', query: { q: term } }, undefined, { shallow: true });
    await searchMovies(term, requestedPage);
  }

  function changePage(requestedPage) {
    if (activeSearch) searchMovies(activeSearch, requestedPage);
    else loadLatest(requestedPage);
  }

  async function add(id) {
    if (!user) {
      const returnTo = activeSearch ? `/search?q=${encodeURIComponent(activeSearch)}` : '/search';
      router.push(`/login?returnTo=${encodeURIComponent(returnTo)}`);
      return;
    }
    try {
      const response = await fetch('/api/watchlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tmdbId: id }),
      });
      const data = await response.json();
      if (response.status === 401) {
        const returnTo = activeSearch ? `/search?q=${encodeURIComponent(activeSearch)}` : '/search';
        router.push(`/login?returnTo=${encodeURIComponent(returnTo)}`);
        return;
      }
      if (!response.ok) throw new Error(data.message);
      setAdded(current => [...current, id]);
      window.dispatchEvent(new Event('watchlist:updated'));
      setToast('Added to your watchlist.');
    } catch (addError) {
      setToast(addError.message || 'Could not add this movie.');
    }
  }

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  }

  return <Layout user={user} onLogout={logout}>
    <div className="page-wrap container-fluid">
      <div className="page-header"><div><div className="eyebrow">THE NEXT GREAT WATCH</div><h1>{activeSearch ? 'Search results' : 'Latest movies'}</h1><p className="page-sub">{activeSearch ? `Movies matching "${activeSearch}".` : 'Latest movies currently in theatres, updated from TMDB.'}</p></div></div>
      <form className="search-form" onSubmit={search}><span aria-hidden="true">&#x2315;</span><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search movies by title..." aria-label="Search movies" /><button className="primary-button" disabled={loading}>{loading ? 'Loading...' : 'Search'} <span aria-hidden="true">&rarr;</span></button></form>
      {error && <div className="inline-error">{error}</div>}
      {loading ? <div className="movie-grid search-grid">{[1,2,3,4,5,6,7,8].map(item => <div className="skeleton" key={item}></div>)}</div> : results.length ? <><div className="results-label">{activeSearch ? `${results.length} MOVIES FOUND` : 'LATEST MOVIES'} <span>PAGE {page}</span></div><div className="movie-grid search-grid">{results.map(movie => <MovieCard key={movie.id} movie={movie} onAdd={add} added={added.includes(movie.id)} />)}</div><div className="pagination"><button disabled={page <= 1} onClick={() => changePage(page - 1)}>Previous</button><span>{page} / {pages}</span><button disabled={page >= pages} onClick={() => changePage(page + 1)}>Next</button></div></> : <div className="empty-state"><h3>{activeSearch ? 'No movies found' : 'No latest movies available'}</h3><p>{activeSearch ? 'Try another title or check the spelling.' : 'Try searching for a movie title.'}</p></div>}
    </div>
    <Toast message={toast} type={toast.includes('Added') ? 'success' : 'error'} onClose={() => setToast('')} />
  </Layout>;
}
