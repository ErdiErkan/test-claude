import prisma from '@/lib/db/prisma'

export interface GetCelebritiesByTagParams {
  tagSlug: string
  locale: string
  page?: number
  limit?: number
}

export async function getTagBySlug(slug: string) {
  return await prisma.tag.findUnique({
    where: { slug },
  })
}

export async function getCelebritiesByTag({
  tagSlug,
  locale,
  page = 1,
  limit = 24,
}: GetCelebritiesByTagParams) {
  const skip = (page - 1) * limit

  const tag = await prisma.tag.findUnique({
    where: { slug: tagSlug },
    include: {
      celebrities: {
        include: {
          celebrity: {
            include: {
              translations: {
                where: { languageCode: locale },
              },
              socialLinks: {
                orderBy: { sortOrder: 'asc' },
              },
              tags: {
                include: {
                  tag: true,
                },
              },
            },
          },
        },
        skip,
        take: limit,
      },
    },
  })

  if (!tag) {
    return null
  }

  const total = await prisma.celebrityTag.count({
    where: { tagId: tag.id },
  })

  return {
    tag,
    celebrities: tag.celebrities.map((ct) => ct.celebrity),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  }
}

export async function getAllTags() {
  return await prisma.tag.findMany({
    orderBy: { nameTr: 'asc' },
  })
}

export async function getPopularTags(limit = 10) {
  const tags = await prisma.tag.findMany({
    include: {
      _count: {
        select: { celebrities: true },
      },
    },
    orderBy: {
      celebrities: {
        _count: 'desc',
      },
    },
    take: limit,
  })

  return tags
}
