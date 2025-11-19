import Link from 'next/link'
import Image from 'next/image'

interface CelebrityOfTheDayProps {
  celebrity: any
  locale: string
}

export default function CelebrityOfTheDay({
  celebrity,
  locale,
}: CelebrityOfTheDayProps) {
  const translation = celebrity.translations?.[0]

  return (
    <div className="bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl shadow-xl overflow-hidden">
      <div className="p-8 md:p-12">
        <h2 className="text-2xl font-bold text-white mb-6">⭐ {locale === 'tr' ? 'Günün Ünlüsü' : 'Celebrity of the Day'}</h2>

        <div className="flex flex-col md:flex-row gap-8 items-center">
          <div className="relative w-48 h-48 rounded-full overflow-hidden border-4 border-white shadow-lg flex-shrink-0">
            <Image
              src={celebrity.profileImageUrl || '/default-avatar.jpg'}
              alt={celebrity.fullName}
              fill
              className="object-cover"
              sizes="192px"
            />
          </div>

          <div className="flex-1 text-white">
            <h3 className="text-3xl md:text-4xl font-bold mb-2">
              {celebrity.fullName}
            </h3>
            {celebrity.nickname && (
              <p className="text-xl opacity-90 mb-4">{celebrity.nickname}</p>
            )}
            {celebrity.profession && (
              <p className="text-lg opacity-80 mb-4">{celebrity.profession}</p>
            )}
            {translation?.bioShort && (
              <p className="text-base opacity-90 mb-6 line-clamp-3">
                {translation.bioShort}
              </p>
            )}

            <Link
              href={`/${locale}/u/${celebrity.slug}`}
              className="inline-block bg-white text-purple-600 px-6 py-3 rounded-lg font-semibold hover:bg-opacity-90 transition"
            >
              {locale === 'tr' ? 'Profili İncele →' : 'View Profile →'}
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
