import { useEffect } from 'react'
import {
  SCROLL_INERTIAL_LERP,
  SCROLL_MAX_WHEEL_DELTA,
  SCROLL_WHEEL_DRAG_FACTOR,
} from './scrollPhysics'

function SmoothScroll() {
  useEffect(() => {
    let frameId: number | null = null
    let currentY = window.scrollY
    let targetY = window.scrollY

    const getMaxScrollY = () =>
      Math.max(0, document.documentElement.scrollHeight - window.innerHeight)

    const clampTarget = () => {
      const maxScrollY = getMaxScrollY()
      if (targetY < 0) {
        targetY = 0
      }
      if (targetY > maxScrollY) {
        targetY = maxScrollY
      }
    }

    const runAnimation = () => {
      clampTarget()
      const distance = targetY - currentY

      if (Math.abs(distance) <= 0.2) {
        currentY = targetY
        window.scrollTo(0, currentY)
        frameId = null
        return
      }

      currentY += distance * SCROLL_INERTIAL_LERP
      window.scrollTo(0, currentY)
      frameId = window.requestAnimationFrame(runAnimation)
    }

    const startAnimation = () => {
      if (frameId !== null) {
        return
      }

      frameId = window.requestAnimationFrame(runAnimation)
    }

    const onWheel = (event: WheelEvent) => {
      const target = event.target as HTMLElement | null
      if (target?.closest?.('[data-gallery-scroll]') !== null || event.ctrlKey) {
        return
      }

      event.preventDefault()

      const dominantDelta =
        Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY
      const clampedDelta = Math.max(
        -SCROLL_MAX_WHEEL_DELTA,
        Math.min(SCROLL_MAX_WHEEL_DELTA, dominantDelta),
      )

      targetY += clampedDelta * SCROLL_WHEEL_DRAG_FACTOR
      clampTarget()
      startAnimation()
    }

    const onScroll = () => {
      if (frameId !== null) {
        return
      }

      currentY = window.scrollY
      targetY = window.scrollY
    }

    const onResize = () => {
      clampTarget()
    }

    window.addEventListener('wheel', onWheel, { passive: false })
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onResize)

    return () => {
      if (frameId !== null) {
        window.cancelAnimationFrame(frameId)
      }
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
    }
  }, [])

  return null
}

export default SmoothScroll
