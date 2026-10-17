import { useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { useCart } from '../cart/CartContext'
import { bankAccount, formatIban, makeTransferRef } from '../data/bank'
import { createPaymentOrder } from '../lib/payments'
import { formatPrice, getCourse, type Course } from '../data/courses'

async function copyText(value: string) {
  try {
    await navigator.clipboard.writeText(value)
    return true
  } catch {
    return false
  }
}

export function TransferPage() {
  const { slug } = useParams()
  const { user } = useAuth()
  const { items, total, clear } = useCart()
  const navigate = useNavigate()

  const single = slug ? getCourse(slug) : undefined
  const orderItems: Course[] = single ? [single] : items
  const orderTotal = single ? single.price : total
  const backTo = single ? `/surgalt/${single.slug}` : '/sags'
  const slugs = orderItems.map((c) => c.slug)

  const [transferRef] = useState(() => makeTransferRef(slugs))
  const [copied, setCopied] = useState<string | null>(null)
  const [confirming, setConfirming] = useState(false)
  const [checked, setChecked] = useState(false)
  const [done, setDone] = useState(false)

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: slug ? `/transfer/${slug}` : '/transfer' }}
      />
    )
  }

  if (!single && items.length === 0 && !done) {
    return <Navigate to="/sags" replace />
  }

  if (slug && !single) {
    return <Navigate to="/surgalt" replace />
  }

  async function onCopy(label: string, value: string) {
    const ok = await copyText(value)
    if (ok) {
      setCopied(label)
      window.setTimeout(() => setCopied(null), 1600)
    }
  }

  function onConfirm() {
    if (!user || !checked || confirming || orderItems.length === 0) return
    setConfirming(true)

    createPaymentOrder({
      ref: transferRef,
      userId: user.id,
      userName: user.name,
      phone: user.phone,
      slugs,
      titles: orderItems.map((c) => c.title),
      amount: orderTotal,
    })

    if (!single) clear()
    setDone(true)
    setConfirming(false)
  }

  if (done) {
    return (
      <div className="transfer-page">
        <header className="card-page__bar">
          <Link to="/profile" className="card-page__back" aria-label="Буцах">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
              <path
                d="M13.5 5 7.5 11l6 6"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
          <h1>Хүсэлт илгээгдлээ</h1>
          <span className="card-page__bar-space" />
        </header>

        <div className="card-page__inner transfer-page__inner">
          <section className="transfer-hero transfer-hero--ok">
            <p className="transfer-hero__bank">Админ шалгана</p>
            <h2>Амжилттай</h2>
            <p>
              Шилжүүлгээ баталгаажуулсны дараа хичээл таны профайл дээр нээгдэнэ. Утга:{' '}
              <b>{transferRef}</b>
            </p>
          </section>
          <button type="button" className="btn btn-primary card-form__submit" onClick={() => navigate('/profile')}>
            Профайл руу
          </button>
          <Link to="/surgalt" className="transfer-alt">
            Сургалт руу буцах
          </Link>
        </div>
      </div>
    )
  }

  const rows = [
    { key: 'bank', label: 'Банк', value: bankAccount.bankName, copy: bankAccount.bankName },
    {
      key: 'account',
      label: 'Дансны дугаар',
      value: bankAccount.accountNumber,
      copy: bankAccount.accountNumber,
    },
    {
      key: 'iban',
      label: 'IBAN',
      value: formatIban(bankAccount.iban),
      copy: bankAccount.iban,
    },
    {
      key: 'name',
      label: 'Хүлээн авагч',
      value: bankAccount.accountName,
      copy: bankAccount.accountName,
    },
    {
      key: 'amount',
      label: 'Дүн',
      value: formatPrice(orderTotal),
      copy: String(orderTotal),
    },
    {
      key: 'ref',
      label: 'Гүйлгээний утга',
      value: transferRef,
      copy: transferRef,
    },
  ] as const

  return (
    <div className="transfer-page">
      <header className="card-page__bar">
        <Link to={backTo} className="card-page__back" aria-label="Буцах">
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
            <path
              d="M13.5 5 7.5 11l6 6"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Link>
        <h1>Дансаар шилжүүлэх</h1>
        <span className="card-page__bar-space" />
      </header>

      <div className="card-page__inner transfer-page__inner">
        <section className="transfer-hero">
          <p className="transfer-hero__bank">{bankAccount.bankName}</p>
          <h2>{formatPrice(orderTotal)}</h2>
          <p>шилжүүлээд хүсэлт илгээнэ — админ баталгаажуулсны дараа хичээл нээгдэнэ</p>
        </section>

        <aside className="card-order">
          {single ? (
            <>
              <div
                className="card-order__thumb"
                style={{
                  background: `linear-gradient(135deg, ${single.accent}, #1a1f1c)`,
                }}
              >
                {single.coverLabel.split('\n')[0]}
              </div>
              <div>
                <h2>{single.title}</h2>
                <p>{single.lessons.length} хичээл · насан туршийн хандалт</p>
                <div className="card-order__price">
                  <s>{formatPrice(single.originalPrice)}</s>
                  <b>{formatPrice(single.price)}</b>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="card-order__thumb card-order__thumb--multi">{orderItems.length}</div>
              <div>
                <h2>Сагсны захиалга</h2>
                <p>{orderItems.length} сургалт</p>
                <div className="card-order__price">
                  <b>{formatPrice(orderTotal)}</b>
                </div>
              </div>
            </>
          )}
        </aside>

        <div className="transfer-steps">
          <p>
            <b>1.</b> Доорх данс руу яг <b>{formatPrice(orderTotal)}</b> шилжүүлнэ
          </p>
          <p>
            <b>2.</b> Гүйлгээний утгад <b>{transferRef}</b> бичнэ
          </p>
          <p>
            <b>3.</b> Шилжүүлсний дараа «Хүсэлт илгээх» дарна — админ шалгаад нээнэ
          </p>
        </div>

        <div className="transfer-card ios-group">
          {rows.map((row) => (
            <div key={row.key} className="transfer-row">
              <div className="transfer-row__text">
                <span>{row.label}</span>
                <strong>{row.value}</strong>
              </div>
              <button
                type="button"
                className="transfer-row__copy"
                onClick={() => onCopy(row.key, row.copy)}
              >
                {copied === row.key ? 'Хуулсан' : 'Хуулах'}
              </button>
            </div>
          ))}
        </div>

        <label className="transfer-check">
          <input
            type="checkbox"
            checked={checked}
            onChange={(e) => setChecked(e.target.checked)}
          />
          <span>
            Би <b>{formatPrice(orderTotal)}</b>-ийг Хаан банкны{' '}
            <b>{bankAccount.accountNumber}</b> данс руу шилжүүлсэн.
          </span>
        </label>

        <button
          type="button"
          className="btn btn-primary card-form__submit"
          disabled={!checked || confirming}
          onClick={onConfirm}
        >
          {confirming ? 'Илгээж байна…' : 'Хүсэлт илгээх'}
        </button>

        <p className="card-form__note">
          Хичээл шууд нээгдэхгүй. Админ төлбөр баталгаажуулсны дараа нээгдэнэ.
        </p>
      </div>
    </div>
  )
}
