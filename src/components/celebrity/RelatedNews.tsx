import Link from 'next/link'
import Image from 'next/image'

interface RelatedNewsProps {
  news: any[]
  locale: string
}

export default function RelatedNews({ news, locale }: RelatedNewsProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-6">
        📰 {locale === 'tr' ? 'Güncel Haberler' : 'Latest News'}
      </h2>

      <div className="space-y-4">
        {news.map((item) => {
          const translation = item.translations?.[0]

          return (
            <Link
              key={item.id}
              href={`/${locale}/${locale === 'tr' ? 'haberler' : 'news'}/${item.slug}`}
              className="flex gap-4 hover:bg-gray-50 p-3 rounded-lg transition"
            >
              {item.featuredImageUrl && (
                <div className="relative w-24 h-24 rounded overflow-hidden flex-shrink-0">
                  <Image
                    src={item.featuredImageUrl}
                    alt={translation?.title || 'News'}
                    fill
                    className="object-cover"
                    sizes="96px"
                  />
                </div>
              )}
              <div className="flex-1">
                <h3 className="font-bold mb-1 line-clamp-2">{translation?.title}</h3>
                {translation?.summary && (
                  <p className="text-sm text-gray-600 line-clamp-2">{translation.summary}</p>
                )}
                {item.publishedAt && (
                  <p className="text-xs text-gray-500 mt-2">
                    {new Date(item.publishedAt).toLocaleDateString(locale)}
                  </p>
                )}
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
