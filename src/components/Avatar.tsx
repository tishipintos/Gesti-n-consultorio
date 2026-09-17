import { getInitials, getAvatarColor } from '../utils'

interface AvatarProps {
  firstName: string
  lastName: string
  id: string
  size?: 'sm' | 'md' | 'lg'
}

const sizes = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-12 h-12 text-sm',
  lg: 'w-16 h-16 text-lg',
}

export function Avatar({ firstName, lastName, id, size = 'md' }: AvatarProps) {
  return (
    <div
      role="img"
      aria-label={`Avatar de ${firstName} ${lastName}`}
      className={`rounded-full flex items-center justify-center font-bold ring-2 ring-white/80 shadow-sm ${sizes[size]} ${getAvatarColor(id)}`}
    >
      {getInitials(firstName, lastName)}
    </div>
  )
}
