import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { errorsFromIssues, registerSchema } from '../utils/authSchemas';

function getReturnPath(value) {
  if (typeof value !== 'string' || value.startsWith('//')) return '/watchlist';
  if (value.startsWith('/search')) return value;
  return /^\/movie\/\d+(?:\?.*)?$/.test(value) ? value : '/watchlist';
}

function EyeIcon({ visible }) {
  return <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
    {!visible && <path d="m3 3 18 18" />}
  </svg>;
}

export default function Register() {
  const router = useRouter();
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setErrors({});
    const parsed = registerSchema.safeParse(Object.fromEntries(new FormData(event.currentTarget)));
    if (!parsed.success) {
      setErrors(errorsFromIssues(parsed.error.issues));
      return;
    }

    setBusy(true);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed.data),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message);
      router.push(getReturnPath(router.query.returnTo));
    } catch (error) {
      setErrors({ form: error.message || 'Could not create your account.' });
    } finally {
      setBusy(false);
    }
  }

  return <main className="auth-page"><Link href="/search" className="brand">Movies WatchList</Link><section className="auth-card"><div className="eyebrow">START YOUR COLLECTION</div><h1>Make movie night<br />a little easier.</h1><p className="auth-sub">Save the films you want to see, all in one place.</p><form onSubmit={submit} noValidate><label>Your name<input name="name" autoComplete="name" required minLength="2" maxLength="80" placeholder="Alex Morgan" />{errors.name && <span className="form-error">{errors.name}</span>}</label><label>Email address<input name="email" type="email" autoComplete="email" required placeholder="you@example.com" />{errors.email && <span className="form-error">{errors.email}</span>}</label><label>Password<div className="password-field"><input name="password" type={showPassword ? 'text' : 'password'} autoComplete="new-password" required minLength="8" maxLength="72" placeholder="At least 8 characters" /><button className="password-toggle" type="button" onClick={() => setShowPassword(value => !value)} aria-label={showPassword ? 'Hide password' : 'Show password'}><EyeIcon visible={showPassword} /></button></div>{errors.password && <span className="form-error">{errors.password}</span>}</label><label>Confirm password<div className="password-field"><input name="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} autoComplete="new-password" required placeholder="Re-enter your password" /><button className="password-toggle" type="button" onClick={() => setShowConfirmPassword(value => !value)} aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}><EyeIcon visible={showConfirmPassword} /></button></div>{errors.confirmPassword && <span className="form-error">{errors.confirmPassword}</span>}</label>{errors.form && <p className="form-error">{errors.form}</p>}<button className="primary-button full" disabled={busy}>{busy ? 'Creating account...' : 'Create your account'} <span aria-hidden="true">&rarr;</span></button></form><div className="auth-foot">Already have an account? <Link href={{ pathname: '/login', query: router.query.returnTo ? { returnTo: router.query.returnTo } : {} }}>Sign in</Link></div></section><div className="auth-bottom">Your watchlist. Your taste. Your call.</div></main>;
}
