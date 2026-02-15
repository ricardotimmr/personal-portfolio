import { useEffect, useRef } from 'react'
import './CursorTrail.css'

const RGB_PATTERN = /\d+(\.\d+)?/g

function getLuminance(color: string): number {
  const channels = color.match(RGB_PATTERN)
  if (!channels || channels.length < 3) {
    return 1
  }

  const [r, g, b] = channels.slice(0, 3).map((value) => Number(value) / 255)
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

function findBackgroundColor(element: Element | null): string {
  let current = element

  while (current instanceof HTMLElement) {
    const backgroundColor = window.getComputedStyle(current).backgroundColor
    if (backgroundColor && backgroundColor !== 'rgba(0, 0, 0, 0)') {
      return backgroundColor
    }
    current = current.parentElement
  }

  return window.getComputedStyle(document.body).backgroundColor
}

function CursorTrail() {
  const trailRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const trail = trailRef.current
    if (!trail) {
      return
    }

    let rafId = 0
    let isVisible = false
    let targetX = 0
    let targetY = 0
    let currentX = 0
    let currentY = 0
    let sampledColorAt = 0
    const cursorSize = 12
    const radius = cursorSize / 2

    const updateColor = (x: number, y: number) => {
      const element = document.elementFromPoint(x, y)
      const backgroundColor = findBackgroundColor(element)
      const luminance = getLuminance(backgroundColor)
      const cursorColor =
        luminance > 0.52 ? 'var(--color-black)' : 'var(--color-white)'
      trail.style.backgroundColor = cursorColor
    }

    const render = () => {
      currentX += (targetX - currentX) * 0.2
      currentY += (targetY - currentY) * 0.2

      trail.style.transform = `translate3d(${currentX - radius}px, ${currentY - radius}px, 0)`
      trail.style.opacity = isVisible ? '1' : '0'

      const now = performance.now()
      if (now - sampledColorAt > 90) {
        sampledColorAt = now
        updateColor(currentX, currentY)
      }

      rafId = window.requestAnimationFrame(render)
    }

    const onMouseMove = (event: MouseEvent) => {
      targetX = event.clientX
      targetY = event.clientY

      if (!isVisible) {
        currentX = targetX
        currentY = targetY
      }

      isVisible = true
    }

    const onMouseLeave = () => {
      isVisible = false
    }

    window.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseleave', onMouseLeave)
    rafId = window.requestAnimationFrame(render)

    return () => {
      window.cancelAnimationFrame(rafId)
      window.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseleave', onMouseLeave)
    }
  }, [])

  return <div ref={trailRef} className="cursor-trail" aria-hidden="true" />
}

export default CursorTrail
