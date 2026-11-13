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
      className={`patient-avatar rounded-full flex shrink-0 items-center justify-center font-semibold ${sizes[size]} ${getAvatarColor(id)}`}
    >
      {getInitials(firstName, lastName)}
    </div>
  )
}
