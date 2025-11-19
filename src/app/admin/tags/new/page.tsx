import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth-options'
import TagForm from '@/components/admin/TagForm'

export const metadata = {
  title: 'Add Tag - Admin',
  description: 'Create a new tag',
}

export default async function NewTagPage() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'admin') {
    redirect('/auth/login')
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Add Tag
        </h1>
        <p className="mt-1 text-gray-600 dark:text-gray-400">
          Create a new tag
        </p>
      </div>

      <TagForm />
    </div>
  )
}
