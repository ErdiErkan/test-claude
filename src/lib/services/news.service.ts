import { prisma } from '@/lib/db/prisma'

export async function getRelatedNews(
  celebrityId: number,
  locale: string = 'en',
  limit: number = 5
) {
  const news = await prisma.newsItem.findMany({
    where: {
      visibility: 'published',
      deletedAt: null,
      celebrities: {
        some: {
          celebrityId,
        },
      },
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
    },
  })

  return news
}
