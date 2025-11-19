import { Metadata } from 'next'
import Link from 'next/link'
import { getCelebritiesByMonth, getCelebritiesBornToday } from '@/lib/services/celebrity.service'
import { calculateAge } from '@/lib/utils/date'

interface BirthdaysPageProps {
  params: {
    locale: string
  }
  searchParams: {
    month?: string
  }
}

export async function generateMetadata({
  params,
}: BirthdaysPageProps): Promise<Metadata> {
  return {
    title:
      params.locale === 'tr'
        ? 'Doğum Günleri - Celebrity Bio'
        : 'Birthdays - Celebrity Bio',
    description:
      params.locale === 'tr'
        ? 'Ünlülerin doğum günleri ve burç bilgileri'
        : 'Celebrity birthdays and zodiac signs',
  }
}

export default async function BirthdaysPage({
  params,
  searchParams,
}: BirthdaysPageProps) {
  const today = new Date()
  const selectedMonth = searchParams.month
    ? parseInt(searchParams.month)
    : today.getMonth() + 1

  const [bornToday, celebritiesInMonth] = await Promise.all([
    getCelebritiesBornToday(today, params.locale),
    getCelebritiesByMonth(selectedMonth, params.locale),
  ])

  const months = [
    { value: 1, nameTr: 'Ocak', nameEn: 'January', emoji: '❄️' },
    { value: 2, nameTr: 'Şubat', nameEn: 'February', emoji: '💝' },
    { value: 3, nameTr: 'Mart', nameEn: 'March', emoji: '🌸' },
    { value: 4, nameTr: 'Nisan', nameEn: 'April', emoji: '🌷' },
    { value: 5, nameTr: 'Mayıs', nameEn: 'May', emoji: '🌺' },
    { value: 6, nameTr: 'Haziran', nameEn: 'June', emoji: '☀️' },
    { value: 7, nameTr: 'Temmuz', nameEn: 'July', emoji: '🏖️' },
    { value: 8, nameTr: 'Ağustos', nameEn: 'August', emoji: '🌊' },
    { value: 9, nameTr: 'Eylül', nameEn: 'September', emoji: '🍂' },
    { value: 10, nameTr: 'Ekim', nameEn: 'October', emoji: '🎃' },
    { value: 11, nameTr: 'Kasım', nameEn: 'November', emoji: '🍁' },
    { value: 12, nameTr: 'Aralık', nameEn: 'December', emoji: '🎄' },
  ]

  const currentMonthData = months.find((m) => m.value === selectedMonth)

  // Group celebrities by day
  const groupedByDay: { [key: number]: any[] } = {}
  celebritiesInMonth.forEach((celebrity: any) => {
    if (celebrity.birth_date) {
      const day = new Date(celebrity.birth_date).getDate()
      if (!groupedByDay[day]) {
        groupedByDay[day] = []
      }
      groupedByDay[day].push(celebrity)
    }
  })

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold text-gray-900 dark:text-white md:text-5xl">
            🎂 {params.locale === 'tr' ? 'Doğum Günleri' : 'Birthdays'}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            {params.locale === 'tr'
              ? 'Ünlülerin doğum günlerini keşfedin'
              : 'Discover celebrity birthdays'}
          </p>
        </div>

        {/* Born Today Section */}
        {bornToday.length > 0 && (
          <div className="mb-12 overflow-hidden rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 p-8 text-white shadow-xl">
            <h2 className="mb-6 flex items-center gap-2 text-3xl font-bold">
              <span>🎉</span>
              {params.locale === 'tr'
                ? 'Bugün Doğanlar'
                : 'Born Today'}
              <span className="text-2xl opacity-75">
                ({today.getDate()}{' '}
                {
                  months.find((m) => m.value === today.getMonth() + 1)?.[
                    params.locale === 'tr' ? 'nameTr' : 'nameEn'
                  ]
                })
              </span>
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {bornToday.map((celebrity: any) => {
                const age = celebrity.birth_date
                  ? calculateAge(new Date(celebrity.birth_date))
                  : null

                return (
                  <Link
                    key={celebrity.id}
                    href={`/${params.locale}/u/${celebrity.slug}`}
                    className="group rounded-xl bg-white/10 p-4 backdrop-blur-sm transition-all hover:bg-white/20"
                  >
                    <div className="mb-3 flex items-center gap-3">
                      <div className="h-12 w-12 overflow-hidden rounded-full bg-white/20">
                        {celebrity.profile_image_url ? (
                          <img
                            src={celebrity.profile_image_url}
                            alt={celebrity.full_name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-xl">
                            👤
                          </div>
                        )}
                      </div>
                      <div>
                        <h3 className="font-bold group-hover:underline">
                          {celebrity.full_name}
                        </h3>
                        {celebrity.nickname && (
                          <p className="text-sm opacity-90">
                            {celebrity.nickname}
                          </p>
                        )}
                      </div>
                    </div>
                    <p className="text-sm opacity-90">{celebrity.profession}</p>
                    {age !== null && (
                      <p className="mt-2 text-sm font-semibold">
                        🎂 {age} {params.locale === 'tr' ? 'yaşında' : 'years old'}
                      </p>
                    )}
                  </Link>
                )
              })}
            </div>
          </div>
        )}

        {/* Month Selector */}
        <div className="mb-8">
          <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            {params.locale === 'tr' ? 'Ay Seçin:' : 'Select Month:'}
          </h3>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {months.map((month) => (
              <Link
                key={month.value}
                href={`/${params.locale}/birthdays?month=${month.value}`}
                className={`flex items-center justify-center gap-2 rounded-lg p-3 text-sm font-medium transition-all ${
                  selectedMonth === month.value
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                <span>{month.emoji}</span>
                <span>{params.locale === 'tr' ? month.nameTr : month.nameEn}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Calendar View */}
        <div className="rounded-xl bg-white p-6 shadow-lg dark:bg-gray-800">
          <h2 className="mb-6 flex items-center gap-2 text-2xl font-bold text-gray-900 dark:text-white">
            {currentMonthData?.emoji}{' '}
            {params.locale === 'tr'
              ? currentMonthData?.nameTr
              : currentMonthData?.nameEn}{' '}
            {today.getFullYear()}
          </h2>

          {Object.keys(groupedByDay).length > 0 ? (
            <div className="space-y-6">
              {Object.keys(groupedByDay)
                .map(Number)
                .sort((a, b) => a - b)
                .map((day) => (
                  <div key={day} className="border-l-4 border-blue-500 pl-4">
                    <h3 className="mb-3 text-lg font-bold text-gray-900 dark:text-white">
                      {day}{' '}
                      {params.locale === 'tr'
                        ? currentMonthData?.nameTr
                        : currentMonthData?.nameEn}
                    </h3>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {groupedByDay[day].map((celebrity: any) => {
                        const age = celebrity.birth_date
                          ? calculateAge(new Date(celebrity.birth_date))
                          : null

                        return (
                          <Link
                            key={celebrity.id}
                            href={`/${params.locale}/u/${celebrity.slug}`}
                            className="group flex items-center gap-3 rounded-lg bg-gray-50 p-3 transition-all hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600"
                          >
                            <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-600">
                              {celebrity.profile_image_url ? (
                                <img
                                  src={celebrity.profile_image_url}
                                  alt={celebrity.full_name}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="flex h-full items-center justify-center text-xl">
                                  👤
                                </div>
                              )}
                            </div>
                            <div className="flex-1 overflow-hidden">
                              <h4 className="truncate font-semibold text-gray-900 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
                                {celebrity.full_name}
                              </h4>
                              <p className="truncate text-sm text-gray-600 dark:text-gray-300">
                                {celebrity.profession}
                              </p>
                              {age !== null && (
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  {age}{' '}
                                  {params.locale === 'tr'
                                    ? 'yaşında'
                                    : 'years old'}
                                </p>
                              )}
                            </div>
                          </Link>
                        )
                      })}
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <div className="py-20 text-center">
              <p className="text-xl text-gray-500 dark:text-gray-400">
                {params.locale === 'tr'
                  ? 'Bu ayda doğum günü olan ünlü bulunamadı.'
                  : 'No celebrities found born in this month.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
