/** Монгол утасны дугаарыг 8 орон болгож хэвийн болгоно */
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

export function formatPhoneDisplay(phone: string) {
  const p = phone.replace(/\D/g, '')
  if (p.length !== 8) return phone
  return `${p.slice(0, 4)} ${p.slice(4)}`
}

export function formatPhoneInput(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 11)
  if (digits.length <= 4) return digits
  if (digits.length <= 8) return `${digits.slice(0, 4)} ${digits.slice(4)}`
  return digits
}
