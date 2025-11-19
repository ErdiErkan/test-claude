import Link from 'next/link'

interface TagListProps {
  tags: any[]
  locale: string
}

export default function TagList({ tags, locale }: TagListProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-xl font-bold mb-4">🏷️ Etiketler</h3>

      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <Link
            key={tag.id}
            href={`/${locale}/${locale === 'tr' ? 'etiket' : 'tag'}/${tag.slug}`}
            className="bg-gray-100 hover:bg-purple-100 text-gray-700 hover:text-purple-700 px-3 py-1 rounded-full text-sm transition"
          >
            {locale === 'tr' ? tag.nameTr : tag.nameEn}
          </Link>
        ))}
      </div>
    </div>
  )
}
