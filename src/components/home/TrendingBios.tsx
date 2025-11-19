import Link from 'next/link'
import Image from 'next/image'

interface TrendingBiosProps {
  celebrities: any[]
  locale: string
}

export default function TrendingBios({ celebrities, locale }: TrendingBiosProps) {
  return (
    <div>
      <h2 className="text-3xl font-bold mb-6">
        📈 {locale === 'tr' ? 'Trend Biyografiler' : 'Trending Biographies'}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {celebrities.map((celeb) => (
          <Link
            key={celeb.id}
            href={`/${locale}/u/${celeb.slug}`}
            className="group bg-white rounded-lg shadow hover:shadow-lg transition overflow-hidden"
          >
            <div className="relative aspect-square">
              <Image
                src={celeb.profileImageUrl || '/default-avatar.jpg'}
                alt={celeb.fullName}
                fill
                className="object-cover group-hover:scale-105 transition"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
              />
            </div>
            <div className="p-4">
              <h3 className="font-bold text-lg mb-1">{celeb.fullName}</h3>
              {celeb.profession && (
                <p className="text-sm text-gray-600">{celeb.profession}</p>
              )}
              <p className="text-xs text-gray-500 mt-2">
                👁 {celeb.totalViews.toLocaleString()} {locale === 'tr' ? 'görüntüleme' : 'views'}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
