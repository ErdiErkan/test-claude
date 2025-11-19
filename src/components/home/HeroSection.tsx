interface HeroSectionProps {
  locale: string
}

export default function HeroSection({ locale }: HeroSectionProps) {
  return (
    <div className="bg-gradient-to-br from-purple-600 to-blue-500 text-white">
      <div className="container mx-auto px-4 py-16 md:py-24 text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-6">
          {locale === 'tr'
            ? '🎭 ÜNLÜLERİN HAYAT HİKAYELERİ'
            : '🎭 CELEBRITY LIFE STORIES'}
        </h1>
        <p className="text-xl md:text-2xl mb-8 opacity-90">
          {locale === 'tr'
            ? 'En ünlü fenomenlerin biyografileri, sosyal medya hesapları ve ilginç bilgileri'
            : 'Biographies, social media accounts and fun facts of the most famous influencers'}
        </p>

        <div className="max-w-2xl mx-auto">
          <input
            type="search"
            placeholder={locale === 'tr' ? 'Ünlü veya fenomen ara...' : 'Search for celebrities or influencers...'}
            className="w-full px-6 py-4 rounded-full text-gray-900 text-lg focus:outline-none focus:ring-4 focus:ring-white/50"
          />
        </div>
      </div>
    </div>
  )
}
