import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getNewsBySlug, getLatestNews } from '@/lib/services/news.service'

interface NewsDetailPageProps {
  params: {
    locale: string
    slug: string
  }
}

export async function generateMetadata({
  params,
}: NewsDetailPageProps): Promise<Metadata> {
  const newsItem = await getNewsBySlug(params.slug, params.locale)

  if (!newsItem || !newsItem.translations[0]) {
    return {
      title: 'News Not Found',
    }
  }

  const translation = newsItem.translations[0]

  return {
    title: `${translation.title} - Celebrity Bio`,
    description: translation.summary || translation.content?.substring(0, 160),
    openGraph: {
      title: translation.title,
      description: translation.summary || '',
      images: newsItem.featuredImageUrl ? [newsItem.featuredImageUrl] : [],
    },
  }
}

export default async function NewsDetailPage({ params }: NewsDetailPageProps) {
  const [newsItem, relatedNews] = await Promise.all([
    getNewsBySlug(params.slug, params.locale),
    getLatestNews(params.locale, 3),
  ])

  if (!newsItem || !newsItem.translations[0]) {
    notFound()
  }

  const translation = newsItem.translations[0]
  const celebrityTranslation = newsItem.primaryCelebrity?.translations[0]

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <article className="container mx-auto px-4 py-12">
        {/* Breadcrumb */}
        <nav className="mb-8 text-sm text-gray-600 dark:text-gray-400">
          <Link
            href={`/${params.locale}`}
            className="hover:text-blue-600 dark:hover:text-blue-400"
          >
            {params.locale === 'tr' ? 'Ana Sayfa' : 'Home'}
          </Link>
          {' > '}
          <Link
            href={`/${params.locale}/news`}
            className="hover:text-blue-600 dark:hover:text-blue-400"
          >
            {params.locale === 'tr' ? 'Haberler' : 'News'}
          </Link>
          {' > '}
          <span className="text-gray-900 dark:text-white">
            {translation.title}
          </span>
        </nav>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Featured Image */}
            {newsItem.featuredImageUrl && (
              <div className="mb-8 overflow-hidden rounded-2xl shadow-lg">
                <img
                  src={newsItem.featuredImageUrl}
                  alt={translation.title}
                  className="h-auto w-full"
                />
              </div>
            )}

            {/* Category & Date */}
            <div className="mb-6 flex items-center gap-4">
              {newsItem.category && (
                <span className="inline-block rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-600 dark:bg-blue-900 dark:text-blue-300">
                  {newsItem.category}
                </span>
              )}
              {newsItem.publishedAt && (
                <time className="text-sm text-gray-500 dark:text-gray-400">
                  {new Date(newsItem.publishedAt).toLocaleDateString(
                    params.locale === 'tr' ? 'tr-TR' : 'en-US',
                    {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    }
                  )}
                </time>
              )}
            </div>

            {/* Title */}
            <h1 className="mb-6 text-4xl font-bold text-gray-900 dark:text-white md:text-5xl">
              {translation.title}
            </h1>

            {/* Summary */}
            {translation.summary && (
              <p className="mb-8 text-xl font-medium text-gray-700 dark:text-gray-300">
                {translation.summary}
              </p>
            )}

            {/* Content */}
            {translation.content && (
              <div className="prose prose-lg dark:prose-invert max-w-none">
                <p className="whitespace-pre-line text-gray-600 dark:text-gray-300">
                  {translation.content}
                </p>
              </div>
            )}

            {/* Related Celebrities */}
            {newsItem.celebrities && newsItem.celebrities.length > 0 && (
              <div className="mt-12 rounded-xl bg-gray-50 p-6 dark:bg-gray-800">
                <h3 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">
                  {params.locale === 'tr'
                    ? 'İlgili Ünlüler'
                    : 'Related Celebrities'}
                </h3>
                <div className="flex flex-wrap gap-4">
                  {newsItem.celebrities.map((nc) => {
                    const celeb = nc.celebrity
                    const celebTranslation = celeb.translations[0]

                    return (
                      <Link
                        key={celeb.id}
                        href={`/${params.locale}/u/${celeb.slug}`}
                        className="flex items-center gap-3 rounded-lg bg-white p-3 shadow-md transition-all hover:shadow-lg dark:bg-gray-700"
                      >
                        <div className="h-12 w-12 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-600">
                          {celeb.profileImageUrl ? (
                            <img
                              src={celeb.profileImageUrl}
                              alt={celeb.fullName}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center text-xl">
                              👤
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {celeb.fullName}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            {celeb.profession}
                          </p>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Primary Celebrity Card */}
            {newsItem.primaryCelebrity && (
              <div className="mb-8 overflow-hidden rounded-xl bg-white shadow-md dark:bg-gray-800">
                <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-4">
                  <h3 className="text-sm font-semibold text-white">
                    {params.locale === 'tr' ? 'Hakkında' : 'About'}
                  </h3>
                </div>
                <Link
                  href={`/${params.locale}/u/${newsItem.primaryCelebrity.slug}`}
                  className="block p-6 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <div className="mb-4 flex justify-center">
                    <div className="h-24 w-24 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-600">
                      {newsItem.primaryCelebrity.profileImageUrl ? (
                        <img
                          src={newsItem.primaryCelebrity.profileImageUrl}
                          alt={newsItem.primaryCelebrity.fullName}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-4xl">
                          👤
                        </div>
                      )}
                    </div>
                  </div>
                  <h4 className="mb-2 text-center text-xl font-bold text-gray-900 dark:text-white">
                    {newsItem.primaryCelebrity.fullName}
                  </h4>
                  <p className="mb-4 text-center text-sm text-gray-600 dark:text-gray-300">
                    {newsItem.primaryCelebrity.profession}
                  </p>
                  {celebrityTranslation && (
                    <p className="line-clamp-3 text-sm text-gray-600 dark:text-gray-400">
                      {celebrityTranslation.bioShort}
                    </p>
                  )}
                </Link>
              </div>
            )}

            {/* Latest News */}
            {relatedNews.length > 0 && (
              <div className="rounded-xl bg-white p-6 shadow-md dark:bg-gray-800">
                <h3 className="mb-4 text-lg font-bold text-gray-900 dark:text-white">
                  {params.locale === 'tr' ? 'Son Haberler' : 'Latest News'}
                </h3>
                <div className="space-y-4">
                  {relatedNews
                    .filter((n) => n.slug !== newsItem.slug)
                    .slice(0, 3)
                    .map((news) => {
                      const newsTranslation = news.translations[0]
                      return (
                        <Link
                          key={news.id}
                          href={`/${params.locale}/news/${news.slug}`}
                          className="group block"
                        >
                          <h4 className="mb-1 font-semibold text-gray-900 line-clamp-2 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
                            {newsTranslation?.title}
                          </h4>
                          {news.publishedAt && (
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {new Date(news.publishedAt).toLocaleDateString(
                                params.locale === 'tr' ? 'tr-TR' : 'en-US',
                                {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                }
                              )}
                            </p>
                          )}
                        </Link>
                      )
                    })}
                </div>
              </div>
            )}
          </div>
        </div>
      </article>
    </div>
  )
}
