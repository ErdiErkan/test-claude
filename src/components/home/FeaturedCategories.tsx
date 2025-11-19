import Link from 'next/link'

interface FeaturedCategoriesProps {
  locale: string
}

const categories = [
  { slug: 'youtuber', icon: '📺', tr: 'YouTuberlar', en: 'YouTubers' },
  { slug: 'actor', icon: '🎬', tr: 'Oyuncular', en: 'Actors' },
  { slug: 'musician', icon: '🎵', tr: 'Şarkıcılar', en: 'Musicians' },
  { slug: 'tiktok-star', icon: '📱', tr: 'TikTok Fenomenleri', en: 'TikTok Stars' },
  { slug: 'athlete', icon: '⚽', tr: 'Sporcular', en: 'Athletes' },
  { slug: 'influencer', icon: '⭐', tr: 'Influencer', en: 'Influencers' },
]

export default function FeaturedCategories({ locale }: FeaturedCategoriesProps) {
  return (
    <div>
      <h2 className="text-3xl font-bold mb-6">
        📂 {locale === 'tr' ? 'Kategoriler' : 'Categories'}
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {categories.map((cat) => (
          <Link
            key={cat.slug}
            href={`/${locale}/${locale === 'tr' ? 'etiket' : 'tag'}/${cat.slug}`}
            className="bg-white hover:bg-purple-50 rounded-lg shadow p-6 text-center transition group"
          >
            <div className="text-4xl mb-2 group-hover:scale-110 transition">{cat.icon}</div>
            <p className="font-medium text-sm">{locale === 'tr' ? cat.tr : cat.en}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
