interface SocialStatsProps {
  socialLinks: any[]
}

export default function SocialStats({ socialLinks }: SocialStatsProps) {
  const totalFollowers = socialLinks.reduce(
    (sum, link) => sum + (Number(link.followersCount) || 0),
    0
  )

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-xl font-bold mb-4">📊 Sosyal Medya</h3>

      <div className="space-y-3">
        {socialLinks.map((link) => (
          <div key={link.id} className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="capitalize font-medium">{link.platform}</span>
              {link.isVerified && <span className="text-blue-500 text-xs">✓</span>}
            </div>
            {link.followersCount && (
              <span className="text-sm text-gray-600">
                👥 {Number(link.followersCount).toLocaleString()}
              </span>
            )}
          </div>
        ))}

        {totalFollowers > 0 && (
          <div className="pt-3 border-t mt-3">
            <div className="flex justify-between font-bold">
              <span>Toplam Takipçi:</span>
              <span>{totalFollowers.toLocaleString()}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
