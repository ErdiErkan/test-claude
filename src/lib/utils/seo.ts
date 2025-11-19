export function generatePersonSchema(celebrity: any, locale: string) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://celebritybio.com'

  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': `${baseUrl}/${locale}/u/${celebrity.slug}#person`,
    name: celebrity.fullName,
    alternateName: celebrity.nickname || undefined,
    description: celebrity.translations[0]?.bioShort || celebrity.profession,
    url: `${baseUrl}/${locale}/u/${celebrity.slug}`,
    image: {
      '@type': 'ImageObject',
      url: celebrity.profileImageUrl || `${baseUrl}/default-avatar.jpg`,
      width: 800,
      height: 800,
    },
    birthDate: celebrity.birthDate?.toISOString().split('T')[0],
    birthPlace: celebrity.birthPlace
      ? {
          '@type': 'Place',
          name: celebrity.birthPlace,
        }
      : undefined,
    nationality: celebrity.country
      ? {
          '@type': 'Country',
          name: celebrity.country,
        }
      : undefined,
    jobTitle: celebrity.profession || undefined,
    sameAs: celebrity.socialLinks
      ?.filter((link: any) => link.url)
      .map((link: any) => link.url) || [],
    knowsAbout: celebrity.tags?.map((ct: any) => ct.tag.slug) || [],
  }
}
