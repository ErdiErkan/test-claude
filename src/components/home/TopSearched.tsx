import Link from 'next/link'
import Image from 'next/image'

interface TopSearchedProps {
  celebrities: any[]
  locale: string
}

export default function TopSearched({ celebrities, locale }: TopSearchedProps) {
  return (
    <div>
      <h2 className="text-3xl font-bold mb-6">
        🔥 {locale === 'tr' ? 'En Çok Arananlar (Bu Hafta)' : 'Most Searched (This Week)'}
      </h2>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {celebrities.map((celeb, index) => (
          <Link
            key={celeb.id}
            href={`/${locale}/u/${celeb.slug}`}
            className="flex items-center gap-4 p-4 hover:bg-gray-50 transition border-b last:border-b-0"
          >
            <div className="text-2xl font-bold text-gray-300 w-8">
              {index + 1}
            </div>
            <div className="relative w-16 h-16 rounded-full overflow-hidden flex-shrink-0">
              <Image
                src={celeb.profileImageUrl || '/default-avatar.jpg'}
                alt={celeb.fullName}
                fill
                className="object-cover"
                sizes="64px"
              />
            </div>
            <div className="flex-1">
              <h3 className="font-bold">{celeb.fullName}</h3>
              <p className="text-sm text-gray-600">{celeb.profession}</p>
            </div>
            <div className="text-right text-sm text-gray-500">
              🔍 {celeb.totalSearches.toLocaleString()}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
