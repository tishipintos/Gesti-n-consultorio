import { useWindowDimensions } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

type Layout = 'reading' | 'agenda' | 'notices'

export function usePageGeometry(layout: Layout = 'reading') {
  const { width } = useWindowDimensions()
  const insets = useSafeAreaInsets()
  const available = Math.max(0, width - insets.left - insets.right)
  const wide = layout === 'agenda' && available >= 820
  const maxWidth = wide ? 1120 : available >= 700 ? (layout === 'notices' ? 760 : 680) : 512
  const frameWidth = Math.min(available, maxWidth)
  return {
    wide,
    frame: { width: frameWidth, marginLeft: insets.left + (available - frameWidth) / 2 },
    rightGutter: insets.right + (available - frameWidth) / 2 + 16,
  }
}
