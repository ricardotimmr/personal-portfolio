import { useLayoutEffect, type RefObject } from 'react'

export function useHeroParallax(heroSectionRef: RefObject<HTMLElement | null>, maxViewportOffsetRatio = 0.22) {
  useLayoutEffect(() => {
    let rafId: number | null = null

    const updateHeroParallax = () => {
      rafId = null

      const hero = heroSectionRef.current
      if (!hero) {
        return
      }

      const rect = hero.getBoundingClientRect()
      const heroHeight = rect.height || 1
      const progress = Math.min(1, Math.max(0, -rect.top / heroHeight))

      const maxOffsetPx = (window.innerHeight || 1) * maxViewportOffsetRatio
      const parallaxOffset = -progress * maxOffsetPx
      hero.style.setProperty('--hero-parallax-y', `${parallaxOffset.toFixed(2)}px`)
    }

    const requestParallaxUpdate = () => {
      if (rafId !== null) {
        return
      }

      rafId = window.requestAnimationFrame(updateHeroParallax)
    }

    requestParallaxUpdate()
    window.addEventListener('scroll', requestParallaxUpdate, { passive: true })
    window.addEventListener('resize', requestParallaxUpdate)

    return () => {
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId)
      }
      window.removeEventListener('scroll', requestParallaxUpdate)
      window.removeEventListener('resize', requestParallaxUpdate)
    }
  }, [heroSectionRef, maxViewportOffsetRatio])
}
