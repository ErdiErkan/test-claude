import { Metadata } from 'next'
import Link from 'next/link'
import { getPopularCelebrities } from '@/lib/services/celebrity.service'

interface PopularPageProps {
  params: {
    locale: string
  }
  searchParams: {
    page?: string
    sortBy?: 'views' | 'searches' | 'popularity'
    period?: 'daily' | 'weekly' | 'monthly' | 'all-time'
  }
}

export async function generateMetadata({
  params,
}: PopularPageProps): Promise<Metadata> {
  return {
    title:
      params.locale === 'tr'
        ? 'Popüler Ünlüler - Celebrity Bio'
        : 'Popular Celebrities - Celebrity Bio',
    description:
      params.locale === 'tr'
        ? 'En çok aranan ve en popüler ünlüler'
        : 'Most searched and popular celebrities',
  }
}

export default async function PopularPage({
  params,
  searchParams,
}: PopularPageProps) {
  const page = parseInt(searchParams.page || '1')
  const sortBy = searchParams.sortBy || 'popularity'
  const period = searchParams.period || 'weekly'

  const { celebrities, pagination } = await getPopularCelebrities({
    locale: params.locale,
    page,
    limit: 24,
    sortBy,
    period,
  })

  const sortOptions = [
    {
      value: 'popularity',
      label: params.locale === 'tr' ? 'Popülerlik' : 'Popularity',
    },
    { value: 'views', label: params.locale === 'tr' ? 'Görüntülenme' : 'Views' },
    { value: 'searches', label: params.locale === 'tr' ? 'Arama' : 'Searches' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-4xl font-bold text-transparent md:text-5xl">
            🔥 {params.locale === 'tr' ? 'Popüler Ünlüler' : 'Popular Celebrities'}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            {params.locale === 'tr'
              ? 'En çok aranan ve trend olan ünlüler'
              : 'Most searched and trending celebrities'}
          </p>
        </div>

        {/* Sort Options */}
        <div className="mb-8 flex flex-wrap items-center justify-center gap-4">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {params.locale === 'tr' ? 'Sıralama:' : 'Sort by:'}
          </span>
          {sortOptions.map((option) => (
            <Link
              key={option.value}
              href={`/${params.locale}/popular?sortBy=${option.value}${searchParams.period ? `&period=${searchParams.period}` : ''}`}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                sortBy === option.value
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              {option.label}
            </Link>
          ))}
        </div>

        {/* Stats Cards */}
        <div className="mb-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 p-6 text-white shadow-lg">
            <div className="mb-2 text-3xl">📊</div>
            <div className="text-2xl font-bold">{pagination.total}</div>
            <div className="text-sm opacity-90">
              {params.locale === 'tr' ? 'Toplam Ünlü' : 'Total Celebrities'}
            </div>
          </div>
          <div className="rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 p-6 text-white shadow-lg">
            <div className="mb-2 text-3xl">👁️</div>
            <div className="text-2xl font-bold">
              {(
                celebrities.reduce((sum, c) => sum + Number(c.totalViews), 0) /
                1000
              ).toFixed(0)}
              K
            </div>
            <div className="text-sm opacity-90">
              {params.locale === 'tr' ? 'Toplam Görüntülenme' : 'Total Views'}
            </div>
          </div>
          <div className="rounded-xl bg-gradient-to-br from-pink-500 to-pink-600 p-6 text-white shadow-lg">
            <div className="mb-2 text-3xl">🔍</div>
            <div className="text-2xl font-bold">
              {(
                celebrities.reduce(
                  (sum, c) => sum + Number(c.totalSearches),
                  0
                ) / 1000
              ).toFixed(0)}
              K
            </div>
            <div className="text-sm opacity-90">
              {params.locale === 'tr' ? 'Toplam Arama' : 'Total Searches'}
            </div>
          </div>
          <div className="rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 p-6 text-white shadow-lg">
            <div className="mb-2 text-3xl">⭐</div>
            <div className="text-2xl font-bold">
              {celebrities.length > 0
                ? (
                    celebrities.reduce(
                      (sum, c) => sum + Number(c.popularityScore),
                      0
                    ) / celebrities.length
                  ).toFixed(1)
                : '0'}
            </div>
            <div className="text-sm opacity-90">
              {params.locale === 'tr'
                ? 'Ortalama Popülerlik'
                : 'Avg Popularity'}
            </div>
          </div>
        </div>

        {/* Celebrities Ranking */}
        {celebrities.length > 0 ? (
          <div className="space-y-4">
            {celebrities.map((celebrity, index) => {
              const translation = celebrity.translations[0]
              const totalFollowers = celebrity.socialLinks.reduce(
                (sum, link) => sum + (link.followersCount || 0),
                0
              )
              const rank = (page - 1) * pagination.limit + index + 1

              return (
                <Link
                  key={celebrity.id}
                  href={`/${params.locale}/u/${celebrity.slug}`}
                  className="group flex items-center gap-6 rounded-xl bg-white p-6 shadow-md transition-all hover:shadow-xl dark:bg-gray-800"
                >
                  {/* Rank */}
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 text-2xl font-bold text-white shadow-lg">
                    {rank <= 3 ? (
                      <span className="text-3xl">
                        {rank === 1 ? '🥇' : rank === 2 ? '🥈' : '🥉'}
                      </span>
                    ) : (
                      rank
                    )}
                  </div>

                  {/* Profile Image */}
                  <div className="h-20 w-20 shrink-0 overflow-hidden rounded-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600">
                    {celebrity.profileImageUrl ? (
                      <img
                        src={celebrity.profileImageUrl}
                        alt={celebrity.fullName}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-4xl">
                        👤
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1">
                    <h3 className="mb-1 text-xl font-bold text-gray-900 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
                      {celebrity.fullName}
                    </h3>
                    {celebrity.nickname && (
                      <p className="mb-1 text-sm text-gray-500 dark:text-gray-400">
                        {celebrity.nickname}
                      </p>
                    )}
                    <p className="mb-2 text-sm text-gray-600 dark:text-gray-300">
                      {celebrity.profession}
                    </p>
                    {translation && (
                      <p className="line-clamp-1 text-sm text-gray-500 dark:text-gray-400">
                        {translation.bioShort}
                      </p>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="hidden shrink-0 space-y-2 text-right sm:block">
                    <div className="flex items-center justify-end gap-2 text-sm">
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        {Number(celebrity.popularityScore).toFixed(1)}
                      </span>
                      <span className="text-gray-500 dark:text-gray-400">
                        {params.locale === 'tr' ? 'Popülerlik' : 'Score'}
                      </span>
                    </div>
                    <div className="flex items-center justify-end gap-2 text-sm">
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        {(Number(celebrity.totalViews) / 1000).toFixed(1)}K
                      </span>
                      <span className="text-gray-500 dark:text-gray-400">
                        {params.locale === 'tr' ? 'Görüntülenme' : 'Views'}
                      </span>
                    </div>
                    {totalFollowers > 0 && (
                      <div className="flex items-center justify-end gap-2 text-sm">
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                          {(totalFollowers / 1000000).toFixed(1)}M
                        </span>
                        <span className="text-gray-500 dark:text-gray-400">
                          {params.locale === 'tr' ? 'Takipçi' : 'Followers'}
                        </span>
                      </div>
                    )}
                  </div>
                </Link>
              )
            })}
          </div>
        ) : (
          <div className="py-20 text-center">
            <p className="text-xl text-gray-500 dark:text-gray-400">
              {params.locale === 'tr'
                ? 'Henüz popüler ünlü yok.'
                : 'No popular celebrities yet.'}
            </p>
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="mt-12 flex justify-center gap-2">
            {page > 1 && (
              <Link
                href={`/${params.locale}/popular?page=${page - 1}&sortBy=${sortBy}${searchParams.period ? `&period=${searchParams.period}` : ''}`}
                className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-md hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                {params.locale === 'tr' ? 'Önceki' : 'Previous'}
              </Link>
            )}

            <span className="flex items-center px-4 text-sm text-gray-600 dark:text-gray-400">
              {params.locale === 'tr' ? 'Sayfa' : 'Page'} {page}{' '}
              {params.locale === 'tr' ? '/' : 'of'} {pagination.totalPages}
            </span>

            {page < pagination.totalPages && (
              <Link
                href={`/${params.locale}/popular?page=${page + 1}&sortBy=${sortBy}${searchParams.period ? `&period=${searchParams.period}` : ''}`}
                className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-md hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                {params.locale === 'tr' ? 'Sonraki' : 'Next'}
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
