import { redirect, notFound } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth-options'
import { prisma } from '@/lib/db/prisma'
import TagForm from '@/components/admin/TagForm'

async function getTag(id: string) {
  const tag = await prisma.tag.findUnique({
    where: { id },
  })

  return tag
}

export default async function EditTagPage({
  params,
}: {
  params: { id: string }
}) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'admin') {
    redirect('/auth/login')
  }

  const tag = await getTag(params.id)

  if (!tag) {
    notFound()
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Edit Tag
        </h1>
        <p className="mt-1 text-gray-600 dark:text-gray-400">{tag.nameTr}</p>
      </div>

      <TagForm tag={tag} />
    </div>
  )
}
