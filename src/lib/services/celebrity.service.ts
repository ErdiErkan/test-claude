import { prisma } from '@/lib/db/prisma'

export async function getCelebrityBySlug(slug: string, locale: string = 'en') {
  const celebrity = await prisma.celebrity.findUnique({
    where: { slug },
    include: {
      translations: {
        where: {
          languageCode: locale,
        },
      },
      socialLinks: {
        orderBy: {
          sortOrder: 'asc',
        },
      },
      tags: {
        include: {
          tag: true,
        },
      },
    },
  })

  if (!celebrity || celebrity.visibility !== 'published') {
    return null
  }

  return celebrity
}

export async function getCelebrityOfTheDay(locale: string = 'en') {
  // Get featured celebrity or random popular one
  const celebrity = await prisma.celebrity.findFirst({
    where: {
      isFeatured: true,
      visibility: 'published',
      deletedAt: null,
    },
    include: {
      translations: {
        where: { languageCode: locale },
      },
      tags: {
        include: { tag: true },
      },
    },
  })

  if (celebrity) return celebrity

  // Fallback to popular celebrity
  return await prisma.celebrity.findFirst({
    where: {
      visibility: 'published',
      deletedAt: null,
    },
    orderBy: {
      popularityScore: 'desc',
    },
    include: {
      translations: {
        where: { languageCode: locale },
      },
      tags: {
        include: { tag: true },
      },
    },
  })
}

export async function getCelebritiesBornToday(date: Date, locale: string = 'en') {
  const month = date.getMonth() + 1
  const day = date.getDate()

  const celebrities = await prisma.$queryRaw`
    SELECT * FROM celebrities
    WHERE EXTRACT(MONTH FROM birth_date) = ${month}
      AND EXTRACT(DAY FROM birth_date) = ${day}
      AND visibility = 'published'
      AND deleted_at IS NULL
    ORDER BY popularity_score DESC
    LIMIT 12
  `

  return celebrities as any[]
}

export async function getTrendingCelebrities(params: {
  period?: 'week' | 'month'
  limit?: number
  locale?: string
}) {
  const { period = 'week', limit = 12, locale = 'en' } = params

  const dateThreshold = new Date()
  if (period === 'week') {
    dateThreshold.setDate(dateThreshold.getDate() - 7)
  } else {
    dateThreshold.setDate(dateThreshold.getDate() - 30)
  }

  const trending = await prisma.celebrity.findMany({
    where: {
      visibility: 'published',
      deletedAt: null,
    },
    orderBy: [
      { totalViews: 'desc' },
      { popularityScore: 'desc' },
    ],
    take: limit,
    include: {
      translations: {
        where: { languageCode: locale },
      },
      tags: {
        include: { tag: true },
        take: 3,
      },
    },
  })

  return trending
}
