export type LessonResource = {
  label: string
  url: string
}

export type LessonQuiz = {
  question: string
  options: string[]
  correctIndex: number
}

export type Lesson = {
  id: string
  order: number
  title: string
  duration: string
  free?: boolean
  videoUrl?: string
  resources?: LessonResource[]
  quiz?: LessonQuiz[]
}

export type CourseCategory = string

export type Course = {
  id: string
  slug: string
  title: string
  subtitle: string
  description: string
  learnings: string[]
  instructor: string
  instructorRole: string
  lessons: Lesson[]
  price: number
  originalPrice: number
  students: number
  rating: number
  accent: string
  accentSoft: string
  coverLabel: string
  tag: string
  category: CourseCategory
  published?: boolean
}

export function formatPrice(n: number): string {
  return n.toLocaleString('mn-MN') + '₮'
}

export function sortLessons(lessons: Lesson[]): Lesson[] {
  return [...lessons].sort((a, b) => a.order - b.order)
}
