import { useEffect, useState } from 'react'
import { Keyboard, Platform } from 'react-native'

export function useKeyboardVisible() {
  const [visible, setVisible] = useState(() => Keyboard.isVisible())

  useEffect(() => {
    // On iOS, hide the floating navigation before the keyboard animation starts.
    const shown = Keyboard.addListener(Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow', () => setVisible(true))
    const hidden = Keyboard.addListener(Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide', () => setVisible(false))
    return () => { shown.remove(); hidden.remove() }
  }, [])

  return visible
}
