import Link from 'next/link'
import { prisma } from '@/lib/db/prisma'

async function getCelebrities(searchParams: { page?: string; search?: string }) {
  const page = parseInt(searchParams.page || '1')
  const limit = 20
  const skip = (page - 1) * limit

  const where = searchParams.search
    ? {
        OR: [
          { fullName: { contains: searchParams.search, mode: 'insensitive' as const } },
          { slug: { contains: searchParams.search, mode: 'insensitive' as const } },
        ],
      }
    : {}

  const [celebrities, total] = await Promise.all([
    prisma.celebrity.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        slug: true,
        fullName: true,
        nickname: true,
        profession: true,
        profileImageUrl: true,
        visibility: true,
        isVerified: true,
        popularityScore: true,
        createdAt: true,
      },
    }),
    prisma.celebrity.count({ where }),
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

export default async function CelebritiesPage({
  searchParams,
}: {
  searchParams: { page?: string; search?: string }
}) {
  const { celebrities, pagination } = await getCelebrities(searchParams)

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Celebrities
          </h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Manage celebrity profiles
          </p>
        </div>
        <Link
          href="/admin/celebrities/new"
          className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700"
        >
          + Add Celebrity
        </Link>
      </div>

      {/* Search & Filters */}
      <div className="mb-6 flex gap-4">
        <input
          type="text"
          placeholder="Search celebrities..."
          defaultValue={searchParams.search}
          className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-white"
        />
        <button className="rounded-lg bg-gray-200 px-6 py-2 font-semibold text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600">
          Search
        </button>
      </div>

      {/* Stats */}
      <div className="mb-6 rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
        <p className="text-sm text-blue-900 dark:text-blue-300">
          Total: {pagination.total} celebrities | Page {pagination.page} of{' '}
          {pagination.totalPages}
        </p>
      </div>

      {/* Celebrities Table */}
      <div className="overflow-hidden rounded-lg bg-white shadow dark:bg-gray-800">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                Celebrity
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                Profession
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                Popularity
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                Created
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {celebrities.map((celebrity) => (
              <tr
                key={celebrity.id}
                className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <td className="whitespace-nowrap px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-600">
                      {celebrity.profileImageUrl ? (
                        <img
                          src={celebrity.profileImageUrl}
                          alt={celebrity.fullName}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-lg">
                          👤
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="font-semibold text-gray-900 dark:text-white">
                          {celebrity.fullName}
                        </div>
                        {celebrity.isVerified && <span>✓</span>}
                      </div>
                      {celebrity.nickname && (
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {celebrity.nickname}
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-gray-300">
                  {celebrity.profession}
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <span
                    className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                      celebrity.visibility === 'published'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                        : celebrity.visibility === 'draft'
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                    }`}
                  >
                    {celebrity.visibility}
                  </span>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-gray-300">
                  {Number(celebrity.popularityScore).toFixed(1)}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                  {new Date(celebrity.createdAt).toLocaleDateString()}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                  <Link
                    href={`/admin/celebrities/${celebrity.id}`}
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
              href={`/admin/celebrities?page=${pagination.page - 1}${searchParams.search ? `&search=${searchParams.search}` : ''}`}
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
              href={`/admin/celebrities?page=${pagination.page + 1}${searchParams.search ? `&search=${searchParams.search}` : ''}`}
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
