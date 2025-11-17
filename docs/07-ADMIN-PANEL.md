# 7. YÖNETİM PANELİ (CMS)

## 7.1 Admin Panel Mimarisi

### Route Yapısı
```
app/
└── [locale]/
    └── admin/
        ├── layout.tsx              # Admin layout
        ├── dashboard/
        │   └── page.tsx            # Ana dashboard
        ├── celebrities/
        │   ├── page.tsx            # Liste
        │   ├── new/
        │   │   └── page.tsx        # Yeni ekleme
        │   └── [id]/
        │       ├── page.tsx        # Düzenleme
        │       └── translations/
        │           └── page.tsx    # Çeviri yönetimi
        ├── news/
        │   ├── page.tsx
        │   ├── new/
        │   │   └── page.tsx
        │   └── [id]/
        │       └── page.tsx
        ├── tags/
        │   └── page.tsx
        ├── users/
        │   └── page.tsx
        ├── analytics/
        │   └── page.tsx
        └── settings/
            └── page.tsx
```

---

## 7.2 Authentication (NextAuth.js)

### NextAuth Configuration
```typescript
// app/api/auth/[...nextauth]/route.ts

import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from '@/lib/db/prisma';
import bcrypt from 'bcryptjs';

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.isActive) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        );

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.id.toString(),
          email: user.email,
          name: user.fullName,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string;
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/admin/login',
    error: '/admin/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
```

### Protected Route Middleware
```typescript
// lib/auth/middleware.ts

import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';

export async function requireAuth() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/admin/login');
  }

  return session;
}

export async function requireRole(allowedRoles: string[]) {
  const session = await requireAuth();

  if (!allowedRoles.includes(session.user.role)) {
    redirect('/admin/dashboard');
  }

  return session;
}
```

---

## 7.3 Dashboard Page

```tsx
// app/[locale]/admin/dashboard/page.tsx

import { requireAuth } from '@/lib/auth/middleware';
import { prisma } from '@/lib/db/prisma';
import { TrendingUp, Users, FileText, Eye } from 'lucide-react';

export default async function DashboardPage() {
  await requireAuth();

  // Fetch dashboard stats
  const [
    totalCelebrities,
    totalNews,
    totalViews,
    totalSearches,
    recentCelebrities,
    topSearchedQueries,
  ] = await Promise.all([
    prisma.celebrity.count({ where: { visibility: 'published' } }),
    prisma.newsItem.count({ where: { visibility: 'published' } }),
    prisma.viewLog.count(),
    prisma.searchLog.count(),
    prisma.celebrity.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        fullName: true,
        profileImageUrl: true,
        createdAt: true,
      },
    }),
    getTopSearchQueries({ period: 'week', limit: 10 }),
  ]);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Celebrities"
          value={totalCelebrities}
          icon={<Users />}
          trend="+12%"
        />
        <StatCard
          title="Total News"
          value={totalNews}
          icon={<FileText />}
          trend="+8%"
        />
        <StatCard
          title="Total Views"
          value={totalViews.toLocaleString()}
          icon={<Eye />}
          trend="+23%"
        />
        <StatCard
          title="Total Searches"
          value={totalSearches.toLocaleString()}
          icon={<TrendingUp />}
          trend="+15%"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Celebrities */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Celebrities</h2>
          <div className="space-y-4">
            {recentCelebrities.map((celeb) => (
              <div key={celeb.id} className="flex items-center gap-4">
                <img
                  src={celeb.profileImageUrl || '/default-avatar.jpg'}
                  alt={celeb.fullName}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div className="flex-1">
                  <p className="font-medium">{celeb.fullName}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(celeb.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Search Queries */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Top Search Queries</h2>
          <div className="space-y-2">
            {topSearchedQueries.map((query, index) => (
              <div key={index} className="flex justify-between items-center">
                <span className="text-gray-700">{query.query}</span>
                <span className="text-sm text-gray-500">{query.count} searches</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, trend }: any) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-2">
        <span className="text-gray-600 text-sm">{title}</span>
        <div className="text-purple-600">{icon}</div>
      </div>
      <div className="text-3xl font-bold mb-1">{value}</div>
      <div className="text-sm text-green-600">{trend}</div>
    </div>
  );
}
```

---

## 7.4 Celebrity Management

### Celebrity List Page
```tsx
// app/[locale]/admin/celebrities/page.tsx

import { requireAuth } from '@/lib/auth/middleware';
import { prisma } from '@/lib/db/prisma';
import Link from 'next/link';
import { Plus, Edit, Trash2 } from 'lucide-react';

export default async function CelebritiesPage({
  searchParams,
}: {
  searchParams: { page?: string; search?: string };
}) {
  await requireAuth();

  const page = parseInt(searchParams.page || '1');
  const search = searchParams.search || '';
  const perPage = 20;

  const where = search
    ? {
        OR: [
          { fullName: { contains: search, mode: 'insensitive' } },
          { nickname: { contains: search, mode: 'insensitive' } },
        ],
      }
    : {};

  const [celebrities, total] = await Promise.all([
    prisma.celebrity.findMany({
      where,
      skip: (page - 1) * perPage,
      take: perPage,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { tags: true, newsItems: true },
        },
      },
    }),
    prisma.celebrity.count({ where }),
  ]);

  const totalPages = Math.ceil(total / perPage);

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Celebrities</h1>
        <Link
          href="/admin/celebrities/new"
          className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
        >
          <Plus className="w-5 h-5" />
          Add New Celebrity
        </Link>
      </div>

      {/* Search */}
      <div className="mb-6">
        <input
          type="search"
          placeholder="Search celebrities..."
          className="w-full max-w-md px-4 py-2 border rounded"
          defaultValue={search}
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Celebrity
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Profession
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Views
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {celebrities.map((celeb) => (
              <tr key={celeb.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <img
                      src={celeb.profileImageUrl || '/default-avatar.jpg'}
                      alt={celeb.fullName}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className="ml-4">
                      <div className="font-medium">{celeb.fullName}</div>
                      <div className="text-sm text-gray-500">{celeb.slug}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">{celeb.profession}</td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2 py-1 text-xs rounded ${
                      celeb.visibility === 'published'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {celeb.visibility}
                  </span>
                </td>
                <td className="px-6 py-4">{celeb.totalViews.toLocaleString()}</td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <Link
                      href={`/admin/celebrities/${celeb.id}`}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Edit className="w-5 h-5" />
                    </Link>
                    <button className="text-red-600 hover:text-red-800">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-6 flex justify-center gap-2">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
          <Link
            key={p}
            href={`/admin/celebrities?page=${p}${search ? `&search=${search}` : ''}`}
            className={`px-3 py-1 rounded ${
              p === page
                ? 'bg-purple-600 text-white'
                : 'bg-gray-200 hover:bg-gray-300'
            }`}
          >
            {p}
          </Link>
        ))}
      </div>
    </div>
  );
}
```

### Celebrity Edit Form
```tsx
// app/[locale]/admin/celebrities/[id]/page.tsx

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save } from 'lucide-react';

export default function EditCelebrityPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData);

    try {
      const response = await fetch(`/api/admin/celebrities/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        router.push('/admin/celebrities');
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Edit Celebrity</h1>

      <form onSubmit={handleSubmit} className="max-w-4xl">
        <div className="bg-white rounded-lg shadow p-6 space-y-6">
          {/* Basic Info */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">First Name</label>
                <input
                  type="text"
                  name="firstName"
                  className="w-full px-3 py-2 border rounded"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  className="w-full px-3 py-2 border rounded"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Nickname</label>
                <input
                  type="text"
                  name="nickname"
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Profession</label>
                <input
                  type="text"
                  name="profession"
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
            </div>
          </div>

          {/* Birth Info */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Birth Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Birth Date</label>
                <input
                  type="date"
                  name="birthDate"
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Birth Place</label>
                <input
                  type="text"
                  name="birthPlace"
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
            </div>
          </div>

          {/* Media */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Media</h2>
            <div>
              <label className="block text-sm font-medium mb-1">Profile Image URL</label>
              <input
                type="url"
                name="profileImageUrl"
                className="w-full px-3 py-2 border rounded"
              />
            </div>
          </div>

          {/* Meta */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Settings</h2>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input type="checkbox" name="isVerified" />
                <span>Verified</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" name="isFeatured" />
                <span>Featured (Celebrity of the Day)</span>
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 bg-purple-600 text-white px-6 py-2 rounded hover:bg-purple-700 disabled:opacity-50"
            >
              <Save className="w-5 h-5" />
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2 border rounded hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
```

---

## 7.5 Multi-language Content Editor

```tsx
// app/[locale]/admin/celebrities/[id]/translations/page.tsx

'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const languages = [
  { code: 'tr', name: 'Türkçe' },
  { code: 'en', name: 'English' },
];

export default function TranslationsPage({ params }: { params: { id: string } }) {
  const [activeTab, setActiveTab] = useState('tr');

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Manage Translations</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          {languages.map((lang) => (
            <TabsTrigger key={lang.code} value={lang.code}>
              {lang.name}
            </TabsTrigger>
          ))}
        </TabsList>

        {languages.map((lang) => (
          <TabsContent key={lang.code} value={lang.code}>
            <div className="bg-white rounded-lg shadow p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Short Bio</label>
                <textarea
                  name={`bioShort_${lang.code}`}
                  rows={3}
                  className="w-full px-3 py-2 border rounded"
                  placeholder="150-200 characters..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Long Bio</label>
                <textarea
                  name={`bioLong_${lang.code}`}
                  rows={10}
                  className="w-full px-3 py-2 border rounded"
                  placeholder="Detailed biography..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Fun Facts (one per line)
                </label>
                <textarea
                  name={`funFacts_${lang.code}`}
                  rows={5}
                  className="w-full px-3 py-2 border rounded"
                  placeholder="Enter each fun fact on a new line..."
                />
              </div>

              <button className="bg-purple-600 text-white px-6 py-2 rounded hover:bg-purple-700">
                Save {lang.name} Translation
              </button>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
```

---

## 7.6 Analytics Dashboard

```tsx
// app/[locale]/admin/analytics/page.tsx

import { requireAuth } from '@/lib/auth/middleware';
import { prisma } from '@/lib/db/prisma';
import { LineChart, BarChart } from '@/components/charts';

export default async function AnalyticsPage() {
  await requireAuth();

  // Fetch analytics data
  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return date.toISOString().split('T')[0];
  }).reverse();

  const viewsByDay = await Promise.all(
    last30Days.map(async (date) => {
      const count = await prisma.viewLog.count({
        where: {
          createdAt: {
            gte: new Date(date),
            lt: new Date(new Date(date).getTime() + 24 * 60 * 60 * 1000),
          },
        },
      });
      return { date, count };
    })
  );

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Analytics</h1>

      <div className="grid grid-cols-1 gap-8">
        {/* Views Over Time */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Views (Last 30 Days)</h2>
          <LineChart data={viewsByDay} />
        </div>

        {/* Top Celebrities */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Top Celebrities by Views</h2>
          {/* Bar chart or table */}
        </div>
      </div>
    </div>
  );
}
```

---

Bu admin panel yapısı, kullanıcı dostu ve güçlü bir içerik yönetim sistemi sağlar.
