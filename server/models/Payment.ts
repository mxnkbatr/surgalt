import mongoose, { Schema } from 'mongoose'

export type PaymentStatus = 'pending' | 'approved' | 'rejected'

export type PaymentDoc = {
  ref: string
  userId: string
  userName: string
  phone: string
  slugs: string[]
  titles: string[]
  amount: number
  status: PaymentStatus
  createdAt: Date
  reviewedAt?: Date
}

const paymentSchema = new Schema<PaymentDoc>(
  {
    ref: { type: String, required: true },
    userId: { type: String, required: true, index: true },
    userName: { type: String, required: true },
    phone: { type: String, required: true },
    slugs: { type: [String], required: true },
    titles: { type: [String], required: true },
    amount: { type: Number, required: true },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
      index: true,
    },
    reviewedAt: { type: Date },
  },
  { timestamps: { createdAt: true, updatedAt: true } },
)

export const Payment = mongoose.model<PaymentDoc>('Payment', paymentSchema)
