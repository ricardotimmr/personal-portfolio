type NavigatorWithUAData = Navigator & {
  userAgentData?: {
    brands?: Array<{ brand?: string }>
    platform?: string
  }
}

export function isWindowsChromiumBrowser() {
  if (typeof navigator === 'undefined') {
    return false
  }

  const navigatorWithUAData = navigator as NavigatorWithUAData
  const userAgent = navigator.userAgent || ''
  const uaDataPlatform = navigatorWithUAData.userAgentData?.platform || ''
  const platform = navigator.platform || ''
  const isWindowsPlatform =
    /windows/i.test(userAgent) || /win/i.test(uaDataPlatform) || /win/i.test(platform)

  const brands = navigatorWithUAData.userAgentData?.brands ?? []
  const hasChromiumBrand = brands.some((entry) => (entry.brand ?? '').toLowerCase().includes('chrom'))
  const hasChromiumUserAgent = /chrom(e|ium)\//i.test(userAgent)
  const isUnsupportedChromiumVariant = /edg\//i.test(userAgent) || /opr\//i.test(userAgent)

  return isWindowsPlatform && (hasChromiumBrand || hasChromiumUserAgent) && !isUnsupportedChromiumVariant
}
