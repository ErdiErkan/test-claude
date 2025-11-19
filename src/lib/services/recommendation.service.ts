import { prisma } from '@/lib/db/prisma'

export async function getSimilarCelebrities(
  celebrityId: number,
  limit: number = 8
) {
  const baseCelebrity = await prisma.celebrity.findUnique({
    where: { id: celebrityId },
    include: {
      tags: {
        include: { tag: true },
      },
    },
  })

  if (!baseCelebrity) return []

  const baseTagIds = baseCelebrity.tags.map((ct) => ct.tagId)

  const similar = await prisma.celebrity.findMany({
    where: {
      id: { not: celebrityId },
      visibility: 'published',
      deletedAt: null,
      OR: [
        { profession: baseCelebrity.profession },
        { country: baseCelebrity.country },
        {
          tags: {
            some: {
              tagId: { in: baseTagIds },
            },
          },
        },
      ],
    },
    include: {
      tags: {
        include: { tag: true },
      },
    },
    take: 50,
  })

  const scored = similar.map((celeb) => {
    let score = 0

    if (celeb.profession === baseCelebrity.profession) {
      score += 10
    }

    if (celeb.country === baseCelebrity.country) {
      score += 5
    }

    const celebTagIds = celeb.tags.map((ct) => ct.tagId)
    const commonTags = baseTagIds.filter((id) => celebTagIds.includes(id))
    score += commonTags.length * 3

    score += Number(celeb.popularityScore) * 0.1

    return {
      celebrity: celeb,
      similarityScore: score,
    }
  })

  return scored
    .sort((a, b) => b.similarityScore - a.similarityScore)
    .slice(0, limit)
    .map((item) => item.celebrity)
}
