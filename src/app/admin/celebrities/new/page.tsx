import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth-options'
import CelebrityForm from '@/components/admin/CelebrityForm'

export const metadata = {
  title: 'Add Celebrity - Admin',
  description: 'Create a new celebrity profile',
}

export default async function NewCelebrityPage() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'admin') {
    redirect('/auth/login')
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Add Celebrity
        </h1>
        <p className="mt-1 text-gray-600 dark:text-gray-400">
          Create a new celebrity profile
        </p>
      </div>

      <CelebrityForm />
    </div>
  )
}
