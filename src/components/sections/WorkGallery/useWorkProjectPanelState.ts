import { useCallback, useEffect, useRef, useState, type RefObject } from 'react'

export type PanelTransitionState = {
  fromIndex: number
  toIndex: number
  progress: number
  direction: 1 | -1
}

const PANEL_TRANSITION_BAND_PX = 120

export function useWorkProjectPanelState(
  sectionRef: RefObject<HTMLElement | null>,
  projectsLength: number,
) {
  const [activeProjectIndex, setActiveProjectIndex] = useState(0)
  const [isPanelFadedOut, setIsPanelFadedOut] = useState(false)
  const [panelTransition, setPanelTransition] = useState<PanelTransitionState | null>(null)

  const previousScrollSnapshotRef = useRef<{ y: number; h: number }>({ y: -1, h: -1 })
  const scrollDirectionRef = useRef<1 | -1>(1)

  const updateScrollLinkedState = useCallback((force = false) => {
    const nextSnapshot = { y: window.scrollY, h: window.innerHeight }
    const previousSnapshot = previousScrollSnapshotRef.current
    if (!force && previousSnapshot.y === nextSnapshot.y && previousSnapshot.h === nextSnapshot.h) {
      return
    }

    const deltaY = nextSnapshot.y - previousSnapshot.y
    if (deltaY > 0.1) {
      scrollDirectionRef.current = 1
    } else if (deltaY < -0.1) {
      scrollDirectionRef.current = -1
    }
    previousScrollSnapshotRef.current = nextSnapshot

    const section = sectionRef.current
    if (!section) {
      setIsPanelFadedOut(false)
      setPanelTransition(null)
      return
    }

    const mediaElements = Array.from(section.querySelectorAll<HTMLElement>('.work-project__media'))
    if (mediaElements.length === 0 || projectsLength === 0) {
      setIsPanelFadedOut(false)
      setPanelTransition(null)
      return
    }

    const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))
    const viewportCenterY = window.innerHeight * 0.5
    const mediaRects = mediaElements.map((media) => media.getBoundingClientRect())
    let closestIndex = 0
    let closestDistance = Number.POSITIVE_INFINITY
    let containingIndex = -1

    mediaRects.forEach((rect, index) => {
      const mediaCenterY = rect.top + rect.height * 0.5
      const distanceToCenter = Math.abs(mediaCenterY - viewportCenterY)

      if (distanceToCenter < closestDistance) {
        closestDistance = distanceToCenter
        closestIndex = index
      }

      if (viewportCenterY >= rect.top && viewportCenterY <= rect.bottom) {
        containingIndex = index
      }
    })

    const nextIndex = containingIndex !== -1 ? containingIndex : closestIndex

    const lastRect = mediaRects[mediaRects.length - 1] ?? null
    const hasLastRectMeasurement = lastRect !== null && lastRect.height > 0
    const shouldFadeOutAfterLast =
      hasLastRectMeasurement && nextIndex === mediaElements.length - 1 && viewportCenterY > lastRect.bottom

    setIsPanelFadedOut((previousState) =>
      previousState === shouldFadeOutAfterLast ? previousState : shouldFadeOutAfterLast,
    )

    let closestBoundaryDistance = Number.POSITIVE_INFINITY
    let nextPanelTransition: PanelTransitionState | null = null

    for (let index = 0; index < mediaRects.length - 1; index += 1) {
      const boundaryY = (mediaRects[index].bottom + mediaRects[index + 1].top) * 0.5
      const distanceToBoundary = boundaryY - viewportCenterY
      const boundaryDistance = Math.abs(distanceToBoundary)

      if (boundaryDistance > PANEL_TRANSITION_BAND_PX || boundaryDistance >= closestBoundaryDistance) {
        continue
      }

      const downProgress = clamp(
        (viewportCenterY - (boundaryY - PANEL_TRANSITION_BAND_PX)) / (PANEL_TRANSITION_BAND_PX * 2),
        0,
        1,
      )
      const direction = scrollDirectionRef.current
      const progress = direction === 1 ? downProgress : 1 - downProgress

      closestBoundaryDistance = boundaryDistance
      nextPanelTransition = {
        fromIndex: direction === 1 ? index : index + 1,
        toIndex: direction === 1 ? index + 1 : index,
        progress,
        direction,
      }
    }

    if (nextPanelTransition && (nextPanelTransition.progress <= 0.02 || nextPanelTransition.progress >= 0.98)) {
      nextPanelTransition = null
    }

    setPanelTransition((previousTransition) => {
      if (!previousTransition && !nextPanelTransition) {
        return previousTransition
      }

      if (!nextPanelTransition) {
        return null
      }

      if (
        previousTransition &&
        previousTransition.fromIndex === nextPanelTransition.fromIndex &&
        previousTransition.toIndex === nextPanelTransition.toIndex &&
        previousTransition.direction === nextPanelTransition.direction &&
        Math.abs(previousTransition.progress - nextPanelTransition.progress) < 0.008
      ) {
        return previousTransition
      }

      return nextPanelTransition
    })

    setActiveProjectIndex((previousIndex) => (previousIndex === nextIndex ? previousIndex : nextIndex))
  }, [projectsLength, sectionRef])

  useEffect(() => {
    let rafId = 0
    let isFirstFrame = true

    const run = () => {
      updateScrollLinkedState(isFirstFrame)
      isFirstFrame = false
      rafId = window.requestAnimationFrame(run)
    }

    rafId = window.requestAnimationFrame(run)

    const onResize = () => updateScrollLinkedState(true)
    window.addEventListener('resize', onResize)

    return () => {
      window.removeEventListener('resize', onResize)
      window.cancelAnimationFrame(rafId)
    }
  }, [updateScrollLinkedState])

  return {
    activeProjectIndex,
    isPanelFadedOut,
    panelTransition,
    updateScrollLinkedState,
  }
}
