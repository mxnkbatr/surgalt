import { useState, type FormEvent } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { formatPhoneInput } from '../auth/phone'
import { Logo } from '../components/Logo'

type Mode = 'login' | 'signup'

export function AuthPage({ mode }: { mode: Mode }) {
  const { user, login, signup } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from ?? '/profile'

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  if (user) {
    const dest = user.isAdmin && (from === '/profile' || from === '/admin') ? '/admin' : from
    return <Navigate to={dest} replace />
  }

  const isLogin = mode === 'login'

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setBusy(true)
    const result = isLogin
      ? await login(phone, password)
      : await signup(name, phone, password)
    setBusy(false)
    if (!result.ok) {
      setError(result.error)
      return
    }
    navigate(result.user.isAdmin ? '/admin' : from, { replace: true })
  }

  return (
    <div className="auth-page">
      <div className="auth-page__bg" aria-hidden="true" />

      <div className="auth-page__top">
        <Link to="/" className="auth-page__back" aria-label="Буцах">
          <svg width="20" height="20" viewBox="0 0 22 22" fill="none" aria-hidden="true">
            <path
              d="M13.5 5 7.5 11l6 6"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Link>
        <Link to="/" className="auth-page__brand">
          <Logo size={32} />
          <span>
            Dcapital
          </span>
        </Link>
        <span className="auth-page__spacer" aria-hidden="true" />
      </div>

      <div className="auth-card">
        <p className="auth-card__eyebrow">{isLogin ? 'Тавтай морил' : 'Шинэ акаунт'}</p>
        <h1>{isLogin ? 'Нэвтрэх' : 'Бүртгүүлэх'}</h1>
        <p className="auth-card__lead">
          {isLogin
            ? 'Утасны дугаар, нууц үгээрээ нэвтэрнэ үү.'
            : 'Утасны дугаараараа бүртгүүлээд суралцаж эхлээрэй.'}
        </p>

        <div className="auth-tabs" role="tablist">
          <Link
            to="/login"
            state={location.state}
            className={`auth-tabs__item${isLogin ? ' is-active' : ''}`}
            role="tab"
            aria-selected={isLogin}
          >
            Нэвтрэх
          </Link>
          <Link
            to="/signup"
            state={location.state}
            className={`auth-tabs__item${!isLogin ? ' is-active' : ''}`}
            role="tab"
            aria-selected={!isLogin}
          >
            Бүртгүүлэх
          </Link>
        </div>

        <form className="auth-form" onSubmit={onSubmit}>
          {!isLogin && (
            <label className="auth-field">
              <span>Нэр</span>
              <input
                type="text"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Жишээ: Болд"
                required
              />
            </label>
          )}

          <label className="auth-field">
            <span>Утасны дугаар</span>
            <div className="auth-field__phone">
              <span className="auth-field__prefix">+976</span>
              <input
                type="tel"
                inputMode="numeric"
                autoComplete="tel-national"
                value={phone}
                onChange={(e) => setPhone(formatPhoneInput(e.target.value))}
                placeholder="9911 2233"
                required
              />
            </div>
          </label>

          <label className="auth-field">
            <span>Нууц үг</span>
            <div className="auth-field__pass">
              <input
                type={showPass ? 'text' : 'password'}
                autoComplete={isLogin ? 'current-password' : 'new-password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Хамгийн багадаа 6 тэмдэгт"
                minLength={6}
                required
              />
              <button type="button" onClick={() => setShowPass((v) => !v)}>
                {showPass ? 'Нуух' : 'Харах'}
              </button>
            </div>
          </label>

          {error && (
            <p className="auth-form__error" role="alert">
              {error}
            </p>
          )}

          <button type="submit" className="btn btn-primary auth-form__submit" disabled={busy}>
            {busy ? 'Түр хүлээнэ үү…' : isLogin ? 'Нэвтрэх' : 'Бүртгүүлэх'}
          </button>
        </form>

        <p className="auth-card__foot">
          {isLogin ? (
            <>
              Бүртгэлгүй юу?{' '}
              <Link to="/signup" state={location.state}>
                Бүртгүүлэх
              </Link>
            </>
          ) : (
            <>
              Бүртгэлтэй юу?{' '}
              <Link to="/login" state={location.state}>
                Нэвтрэх
              </Link>
            </>
          )}
        </p>
      </div>
    </div>
  )
}
