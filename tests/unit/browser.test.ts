import { afterEach, describe, expect, it, vi } from 'vitest'
import { isWindowsChromiumBrowser } from '../../src/utils/browser'

const originalNavigator = globalThis.navigator

function setNavigatorStub(value: unknown) {
  vi.stubGlobal('navigator', value)
}

afterEach(() => {
  if (typeof originalNavigator === 'undefined') {
    Reflect.deleteProperty(globalThis, 'navigator')
  } else {
    vi.stubGlobal('navigator', originalNavigator)
  }
  vi.restoreAllMocks()
})

describe('isWindowsChromiumBrowser', () => {
  it('returns true for Chrome on Windows user agent', () => {
    setNavigatorStub({
      userAgent:
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',
      platform: 'Win32',
      userAgentData: {
        brands: [{ brand: 'Chromium' }],
        platform: 'Windows',
      },
    })

    expect(isWindowsChromiumBrowser()).toBe(true)
  })

  it('returns false for Edge on Windows', () => {
    setNavigatorStub({
      userAgent:
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0',
      platform: 'Win32',
      userAgentData: {
        brands: [{ brand: 'Chromium' }, { brand: 'Microsoft Edge' }],
        platform: 'Windows',
      },
    })

    expect(isWindowsChromiumBrowser()).toBe(false)
  })

  it('returns false for Chrome on macOS', () => {
    setNavigatorStub({
      userAgent:
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',
      platform: 'MacIntel',
      userAgentData: {
        brands: [{ brand: 'Chromium' }],
        platform: 'macOS',
      },
    })

    expect(isWindowsChromiumBrowser()).toBe(false)
  })
})
