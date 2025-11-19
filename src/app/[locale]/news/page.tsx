import { Metadata } from 'next'
import Link from 'next/link'
import { getNewsList } from '@/lib/services/news.service'

interface NewsPageProps {
  params: {
    locale: string
  }
  searchParams: {
    page?: string
    category?: string
  }
}

export async function generateMetadata({
  params,
}: NewsPageProps): Promise<Metadata> {
  return {
    title: params.locale === 'tr' ? 'Haberler - Celebrity Bio' : 'News - Celebrity Bio',
    description:
      params.locale === 'tr'
        ? 'Ünlüler ve fenomenler hakkında güncel haberler'
        : 'Latest news about celebrities and influencers',
  }
}

export default async function NewsPage({
  params,
  searchParams,
}: NewsPageProps) {
  const page = parseInt(searchParams.page || '1')
  const { news, pagination } = await getNewsList({
    locale: params.locale,
    page,
    limit: 12,
    category: searchParams.category,
  })

  const categories = [
    { value: '', label: params.locale === 'tr' ? 'Tümü' : 'All' },
    { value: 'announcement', label: params.locale === 'tr' ? 'Duyuru' : 'Announcement' },
    { value: 'career', label: params.locale === 'tr' ? 'Kariyer' : 'Career' },
    { value: 'project', label: params.locale === 'tr' ? 'Proje' : 'Project' },
    { value: 'social', label: params.locale === 'tr' ? 'Sosyal' : 'Social' },
    { value: 'personal', label: params.locale === 'tr' ? 'Kişisel' : 'Personal' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="mb-4 text-4xl font-bold text-gray-900 dark:text-white md:text-5xl">
            📰 {params.locale === 'tr' ? 'Haberler' : 'News'}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            {params.locale === 'tr'
              ? 'Ünlüler ve fenomenler hakkında güncel gelişmeler'
              : 'Latest updates about celebrities and influencers'}
          </p>
        </div>

        {/* Category Filter */}
        <div className="mb-8 flex flex-wrap gap-2">
          {categories.map((category) => (
            <Link
              key={category.value}
              href={`/${params.locale}/news${category.value ? `?category=${category.value}` : ''}`}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                (searchParams.category || '') === category.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              {category.label}
            </Link>
          ))}
        </div>

        {/* News Grid */}
        {news.length > 0 ? (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {news.map((newsItem) => {
              const translation = newsItem.translations[0]
              const celebrityTranslation = newsItem.primaryCelebrity?.translations[0]

              return (
                <Link
                  key={newsItem.id}
                  href={`/${params.locale}/news/${newsItem.slug}`}
                  className="group overflow-hidden rounded-xl bg-white shadow-md transition-all hover:shadow-xl dark:bg-gray-800"
                >
                  {/* Featured Image */}
                  <div className="aspect-video overflow-hidden bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600">
                    {newsItem.featuredImageUrl ? (
                      <img
                        src={newsItem.featuredImageUrl}
                        alt={translation?.title || ''}
                        className="h-full w-full object-cover transition-transform group-hover:scale-110"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-6xl">
                        📰
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    {/* Category Badge */}
                    {newsItem.category && (
                      <span className="mb-2 inline-block rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-600 dark:bg-blue-900 dark:text-blue-300">
                        {
                          categories.find((c) => c.value === newsItem.category)
                            ?.label
                        }
                      </span>
                    )}

                    <h3 className="mb-2 line-clamp-2 text-xl font-bold text-gray-900 dark:text-white">
                      {translation?.title}
                    </h3>

                    {translation?.summary && (
                      <p className="mb-4 line-clamp-3 text-sm text-gray-600 dark:text-gray-300">
                        {translation.summary}
                      </p>
                    )}

                    {/* Celebrity Info */}
                    {newsItem.primaryCelebrity && (
                      <div className="mb-4 flex items-center gap-2">
                        <div className="h-8 w-8 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                          {newsItem.primaryCelebrity.profileImageUrl ? (
                            <img
                              src={newsItem.primaryCelebrity.profileImageUrl}
                              alt={newsItem.primaryCelebrity.fullName}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center text-sm">
                              👤
                            </div>
                          )}
                        </div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {newsItem.primaryCelebrity.fullName}
                        </span>
                      </div>
                    )}

                    {/* Date */}
                    {newsItem.publishedAt && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(newsItem.publishedAt).toLocaleDateString(
                          params.locale === 'tr' ? 'tr-TR' : 'en-US',
                          {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          }
                        )}
                      </p>
                    )}
                  </div>
                </Link>
              )
            })}
          </div>
        ) : (
          <div className="py-20 text-center">
            <p className="text-xl text-gray-500 dark:text-gray-400">
              {params.locale === 'tr' ? 'Henüz haber yok.' : 'No news yet.'}
            </p>
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="mt-12 flex justify-center gap-2">
            {page > 1 && (
              <Link
                href={`/${params.locale}/news?page=${page - 1}${searchParams.category ? `&category=${searchParams.category}` : ''}`}
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
                href={`/${params.locale}/news?page=${page + 1}${searchParams.category ? `&category=${searchParams.category}` : ''}`}
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
