/** Khan Bank — шилжүүлгээр төлбөр */
export const bankAccount = {
  bankName: 'Хаан банк',
  bankNameEn: 'Khan Bank',
  accountName: 'Dcapital',
  accountNumber: '5521030606',
  iban: 'MN580005005521030606',
  /** IBAN-ыг уншихад хялбар формат */
  ibanFormatted: 'MN58 0005 0055 2103 0606',
} as const

export function formatIban(iban: string) {
  const clean = iban.replace(/\s/g, '').toUpperCase()
  return clean.replace(/(.{4})/g, '$1 ').trim()
}

export function makeTransferRef(slugs: string[]) {
  const stamp = Date.now().toString(36).toUpperCase().slice(-5)
  const code = slugs[0]?.slice(0, 6).toUpperCase() ?? 'ORDER'
  return `SG-${code}-${stamp}`
}
