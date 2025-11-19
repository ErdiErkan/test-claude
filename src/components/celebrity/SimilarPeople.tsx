import Link from 'next/link'
import Image from 'next/image'

interface SimilarPeopleProps {
  celebrities: any[]
  locale: string
}

export default function SimilarPeople({ celebrities, locale }: SimilarPeopleProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-6">
        👥 {locale === 'tr' ? 'Benzer Kişiler' : 'Similar People'}
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {celebrities.map((celeb) => (
          <Link
            key={celeb.id}
            href={`/${locale}/u/${celeb.slug}`}
            className="group text-center"
          >
            <div className="relative aspect-square rounded-lg overflow-hidden mb-2">
              <Image
                src={celeb.profileImageUrl || '/default-avatar.jpg'}
                alt={celeb.fullName}
                fill
                className="object-cover group-hover:scale-110 transition"
                sizes="(max-width: 768px) 50vw, 25vw"
              />
            </div>
            <p className="font-medium text-sm">{celeb.fullName}</p>
            {celeb.profession && (
              <p className="text-xs text-gray-600">{celeb.profession}</p>
            )}
          </Link>
        ))}
      </div>
    </div>
  )
}
