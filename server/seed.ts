import bcrypt from 'bcryptjs'
import { User } from './models/User.js'

const ADMIN_PHONE = process.env.ADMIN_PHONE || '90000000'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123'

/** ADMIN_PHONE-г админ болгоно; байхгүй бол үүсгэнэ */
export async function ensureAdmin() {
  const existing = await User.findOne({ phone: ADMIN_PHONE })
  if (existing) {
    if (!existing.isAdmin) {
      existing.isAdmin = true
      await existing.save()
      console.log(`[seed] Админ эрх өглөө: ${ADMIN_PHONE}`)
    }
    return
  }

  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10)
  await User.create({
    name: 'Админ',
    phone: ADMIN_PHONE,
    passwordHash,
    isAdmin: true,
    unlockedSlugs: [],
  })
  console.log(`[seed] Админ үүслээ: ${ADMIN_PHONE} / ${ADMIN_PASSWORD}`)
}
