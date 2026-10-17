import mongoose, { Schema } from 'mongoose'

export type CategoryDoc = {
  name: string
  order: number
}

const categorySchema = new Schema<CategoryDoc>(
  {
    name: { type: String, required: true, unique: true, trim: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
)

export const Category = mongoose.model<CategoryDoc>('Category', categorySchema)
