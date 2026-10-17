import mongoose, { Schema } from 'mongoose'

export type UserDoc = {
  name: string
  phone: string
  passwordHash: string
  isAdmin: boolean
  unlockedSlugs: string[]
  createdAt: Date
}

const userSchema = new Schema<UserDoc>(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String, required: true },
    isAdmin: { type: Boolean, default: false },
    unlockedSlugs: { type: [String], default: [] },
  },
  { timestamps: { createdAt: true, updatedAt: true } },
)

export const User = mongoose.model<UserDoc>('User', userSchema)
