import gsap from 'gsap'
import { CustomEase } from 'gsap/CustomEase'
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { useLocation, type Location } from 'react-router-dom'
import './PageTransition.css'

const PAGE_INCOMING_DELAY_MS = 0
const PAGE_INCOMING_BASE_DURATION_MS = 1460
const PAGE_INCOMING_SETTLE_EXTRA_MS = 320
const PAGE_INCOMING_DURATION_MS = PAGE_INCOMING_BASE_DURATION_MS + PAGE_INCOMING_SETTLE_EXTRA_MS
const REDUCED_MOTION_INCOMING_DURATION_MS = 360
const PAGE_INCOMING_DELAY_S = PAGE_INCOMING_DELAY_MS / 1000
const PAGE_INCOMING_DURATION_S = PAGE_INCOMING_DURATION_MS / 1000
const REDUCED_MOTION_INCOMING_DURATION_S = REDUCED_MOTION_INCOMING_DURATION_MS / 1000

const DEBUG_PAGE_TRANSITION = import.meta.env.DEV
const DEBUG_UPDATE_LOG_INTERVAL_MS = 120
const SLOW_FRAME_THRESHOLD_MS = 22
const PAGE_EASE_NAME = 'pageCreepWhipSettle-v6'
const OUTGOING_MIN_SCALE = 0.88
const OUTGOING_DIM_BASE_OPACITY = 0.08
const OUTGOING_DIM_PROGRESS_OPACITY = 0.48
const OUTGOING_DIM_MAX_OPACITY = OUTGOING_DIM_BASE_OPACITY + OUTGOING_DIM_PROGRESS_OPACITY

gsap.registerPlugin(CustomEase)
CustomEase.create(
  PAGE_EASE_NAME,
  // Travel-anchored phases:
  // - creep reaches ~15% travel
  // - whip reaches ~80% travel
  // - then long settle that keeps decelerating toward 100%
  // S commands keep tangent continuity at phase joins for smoother speed blending.
  'M0,0 C0.08,0.001 0.24,0.04 0.42,0.15 S0.60,0.72 0.66,0.85 C0.72,0.885 0.79,0.93 0.86,0.955 C0.93,0.978 0.97,0.992 1,1',
)

type TransitionWindow = Window & {
  __projectOutgoingDimOpacity?: number
}

type PageTransitionProps = {
  renderRoute: (location: Location) => ReactNode
  onTransitioningChange?: (isTransitioning: boolean) => void
  onDisplayedLocationKeyChange?: (key: string) => void
}

function PageTransition({
  renderRoute,
  onTransitioningChange,
  onDisplayedLocationKeyChange,
}: PageTransitionProps) {
  const location = useLocation()
  const [displayLocation, setDisplayLocation] = useState(location)
  const [incomingLocation, setIncomingLocation] = useState<Location | null>(null)
  const [outgoingLocation, setOutgoingLocation] = useState<Location | null>(null)
  const [outgoingScrollY, setOutgoingScrollY] = useState(0)
  const [outgoingDimOpacity, setOutgoingDimOpacity] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const incomingMotionRef = useRef<HTMLDivElement | null>(null)
  const outgoingMotionRef = useRef<HTMLDivElement | null>(null)
  const outgoingDimRef = useRef<HTMLDivElement | null>(null)
  const incomingTweenRef = useRef<gsap.core.Tween | null>(null)
  const displayLocationRef = useRef(location)
  const incomingLocationRef = useRef<Location | null>(null)
  const isTransitioningRef = useRef(false)
  const pendingLocationRef = useRef<Location | null>(null)
  const activeTransitionTargetKeyRef = useRef<string | null>(null)
  const incomingTweenRunIdRef = useRef(0)

  useEffect(() => {
    incomingLocationRef.current = incomingLocation
  }, [incomingLocation])

  useEffect(() => {
    isTransitioningRef.current = isTransitioning
  }, [isTransitioning])

  useEffect(() => {
    onTransitioningChange?.(isTransitioning)
  }, [isTransitioning, onTransitioningChange])

  useEffect(() => {
    onDisplayedLocationKeyChange?.(displayLocation.key)
  }, [displayLocation.key, onDisplayedLocationKeyChange])

  useEffect(() => {
    displayLocationRef.current = displayLocation
  }, [displayLocation])

  const startTransition = useCallback(
    (nextLocation: Location) => {
      const currentDisplayLocation = displayLocationRef.current
      if (nextLocation.key === currentDisplayLocation.key) {
        return
      }

      if (isTransitioningRef.current) {
        pendingLocationRef.current = nextLocation
        if (DEBUG_PAGE_TRANSITION) {
          console.debug('[PageTransition] queued during active transition', { key: nextLocation.key })
        }
        return
      }

      if (activeTransitionTargetKeyRef.current === nextLocation.key) {
        return
      }

      const transitionWindow = window as TransitionWindow
      const pendingDimOpacity = transitionWindow.__projectOutgoingDimOpacity
      if (typeof pendingDimOpacity === 'number' && Number.isFinite(pendingDimOpacity)) {
        setOutgoingDimOpacity(Math.max(0, Math.min(1, pendingDimOpacity)))
      } else {
        setOutgoingDimOpacity(0)
      }
      delete transitionWindow.__projectOutgoingDimOpacity

      isTransitioningRef.current = true
      activeTransitionTargetKeyRef.current = nextLocation.key
      setOutgoingScrollY(window.scrollY)
      setOutgoingLocation(currentDisplayLocation)
      setIncomingLocation(nextLocation)
      setIsTransitioning(true)
    },
    [],
  )

  const finishTransition = useCallback(
    (completedIncomingKey: string) => {
      if (!isTransitioningRef.current) {
        return
      }

      const activeIncoming = incomingLocationRef.current
      if (!activeIncoming || activeIncoming.key !== completedIncomingKey) {
        return
      }

      const completedLocation = activeIncoming
      isTransitioningRef.current = false
      activeTransitionTargetKeyRef.current = null
      setDisplayLocation(completedLocation)
      setIncomingLocation(null)
      setOutgoingLocation(null)
      setOutgoingDimOpacity(0)
      setIsTransitioning(false)

      const queued = pendingLocationRef.current
      pendingLocationRef.current = null
      if (queued && queued.key !== completedLocation.key) {
        window.requestAnimationFrame(() => {
          startTransition(queued)
        })
      }
    },
    [startTransition],
  )

  useEffect(() => {
    if (location.key === displayLocation.key) {
      return
    }

    if (isTransitioningRef.current) {
      pendingLocationRef.current = location
      return
    }

    startTransition(location)
  }, [displayLocation.key, location, startTransition])

  useLayoutEffect(() => {
    if (!isTransitioning || !incomingLocation) {
      return
    }

    const incomingElement = incomingMotionRef.current
    if (!incomingElement) {
      return
    }
    const outgoingElement = outgoingMotionRef.current
    const outgoingDimElement = outgoingDimRef.current

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const duration = prefersReducedMotion
      ? REDUCED_MOTION_INCOMING_DURATION_S
      : PAGE_INCOMING_DURATION_S
    const ease = prefersReducedMotion ? 'power1.out' : PAGE_EASE_NAME
    const startContentOpacity = prefersReducedMotion ? 1 : 0
    const startOutgoingDimOpacity = Math.max(0, Math.min(OUTGOING_DIM_MAX_OPACITY, outgoingDimOpacity))
    const targetLocationKey = incomingLocation.key
    const runId = incomingTweenRunIdRef.current + 1
    incomingTweenRunIdRef.current = runId

    const ctx = gsap.context(() => {
      if (incomingTweenRef.current?.isActive() && activeTransitionTargetKeyRef.current === targetLocationKey) {
        if (DEBUG_PAGE_TRANSITION) {
          console.debug('[PageTransition] duplicate tween request ignored', {
            key: targetLocationKey,
            runId,
          })
        }
        return
      }

      if (incomingTweenRef.current) {
        if (DEBUG_PAGE_TRANSITION) {
          console.warn('[PageTransition] replacing active tween', {
            key: targetLocationKey,
            runId,
          })
        }
        incomingTweenRef.current.kill()
        incomingTweenRef.current = null
      }

      gsap.killTweensOf(incomingElement)

      // Use viewport-based pixel offset, not yPercent, so long pages don't push creep off-screen.
      const incomingStartY = window.innerHeight
      gsap.set(incomingElement, {
        y: incomingStartY,
        opacity: 1,
        '--incoming-content-opacity': startContentOpacity,
        force3D: true,
        willChange: 'transform, opacity',
      })
      if (outgoingElement) {
        gsap.set(outgoingElement, {
          scale: 1,
          opacity: 1,
          force3D: true,
          willChange: 'transform',
          transformOrigin: 'center center',
        })
      }
      if (outgoingDimElement) {
        gsap.set(outgoingDimElement, {
          opacity: startOutgoingDimOpacity,
          willChange: 'opacity',
        })
      }

      let lastUpdateLogAt = 0
      let lastFrameAt = performance.now()
      let maxFrameDelta = 0
      let slowFrameCount = 0
      let outgoingTween: gsap.core.Tween | null = null
      const setOutgoingDimOpacityValue = outgoingDimElement
        ? gsap.quickSetter(outgoingDimElement, 'opacity')
        : null
      if (outgoingElement) {
        gsap.killTweensOf(outgoingElement)
        outgoingTween = gsap.to(outgoingElement, {
          scale: OUTGOING_MIN_SCALE,
          duration,
          delay: PAGE_INCOMING_DELAY_S,
          ease,
          force3D: true,
        })
      }

      const tween = gsap.to(incomingElement, {
        y: 0,
        '--incoming-content-opacity': 1,
        duration,
        delay: PAGE_INCOMING_DELAY_S,
        ease,
        force3D: true,
        onStart: () => {
          if (!DEBUG_PAGE_TRANSITION) {
            return
          }
          console.debug('[PageTransition] tween start', {
            key: targetLocationKey,
            runId,
            transform: incomingElement.style.transform,
            contentOpacity: incomingElement.style.getPropertyValue('--incoming-content-opacity'),
          })
        },
        onUpdate: () => {
          const now = performance.now()
          const frameDelta = now - lastFrameAt
          lastFrameAt = now
          if (frameDelta > maxFrameDelta) {
            maxFrameDelta = frameDelta
          }
          if (frameDelta > SLOW_FRAME_THRESHOLD_MS) {
            slowFrameCount += 1
          }
          const progress = tween.progress()
          const outgoingProgress = outgoingTween ? outgoingTween.progress() : progress
          if (setOutgoingDimOpacityValue) {
            const nextDimOpacity =
              startOutgoingDimOpacity + (OUTGOING_DIM_MAX_OPACITY - startOutgoingDimOpacity) * outgoingProgress
            setOutgoingDimOpacityValue(nextDimOpacity)
          }

          if (!DEBUG_PAGE_TRANSITION) {
            return
          }
          if (now - lastUpdateLogAt < DEBUG_UPDATE_LOG_INTERVAL_MS) {
            return
          }
          lastUpdateLogAt = now
          console.debug('[PageTransition] tween update', {
            key: targetLocationKey,
            runId,
            progress: Number(progress.toFixed(3)),
            outgoingProgress: Number(outgoingProgress.toFixed(3)),
            frameDelta: Number(frameDelta.toFixed(2)),
            transform: incomingElement.style.transform,
            contentOpacity: incomingElement.style.getPropertyValue('--incoming-content-opacity'),
          })
        },
        onComplete: () => {
          if (runId !== incomingTweenRunIdRef.current) {
            if (DEBUG_PAGE_TRANSITION) {
              console.debug('[PageTransition] stale completion ignored', {
                key: targetLocationKey,
                runId,
              })
            }
            return
          }

          if (DEBUG_PAGE_TRANSITION) {
            console.debug('[PageTransition] tween complete', {
              key: targetLocationKey,
              runId,
              maxFrameDelta: Number(maxFrameDelta.toFixed(2)),
              slowFrameCount,
              transform: incomingElement.style.transform,
              contentOpacity: incomingElement.style.getPropertyValue('--incoming-content-opacity'),
            })
          }

          gsap.set(incomingElement, { clearProps: 'transform,opacity,willChange' })
          incomingElement.style.removeProperty('--incoming-content-opacity')
          if (outgoingElement) {
            gsap.set(outgoingElement, { clearProps: 'transform,willChange' })
          }
          if (outgoingDimElement) {
            gsap.set(outgoingDimElement, { clearProps: 'opacity,willChange' })
          }
          if (outgoingTween) {
            outgoingTween.kill()
            outgoingTween = null
          }
          if (incomingTweenRef.current === tween) {
            incomingTweenRef.current = null
          }
          finishTransition(targetLocationKey)
        },
      })

      incomingTweenRef.current = tween
    }, incomingElement)

    return () => {
      const currentTween = incomingTweenRef.current
      if (currentTween) {
        currentTween.kill()
        if (incomingTweenRef.current === currentTween) {
          incomingTweenRef.current = null
        }
      }
      if (outgoingElement) {
        gsap.killTweensOf(outgoingElement)
      }
      if (outgoingDimElement) {
        gsap.killTweensOf(outgoingDimElement)
      }
      ctx.revert()
    }
  }, [finishTransition, incomingLocation, isTransitioning, outgoingDimOpacity])

  return (
    <div className={`page-transition ${isTransitioning ? 'is-transitioning' : ''}`}>
      <div className="page-transition__current">{renderRoute(displayLocation)}</div>

      {isTransitioning && outgoingLocation ? (
        <div className="page-transition__outgoing-layer" aria-hidden="true">
          <div ref={outgoingMotionRef} className="page-transition__outgoing-motion">
            <div
              className="page-transition__outgoing-scroll"
              style={{ transform: `translate3d(0, ${-outgoingScrollY}px, 0)` }}
            >
              <div className="page-transition__outgoing-content">
                {renderRoute(outgoingLocation)}
                <div
                  ref={outgoingDimRef}
                  className="page-transition__outgoing-dim"
                  style={{ opacity: outgoingDimOpacity.toFixed(3) }}
                  aria-hidden="true"
                />
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {isTransitioning && incomingLocation ? (
        <div className="page-transition__incoming-layer" aria-hidden="true">
          <div ref={incomingMotionRef} className="page-transition__incoming-motion">
            <div className="page-transition__incoming-content">
              {renderRoute(incomingLocation)}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default PageTransition
