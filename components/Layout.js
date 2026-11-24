import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

function SignInIcon() {
  return <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" /><path d="m10 17 5-5-5-5" /><path d="M15 12H3" /></svg>;
}

function SignOutIcon() {
  return <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h4" /><path d="m16 17 5-5-5-5" /><path d="M21 12H9" /></svg>;
}

export default function Layout({ children, user, onLogout }) {
  const router = useRouter();
  const [watchlistCount, setWatchlistCount] = useState(null);
  const homeHref = '/search';

  useEffect(() => {
    if (!user) {
      setWatchlistCount(null);
      return;
    }

    let active = true;
    async function loadCount() {
      try {
        const response = await fetch('/api/watchlist?countOnly=true');
        const data = await response.json();
        if (active && data.success) setWatchlistCount(data.count);
      } catch {}
    }
    loadCount();
    window.addEventListener('watchlist:updated', loadCount);
    return () => {
      active = false;
      window.removeEventListener('watchlist:updated', loadCount);
    };
  }, [user?.id, user?._id, router.pathname]);

  const watchlistLink = <Link className={router.pathname.startsWith('/watchlist') ? 'nav-link active' : 'nav-link'} href="/watchlist">My watchlist{watchlistCount !== null && <span className="watchlist-count">{watchlistCount}</span>}</Link>;

  return <div className="app-shell d-flex min-vh-100">
    <aside className="sidebar"><Link href={homeHref} className="brand">Movies WatchList</Link>
      {user && <div className="nav-label">YOUR SPACE</div>}
      <nav>{user && watchlistLink}<Link className={router.pathname === '/search' ? 'nav-link active' : 'nav-link'} href="/search">Discover</Link></nav>
      <div className="sidebar-bottom">{user ? <><div className="avatar">{user.name?.[0]?.toUpperCase() || 'M'}</div><div className="profile-copy"><strong>{user.name}</strong><span>{user.email}</span></div><button className="icon-button sign-out-link" onClick={onLogout} title="Sign out"><SignOutIcon />Sign out</button></> : <Link className="icon-button sign-in-link" href="/login"><SignInIcon />Sign in</Link>}</div>
    </aside><main className="main-area flex-grow-1"><header className="mobile-header"><Link href={homeHref} className="brand">Movies WatchList</Link><div className="mobile-links">{user && <Link className="mobile-watchlist-link" href="/watchlist">My watchlist{watchlistCount !== null && <span className="watchlist-count">{watchlistCount}</span>}</Link>}<Link href="/search">Discover</Link>{user ? <button className="icon-button sign-out-link" onClick={onLogout}><SignOutIcon />Sign out</button> : <Link href="/login" className="sign-in-link"><SignInIcon />Sign in</Link>}</div></header>{children}</main>
  </div>;
}
