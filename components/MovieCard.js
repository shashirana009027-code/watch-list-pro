import Link from 'next/link';

export default function MovieCard({ movie, onAdd, added, onStatus, onRemove }) {
  const poster = movie.posterUrl || (movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : '');
  const year = (movie.releaseDate || movie.release_date || '').slice(0, 4);
  const tmdbId = movie.id ?? movie.tmdbId;
  const overviewHref = tmdbId ? `/movie/${tmdbId}` : '#';

  return <article className="movie-card col">
    <Link href={movie._id ? `/watchlist/${movie._id}` : overviewHref} className="poster-wrap">
      {poster ? <img className="poster" src={poster} alt={`${movie.title} poster`} loading="lazy" /> : <div className="poster-placeholder"><span>&#x25C6;</span><small>NO POSTER</small></div>}
      {movie.status && <span className={`status-chip ${movie.status}`}>{movie.status.replace('_', ' ')}</span>}
    </Link>
    <div className="card-copy">
      <div className="card-title-row"><Link href={movie._id ? `/watchlist/${movie._id}` : overviewHref} className="movie-title">{movie.title}</Link><span className="movie-year">{year || 'N/A'}</span></div>
      {(movie.genres?.length > 0) && <div className="genre-line">{movie.genres.slice(0, 2).join(', ')}</div>}
      {Number.isFinite(movie.vote_average) && movie.vote_average > 0 && <div className="movie-rating">TMDB {movie.vote_average.toFixed(1)}/10</div>}
      {Number.isInteger(movie.rating) && movie.rating >= 1 && movie.rating <= 10 && <div className="user-rating">Your rating: {movie.rating}/10</div>}
      {movie.status === 'done' && !Number.isInteger(movie.rating) && <div className="user-rating">Your rating: N/A</div>}
      <div className="movie-actions">
        <Link className="overview-button" href={movie._id ? `/watchlist/${movie._id}` : overviewHref}>{movie._id ? 'Status & rating' : 'Overview'}</Link>
        {onAdd && <button className={added ? 'add-button added' : 'add-button'} onClick={() => onAdd(tmdbId)} disabled={added}>{added ? 'In your list' : '+ Add to list'}</button>}
        {onRemove && <button className="remove-link" onClick={() => onRemove(movie)}>Remove from list</button>}
      </div>
      {onStatus && <select aria-label={`Status for ${movie.title}`} className="status-select" value={movie.status} onChange={event => onStatus(event.target.value)}><option value="to_watch">To watch</option><option value="watching">Watching</option><option value="done">Done</option></select>}
    </div>
  </article>;
}
