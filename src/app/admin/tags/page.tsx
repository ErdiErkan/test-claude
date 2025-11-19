import Link from 'next/link'
import { prisma } from '@/lib/db/prisma'

async function getTags() {
  const tags = await prisma.tag.findMany({
    orderBy: { slug: 'asc' },
    include: {
      _count: {
        select: { celebrities: true },
      },
    },
  })

  return tags
}

export default async function TagsManagementPage() {
  const tags = await getTags()

  const categories = [
    { value: 'profession', label: 'Profession', emoji: '💼' },
    { value: 'nationality', label: 'Nationality', emoji: '🌍' },
    { value: 'genre', label: 'Genre', emoji: '🎭' },
    { value: 'award', label: 'Award', emoji: '🏆' },
    { value: 'other', label: 'Other', emoji: '📌' },
  ]

  const groupedTags = categories.map((cat) => ({
    ...cat,
    tags: tags.filter((tag) => tag.category === cat.value),
  }))

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Tags
          </h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Manage content tags and categories
          </p>
        </div>
        <Link
          href="/admin/tags/new"
          className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700"
        >
          + Add Tag
        </Link>
      </div>

      {/* Stats */}
      <div className="mb-6 rounded-lg bg-green-50 p-4 dark:bg-green-900/20">
        <p className="text-sm text-green-900 dark:text-green-300">
          Total: {tags.length} tags
        </p>
      </div>

      {/* Tags by Category */}
      <div className="space-y-6">
        {groupedTags.map((group) => (
          <div
            key={group.value}
            className="rounded-lg bg-white p-6 shadow dark:bg-gray-800"
          >
            <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">
              {group.emoji} {group.label}
            </h2>
            {group.tags.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400">
                No tags in this category
              </p>
            ) : (
              <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                        Tag
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                        Slug
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                        Celebrities
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {group.tags.map((tag) => (
                      <tr
                        key={tag.id}
                        className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        <td className="whitespace-nowrap px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">{tag.icon}</span>
                            <div>
                              <div className="font-semibold text-gray-900 dark:text-white">
                                {tag.nameTr}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {tag.nameEn}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-gray-300">
                          {tag.slug}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-gray-300">
                          {tag._count.celebrities}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                          <Link
                            href={`/admin/tags/${tag.id}`}
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
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
