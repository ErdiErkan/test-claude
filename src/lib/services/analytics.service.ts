import { prisma } from '@/lib/db/prisma'
import crypto from 'crypto'

export async function logSearch(params: {
  query: string
  resultsCount: number
  userIp?: string
  userAgent?: string
  matchedCelebrityId?: number
  clickedPosition?: number
}) {
  const {
    query,
    resultsCount,
    userIp,
    userAgent,
    matchedCelebrityId,
    clickedPosition,
  } = params

  const userIpHash = userIp
    ? crypto.createHash('sha256').update(userIp).digest('hex')
    : null

  const normalizedQuery = query.trim().toLowerCase()

  await prisma.searchLog.create({
    data: {
      query,
      normalizedQuery,
      resultsCount,
      matchedCelebrityId,
      clickedPosition,
      userIpHash,
      userAgent,
    },
  })

  if (matchedCelebrityId) {
    await prisma.celebrity.update({
      where: { id: matchedCelebrityId },
      data: {
        totalSearches: {
          increment: 1,
        },
      },
    })
  }
}

export async function logView(params: {
  celebrityId: number
  pageType?: string
  referrer?: string
  userIp?: string
  userAgent?: string
  sessionId?: string
}) {
  const {
    celebrityId,
    pageType = 'profile',
    referrer,
    userIp,
    userAgent,
    sessionId,
  } = params

  const userIpHash = userIp
    ? crypto.createHash('sha256').update(userIp).digest('hex')
    : null

  await prisma.viewLog.create({
    data: {
      celebrityId,
      pageType,
      referrer,
      userIpHash,
      userAgent,
      sessionId,
    },
  })

  await prisma.celebrity.update({
    where: { id: celebrityId },
    data: {
      totalViews: {
        increment: 1,
      },
    },
  })
}

export async function getTopSearched(params: {
  period: 'week' | 'month'
  limit?: number
}) {
  const { period, limit = 10 } = params

  const dateThreshold = new Date()
  if (period === 'week') {
    dateThreshold.setDate(dateThreshold.getDate() - 7)
  } else {
    dateThreshold.setDate(dateThreshold.getDate() - 30)
  }

  const topSearched = await prisma.celebrity.findMany({
    where: {
      visibility: 'published',
      deletedAt: null,
    },
    orderBy: {
      totalSearches: 'desc',
    },
    take: limit,
    select: {
      id: true,
      slug: true,
      fullName: true,
      profession: true,
      profileImageUrl: true,
      totalSearches: true,
      popularityScore: true,
    },
  })

  return topSearched
}

export async function getTopSearchQueries(params: {
  period: 'day' | 'week' | 'month'
  limit?: number
}) {
  const { period, limit = 20 } = params

  const dateThreshold = new Date()
  if (period === 'day') {
    dateThreshold.setDate(dateThreshold.getDate() - 1)
  } else if (period === 'week') {
    dateThreshold.setDate(dateThreshold.getDate() - 7)
  } else {
    dateThreshold.setDate(dateThreshold.getDate() - 30)
  }

  const topQueries = await prisma.searchLog.groupBy({
    by: ['normalizedQuery'],
    where: {
      createdAt: {
        gte: dateThreshold,
      },
    },
    _count: {
      id: true,
    },
    orderBy: {
      _count: {
        id: 'desc',
      },
    },
    take: limit,
  })

  return topQueries.map((q) => ({
    query: q.normalizedQuery,
    count: q._count.id,
  }))
}
