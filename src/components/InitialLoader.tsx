import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import loadingBikeGif from '../assets/videos/loading-screen-bike.gif'
import './InitialLoader.css'

type LoaderPhase = 'loading' | 'bike-exit' | 'split-open'

type InitialLoaderProps = {
  onReveal: () => void
  onComplete: () => void
}

const LOADER_NAME = 'RICARDO TIMM'
const LOADING_BASE_DURATION_MS = 2500
const LOADING_STUTTER_ONE_AT = 0.26
const LOADING_STUTTER_ONE_MS = 220
const LOADING_STUTTER_TWO_AT = 0.58
const LOADING_STUTTER_TWO_MS = 170
const BIKE_EXIT_DURATION_MS = 760
const SPLIT_OPEN_DELAY_MS = 220
const SPLIT_OPEN_DURATION_MS = 1240
const SPLIT_OPEN_SETTLE_MS = 180
const TOTAL_LOADING_TIMELINE_MS =
  LOADING_BASE_DURATION_MS + LOADING_STUTTER_ONE_MS + LOADING_STUTTER_TWO_MS

function getLoadingLinearProgress(elapsedMs: number): number {
  const cappedElapsed = Math.min(TOTAL_LOADING_TIMELINE_MS, elapsedMs)
  let effectiveElapsed = cappedElapsed

  const firstStutterStart = LOADING_BASE_DURATION_MS * LOADING_STUTTER_ONE_AT
  if (cappedElapsed > firstStutterStart) {
    effectiveElapsed -= Math.min(LOADING_STUTTER_ONE_MS, cappedElapsed - firstStutterStart)
  }

  const secondStutterStart =
    LOADING_BASE_DURATION_MS * LOADING_STUTTER_TWO_AT + LOADING_STUTTER_ONE_MS
  if (cappedElapsed > secondStutterStart) {
    effectiveElapsed -= Math.min(LOADING_STUTTER_TWO_MS, cappedElapsed - secondStutterStart)
  }

  return Math.min(1, effectiveElapsed / LOADING_BASE_DURATION_MS)
}

function InitialLoader({ onReveal, onComplete }: InitialLoaderProps) {
  const [phase, setPhase] = useState<LoaderPhase>('loading')
  const [progress, setProgress] = useState(0)
  const [typedCount, setTypedCount] = useState(0)
  const revealTimeoutRef = useRef<number | null>(null)
  const completeTimeoutRef = useRef<number | null>(null)

  useEffect(() => {
    document.body.dataset.loading = 'true'
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    let frameId = 0
    const startedAt = performance.now()

    const animateLoading = (now: number) => {
      const linear = getLoadingLinearProgress(now - startedAt)
      const eased = 1 - Math.pow(1 - linear, 2.25)
      const nextProgress = eased * 100

      setProgress(nextProgress)
      setTypedCount(Math.min(LOADER_NAME.length, Math.floor(eased * (LOADER_NAME.length + 1))))

      if (linear < 1) {
        frameId = window.requestAnimationFrame(animateLoading)
        return
      }

      setProgress(100)
      setTypedCount(LOADER_NAME.length)
      setPhase('bike-exit')

      revealTimeoutRef.current = window.setTimeout(() => {
        setPhase('split-open')
        onReveal()
      }, BIKE_EXIT_DURATION_MS + SPLIT_OPEN_DELAY_MS)

      completeTimeoutRef.current = window.setTimeout(() => {
        onComplete()
      }, BIKE_EXIT_DURATION_MS + SPLIT_OPEN_DELAY_MS + SPLIT_OPEN_DURATION_MS + SPLIT_OPEN_SETTLE_MS)
    }

    frameId = window.requestAnimationFrame(animateLoading)

    return () => {
      document.body.style.overflow = previousOverflow
      delete document.body.dataset.loading
      window.cancelAnimationFrame(frameId)

      if (revealTimeoutRef.current !== null) {
        window.clearTimeout(revealTimeoutRef.current)
      }

      if (completeTimeoutRef.current !== null) {
        window.clearTimeout(completeTimeoutRef.current)
      }
    }
  }, [onComplete, onReveal])

  const bikeStyle = useMemo(
    () => ({ '--loader-progress': `${progress}%` }) as CSSProperties,
    [progress],
  )

  const typedName = LOADER_NAME.slice(0, typedCount)

  return (
    <div className={`initial-loader initial-loader--${phase}`} role="status" aria-live="polite">
      <div className="initial-loader__doors" aria-hidden="true">
        <span className="initial-loader__door initial-loader__door--left" />
        <span className="initial-loader__door initial-loader__door--right" />
      </div>

      <div className="initial-loader__content">
        <div className="initial-loader__bar-shell">
          <div className="initial-loader__bar-track">
            <div className="initial-loader__bar-fill" style={{ width: `${progress}%` }} />
          </div>

          <img
            className="initial-loader__bike"
            src={loadingBikeGif}
            alt=""
            aria-hidden="true"
            style={bikeStyle}
          />
        </div>

        <p className="initial-loader__name" aria-label={LOADER_NAME}>
          {typedName}
          <span className="initial-loader__caret" aria-hidden="true" />
        </p>
      </div>
    </div>
  )
}

export default InitialLoader
