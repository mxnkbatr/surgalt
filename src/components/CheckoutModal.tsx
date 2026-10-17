import { formatPrice, type Course } from '../data/courses'

type Props = {
  course: Course
  onClose: () => void
  onConfirm: () => void
}

export function CheckoutModal({ course, onClose, onConfirm }: Props) {
  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="checkout-title"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="checkout-title">Төлбөр төлөх</h2>
        <p>
          <strong>{course.title}</strong>
          <br />
          Нийт: {formatPrice(course.price)}. Төлбөр амжилттай болбол бүх хичээл нээгдэнэ.
        </p>
        <div className="modal__actions">
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Болих
          </button>
          <button type="button" className="btn btn-primary" onClick={onConfirm}>
            Төлөх
          </button>
        </div>
      </div>
    </div>
  )
}
