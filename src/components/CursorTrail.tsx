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
    let previousX = 0
    let previousY = 0
    let currentIntensity = 0
    let shapeVx = 0
    let shapeVy = 0
    let currentAngle = 0
    const cursorSize = 12
    const radius = cursorSize / 2

    const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))
    const normalizeAngleDelta = (delta: number) => {
      let wrapped = delta
      while (wrapped > Math.PI) wrapped -= Math.PI * 2
      while (wrapped < -Math.PI) wrapped += Math.PI * 2
      return wrapped
    }

    const render = () => {
      currentX += (targetX - currentX) * 0.2
      currentY += (targetY - currentY) * 0.2

      const rawVelocityX = currentX - previousX
      const rawVelocityY = currentY - previousY

      previousX = currentX
      previousY = currentY

      // Smooth the shape velocity separately so quick direction changes feel fluid, not rigid.
      shapeVx += (rawVelocityX - shapeVx) * 0.2
      shapeVy += (rawVelocityY - shapeVy) * 0.2

      const speed = Math.hypot(shapeVx, shapeVy)
      const targetIntensity = clamp(speed / 2.8, 0, 1)
      currentIntensity += (targetIntensity - currentIntensity) * 0.18

      if (speed > 0.02) {
        const targetAngle = Math.atan2(shapeVy, shapeVx)
        currentAngle += normalizeAngleDelta(targetAngle - currentAngle) * 0.22
      }

      // More restrained morphing than before so it does not become overly oval.
      const scaleX = 1 + currentIntensity * 0.34
      const scaleY = 1 - currentIntensity * 0.14
      const skewX = clamp(shapeVx * 0.3, -5, 5) * currentIntensity
      const skewY = clamp(shapeVy * 0.3, -5, 5) * currentIntensity
      const blurPx = currentIntensity * 1.8

      const rxA = clamp(50 + skewX * 0.65 - skewY * 0.25, 38, 62)
      const rxB = clamp(50 - skewX * 0.45 - skewY * 0.2, 38, 62)
      const rxC = clamp(50 - skewX * 0.65 + skewY * 0.25, 38, 62)
      const rxD = clamp(50 + skewX * 0.45 + skewY * 0.2, 38, 62)
      const ryA = clamp(50 + skewY * 0.6 + skewX * 0.2, 38, 62)
      const ryB = clamp(50 + skewY * 0.2 - skewX * 0.2, 38, 62)
      const ryC = clamp(50 - skewY * 0.6 - skewX * 0.2, 38, 62)
      const ryD = clamp(50 - skewY * 0.2 + skewX * 0.2, 38, 62)

      trail.style.transform = `translate3d(${currentX - radius}px, ${
        currentY - radius
      }px, 0) rotate(${currentAngle.toFixed(4)}rad) scale(${scaleX.toFixed(
        3,
      )}, ${scaleY.toFixed(3)}) skew(${skewX.toFixed(
        2,
      )}deg, ${skewY.toFixed(2)}deg)`
      trail.style.filter = `blur(${blurPx.toFixed(2)}px)`
      trail.style.borderRadius = `${rxA.toFixed(1)}% ${rxB.toFixed(1)}% ${rxC.toFixed(
        1,
      )}% ${rxD.toFixed(1)}% / ${ryA.toFixed(1)}% ${ryB.toFixed(1)}% ${ryC.toFixed(
        1,
      )}% ${ryD.toFixed(1)}%`
      trail.style.opacity = isVisible ? '1' : '0'

      rafId = window.requestAnimationFrame(render)
    }

    const onMouseMove = (event: MouseEvent) => {
      targetX = event.clientX
      targetY = event.clientY

      if (!isVisible) {
        currentX = targetX
        currentY = targetY
        previousX = targetX
        previousY = targetY
        currentIntensity = 0
        shapeVx = 0
        shapeVy = 0
        currentAngle = 0
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
