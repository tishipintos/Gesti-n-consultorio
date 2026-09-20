import { AppState } from 'react-native'
export function onForeground(callback: () => void) {
  const subscription = AppState.addEventListener('change', state => { if (state === 'active') callback() })
  return () => subscription.remove()
}
