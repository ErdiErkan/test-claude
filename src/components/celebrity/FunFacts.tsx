interface FunFactsProps {
  facts: string[]
  locale: string
}

export default function FunFacts({ facts, locale }: FunFactsProps) {
  return (
    <div className="bg-yellow-50 rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
        💡 {locale === 'tr' ? 'İlginç Bilgiler' : 'Fun Facts'}
      </h2>

      <ul className="space-y-3">
        {facts.map((fact, index) => (
          <li key={index} className="flex gap-3">
            <span className="text-yellow-600 font-bold">✨</span>
            <span className="text-gray-800">{fact}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
