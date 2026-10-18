import { useCallback, useEffect, useRef, useState } from 'react'

const STORAGE_KEY = 'dcapital.onboarded'

const slides = [
  {
    id: 'discover',
    eyebrow: '01',
    title: 'Хичээлээ ол',
    text: 'Эрэлттэй сургалт, багш, сэдвээр цэвэрхэн хайж олно.',
    accent: 'linear-gradient(145deg, #1f6b4a 0%, #244a63 100%)',
    icon: (
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden="true">
        <circle cx="18" cy="18" r="9" stroke="#fff" strokeWidth="2.2" />
        <path d="M25 25l7 7" stroke="#8FD9B8" strokeWidth="2.2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'buy',
    eyebrow: '02',
    title: 'Худалдаж ав',
    text: 'Сагсанд нэмээд дансаар шилжүүл — админ баталгаажуулсны дараа хичээл нээгдэнэ.',
    accent: 'linear-gradient(145deg, #1a2f28 0%, #1f6b4a 55%, #3dbf8a 120%)',
    icon: (
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden="true">
        <rect x="7" y="10" width="26" height="20" rx="3" stroke="#fff" strokeWidth="2.2" />
        <path d="M12 18h16M12 23h10" stroke="#8FD9B8" strokeWidth="2.2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'watch',
    eyebrow: '03',
    title: 'Үзээд сур',
    text: 'Видео хичээлүүдээ хүссэн үедээ, хүссэн газраасаа үз.',
    accent: 'linear-gradient(145deg, #244a63 0%, #1a2f28 50%, #8a4b2b 120%)',
    icon: (
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden="true">
        <circle cx="20" cy="20" r="12" stroke="#fff" strokeWidth="2.2" />
        <path d="M17 14.5v11l10-5.5-10-5.5Z" fill="#8FD9B8" />
      </svg>
    ),
  },
] as const

export function hasCompletedOnboarding() {
  try {
    return localStorage.getItem(STORAGE_KEY) === '1'
  } catch {
    return false
  }
}

function markOnboarded() {
  try {
    localStorage.setItem(STORAGE_KEY, '1')
  } catch {
    /* ignore */
  }
}

type Props = {
  onDone: () => void
}

export function Onboarding({ onDone }: Props) {
  const [index, setIndex] = useState(0)
  const [leaving, setLeaving] = useState(false)
  const touchX = useRef<number | null>(null)
  const last = index === slides.length - 1
  const slide = slides[index]

  const finish = useCallback(() => {
    setLeaving(true)
    markOnboarded()
    window.setTimeout(onDone, 320)
  }, [onDone])

  const next = useCallback(() => {
    if (last) {
      finish()
      return
    }
    setIndex((i) => Math.min(i + 1, slides.length - 1))
  }, [finish, last])

  const prev = useCallback(() => {
    setIndex((i) => Math.max(i - 1, 0))
  }, [])

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  return (
    <div
      className={`onboard${leaving ? ' onboard--out' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label="Танилцуулга"
      onTouchStart={(e) => {
        touchX.current = e.changedTouches[0]?.clientX ?? null
      }}
      onTouchEnd={(e) => {
        if (touchX.current == null) return
        const dx = (e.changedTouches[0]?.clientX ?? touchX.current) - touchX.current
        touchX.current = null
        if (Math.abs(dx) < 48) return
        if (dx < 0) next()
        else prev()
      }}
    >
      <div className="onboard__bg" aria-hidden="true" />

      <button type="button" className="onboard__skip" onClick={finish}>
        Алгасах
      </button>

      <div className="onboard__stage" key={slide.id}>
        <div className="onboard__visual" style={{ background: slide.accent }}>
          <div className="onboard__visual-glow" aria-hidden="true" />
          <div className="onboard__visual-icon">{slide.icon}</div>
          <p className="onboard__brand">
            Dcapital
          </p>
        </div>

        <div className="onboard__copy">
          <span className="onboard__eyebrow">{slide.eyebrow}</span>
          <h1>{slide.title}</h1>
          <p>{slide.text}</p>
        </div>
      </div>

      <div className="onboard__footer">
        <div className="onboard__dots" role="tablist" aria-label="Алхам">
          {slides.map((s, i) => (
            <button
              key={s.id}
              type="button"
              role="tab"
              aria-selected={i === index}
              className={`onboard__dot${i === index ? ' is-active' : ''}`}
              onClick={() => setIndex(i)}
              aria-label={`${i + 1}-р алхам`}
            />
          ))}
        </div>

        <button type="button" className="onboard__cta" onClick={next}>
          {last ? 'Эхлэх' : 'Үргэлжлүүлэх'}
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path
              d="M3.5 8h9M8.5 4l4 4-4 4"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </div>
  )
}
