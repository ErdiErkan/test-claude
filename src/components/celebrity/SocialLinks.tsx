interface SocialLinksProps {
  links: any[]
}

const platformIcons: Record<string, string> = {
  instagram: '📷',
  youtube: '📺',
  tiktok: '🎵',
  twitter: '🐦',
  facebook: '👍',
  twitch: '🎮',
  linkedin: '💼',
  website: '🌐',
}

export default function SocialLinks({ links }: SocialLinksProps) {
  return (
    <div className="flex flex-wrap gap-3">
      {links.map((link) => (
        <a
          key={link.id}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 bg-purple-100 hover:bg-purple-200 text-purple-700 px-4 py-2 rounded-full transition"
        >
          <span>{platformIcons[link.platform] || '🔗'}</span>
          <span className="font-medium capitalize">{link.platform}</span>
          {link.isVerified && <span className="text-xs">✓</span>}
        </a>
      ))}
    </div>
  )
}
