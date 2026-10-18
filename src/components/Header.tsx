import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { useCart } from '../cart/CartContext'
import { useWishlist } from '../wishlist/WishlistContext'
import { Logo } from './Logo'

export function Header() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { count: cartCount } = useCart()
  const { count: wishCount } = useWishlist()
  const [query, setQuery] = useState('')

  const profileTo = user ? '/profile' : '/login'
  const profileActive =
    pathname.startsWith('/profile') || pathname === '/login' || pathname === '/signup'

  const links = [
    { to: '/', label: 'Нүүр', match: (p: string) => p === '/', state: undefined as undefined },
    {
      to: '/surgalt',
      label: 'Сургалт',
      match: (p: string) => p === '/surgalt' || p.startsWith('/surgalt/'),
      state: undefined as undefined,
    },
    {
      to: '/sags',
      label: 'Сагс',
      match: (p: string) => p.startsWith('/sags'),
      state: undefined as undefined,
    },
    {
      to: profileTo,
      label: 'Профайл',
      match: () => profileActive,
      state: user ? undefined : { from: '/profile' },
    },
  ]

  if (
    pathname.startsWith('/transfer') ||
    pathname === '/login' ||
    pathname === '/signup' ||
    pathname.startsWith('/admin')
  ) {
    return null
  }

  function onSearch(e: FormEvent) {
    e.preventDefault()
    const q = query.trim()
    navigate(q ? `/surgalt?q=${encodeURIComponent(q)}` : '/surgalt')
  }

  return (
    <header className="site-header">
      <div className="site-header__bar">
        <Link to="/" className="site-header__brand" aria-label="Dcapital нүүр">
          <Logo size={36} />
          <span>Dcapital</span>
        </Link>

        <nav className="site-header__nav" aria-label="Үндсэн цэс">
          {links.map((link) => (
            <Link
              key={link.label}
              to={link.to}
              state={link.state}
              className={`site-header__link${link.match(pathname) ? ' is-active' : ''}`}
            >
              {link.label}
              {link.to === '/sags' && cartCount > 0 && (
                <i className="site-header__pill">{cartCount}</i>
              )}
            </Link>
          ))}
        </nav>

        <div className="site-header__actions">
          <form className="site-header__search" onSubmit={onSearch} role="search">
            <svg width="16" height="16" viewBox="0 0 18 18" fill="none" aria-hidden="true">
              <circle cx="8" cy="8" r="5.25" stroke="currentColor" strokeWidth="1.6" />
              <path
                d="M12.2 12.2 15 15"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Сургалт, багш хайх…"
              enterKeyHint="search"
            />
          </form>

          <Link
            to="/wishlist"
            className={`site-header__wish${pathname.startsWith('/wishlist') ? ' is-active' : ''}${wishCount > 0 ? ' has-items' : ''}`}
            aria-label="Хүслийн жагсаалт"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M12.1 20.3c-.3 0-.5-.1-1.2-.6-2.3-1.6-5.2-3.9-6.9-6.5C2.6 11.1 2.4 8.6 3.7 6.9c1.1-1.5 3-2.2 4.8-1.8 1.1.2 2.1.9 2.7 1.8.6-.9 1.6-1.6 2.7-1.8 1.8-.4 3.7.3 4.8 1.8 1.3 1.7 1.1 4.2-.3 6.3-1.7 2.6-4.6 4.9-6.9 6.5-.4.3-.7.6-1 .6Z"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinejoin="round"
                fill={wishCount > 0 || pathname.startsWith('/wishlist') ? 'currentColor' : 'none'}
              />
            </svg>
            {wishCount > 0 && <i className="site-header__badge">{wishCount}</i>}
          </Link>
        </div>
      </div>
    </header>
  )
}
