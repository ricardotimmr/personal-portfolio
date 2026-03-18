import { expect, test } from '@playwright/test'

const INTRO_SESSION_STORAGE_KEY = 'portfolio:intro-played'
const THEME_STORAGE_KEY = 'rt-site-theme'
const LANGUAGE_STORAGE_KEY = 'rt-site-language'

test.beforeEach(async ({ page }) => {
  await page.addInitScript((introStorageKey) => {
    window.sessionStorage.setItem(introStorageKey, '1')
  }, INTRO_SESSION_STORAGE_KEY)
})

test('main routes keep layout within viewport width', async ({ page }) => {
  const routes = ['/', '/work', '/info', '/privacy-policy', '/legal-notice']
  for (const route of routes) {
    await page.goto(route)
    await expect(page.locator('main').first()).toBeVisible()
    const overflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth - document.documentElement.clientWidth
    })
    expect(overflow).toBeLessThanOrEqual(1)
  }
})

test('route transitions complete cleanly when navigating to info page', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('.site-navbar')).toBeVisible()

  const pageTransition = page.locator('.page-transition')
  await page.getByRole('link', { name: 'INFO' }).click()

  await expect(page).toHaveURL(/\/info$/)
  await expect
    .poll(async () => ((await pageTransition.getAttribute('class')) ?? '').includes('is-transitioning'))
    .toBe(false)
})

test('page transition performance fallback toggles for browser-specific profiles', async ({ page }) => {
  await page.goto('/')
  const className = (await page.locator('.page-transition').getAttribute('class')) ?? ''
  const shouldUseFallback = await page.evaluate(() => {
    const userAgent = navigator.userAgent || ''
    const platform = navigator.platform || ''
    const isWindowsPlatform = /windows/i.test(userAgent) || /win/i.test(platform)
    const isSafariBrowser =
      /safari\//i.test(userAgent) &&
      !/chrom(e|ium)\//i.test(userAgent) &&
      !/edg\//i.test(userAgent) &&
      !/opr\//i.test(userAgent) &&
      !/firefox\//i.test(userAgent)
    return isWindowsPlatform || isSafariBrowser
  })
  expect(className.includes('is-performance-fallback')).toBe(shouldUseFallback)
})

test('info river progressively reveals stations while scrolling', async ({ page }) => {
  await page.goto('/info')

  const stations = page.locator('.info-river-station')
  const totalStations = await stations.count()
  expect(totalStations).toBeGreaterThan(0)

  await expect.poll(async () => page.locator('.info-river-station.is-visible').count()).toBeLessThan(totalStations)

  await page.evaluate(() => {
    window.scrollTo(0, document.documentElement.scrollHeight * 0.5)
  })

  await expect.poll(async () => page.locator('.info-river-station.is-visible').count()).toBeGreaterThan(0)
  await expect.poll(async () => page.locator('.info-river-station.is-visible').count()).toBeLessThan(totalStations)

  await page.evaluate(() => {
    window.scrollTo(0, document.documentElement.scrollHeight)
  })

  await expect.poll(async () => page.locator('.info-river-station.is-visible').count()).toBe(totalStations)
})

test('reduced motion still yields fully visible river content', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/info')

  const totalStations = await page.locator('.info-river-station').count()
  expect(totalStations).toBeGreaterThan(0)

  await expect.poll(async () => page.locator('.info-river-station.is-visible').count()).toBe(totalStations)

  const riverProgress = await page.locator('.info-river-track').evaluate((element) => {
    return getComputedStyle(element).getPropertyValue('--river-progress').trim()
  })
  expect(riverProgress).toBe('1.0000')
})

test('theme toggle updates document theme and persists across reload', async ({ page }) => {
  await page.goto('/')
  await page.evaluate((key) => {
    window.localStorage.removeItem(key)
  }, THEME_STORAGE_KEY)
  await page.reload()

  await expect.poll(async () => page.evaluate(() => document.documentElement.dataset.theme)).toBe('light')
  await page.getByRole('button', { name: /switch to dark mode/i }).click()

  await expect.poll(async () => page.evaluate(() => document.documentElement.dataset.theme)).toBe('dark')
  await expect.poll(async () => page.evaluate((key) => window.localStorage.getItem(key), THEME_STORAGE_KEY)).toBe(
    'dark',
  )

  await page.reload()
  await expect.poll(async () => page.evaluate(() => document.documentElement.dataset.theme)).toBe('dark')
})

test('site language toggle updates UI and persists across reload', async ({ page }) => {
  await page.goto('/')
  await page.evaluate((key) => {
    window.localStorage.removeItem(key)
  }, LANGUAGE_STORAGE_KEY)
  await page.reload()

  await expect.poll(async () => page.evaluate(() => document.documentElement.lang)).toBe('en')
  await expect(page.getByRole('link', { name: 'FREETIME' })).toBeVisible()

  await page.getByRole('button', { name: 'DE' }).click()
  await expect.poll(async () => page.evaluate(() => document.documentElement.lang)).toBe('de')
  await expect(page.getByRole('link', { name: 'FREIZEIT' })).toBeVisible()

  await page.goto('/privacy-policy')
  await expect(page.getByRole('heading', { level: 1, name: 'Datenschutzerklärung' })).toBeVisible()

  await page.reload()
  await expect.poll(async () => page.evaluate(() => document.documentElement.lang)).toBe('de')
})

test('navigation hover state animates text swap on desktop browsers', async ({ page }) => {
  await page.goto('/')

  const navLink = page.locator('.nav-menu-link').filter({ hasText: 'WORK' }).first()
  const primaryText = navLink.locator('.nav-text-swap__primary')
  const transformBeforeHover = await primaryText.evaluate((element) => getComputedStyle(element).transform)

  await navLink.hover()

  await expect
    .poll(async () => primaryText.evaluate((element) => getComputedStyle(element).transform))
    .not.toBe(transformBeforeHover)
})

test('gallery interaction marker opens when hovering centered card', async ({ page }) => {
  await page.goto('/')

  const viewport = page.locator('.gallery-slider-viewport')
  await viewport.scrollIntoViewIfNeeded()
  const bounds = await viewport.boundingBox()
  expect(bounds).not.toBeNull()

  await page.mouse.move((bounds?.x ?? 0) + (bounds?.width ?? 0) / 2, (bounds?.y ?? 0) + (bounds?.height ?? 0) / 2)

  await expect
    .poll(async () => (await page.locator('.gallery-center-action').getAttribute('class')) ?? '')
    .toContain('gallery-center-action--open')
})

test('footer contact overlay opens and closes with escape', async ({ page }) => {
  await page.goto('/info')

  const cta = page.locator('.footer-cta-link')
  await cta.scrollIntoViewIfNeeded()
  await cta.click()

  const overlay = page.locator('.footer-contact-overlay')
  await expect(overlay).toHaveClass(/is-open/)

  await page.keyboard.press('Escape')
  await expect(overlay).not.toHaveClass(/is-open/)
})

test('page-mode wheel deltas are normalized to significant pixel movement', async ({ page }) => {
  await page.goto('/info')

  await page.evaluate(() => {
    window.scrollTo(0, 0)
  })

  await page.evaluate(() => {
    const wheelEvent = new WheelEvent('wheel', {
      bubbles: true,
      cancelable: true,
      deltaY: 1,
      deltaMode: 2,
    })
    window.dispatchEvent(wheelEvent)
  })

  await expect.poll(async () => page.evaluate(() => window.scrollY)).toBeGreaterThan(450)
})
