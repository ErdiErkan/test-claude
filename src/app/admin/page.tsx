import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth-options'
import { prisma } from '@/lib/db/prisma'
import Link from 'next/link'

async function getStats() {
  const [
    totalCelebrities,
    publishedCelebrities,
    totalNews,
    totalTags,
    totalUsers,
    totalViews,
    totalSearches,
    recentCelebrities,
    recentNews,
  ] = await Promise.all([
    prisma.celebrity.count(),
    prisma.celebrity.count({ where: { visibility: 'published' } }),
    prisma.newsItem.count(),
    prisma.tag.count(),
    prisma.user.count(),
    prisma.celebrity.aggregate({
      _sum: { totalViews: true },
    }),
    prisma.celebrity.aggregate({
      _sum: { totalSearches: true },
    }),
    prisma.celebrity.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        fullName: true,
        slug: true,
        profileImageUrl: true,
        visibility: true,
        createdAt: true,
      },
    }),
    prisma.newsItem.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        translations: {
          where: { languageCode: 'tr' },
          take: 1,
        },
        primaryCelebrity: {
          select: { fullName: true },
        },
      },
    }),
  ])

  return {
    totalCelebrities,
    publishedCelebrities,
    totalNews,
    totalTags,
    totalUsers,
    totalViews: totalViews._sum.totalViews || 0,
    totalSearches: totalSearches._sum.totalSearches || 0,
    recentCelebrities,
    recentNews,
  }
}

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions)
  const stats = await getStats()

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white">
          Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Welcome back, {session?.user.name}!
        </p>
      </div>

      {/* Stats Grid */}
      <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 p-6 text-white shadow-lg">
          <div className="mb-2 text-3xl">⭐</div>
          <div className="text-3xl font-bold">{stats.totalCelebrities}</div>
          <div className="text-sm opacity-90">Total Celebrities</div>
          <div className="mt-2 text-xs opacity-75">
            {stats.publishedCelebrities} published
          </div>
        </div>

        <div className="rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 p-6 text-white shadow-lg">
          <div className="mb-2 text-3xl">📰</div>
          <div className="text-3xl font-bold">{stats.totalNews}</div>
          <div className="text-sm opacity-90">News Articles</div>
        </div>

        <div className="rounded-xl bg-gradient-to-br from-green-500 to-green-600 p-6 text-white shadow-lg">
          <div className="mb-2 text-3xl">👁️</div>
          <div className="text-3xl font-bold">
            {(Number(stats.totalViews) / 1000).toFixed(1)}K
          </div>
          <div className="text-sm opacity-90">Total Views</div>
        </div>

        <div className="rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 p-6 text-white shadow-lg">
          <div className="mb-2 text-3xl">🔍</div>
          <div className="text-3xl font-bold">
            {(Number(stats.totalSearches) / 1000).toFixed(1)}K
          </div>
          <div className="text-sm opacity-90">Total Searches</div>
        </div>

        <div className="rounded-xl bg-gradient-to-br from-pink-500 to-pink-600 p-6 text-white shadow-lg">
          <div className="mb-2 text-3xl">🏷️</div>
          <div className="text-3xl font-bold">{stats.totalTags}</div>
          <div className="text-sm opacity-90">Tags</div>
        </div>

        <div className="rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 p-6 text-white shadow-lg">
          <div className="mb-2 text-3xl">👥</div>
          <div className="text-3xl font-bold">{stats.totalUsers}</div>
          <div className="text-sm opacity-90">Users</div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Recent Celebrities */}
        <div className="rounded-xl bg-white p-6 shadow-lg dark:bg-gray-800">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Recent Celebrities
            </h2>
            <Link
              href="/admin/celebrities"
              className="text-sm text-blue-600 hover:underline dark:text-blue-400"
            >
              View All →
            </Link>
          </div>
          <div className="space-y-3">
            {stats.recentCelebrities.map((celebrity) => (
              <Link
                key={celebrity.id}
                href={`/admin/celebrities/${celebrity.id}`}
                className="flex items-center gap-3 rounded-lg p-3 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <div className="h-12 w-12 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-600">
                  {celebrity.profileImageUrl ? (
                    <img
                      src={celebrity.profileImageUrl}
                      alt={celebrity.fullName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xl">
                      👤
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {celebrity.fullName}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(celebrity.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    celebrity.visibility === 'published'
                      ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                      : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                  }`}
                >
                  {celebrity.visibility}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent News */}
        <div className="rounded-xl bg-white p-6 shadow-lg dark:bg-gray-800">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Recent News
            </h2>
            <Link
              href="/admin/news"
              className="text-sm text-blue-600 hover:underline dark:text-blue-400"
            >
              View All →
            </Link>
          </div>
          <div className="space-y-3">
            {stats.recentNews.map((news) => (
              <Link
                key={news.id}
                href={`/admin/news/${news.id}`}
                className="block rounded-lg p-3 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <h3 className="mb-1 font-semibold text-gray-900 dark:text-white">
                  {news.translations[0]?.title || news.slug}
                </h3>
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <span>{news.primaryCelebrity?.fullName}</span>
                  <span>•</span>
                  <span>{new Date(news.createdAt).toLocaleDateString()}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8">
        <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">
          Quick Actions
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Link
            href="/admin/celebrities/new"
            className="flex items-center gap-3 rounded-xl bg-white p-4 shadow-md transition-all hover:shadow-lg dark:bg-gray-800"
          >
            <div className="rounded-full bg-blue-100 p-3 text-2xl dark:bg-blue-900">
              ➕
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Add Celebrity
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Create new profile
              </p>
            </div>
          </Link>

          <Link
            href="/admin/news/new"
            className="flex items-center gap-3 rounded-xl bg-white p-4 shadow-md transition-all hover:shadow-lg dark:bg-gray-800"
          >
            <div className="rounded-full bg-purple-100 p-3 text-2xl dark:bg-purple-900">
              📝
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Add News
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Publish article
              </p>
            </div>
          </Link>

          <Link
            href="/admin/tags"
            className="flex items-center gap-3 rounded-xl bg-white p-4 shadow-md transition-all hover:shadow-lg dark:bg-gray-800"
          >
            <div className="rounded-full bg-green-100 p-3 text-2xl dark:bg-green-900">
              🏷️
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Manage Tags
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Organize content
              </p>
            </div>
          </Link>

          <Link
            href="/admin/users"
            className="flex items-center gap-3 rounded-xl bg-white p-4 shadow-md transition-all hover:shadow-lg dark:bg-gray-800"
          >
            <div className="rounded-full bg-orange-100 p-3 text-2xl dark:bg-orange-900">
              👥
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Manage Users
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                User accounts
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}
