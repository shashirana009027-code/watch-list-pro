import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { errorsFromIssues, loginSchema } from '../utils/authSchemas';

function getReturnPath(value) {
  if (typeof value !== 'string' || value.startsWith('//')) return '/watchlist';
  if (value.startsWith('/search')) return value;
  return /^\/movie\/\d+(?:\?.*)?$/.test(value) ? value : '/watchlist';
}

export default function Login() {
  const router = useRouter();
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setErrors({});
    const parsed = loginSchema.safeParse(Object.fromEntries(new FormData(event.currentTarget)));
    if (!parsed.success) {
      setErrors(errorsFromIssues(parsed.error.issues));
      return;
    }

    setBusy(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed.data),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message);
      router.push(getReturnPath(router.query.returnTo));
    } catch (error) {
      setErrors({ form: error.message || 'Could not sign in right now.' });
    } finally {
      setBusy(false);
    }
  }

  return <main className="auth-page"><Link href="/search" className="brand">Movies WatchList</Link><section className="auth-card"><div className="eyebrow">WELCOME BACK</div><h1>Your next favorite<br />is waiting.</h1><p className="auth-sub">Sign in to pick up where you left off.</p><form onSubmit={submit} noValidate><label>Email address<input name="email" type="email" autoComplete="email" required placeholder="you@example.com" />{errors.email && <span className="form-error">{errors.email}</span>}</label><label>Password<input name="password" type="password" autoComplete="current-password" required placeholder="Your password" />{errors.password && <span className="form-error">{errors.password}</span>}</label>{errors.form && <p className="form-error">{errors.form}</p>}<button className="primary-button full" disabled={busy}>{busy ? 'Signing in...' : 'Sign in'} <span aria-hidden="true">&rarr;</span></button></form><div className="auth-foot">New here? <Link href={{ pathname: '/register', query: router.query.returnTo ? { returnTo: router.query.returnTo } : {} }}>Create an account</Link></div></section><div className="auth-bottom">A little less scrolling. A lot more watching.</div></main>;
}
