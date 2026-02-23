import { useEffect, useRef } from 'react'

export function useProjectDetailMinimap(projectKey: string | undefined) {
  const mainContentRef = useRef<HTMLDivElement | null>(null)
  const minimapRef = useRef<HTMLElement | null>(null)
  const minimapFrameRef = useRef<HTMLDivElement | null>(null)
  const minimapHostRef = useRef<HTMLDivElement | null>(null)
  const minimapViewportRef = useRef<HTMLSpanElement | null>(null)
  const heroRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!projectKey) {
      return
    }

    const source = mainContentRef.current
    const minimap = minimapRef.current
    const minimapFrame = minimapFrameRef.current
    const minimapHost = minimapHostRef.current
    const viewportMarker = minimapViewportRef.current
    const hero = heroRef.current

    if (!source || !minimap || !minimapFrame || !minimapHost || !viewportMarker || !hero) {
      return
    }

    let rafId: number | null = null

    const clone = source.cloneNode(true) as HTMLElement
    clone.classList.add('project-scroll-minimap__clone')
    clone.setAttribute('aria-hidden', 'true')
    minimapHost.innerHTML = ''
    minimapHost.append(clone)

    const updateGeometry = () => {
      const hostWidth = minimapHost.clientWidth
      const hostHeight = minimapHost.clientHeight
      const sourceWidth = Math.max(1, source.clientWidth)
      const sourceHeight = Math.max(1, source.scrollHeight)

      const scaleX = hostWidth / sourceWidth
      const scaleY = hostHeight / sourceHeight

      clone.style.width = `${sourceWidth}px`
      clone.style.top = '0'
      clone.style.transform = `scale(${scaleX}, ${scaleY})`
    }

    const updateViewportMarker = () => {
      const documentHeight = Math.max(1, document.documentElement.scrollHeight)
      const viewportHeight = window.innerHeight
      const maxScroll = Math.max(1, documentHeight - viewportHeight)
      const scrollProgress = Math.max(0, Math.min(1, window.scrollY / maxScroll))
      const hostHeight = minimapHost.clientHeight

      const viewportHeightScaled = (viewportHeight / documentHeight) * hostHeight
      const markerHeight = Math.max(16, Math.min(hostHeight, viewportHeightScaled))
      const markerRange = Math.max(0, hostHeight - markerHeight)
      const markerTop = markerRange * scrollProgress

      viewportMarker.style.height = `${markerHeight.toFixed(3)}px`
      viewportMarker.style.transform = `translate3d(0, ${markerTop.toFixed(3)}px, 0)`
    }

    const updateMinimapPosition = () => {
      const heroTopDoc = hero.getBoundingClientRect().top + window.scrollY
      const baseTop = Math.max(12, heroTopDoc)
      const minimapHeight = minimapFrame.clientHeight
      const lastVisual = source.querySelector(
        '.project-detail-visual-stack:last-of-type .project-detail-visual:last-child',
      ) as HTMLElement | null

      if (!lastVisual) {
        minimap.style.top = `${baseTop.toFixed(3)}px`
        return
      }

      const lastVisualBottomDoc = lastVisual.getBoundingClientRect().bottom + window.scrollY
      const clampedTop = Math.min(baseTop, lastVisualBottomDoc - window.scrollY - minimapHeight)
      minimap.style.top = `${clampedTop.toFixed(3)}px`
    }

    const updateAll = () => {
      rafId = null
      updateGeometry()
      updateMinimapPosition()
      updateViewportMarker()
    }

    const requestUpdate = () => {
      if (rafId !== null) {
        return
      }

      rafId = window.requestAnimationFrame(updateAll)
    }

    const resizeObserver = new ResizeObserver(requestUpdate)
    resizeObserver.observe(source)

    window.addEventListener('scroll', requestUpdate, { passive: true })
    window.addEventListener('resize', requestUpdate)
    requestUpdate()

    return () => {
      resizeObserver.disconnect()
      window.removeEventListener('scroll', requestUpdate)
      window.removeEventListener('resize', requestUpdate)
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId)
      }
    }
  }, [projectKey])

  return {
    mainContentRef,
    minimapRef,
    minimapFrameRef,
    minimapHostRef,
    minimapViewportRef,
    heroRef,
  }
}
