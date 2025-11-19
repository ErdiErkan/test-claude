import Link from 'next/link'
import Image from 'next/image'

interface BornTodayProps {
  celebrities: any[]
  locale: string
}

export default function BornToday({ celebrities, locale }: BornTodayProps) {
  return (
    <div>
      <h2 className="text-3xl font-bold mb-6">
        🎂 {locale === 'tr' ? 'Bugün Doğan Ünlüler' : 'Born Today'}
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {celebrities.map((celeb: any) => (
          <Link
            key={celeb.id}
            href={`/${locale}/u/${celeb.slug}`}
            className="group"
          >
            <div className="relative aspect-square rounded-lg overflow-hidden mb-2">
              <Image
                src={celeb.profile_image_url || '/default-avatar.jpg'}
                alt={celeb.full_name}
                fill
                className="object-cover group-hover:scale-110 transition"
                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 16vw"
              />
            </div>
            <p className="font-medium text-sm text-center">{celeb.full_name}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
