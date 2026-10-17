import mongoose, { Schema } from 'mongoose'

export type LessonResource = {
  label: string
  url: string
}

export type LessonQuiz = {
  question: string
  options: string[]
  correctIndex: number
}

export type LessonDoc = {
  id: string
  order: number
  title: string
  duration: string
  free?: boolean
  videoUrl?: string
  resources?: LessonResource[]
  quiz?: LessonQuiz[]
}

export type CourseDoc = {
  slug: string
  title: string
  subtitle: string
  description: string
  learnings: string[]
  instructor: string
  instructorRole: string
  lessons: LessonDoc[]
  price: number
  originalPrice: number
  students: number
  rating: number
  accent: string
  accentSoft: string
  coverLabel: string
  tag: string
  category: string
  published: boolean
}

const resourceSchema = new Schema<LessonResource>(
  {
    label: { type: String, required: true },
    url: { type: String, required: true },
  },
  { _id: false },
)

const quizSchema = new Schema<LessonQuiz>(
  {
    question: { type: String, required: true },
    options: { type: [String], required: true },
    correctIndex: { type: Number, required: true, default: 0 },
  },
  { _id: false },
)

const lessonSchema = new Schema<LessonDoc>(
  {
    id: { type: String, required: true },
    order: { type: Number, required: true, default: 0 },
    title: { type: String, required: true },
    duration: { type: String, default: '' },
    free: { type: Boolean, default: false },
    videoUrl: { type: String, default: '' },
    resources: { type: [resourceSchema], default: [] },
    quiz: { type: [quizSchema], default: [] },
  },
  { _id: false },
)

const courseSchema = new Schema<CourseDoc>(
  {
    slug: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    subtitle: { type: String, default: '' },
    description: { type: String, default: '' },
    learnings: { type: [String], default: [] },
    instructor: { type: String, default: '' },
    instructorRole: { type: String, default: '' },
    lessons: { type: [lessonSchema], default: [] },
    price: { type: Number, required: true, default: 0 },
    originalPrice: { type: Number, default: 0 },
    students: { type: Number, default: 0 },
    rating: { type: Number, default: 5 },
    accent: { type: String, default: '#1F6B4A' },
    accentSoft: { type: String, default: '#D8F3E5' },
    coverLabel: { type: String, default: 'SURGALT' },
    tag: { type: String, default: 'Шинэ' },
    category: { type: String, required: true, index: true },
    published: { type: Boolean, default: true },
  },
  { timestamps: true },
)

export const Course = mongoose.model<CourseDoc>('Course', courseSchema)
