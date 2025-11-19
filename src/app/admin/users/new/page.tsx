import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth-options'
import UserForm from '@/components/admin/UserForm'

export const metadata = {
  title: 'Add User - Admin',
  description: 'Create a new user account',
}

export default async function NewUserPage() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'admin') {
    redirect('/auth/login')
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Add User
        </h1>
        <p className="mt-1 text-gray-600 dark:text-gray-400">
          Create a new user account
        </p>
      </div>

      <UserForm />
    </div>
  )
}
