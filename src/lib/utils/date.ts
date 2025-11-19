export function calculateAge(birthDate: Date): number {
  const today = new Date()
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }

  return age
}

export function getZodiacSign(birthDate: Date): string {
  const month = birthDate.getMonth() + 1
  const day = birthDate.getDate()

  const signs = [
    { sign: '♑ Oğlak', start: [12, 22], end: [1, 19] },
    { sign: '♒ Kova', start: [1, 20], end: [2, 18] },
    { sign: '♓ Balık', start: [2, 19], end: [3, 20] },
    { sign: '♈ Koç', start: [3, 21], end: [4, 19] },
    { sign: '♉ Boğa', start: [4, 20], end: [5, 20] },
    { sign: '♊ İkizler', start: [5, 21], end: [6, 20] },
    { sign: '♋ Yengeç', start: [6, 21], end: [7, 22] },
    { sign: '♌ Aslan', start: [7, 23], end: [8, 22] },
    { sign: '♍ Başak', start: [8, 23], end: [9, 22] },
    { sign: '♎ Terazi', start: [9, 23], end: [10, 22] },
    { sign: '♏ Akrep', start: [10, 23], end: [11, 21] },
    { sign: '♐ Yay', start: [11, 22], end: [12, 21] },
  ]

  for (const { sign, start, end } of signs) {
    if (
      (month === start[0] && day >= start[1]) ||
      (month === end[0] && day <= end[1])
    ) {
      return sign
    }
  }

  return ''
}
