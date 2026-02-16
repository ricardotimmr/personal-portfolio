import { useEffect, useRef } from 'react'
import './CursorTrail.css'

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
    const cursorSize = 12
    const radius = cursorSize / 2

    const render = () => {
      currentX += (targetX - currentX) * 0.2
      currentY += (targetY - currentY) * 0.2

      trail.style.transform = `translate3d(${currentX - radius}px, ${currentY - radius}px, 0)`
      trail.style.opacity = isVisible ? '1' : '0'

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
