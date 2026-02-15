import { useEffect } from 'react'

function SmoothScroll() {
  useEffect(() => {
    let frameId = 0
    let cleanup: (() => void) | undefined

    const setupSmoothScroll = async () => {
      try {
        const moduleName = 'lenis'
        const lenisModule = await import(
          /* @vite-ignore */
          moduleName
        )
        const Lenis = lenisModule.default
        const lenis = new Lenis({
          lerp: 0.06,
          smoothWheel: true,
          wheelMultiplier: 0.62,
          touchMultiplier: 0.9,
          prevent: (node: HTMLElement) =>
            node?.closest?.('[data-gallery-scroll]') !== null,
        })

        const animate = (time: number) => {
          lenis.raf(time)
          frameId = window.requestAnimationFrame(animate)
        }

        frameId = window.requestAnimationFrame(animate)
        cleanup = () => lenis.destroy()
      } catch {
        document.documentElement.style.scrollBehavior = 'smooth'
        cleanup = () => {
          document.documentElement.style.scrollBehavior = 'auto'
        }
      }
    }

    setupSmoothScroll()

    return () => {
      window.cancelAnimationFrame(frameId)
      cleanup?.()
    }
  }, [])

  return null
}

export default SmoothScroll
