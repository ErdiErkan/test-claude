import { prisma } from '@/lib/db/prisma'

export interface GetNewsListParams {
  locale: string
  page?: number
  limit?: number
  category?: string
}

export async function getRelatedNews(
  celebrityId: number,
  locale: string = 'en',
  limit: number = 5
) {
  const news = await prisma.newsItem.findMany({
    where: {
      visibility: 'published',
      deletedAt: null,
      OR: [
        { primaryCelebrityId: celebrityId },
        {
          celebrities: {
            some: {
              celebrityId,
            },
          },
        },
      ],
    },
    orderBy: {
      publishedAt: 'desc',
    },
    take: limit,
    include: {
      translations: {
        where: {
          languageCode: locale,
        },
      },
      primaryCelebrity: {
        include: {
          translations: {
            where: { languageCode: locale },
          },
        },
      },
    },
  })

  return news
}

export async function getNewsList({
  locale,
  page = 1,
  limit = 12,
  category,
}: GetNewsListParams) {
  const skip = (page - 1) * limit

  const where = {
    visibility: 'published' as const,
    deletedAt: null,
    ...(category && { category }),
  }

  const [news, total] = await Promise.all([
    prisma.newsItem.findMany({
      where,
      include: {
        translations: {
          where: { languageCode: locale },
        },
        primaryCelebrity: {
          include: {
            translations: {
              where: { languageCode: locale },
            },
          },
        },
      },
      orderBy: {
        publishedAt: 'desc',
      },
      skip,
      take: limit,
    }),
    prisma.newsItem.count({ where }),
  ])

  return {
    news,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  }
}

export async function getNewsBySlug(slug: string, locale: string) {
  const newsItem = await prisma.newsItem.findUnique({
    where: {
      slug,
      visibility: 'published',
      deletedAt: null,
    },
    include: {
      translations: {
        where: { languageCode: locale },
      },
      primaryCelebrity: {
        include: {
          translations: {
            where: { languageCode: locale },
          },
        },
      },
      celebrities: {
        include: {
          celebrity: {
            include: {
              translations: {
                where: { languageCode: locale },
              },
            },
          },
        },
      },
    },
  })

  return newsItem
}

export async function getLatestNews(locale: string, limit = 6) {
  return await prisma.newsItem.findMany({
    where: {
      visibility: 'published',
      deletedAt: null,
    },
    include: {
      translations: {
        where: { languageCode: locale },
      },
      primaryCelebrity: {
        include: {
          translations: {
            where: { languageCode: locale },
          },
        },
      },
    },
    orderBy: {
      publishedAt: 'desc',
    },
    take: limit,
  })
}
