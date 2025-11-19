interface BioSectionProps {
  celebrity: any
  translation: any
}

export default function BioSection({ celebrity, translation }: BioSectionProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-4">📖 Biyografi</h2>

      {translation?.bioLong && (
        <div className="prose max-w-none">
          <p className="whitespace-pre-line text-gray-700 leading-relaxed">
            {translation.bioLong}
          </p>
        </div>
      )}

      {translation?.careerSummary && (
        <div className="mt-6">
          <h3 className="text-xl font-semibold mb-3">Kariyer</h3>
          <p className="text-gray-700 leading-relaxed whitespace-pre-line">
            {translation.careerSummary}
          </p>
        </div>
      )}
    </div>
  )
}
