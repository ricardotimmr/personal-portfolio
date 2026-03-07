import { expect, test } from '@playwright/test'

const INTRO_SESSION_STORAGE_KEY = 'portfolio:intro-played'

test.beforeEach(async ({ page }) => {
  await page.addInitScript((storageKey) => {
    window.sessionStorage.setItem(storageKey, '1')
  }, INTRO_SESSION_STORAGE_KEY)
})

test('route transitions complete cleanly when navigating to info page', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('.site-navbar')).toBeVisible()

  const pageTransition = page.locator('.page-transition')
  await page.getByRole('link', { name: 'INFO' }).click()

  await expect
    .poll(async () => ((await pageTransition.getAttribute('class')) ?? '').includes('is-transitioning'))
    .toBe(true)

  await expect(page).toHaveURL(/\/info$/)
  await expect
    .poll(async () => ((await pageTransition.getAttribute('class')) ?? '').includes('is-transitioning'))
    .toBe(false)
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
