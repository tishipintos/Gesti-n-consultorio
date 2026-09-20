export function onForeground(callback: () => void) {
  window.addEventListener('focus', callback)
  return () => window.removeEventListener('focus', callback)
}
