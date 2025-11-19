import Link from 'next/link'
import { prisma } from '@/lib/db/prisma'

async function getNews(searchParams: { page?: string; category?: string }) {
  const page = parseInt(searchParams.page || '1')
  const limit = 20
  const skip = (page - 1) * limit

  const where = searchParams.category
    ? { category: searchParams.category }
    : {}

  const [news, total] = await Promise.all([
    prisma.newsItem.findMany({
      where,
      skip,
      take: limit,
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

export default async function NewsManagementPage({
  searchParams,
}: {
  searchParams: { page?: string; category?: string }
}) {
  const { news, pagination } = await getNews(searchParams)

  const categories = [
    { value: '', label: 'All' },
    { value: 'announcement', label: 'Announcement' },
    { value: 'career', label: 'Career' },
    { value: 'project', label: 'Project' },
    { value: 'social', label: 'Social' },
    { value: 'personal', label: 'Personal' },
  ]

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            News
          </h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Manage news articles
          </p>
        </div>
        <Link
          href="/admin/news/new"
          className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700"
        >
          + Add News
        </Link>
      </div>

      {/* Filters */}
      <div className="mb-6 flex gap-4">
        <select
          defaultValue={searchParams.category}
          className="rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white"
        >
          {categories.map((cat) => (
            <option key={cat.value} value={cat.value}>
              {cat.label}
            </option>
          ))}
        </select>
      </div>

      {/* Stats */}
      <div className="mb-6 rounded-lg bg-purple-50 p-4 dark:bg-purple-900/20">
        <p className="text-sm text-purple-900 dark:text-purple-300">
          Total: {pagination.total} articles | Page {pagination.page} of{' '}
          {pagination.totalPages}
        </p>
      </div>

      {/* News Table */}
      <div className="overflow-hidden rounded-lg bg-white shadow dark:bg-gray-800">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                Title
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                Celebrity
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                Published
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {news.map((item) => (
              <tr
                key={item.id}
                className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <td className="px-6 py-4">
                  <div className="font-semibold text-gray-900 dark:text-white">
                    {item.translations[0]?.title || item.slug}
                  </div>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-gray-300">
                  {item.primaryCelebrity?.fullName || '-'}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-gray-300">
                  <span className="capitalize">{item.category}</span>
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <span
                    className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                      item.visibility === 'published'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                        : item.visibility === 'draft'
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                    }`}
                  >
                    {item.visibility}
                  </span>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                  {item.publishedAt
                    ? new Date(item.publishedAt).toLocaleDateString()
                    : '-'}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                  <Link
                    href={`/admin/news/${item.id}`}
                    className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="mt-6 flex justify-center gap-2">
          {pagination.page > 1 && (
            <Link
              href={`/admin/news?page=${pagination.page - 1}${searchParams.category ? `&category=${searchParams.category}` : ''}`}
              className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Previous
            </Link>
          )}

          <span className="flex items-center px-4 text-sm text-gray-600 dark:text-gray-400">
            Page {pagination.page} of {pagination.totalPages}
          </span>

          {pagination.page < pagination.totalPages && (
            <Link
              href={`/admin/news?page=${pagination.page + 1}${searchParams.category ? `&category=${searchParams.category}` : ''}`}
              className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Next
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
