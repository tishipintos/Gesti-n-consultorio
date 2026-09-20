import { Alert } from 'react-native'

export function attempt(action: () => void) { try { action() } catch (error) { Alert.alert('No se pudo guardar', error instanceof Error ? error.message : 'Intentá nuevamente. Tus datos anteriores se conservan.') } }
export function confirmDelete(detail: string, action: () => void) { Alert.alert('¿Eliminar?', detail, [{ text: 'Cancelar', style: 'cancel' }, { text: 'Eliminar', style: 'destructive', onPress: () => attempt(action) }]) }
