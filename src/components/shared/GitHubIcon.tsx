import { FaGithub } from 'react-icons/fa'

interface GitHubIconProps {
  size?: number
  className?: string
}

export default function GitHubIcon({ size = 20, className = '' }: GitHubIconProps) {
  return (
    <FaGithub
      size={size}
      className={`${className} hover:text-gray-800 dark:hover:text-gray-200 transition-colors`}
    />
  )
}