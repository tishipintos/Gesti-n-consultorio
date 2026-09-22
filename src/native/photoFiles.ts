import { File, Paths } from 'expo-file-system'

export const PHOTO_DIRECTORY = 'clinic-photos'
// Relative references survive a changed iOS sandbox path.
export function photoUri(value: string) {
  return value.startsWith(`${PHOTO_DIRECTORY}/`) ? new File(Paths.document, value).uri : value
}
export function removePhotoFile(value: string) {
  if (!value.startsWith(`${PHOTO_DIRECTORY}/`)) return
  try { new File(photoUri(value)).delete() } catch { /* Metadata is already deleted. */ }
}
