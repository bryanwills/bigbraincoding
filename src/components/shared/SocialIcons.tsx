import Link from 'next/link'
import {
  FaGithub,
  FaTwitter,
  FaFacebook,
  FaInstagram,
  FaTiktok
} from 'react-icons/fa'

interface SocialIconsProps {
  className?: string
  size?: number
}

export default function SocialIcons({ className = '', size = 20 }: SocialIconsProps) {
  const socialLinks = [
    {
      name: 'GitHub',
      url: 'https://github.com/bigbraincoding',
      icon: FaGithub,
      color: 'hover:text-gray-800 dark:hover:text-gray-200'
    },
    {
      name: 'X (Twitter)',
      url: 'https://x.com/bigbraincoding',
      icon: FaTwitter,
      color: 'hover:text-blue-400'
    },
    {
      name: 'Facebook',
      url: 'https://facebook.com/bigbraincoding',
      icon: FaFacebook,
      color: 'hover:text-blue-600'
    },
    {
      name: 'Instagram',
      url: 'https://instagram.com/bigbraincoding',
      icon: FaInstagram,
      color: 'hover:text-pink-500'
    },
    {
      name: 'TikTok',
      url: 'https://tiktok.com/@bigbraincoding',
      icon: FaTiktok,
      color: 'hover:text-black dark:hover:text-white'
    }
  ]

  return (
    <div className={`flex space-x-4 ${className}`}>
      {socialLinks.map((social) => {
        const IconComponent = social.icon
        return (
          <Link
            key={social.name}
            href={social.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`text-muted-foreground transition-colors ${social.color}`}
            aria-label={social.name}
          >
            <IconComponent size={size} />
          </Link>
        )
      })}
    </div>
  )
}