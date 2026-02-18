import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { useLocation, type Location } from 'react-router-dom'
import './PageTransition.css'

const PAGE_OUTGOING_DURATION_MS = 1540
const PAGE_INCOMING_DELAY_MS = 120
const PAGE_INCOMING_DURATION_MS = 1040
const PAGE_TRANSITION_DURATION_MS = PAGE_INCOMING_DELAY_MS + PAGE_INCOMING_DURATION_MS + 36

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
  const [isTransitioning, setIsTransitioning] = useState(false)
  const transitionTimeoutRef = useRef<number | null>(null)
  const finalizeFrameOneRef = useRef<number | null>(null)
  const finalizeFrameTwoRef = useRef<number | null>(null)

  const transitionStyle: CSSProperties = {
    '--page-outgoing-duration': `${PAGE_OUTGOING_DURATION_MS}ms`,
    '--page-incoming-duration': `${PAGE_INCOMING_DURATION_MS}ms`,
    '--page-incoming-delay': `${PAGE_INCOMING_DELAY_MS}ms`,
  } as CSSProperties

  useEffect(() => {
    onTransitioningChange?.(isTransitioning)
  }, [isTransitioning, onTransitioningChange])

  useEffect(() => {
    onDisplayedLocationKeyChange?.(displayLocation.key)
  }, [displayLocation.key, onDisplayedLocationKeyChange])

  useEffect(() => {
    const clearFinalizeFrames = () => {
      if (finalizeFrameOneRef.current !== null) {
        window.cancelAnimationFrame(finalizeFrameOneRef.current)
        finalizeFrameOneRef.current = null
      }
      if (finalizeFrameTwoRef.current !== null) {
        window.cancelAnimationFrame(finalizeFrameTwoRef.current)
        finalizeFrameTwoRef.current = null
      }
    }

    const clearTransitionTimeout = () => {
      if (transitionTimeoutRef.current === null) {
        return
      }

      window.clearTimeout(transitionTimeoutRef.current)
      transitionTimeoutRef.current = null
    }

    const startTransition = (nextLocation: Location) => {
      clearTransitionTimeout()
      clearFinalizeFrames()

      setOutgoingScrollY(window.scrollY)
      setOutgoingLocation(displayLocation)
      setIncomingLocation(nextLocation)
      setIsTransitioning(true)

      transitionTimeoutRef.current = window.setTimeout(() => {
        setDisplayLocation(nextLocation)

        finalizeFrameOneRef.current = window.requestAnimationFrame(() => {
          finalizeFrameTwoRef.current = window.requestAnimationFrame(() => {
            setIncomingLocation(null)
            setOutgoingLocation(null)
            setIsTransitioning(false)
            transitionTimeoutRef.current = null
            finalizeFrameOneRef.current = null
            finalizeFrameTwoRef.current = null
          })
        })
      }, PAGE_TRANSITION_DURATION_MS)
    }

    if (location.key === displayLocation.key) {
      return
    }

    if (isTransitioning) {
      return
    }

    startTransition(location)
  }, [displayLocation.key, isTransitioning, location])

  useEffect(() => {
    return () => {
      if (transitionTimeoutRef.current !== null) {
        window.clearTimeout(transitionTimeoutRef.current)
      }
      if (finalizeFrameOneRef.current !== null) {
        window.cancelAnimationFrame(finalizeFrameOneRef.current)
      }
      if (finalizeFrameTwoRef.current !== null) {
        window.cancelAnimationFrame(finalizeFrameTwoRef.current)
      }
    }
  }, [])

  return (
    <div
      className={`page-transition ${isTransitioning ? 'is-transitioning' : ''}`}
      style={transitionStyle}
    >
      <div className="page-transition__current">{renderRoute(displayLocation)}</div>

      {isTransitioning && outgoingLocation ? (
        <div className="page-transition__outgoing-layer" aria-hidden="true">
          <div
            className="page-transition__outgoing-scroll"
            style={{ transform: `translate3d(0, ${-outgoingScrollY}px, 0)` }}
          >
            <div className="page-transition__outgoing-content">{renderRoute(outgoingLocation)}</div>
          </div>
        </div>
      ) : null}

      {isTransitioning && incomingLocation ? (
        <div className="page-transition__incoming-layer" aria-hidden="true">
          <div className="page-transition__incoming-content">{renderRoute(incomingLocation)}</div>
        </div>
      ) : null}
    </div>
  )
}

export default PageTransition
