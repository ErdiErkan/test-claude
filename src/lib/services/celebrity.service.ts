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

export interface GetPopularCelebritiesParams {
  locale: string
  period?: 'daily' | 'weekly' | 'monthly' | 'all-time'
  page?: number
  limit?: number
  sortBy?: 'views' | 'searches' | 'popularity'
}

export async function getPopularCelebrities({
  locale,
  period = 'weekly',
  page = 1,
  limit = 24,
  sortBy = 'popularity',
}: GetPopularCelebritiesParams) {
  const skip = (page - 1) * limit

  let orderBy: any = { popularityScore: 'desc' }
  if (sortBy === 'views') {
    orderBy = { totalViews: 'desc' }
  } else if (sortBy === 'searches') {
    orderBy = { totalSearches: 'desc' }
  }

  const [celebrities, total] = await Promise.all([
    prisma.celebrity.findMany({
      where: {
        visibility: 'published',
        deletedAt: null,
      },
      orderBy,
      skip,
      take: limit,
      include: {
        translations: {
          where: { languageCode: locale },
        },
        socialLinks: {
          orderBy: { sortOrder: 'asc' },
        },
        tags: {
          include: { tag: true },
          take: 5,
        },
      },
    }),
    prisma.celebrity.count({
      where: {
        visibility: 'published',
        deletedAt: null,
      },
    }),
  ])

  return {
    celebrities,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  }
}

export async function getCelebritiesByMonth(month: number, locale: string = 'en') {
  const celebrities = await prisma.$queryRaw<any[]>`
    SELECT c.*, ct.bio_short, ct.language_code
    FROM celebrities c
    LEFT JOIN celebrity_translations ct ON c.id = ct.celebrity_id AND ct.language_code = ${locale}
    WHERE EXTRACT(MONTH FROM c.birth_date) = ${month}
      AND c.visibility = 'published'
      AND c.deleted_at IS NULL
    ORDER BY EXTRACT(DAY FROM c.birth_date), c.popularity_score DESC
  `

  return celebrities
}
