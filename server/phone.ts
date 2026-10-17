export function normalizePhone(input: string): string | null {
  const digits = input.replace(/\D/g, '')
  let phone = digits
  if (phone.startsWith('976') && phone.length >= 11) {
    phone = phone.slice(3)
  }
  if (phone.length !== 8) return null
  if (!/^[789]\d{7}$/.test(phone)) return null
  return phone
}
