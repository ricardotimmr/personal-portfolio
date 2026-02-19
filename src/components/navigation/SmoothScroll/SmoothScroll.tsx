import { useEffect, useRef } from 'react'
import { useLocation, useNavigationType } from 'react-router-dom'
import {
  PAGE_SCROLL_INERTIAL_LERP,
  PAGE_SCROLL_MAX_WHEEL_DELTA,
  PAGE_SCROLL_WHEEL_DRAG_FACTOR,
} from './scrollPhysics'

type SmoothScrollProps = {
  deferRouteSync?: boolean
}

function SmoothScroll({ deferRouteSync = false }: SmoothScrollProps) {
  const frameIdRef = useRef<number | null>(null)
  const currentYRef = useRef(0)
  const targetYRef = useRef(0)
  const positionsRef = useRef<Map<string, number>>(new Map())
  const activeLocationKeyRef = useRef('')
  const location = useLocation()
  const navigationType = useNavigationType()

  useEffect(() => {
    currentYRef.current = window.scrollY
    targetYRef.current = window.scrollY

    const getMaxScrollY = () =>
      Math.max(0, document.documentElement.scrollHeight - window.innerHeight)

    const clampTarget = () => {
      const maxScrollY = getMaxScrollY()
      if (targetYRef.current < 0) {
        targetYRef.current = 0
      }
      if (targetYRef.current > maxScrollY) {
        targetYRef.current = maxScrollY
      }
    }

    const runAnimation = () => {
      clampTarget()
      const distance = targetYRef.current - currentYRef.current

      if (Math.abs(distance) <= 0.2) {
        currentYRef.current = targetYRef.current
        window.scrollTo(0, currentYRef.current)
        frameIdRef.current = null
        return
      }

      currentYRef.current += distance * PAGE_SCROLL_INERTIAL_LERP
      window.scrollTo(0, currentYRef.current)
      frameIdRef.current = window.requestAnimationFrame(runAnimation)
    }

    const startAnimation = () => {
      if (frameIdRef.current !== null) {
        return
      }

      frameIdRef.current = window.requestAnimationFrame(runAnimation)
    }

    const onWheel = (event: WheelEvent) => {
      if (event.defaultPrevented || (event as WheelEvent & { __galleryWheelHandled?: boolean }).__galleryWheelHandled) {
        return
      }

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

      targetYRef.current += clampedDelta * PAGE_SCROLL_WHEEL_DRAG_FACTOR
      clampTarget()
      startAnimation()
    }

    const onScroll = () => {
      const scrolledY = window.scrollY

      if (frameIdRef.current === null) {
        currentYRef.current = scrolledY
        targetYRef.current = scrolledY
      }

      const key = activeLocationKeyRef.current
      if (key) {
        positionsRef.current.set(key, scrolledY)
      }
    }

    const onResize = () => {
      clampTarget()
    }

    window.addEventListener('wheel', onWheel, { passive: false })
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onResize)

    return () => {
      if (frameIdRef.current !== null) {
        window.cancelAnimationFrame(frameIdRef.current)
        frameIdRef.current = null
      }
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
    }
  }, [])

  useEffect(() => {
    if (deferRouteSync) {
      return
    }

    const previousKey = activeLocationKeyRef.current
    if (previousKey) {
      positionsRef.current.set(previousKey, window.scrollY)
    }

    const stopAnimation = () => {
      if (frameIdRef.current === null) {
        return
      }

      window.cancelAnimationFrame(frameIdRef.current)
      frameIdRef.current = null
    }

    const maxScrollY = Math.max(0, document.documentElement.scrollHeight - window.innerHeight)
    const clampY = (value: number) => Math.min(maxScrollY, Math.max(0, value))

    if (navigationType === 'POP') {
      const restoredY = clampY(positionsRef.current.get(location.key) ?? window.scrollY)
      stopAnimation()
      currentYRef.current = restoredY
      targetYRef.current = restoredY
      window.scrollTo(0, restoredY)
    } else {
      stopAnimation()
      currentYRef.current = 0
      targetYRef.current = 0
      window.scrollTo(0, 0)
    }

    activeLocationKeyRef.current = location.key
    positionsRef.current.set(location.key, window.scrollY)
  }, [deferRouteSync, location.key, navigationType])

  return null
}

export default SmoothScroll
