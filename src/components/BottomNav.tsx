import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { useCart } from '../cart/CartContext'

export function BottomNav() {
  const { pathname } = useLocation()
  const { user } = useAuth()
  const { count } = useCart()
  const [minimized, setMinimized] = useState(false)

  const profileTo = user ? '/profile' : '/login'
  const profileActive =
    pathname.startsWith('/profile') ||
    pathname === '/login' ||
    pathname === '/signup'

  const tabs = [
    {
      to: '/',
      match: (p: string) => p === '/',
      label: 'Нүүр',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M4.5 10.5 12 4l7.5 6.5V20a1.5 1.5 0 0 1-1.5 1.5h-4.25v-5.5h-3.5V21.5H6A1.5 1.5 0 0 1 4.5 20v-9.5Z"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
    {
      to: '/surgalt',
      match: (p: string) => p === '/surgalt',
      label: 'Сургалт',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M4 7.5A2.5 2.5 0 0 1 6.5 5H18a2 2 0 0 1 2 2v10.5a1.5 1.5 0 0 1-1.5 1.5H7A3 3 0 0 0 4 21V7.5Z"
            stroke="currentColor"
            strokeWidth="1.7"
          />
          <path d="M4 17.5h13.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      to: '/sags',
      match: (p: string) => p.startsWith('/sags'),
      label: 'Сагс',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M4 6h2.2l1.3 9.2a2 2 0 0 0 2 1.7h7.8a2 2 0 0 0 2-1.6L21 8H7"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="10" cy="19" r="1.2" fill="currentColor" />
          <circle cx="17" cy="19" r="1.2" fill="currentColor" />
        </svg>
      ),
    },
    {
      to: profileTo,
      match: () => profileActive,
      label: 'Профайл',
      state: user ? undefined : { from: '/profile' },
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="9" r="3.25" stroke="currentColor" strokeWidth="1.7" />
          <path
            d="M5.5 19.25c1.4-2.6 3.7-3.9 6.5-3.9s5.1 1.3 6.5 3.9"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
          />
        </svg>
      ),
    },
  ] as const

  useEffect(() => {
    let lastY = window.scrollY
    let ticking = false

    function onScroll() {
      if (ticking) return
      ticking = true
      window.requestAnimationFrame(() => {
        const y = window.scrollY
        const delta = y - lastY
        if (y < 24) setMinimized(false)
        else if (delta > 8) setMinimized(true)
        else if (delta < -8) setMinimized(false)
        lastY = y
        ticking = false
      })
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [pathname])

  return (
    <div className={`bottom-nav-dock${minimized ? ' is-minimized' : ''}`}>
      <nav className="bottom-nav" aria-label="Үндсэн цэс">
        <div className="bottom-nav__glass bottom-nav__glass--4">
          {tabs.map((tab) => {
            const active = tab.match(pathname)
            const showBadge = tab.to === '/sags' && count > 0
            return (
              <Link
                key={tab.label}
                to={tab.to}
                state={'state' in tab ? tab.state : undefined}
                className={`bottom-nav__item${active ? ' is-active' : ''}`}
                onClick={() => setMinimized(false)}
              >
                <span className="bottom-nav__icon">
                  {tab.icon}
                  {showBadge && <i className="bottom-nav__badge">{count}</i>}
                </span>
                <span className="bottom-nav__label">{tab.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
