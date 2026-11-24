import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Swal from 'sweetalert2';
import Layout from '../../components/Layout';
import MovieCard from '../../components/MovieCard';
import Toast from '../../components/Toast';

const filters = [['all', 'All movies'], ['to_watch', 'To watch'], ['watching', 'Watching'], ['done', 'Done']];

export default function Watchlist() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [movies, setMovies] = useState([]);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState('');

  async function load() {
    const me = await fetch('/api/auth/me').then(response => response.json());
    if (!me.user) {
      router.replace('/login');
      return;
    }
    setUser(me.user);
    const query = new URLSearchParams();
    if (filter !== 'all') query.set('status', filter);
    if (search) query.set('search', search);
    const data = await fetch(`/api/watchlist?${query}`).then(response => response.json());
    if (data.success) setMovies(data.movies);
  }

  useEffect(() => { load(); }, [filter, search]);

  async function changeStatus(movie, status) {
    try {
      const response = await fetch(`/api/watchlist/${movie._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Could not update movie status.');
      setToast('Movie status updated.');
      await load();
    } catch (error) {
      await Swal.fire({ icon: 'error', title: 'Update failed', text: error.message });
    }
  }

  async function remove(movie) {
    const confirmation = await Swal.fire({
      title: 'Remove this movie?',
      text: `Remove "${movie.title}" from your watchlist?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Remove movie',
      cancelButtonText: 'Keep it',
      confirmButtonColor: '#d5fa58',
      cancelButtonColor: '#252d3a',
      color: '#f1f3f4',
      background: '#121722',
    });
    if (!confirmation.isConfirmed) return;

    try {
      const response = await fetch(`/api/watchlist/${movie._id}`, { method: 'DELETE' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Could not remove this movie.');
      window.dispatchEvent(new Event('watchlist:updated'));
      setToast('Movie removed from your list.');
      await load();
    } catch (error) {
      await Swal.fire({ icon: 'error', title: 'Could not remove movie', text: error.message });
    }
  }

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  }

  return <Layout user={user} onLogout={logout}>
    <div className="page-wrap container-fluid">
      <div className="page-header"><div><div className="eyebrow">YOUR PERSONAL COLLECTION</div><h1>My watchlist<span className="title-count">{movies.length}</span></h1><p className="page-sub">Everything you want to watch, all in one place.</p></div></div>
      <div className="list-toolbar"><div className="filter-tabs">{filters.map(([key, label]) => <button key={key} className={filter === key ? 'filter-tab selected' : 'filter-tab'} onClick={() => setFilter(key)}>{label}</button>)}</div><label className="list-search"><span aria-hidden="true">&#x2315;</span><input value={search} onChange={event => setSearch(event.target.value)} placeholder="Find in your list" /></label></div>
      {movies.length ? <div className="movie-grid">{movies.map(movie => <MovieCard key={movie._id} movie={movie} onStatus={status => changeStatus(movie, status)} onRemove={remove} />)}</div> : <div className="empty-state"><span>&#x25A4;</span><h3>{search ? 'No matches in your list' : 'This shelf is looking a little empty'}</h3><p>{search ? 'Try a different title.' : 'Add movies from Discover and they will show up here.'}</p><button className="primary-button" onClick={() => router.push('/search')}>Discover movies <span aria-hidden="true">&rarr;</span></button></div>}
    </div>
    <Toast message={toast} onClose={() => setToast('')} />
  </Layout>;
}
