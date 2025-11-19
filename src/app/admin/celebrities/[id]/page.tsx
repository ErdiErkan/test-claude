import { redirect, notFound } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth-options'
import { prisma } from '@/lib/db/prisma'
import CelebrityForm from '@/components/admin/CelebrityForm'

async function getCelebrity(id: string) {
  const celebrity = await prisma.celebrity.findUnique({
    where: { id },
    include: {
      translations: true,
      socialLinks: {
        orderBy: { sortOrder: 'asc' },
      },
      tags: {
        include: { tag: true },
      },
    },
  })

  return celebrity
}

export default async function EditCelebrityPage({
  params,
}: {
  params: { id: string }
}) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'admin') {
    redirect('/auth/login')
  }

  const celebrity = await getCelebrity(params.id)

  if (!celebrity) {
    notFound()
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Edit Celebrity
        </h1>
        <p className="mt-1 text-gray-600 dark:text-gray-400">
          {celebrity.fullName}
        </p>
      </div>

      <CelebrityForm celebrity={celebrity} />
    </div>
  )
}
