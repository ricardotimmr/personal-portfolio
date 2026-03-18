export function toSafeExternalUrl(value: string | undefined) {
  const trimmedValue = value?.trim()
  if (!trimmedValue) {
    return undefined
  }

  try {
    const parsedUrl = new URL(trimmedValue)
    if (parsedUrl.protocol !== 'https:') {
      return undefined
    }
    return parsedUrl.href
  } catch {
    return undefined
  }
}
