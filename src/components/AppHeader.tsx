import { useEffect, useState, type FormEvent } from 'react'
import { createPortal } from 'react-dom'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { useWishlist } from '../wishlist/WishlistContext'
import { Logo } from './Logo'

type Props = {
  searchValue?: string
  onSearchChange?: (value: string) => void
  searchPlaceholder?: string
}

export function AppHeader({
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Хайх…',
}: Props) {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { user } = useAuth()
  const { count } = useWishlist()

  const menuLinks = [
    { to: '/', label: 'Нүүр', hint: 'Нүүр хуудас', state: undefined as undefined },
    { to: '/surgalt', label: 'Сургалт', hint: 'Бүх хичээлүүд', state: undefined as undefined },
    { to: '/sags', label: 'Сагс', hint: 'Захиалга', state: undefined as undefined },
    {
      to: '/wishlist',
      label: 'Хүслийн жагсаалт',
      hint: 'Хадгалсан',
      state: undefined as undefined,
    },
    {
      to: user ? '/profile' : '/login',
      label: 'Профайл',
      hint: user ? 'Акаунт' : 'Нэвтрэх / Бүртгүүлэх',
      state: user ? undefined : { from: '/profile' },
    },
  ]
  const [menuOpen, setMenuOpen] = useState(false)
  const [localQuery, setLocalQuery] = useState(searchValue ?? '')

  useEffect(() => {
    if (searchValue !== undefined) setLocalQuery(searchValue)
  }, [searchValue])

  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!menuOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [menuOpen])

  function submitSearch(e: FormEvent) {
    e.preventDefault()
    const q = localQuery.trim()
    if (onSearchChange) {
      onSearchChange(q)
      return
    }
    navigate(q ? `/surgalt?q=${encodeURIComponent(q)}` : '/surgalt')
  }

  const menu = menuOpen
    ? createPortal(
        <div className="app-menu" role="dialog" aria-modal="true" aria-label="Цэс">
          <button
            type="button"
            className="app-menu__backdrop"
            aria-label="Хаах"
            onClick={() => setMenuOpen(false)}
          />
          <div className="app-menu__sheet">
            <div className="app-menu__grab" aria-hidden="true" />
            <div className="app-menu__head">
              <div className="app-menu__brand">
                <Logo size={40} />
                <div>
                  <strong>Dcapital</strong>
                  <span>Онлайн сургалт</span>
                </div>
              </div>
              <button
                type="button"
                className="app-header__icon"
                aria-label="Хаах"
                onClick={() => setMenuOpen(false)}
              >
                <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path
                    d="M4 4l8 8M12 4l-8 8"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>

            <nav className="app-menu__group">
              {menuLinks.map((item) => {
                const active =
                  item.label === 'Профайл'
                    ? pathname.startsWith('/profile') ||
                      pathname === '/login' ||
                      pathname === '/signup'
                    : item.to === '/'
                      ? pathname === '/'
                      : pathname.startsWith(item.to)
                return (
                  <Link
                    key={item.label}
                    to={item.to}
                    state={item.state}
                    className={`app-menu__row${active ? ' is-active' : ''}`}
                    onClick={() => setMenuOpen(false)}
                  >
                    <span>
                      <b>{item.label}</b>
                      <small>{item.hint}</small>
                    </span>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                      <path
                        d="M6 3.5 10.5 8 6 12.5"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </Link>
                )
              })}
            </nav>
          </div>
        </div>,
        document.body,
      )
    : null

  return (
    <>
      <header className="app-header">
        <div className="app-header__glass">
          <Link to="/" className="app-header__brand" aria-label="Dcapital нүүр">
            <Logo size={34} />
          </Link>

          <form className="app-header__search" onSubmit={submitSearch} role="search">
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
              value={localQuery}
              onChange={(e) => {
                setLocalQuery(e.target.value)
                onSearchChange?.(e.target.value)
              }}
              placeholder={searchPlaceholder}
              enterKeyHint="search"
            />
          </form>

          <Link
            to="/wishlist"
            className={`app-header__icon app-header__wish${pathname.startsWith('/wishlist') ? ' is-active' : ''}${count > 0 ? ' has-items' : ''}`}
            aria-label="Хүслийн жагсаалт"
          >
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M12.1 20.3c-.3 0-.5-.1-1.2-.6-2.3-1.6-5.2-3.9-6.9-6.5C2.6 11.1 2.4 8.6 3.7 6.9c1.1-1.5 3-2.2 4.8-1.8 1.1.2 2.1.9 2.7 1.8.6-.9 1.6-1.6 2.7-1.8 1.8-.4 3.7.3 4.8 1.8 1.3 1.7 1.1 4.2-.3 6.3-1.7 2.6-4.6 4.9-6.9 6.5-.4.3-.7.6-1 .6Z"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinejoin="round"
                fill={count > 0 || pathname.startsWith('/wishlist') ? 'currentColor' : 'none'}
              />
            </svg>
            {count > 0 && <i className="app-header__badge">{count}</i>}
          </Link>

          <button
            type="button"
            className="app-header__icon"
            aria-label="Цэс"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(true)}
          >
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M5 8h14M5 12h14M5 16h10"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
      </header>

      {menu}
    </>
  )
}
