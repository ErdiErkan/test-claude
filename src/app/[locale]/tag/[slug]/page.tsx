import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getCelebritiesByTag, getTagBySlug } from '@/lib/services/tag.service'

interface TagPageProps {
  params: {
    locale: string
    slug: string
  }
  searchParams: {
    page?: string
  }
}

export async function generateMetadata({
  params,
}: TagPageProps): Promise<Metadata> {
  const tag = await getTagBySlug(params.slug)

  if (!tag) {
    return {
      title: 'Tag Not Found',
    }
  }

  const tagName = params.locale === 'tr' ? tag.nameTr : tag.nameEn

  return {
    title: `${tagName} - Celebrity Bio`,
    description: `Explore celebrities and influencers tagged as ${tagName}`,
  }
}

export default async function TagPage({
  params,
  searchParams,
}: TagPageProps) {
  const page = parseInt(searchParams.page || '1')
  const result = await getCelebritiesByTag({
    tagSlug: params.slug,
    locale: params.locale,
    page,
    limit: 24,
  })

  if (!result) {
    notFound()
  }

  const { tag, celebrities, pagination } = result
  const tagName = params.locale === 'tr' ? tag.nameTr : tag.nameEn

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="mb-4 inline-block rounded-full bg-gradient-to-r from-blue-500 to-purple-500 p-4 text-6xl">
            {tag.icon}
          </div>
          <h1 className="mb-4 text-4xl font-bold text-gray-900 dark:text-white md:text-5xl">
            {tagName}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            {pagination.total}{' '}
            {params.locale === 'tr' ? 'ünlü bulundu' : 'celebrities found'}
          </p>
        </div>

        {/* Celebrities Grid */}
        {celebrities.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {celebrities.map((celebrity) => {
              const translation = celebrity.translations[0]
              const totalFollowers = celebrity.socialLinks.reduce(
                (sum, link) => sum + (link.followersCount || 0),
                0
              )

              return (
                <Link
                  key={celebrity.id}
                  href={`/${params.locale}/u/${celebrity.slug}`}
                  className="group overflow-hidden rounded-xl bg-white shadow-md transition-all hover:shadow-xl dark:bg-gray-800"
                >
                  <div className="aspect-square overflow-hidden bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600">
                    {celebrity.profileImageUrl ? (
                      <img
                        src={celebrity.profileImageUrl}
                        alt={celebrity.fullName}
                        className="h-full w-full object-cover transition-transform group-hover:scale-110"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-6xl">
                        👤
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="mb-1 font-bold text-gray-900 dark:text-white">
                      {celebrity.fullName}
                    </h3>
                    {celebrity.nickname && (
                      <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                        {celebrity.nickname}
                      </p>
                    )}
                    <p className="mb-3 text-sm text-gray-600 dark:text-gray-300">
                      {celebrity.profession}
                    </p>
                    {translation && (
                      <p className="mb-3 line-clamp-2 text-sm text-gray-500 dark:text-gray-400">
                        {translation.bioShort}
                      </p>
                    )}
                    {totalFollowers > 0 && (
                      <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                        <svg
                          className="mr-1 h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                          />
                        </svg>
                        {(totalFollowers / 1000000).toFixed(1)}M{' '}
                        {params.locale === 'tr' ? 'takipçi' : 'followers'}
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
                ? 'Bu etiketle ilgili ünlü bulunamadı.'
                : 'No celebrities found with this tag.'}
            </p>
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="mt-12 flex justify-center gap-2">
            {page > 1 && (
              <Link
                href={`/${params.locale}/tag/${params.slug}?page=${page - 1}`}
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
                href={`/${params.locale}/tag/${params.slug}?page=${page + 1}`}
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
