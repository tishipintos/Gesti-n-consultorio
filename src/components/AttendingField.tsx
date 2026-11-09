import { attendingOptions, parseProfile } from '../utils/profiles'
import type { Profile } from '../types'

export function AttendingField({ value, onChange, className }: { value?: Profile; onChange: (profile?: Profile) => void; className?: string }) {
  return <label className="block">
    <span className="block mb-1.5 font-medium text-text-secondary">Atendida por</span>
    <select className={className} value={value ?? ''} onChange={event => onChange(parseProfile(event.target.value))}>
      {attendingOptions.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
    </select>
  </label>
}
