import { api } from './api'
import type { Course, Lesson } from '../data/courses'

export type CategoryItem = {
  id: string
  name: string
  order: number
}

export async function fetchCourses(): Promise<Course[]> {
  const data = await api<{ courses: Course[] }>('/courses')
  return data.courses
}

export async function fetchAdminCourses(): Promise<Course[]> {
  const data = await api<{ courses: Course[] }>('/courses/admin/all')
  return data.courses
}

export async function fetchCategories(): Promise<CategoryItem[]> {
  const data = await api<{ categories: CategoryItem[] }>('/categories')
  return data.categories
}

export async function createCategory(name: string): Promise<CategoryItem> {
  const data = await api<{ category: CategoryItem }>('/categories', {
    method: 'POST',
    json: { name },
  })
  return data.category
}

export async function deleteCategory(id: string): Promise<void> {
  await api<{ ok: boolean }>(`/categories/${id}`, { method: 'DELETE' })
}

export async function createCourse(body: Record<string, unknown>): Promise<Course> {
  const data = await api<{ course: Course }>('/courses', {
    method: 'POST',
    json: body,
  })
  return data.course
}

export async function updateCourse(
  id: string,
  body: Record<string, unknown>,
): Promise<Course> {
  const data = await api<{ course: Course }>(`/courses/${id}`, {
    method: 'PUT',
    json: body,
  })
  return data.course
}

export async function deleteCourse(id: string): Promise<void> {
  await api<{ ok: boolean }>(`/courses/${id}`, { method: 'DELETE' })
}

export function emptyLesson(order: number): Lesson {
  return {
    id: `l_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
    order,
    title: '',
    duration: '',
    free: false,
    videoUrl: '',
    resources: [],
    quiz: [],
  }
}
