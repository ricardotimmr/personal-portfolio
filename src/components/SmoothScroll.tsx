import { useEffect } from 'react'
import {
  PAGE_SCROLL_INERTIAL_LERP,
  PAGE_SCROLL_MAX_WHEEL_DELTA,
  PAGE_SCROLL_WHEEL_DRAG_FACTOR,
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

      currentY += distance * PAGE_SCROLL_INERTIAL_LERP
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
      const inGallery = target?.closest?.('[data-gallery-scroll]') !== null
      const isHorizontalIntent =
        Math.abs(event.deltaX) > Math.abs(event.deltaY) * 1.1 && Math.abs(event.deltaX) > 0.5

      if (event.ctrlKey || (inGallery && isHorizontalIntent)) {
        return
      }

      const verticalDelta = event.deltaY
      if (Math.abs(verticalDelta) < 0.1) {
        return
      }

      event.preventDefault()

      const clampedDelta = Math.max(
        -PAGE_SCROLL_MAX_WHEEL_DELTA,
        Math.min(PAGE_SCROLL_MAX_WHEEL_DELTA, verticalDelta),
      )

      targetY += clampedDelta * PAGE_SCROLL_WHEEL_DRAG_FACTOR
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
