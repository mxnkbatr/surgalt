import { useNavigate } from 'react-router-dom'
import { useCart } from '../cart/CartContext'
import { formatPrice, type Course } from '../data/courses'

type Props = {
  course: Course
}

export function PurchaseBar({ course }: Props) {
  const { has, add } = useCart()
  const navigate = useNavigate()
  const inCart = has(course.slug)

  function onAction() {
    if (inCart) {
      navigate('/sags')
      return
    }
    add(course.slug)
    navigate('/sags')
  }

  return (
    <div className="purchase-dock">
      <div className="purchase-bar" role="region" aria-label="Төлбөр төлөх">
        <div className="purchase-bar__prices">
          <span className="purchase-bar__old">{formatPrice(course.originalPrice)}</span>
          <span className="purchase-bar__new">{formatPrice(course.price)}</span>
        </div>

        <button type="button" className="purchase-bar__btn" onClick={onAction}>
          <span className="purchase-bar__badge">{course.tag}</span>
          <span className="purchase-bar__btn-main">
            {inCart ? 'Сагс руу' : 'Сагсанд нэмэх'}
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path
                d="M3 8h10M9 4l4 4-4 4"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </button>
      </div>
    </div>
  )
}
