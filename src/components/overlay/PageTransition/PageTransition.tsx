import { motion } from 'framer-motion'
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { useLocation, type Location } from 'react-router-dom'
import './PageTransition.css'

const PAGE_OUTGOING_DURATION_MS = 1320
const PAGE_INCOMING_DELAY_MS = 60
const PAGE_INCOMING_DURATION_MS = 1120
const PAGE_OUTGOING_DURATION_S = PAGE_OUTGOING_DURATION_MS / 1000
const PAGE_INCOMING_DELAY_S = PAGE_INCOMING_DELAY_MS / 1000
const PAGE_INCOMING_DURATION_S = PAGE_INCOMING_DURATION_MS / 1000

const OUTGOING_EASE: [number, number, number, number] = [0.18, 0.72, 0.14, 1]

function createVelocityEase() {
  const samples = 320
  const baseVelocity = 0.14
  const whipAmplitude = 2.8
  const whipCenter = 0.56
  const whipSigma = 0.16
  const cumulative = new Float32Array(samples + 1)

  const velocityAt = (t: number) =>
    baseVelocity + whipAmplitude * Math.exp(-((t - whipCenter) ** 2) / (2 * whipSigma * whipSigma))

  let area = 0
  let previousVelocity = velocityAt(0)

  for (let i = 1; i <= samples; i += 1) {
    const t = i / samples
    const currentVelocity = velocityAt(t)
    area += ((previousVelocity + currentVelocity) * 0.5) / samples
    cumulative[i] = area
    previousVelocity = currentVelocity
  }

  return (t: number) => {
    if (t <= 0) {
      return 0
    }
    if (t >= 1) {
      return 1
    }

    const scaled = t * samples
    const lower = Math.floor(scaled)
    const upper = Math.min(samples, lower + 1)
    const interpolation = scaled - lower
    const value = cumulative[lower] + (cumulative[upper] - cumulative[lower]) * interpolation

    return value / area
  }
}

const INCOMING_EASE = createVelocityEase()

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
  const getIncomingStartY = () =>
    typeof window === 'undefined' ? 1280 : window.innerHeight + 220

  const location = useLocation()
  const [displayLocation, setDisplayLocation] = useState(location)
  const [incomingLocation, setIncomingLocation] = useState<Location | null>(null)
  const [outgoingLocation, setOutgoingLocation] = useState<Location | null>(null)
  const [incomingStartY, setIncomingStartY] = useState(getIncomingStartY)
  const [outgoingScrollY, setOutgoingScrollY] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const incomingLocationRef = useRef<Location | null>(null)
  const isTransitioningRef = useRef(false)
  const pendingLocationRef = useRef<Location | null>(null)

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

  const startTransition = useCallback(
    (nextLocation: Location) => {
      setOutgoingScrollY(window.scrollY)
      setIncomingStartY(getIncomingStartY())
      setOutgoingLocation(displayLocation)
      setIncomingLocation(nextLocation)
      setIsTransitioning(true)
    },
    [displayLocation],
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
      setDisplayLocation(completedLocation)
      setIncomingLocation(null)
      setOutgoingLocation(null)
      setIsTransitioning(false)

      const queued = pendingLocationRef.current
      if (queued && queued.key !== completedLocation.key) {
        pendingLocationRef.current = null
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

    if (isTransitioning) {
      pendingLocationRef.current = location
      return
    }

    startTransition(location)
  }, [displayLocation.key, isTransitioning, location, startTransition])

  return (
    <div className={`page-transition ${isTransitioning ? 'is-transitioning' : ''}`}>
      <div className="page-transition__current">{renderRoute(displayLocation)}</div>

      {isTransitioning && outgoingLocation ? (
        <div className="page-transition__outgoing-layer" aria-hidden="true">
          <div
            className="page-transition__outgoing-scroll"
            style={{ transform: `translate3d(0, ${-outgoingScrollY}px, 0)` }}
          >
            <motion.div
              className="page-transition__outgoing-content"
              initial={{ y: 0, scale: 1, opacity: 1 }}
              animate={{ y: 50, scale: 0.92, opacity: 0.94 }}
              transition={{
                duration: PAGE_OUTGOING_DURATION_S,
                ease: OUTGOING_EASE,
              }}
            >
              {renderRoute(outgoingLocation)}
            </motion.div>
          </div>
        </div>
      ) : null}

      {isTransitioning && incomingLocation ? (
        <div className="page-transition__incoming-layer" aria-hidden="true">
          <motion.div
            className="page-transition__incoming-content"
            initial={{ y: incomingStartY, scale: 1.004 }}
            animate={{ y: 0, scale: 1 }}
            transition={{
              duration: PAGE_INCOMING_DURATION_S,
              delay: PAGE_INCOMING_DELAY_S,
              ease: INCOMING_EASE,
            }}
            onAnimationComplete={() => {
              finishTransition(incomingLocation.key)
            }}
          >
            {renderRoute(incomingLocation)}
          </motion.div>
        </div>
      ) : null}
    </div>
  )
}

export default PageTransition
