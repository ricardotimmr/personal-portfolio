import { useEffect, useMemo, useRef, useState, type MouseEvent, type WheelEvent } from 'react'
import {
  GALLERY_SCROLL_INERTIAL_LERP,
  GALLERY_SCROLL_MAX_WHEEL_DELTA,
  GALLERY_SCROLL_WHEEL_DRAG_FACTOR,
} from '../../navigation/SmoothScroll/scrollPhysics'
import './GallerySection.css'

type SlideOrientation = 'landscape' | 'portrait'

type GallerySlide = {
  id: string
  orientation: SlideOrientation
  imageSrc: string
}

type CardMetric = {
  mediaElement: HTMLImageElement
  center: number
  halfWidth: number
  lastShift: number
}

const horizontalModules = import.meta.glob(
  '../../../assets/projects/horizontal/*.{png,jpg,jpeg,webp,avif}',
  {
  eager: true,
  import: 'default',
  },
) as Record<string, string>

const verticalModules = import.meta.glob(
  '../../../assets/projects/vertical/*.{png,jpg,jpeg,webp,avif}',
  {
  eager: true,
  import: 'default',
  },
) as Record<string, string>

const optimizedHorizontalModules = import.meta.glob(
  '../../../assets/projects-optimized/horizontal/*.{png,jpg,jpeg,webp,avif}',
  {
    eager: true,
    import: 'default',
  },
) as Record<string, string>

const optimizedVerticalModules = import.meta.glob(
  '../../../assets/projects-optimized/vertical/*.{png,jpg,jpeg,webp,avif}',
  {
    eager: true,
    import: 'default',
  },
) as Record<string, string>

function resolveImageSources(
  originalModules: Record<string, string>,
  optimizedModules: Record<string, string>,
  optimizedBasePath: string,
) {
  return Object.entries(originalModules)
    .sort(([pathA], [pathB]) => pathA.localeCompare(pathB))
    .map(([originalPath, originalSource]) => {
      const fileName = originalPath.split('/').at(-1)
      if (!fileName) {
        return originalSource
      }

      const optimizedPath = `${optimizedBasePath}/${fileName}`
      return optimizedModules[optimizedPath] ?? originalSource
    })
}

const horizontalImages = resolveImageSources(
  horizontalModules,
  optimizedHorizontalModules,
  '../../../assets/projects-optimized/horizontal',
)

const verticalImages = resolveImageSources(
  verticalModules,
  optimizedVerticalModules,
  '../../../assets/projects-optimized/vertical',
)

const repeatedSetCount = 7
const middleSetIndex = Math.floor(repeatedSetCount / 2)
const textCloseDelayMs = 260
const cardImageParallaxMaxShiftPx = 292
const cardImageParallaxScale = 1.8
const centerHitTestMinIntervalMs = 34

type MarkerPhase = 'idle' | 'open' | 'closing'

function buildSlides(): GallerySlide[] {
  const hasHorizontal = horizontalImages.length > 0
  const hasVertical = verticalImages.length > 0

  if (!hasHorizontal && !hasVertical) {
    return []
  }

  if (hasHorizontal && !hasVertical) {
    return horizontalImages.map((src, index) => ({
      id: `h-${index}`,
      orientation: 'landscape',
      imageSrc: src,
    }))
  }

  if (!hasHorizontal && hasVertical) {
    return verticalImages.map((src, index) => ({
      id: `v-${index}`,
      orientation: 'portrait',
      imageSrc: src,
    }))
  }

  const slideCount = Math.max(horizontalImages.length, verticalImages.length) * 2

  return Array.from({ length: slideCount }, (_, index) => {
    const prefersLandscape = index % 2 === 0

    if (prefersLandscape) {
      return {
        id: `h-${index}`,
        orientation: 'landscape',
        imageSrc: horizontalImages[index % horizontalImages.length],
      }
    }

    return {
      id: `v-${index}`,
      orientation: 'portrait',
      imageSrc: verticalImages[index % verticalImages.length],
    }
  })
}

function GallerySection() {
  const viewportRef = useRef<HTMLDivElement | null>(null)
  const trackRef = useRef<HTMLDivElement | null>(null)
  const firstSetRef = useRef<HTMLDivElement | null>(null)
  const setWidthRef = useRef(0)
  const currentXRef = useRef(0)
  const targetXRef = useRef(0)
  const animationFrameRef = useRef<number | null>(null)
  const closeTextTimeoutRef = useRef<number | null>(null)
  const centerHitRafRef = useRef<number | null>(null)
  const pointerInsideRef = useRef(false)
  const pointerXRef = useRef(0)
  const pointerYRef = useRef(0)
  const isCenterHoveringRef = useRef(false)
  const lastCenterHitTestAtRef = useRef(0)
  const cardMetricsRef = useRef<CardMetric[]>([])
  const viewportWidthRef = useRef(0)

  const [markerPhase, setMarkerPhase] = useState<MarkerPhase>('idle')
  const [isCenterHovering, setIsCenterHovering] = useState(false)

  const gallerySlides = useMemo(() => buildSlides(), [])
  const uniqueImageSources = useMemo(
    () => Array.from(new Set(gallerySlides.map((slide) => slide.imageSrc))),
    [gallerySlides],
  )

  const applyTrackTransform = () => {
    const track = trackRef.current
    if (!track) {
      return
    }

    track.style.transform = `translate3d(${-currentXRef.current}px, 0, 0)`
  }

  const updateCardParallax = () => {
    const viewport = viewportRef.current
    const cardMetrics = cardMetricsRef.current
    if (!viewport || cardMetrics.length === 0) {
      return
    }

    const viewportWidth = viewportWidthRef.current || viewport.clientWidth
    if (viewportWidth <= 0) {
      return
    }

    const viewportStart = currentXRef.current
    const viewportEnd = viewportStart + viewportWidth
    const viewportCenterInTrack = currentXRef.current + viewportWidth / 2
    const influenceRange = viewportWidth * 0.64

    cardMetrics.forEach((metric) => {
      const isFarOutsideViewport =
        metric.center + metric.halfWidth < viewportStart - influenceRange ||
        metric.center - metric.halfWidth > viewportEnd + influenceRange

      const nextShift = (() => {
        if (isFarOutsideViewport) {
          return 0
        }

        const ratio = Math.max(
          -1,
          Math.min(1, (metric.center - viewportCenterInTrack) / influenceRange),
        )
        return -ratio * cardImageParallaxMaxShiftPx
      })()

      if (Math.abs(nextShift - metric.lastShift) < 0.35) {
        return
      }

      metric.lastShift = nextShift
      metric.mediaElement.style.transform = `translate3d(${nextShift.toFixed(
        2,
      )}px, 0, 0) scale(${cardImageParallaxScale})`
    })
  }

  const normalizeInfinitePosition = () => {
    const setWidth = setWidthRef.current
    if (setWidth === 0) {
      return
    }

    const anchor = setWidth * middleSetIndex

    while (currentXRef.current < anchor - setWidth) {
      currentXRef.current += setWidth
      targetXRef.current += setWidth
    }

    while (currentXRef.current > anchor + setWidth) {
      currentXRef.current -= setWidth
      targetXRef.current -= setWidth
    }
  }

  const setCenterHovering = (isHoveringCenterCard: boolean) => {
    if (isCenterHoveringRef.current === isHoveringCenterCard) {
      return
    }

    isCenterHoveringRef.current = isHoveringCenterCard
    setIsCenterHovering(isHoveringCenterCard)

    if (closeTextTimeoutRef.current !== null) {
      window.clearTimeout(closeTextTimeoutRef.current)
      closeTextTimeoutRef.current = null
    }

    if (isHoveringCenterCard) {
      setMarkerPhase('open')
      return
    }

    setMarkerPhase((currentPhase) => {
      if (currentPhase === 'idle') {
        return currentPhase
      }

      closeTextTimeoutRef.current = window.setTimeout(() => {
        setMarkerPhase('idle')
      }, textCloseDelayMs)

      return 'closing'
    })
  }

  const updateCenterHitState = () => {
    const viewport = viewportRef.current
    if (!viewport || !pointerInsideRef.current) {
      setCenterHovering(false)
      return
    }

    const viewportRect = viewport.getBoundingClientRect()
    const centerX = viewportRect.left + viewportRect.width / 2
    const centerY = viewportRect.top + viewportRect.height / 2

    const centeredCard = document
      .elementFromPoint(centerX, centerY)
      ?.closest('.gallery-card') as HTMLElement | null

    if (!centeredCard) {
      setCenterHovering(false)
      return
    }

    const centeredRect = centeredCard.getBoundingClientRect()
    const isPointerInsideCenteredCard =
      pointerXRef.current >= centeredRect.left &&
      pointerXRef.current <= centeredRect.right &&
      pointerYRef.current >= centeredRect.top &&
      pointerYRef.current <= centeredRect.bottom

    setCenterHovering(isPointerInsideCenteredCard)
  }

  const requestCenterHitState = () => {
    if (centerHitRafRef.current !== null) {
      return
    }

    centerHitRafRef.current = window.requestAnimationFrame(() => {
      centerHitRafRef.current = null

      const now = performance.now()
      if (now - lastCenterHitTestAtRef.current < centerHitTestMinIntervalMs) {
        return
      }

      lastCenterHitTestAtRef.current = now
      updateCenterHitState()
    })
  }

  const runAnimation = () => {
    const distance = targetXRef.current - currentXRef.current

    if (Math.abs(distance) <= 0.15) {
      currentXRef.current = targetXRef.current
      normalizeInfinitePosition()
      applyTrackTransform()
      updateCardParallax()
      updateCenterHitState()
      animationFrameRef.current = null
      return
    }

    currentXRef.current += distance * GALLERY_SCROLL_INERTIAL_LERP
    normalizeInfinitePosition()
    applyTrackTransform()
    updateCardParallax()

    if (pointerInsideRef.current) {
      requestCenterHitState()
    }

    animationFrameRef.current = window.requestAnimationFrame(runAnimation)
  }

  const startAnimation = () => {
    if (animationFrameRef.current !== null) {
      return
    }

    animationFrameRef.current = window.requestAnimationFrame(runAnimation)
  }

  useEffect(() => {
    const firstSet = firstSetRef.current
    if (!firstSet) {
      return
    }

    const recalculateTrack = () => {
      setWidthRef.current = firstSet.scrollWidth
      if (setWidthRef.current === 0) {
        return
      }

      viewportWidthRef.current = viewportRef.current?.clientWidth ?? window.innerWidth

      cardMetricsRef.current = Array.from(
        (trackRef.current ?? firstSet).querySelectorAll<HTMLElement>('.gallery-card'),
      )
        .map((element) => {
          const mediaElement = element.querySelector<HTMLImageElement>('.gallery-card__image')
          if (!mediaElement) {
            return null
          }

          return {
            mediaElement,
            center: element.offsetLeft + element.offsetWidth / 2,
            halfWidth: element.offsetWidth / 2,
            lastShift: Number.NaN,
          }
        })
        .filter((metric): metric is CardMetric => metric !== null)

      const middleStart = setWidthRef.current * middleSetIndex
      currentXRef.current = middleStart
      targetXRef.current = middleStart
      applyTrackTransform()
      updateCardParallax()
      requestCenterHitState()
    }

    recalculateTrack()
    const resizeObserver = new ResizeObserver(recalculateTrack)
    resizeObserver.observe(firstSet)
    window.addEventListener('resize', recalculateTrack)

    return () => {
      resizeObserver.disconnect()
      window.removeEventListener('resize', recalculateTrack)

      if (animationFrameRef.current !== null) {
        window.cancelAnimationFrame(animationFrameRef.current)
      }

      if (centerHitRafRef.current !== null) {
        window.cancelAnimationFrame(centerHitRafRef.current)
      }

      if (closeTextTimeoutRef.current !== null) {
        window.clearTimeout(closeTextTimeoutRef.current)
      }
    }
  }, [gallerySlides.length])

  useEffect(() => {
    // Eager preload so images are already in cache before the section enters view.
    const preloadedImages = uniqueImageSources.map((source) => {
      const image = new Image()
      image.src = source
      return image
    })

    return () => {
      preloadedImages.forEach((image) => {
        image.src = ''
      })
    }
  }, [uniqueImageSources])

  const handleWheel = (event: WheelEvent<HTMLDivElement>) => {
    if (setWidthRef.current === 0) {
      return
    }

    const isHorizontalIntent =
      Math.abs(event.deltaX) > Math.abs(event.deltaY) * 1.1 || event.shiftKey
    if (!isHorizontalIntent) {
      return
    }

    event.preventDefault()
    event.stopPropagation()

    const dominantDelta =
      Math.abs(event.deltaX) >= Math.abs(event.deltaY) ? event.deltaX : event.deltaY
    const clampedDelta = Math.max(
      -GALLERY_SCROLL_MAX_WHEEL_DELTA,
      Math.min(GALLERY_SCROLL_MAX_WHEEL_DELTA, dominantDelta),
    )

    targetXRef.current += clampedDelta * GALLERY_SCROLL_WHEEL_DRAG_FACTOR
    startAnimation()
  }

  const handlePointerMove = (event: MouseEvent<HTMLDivElement>) => {
    pointerInsideRef.current = true
    pointerXRef.current = event.clientX
    pointerYRef.current = event.clientY
    requestCenterHitState()
  }

  const handlePointerLeave = () => {
    pointerInsideRef.current = false
    if (centerHitRafRef.current !== null) {
      window.cancelAnimationFrame(centerHitRafRef.current)
      centerHitRafRef.current = null
    }
    setCenterHovering(false)
  }

  return (
    <section className="index-section section--gallery">
      <p className="gallery-title">[THE GALLERY]</p>

      <div
        className={`gallery-slider-viewport ${isCenterHovering ? 'is-active-card' : ''}`}
        ref={viewportRef}
        onWheel={handleWheel}
        onMouseMove={handlePointerMove}
        onMouseLeave={handlePointerLeave}
        data-gallery-scroll
      >
        <div className="gallery-slider-track" ref={trackRef}>
          {Array.from({ length: repeatedSetCount }, (_, setIndex) => (
            <div
              className="gallery-slider__set"
              key={`gallery-set-${setIndex}`}
              ref={setIndex === 0 ? firstSetRef : undefined}
              aria-hidden={setIndex !== middleSetIndex}
            >
              {gallerySlides.map((slide, index) => (
                <article
                  key={`${setIndex}-${slide.id}-${index}`}
                  className={`gallery-card gallery-card--${slide.orientation}`}
                >
                  <img
                    src={slide.imageSrc}
                    alt=""
                    loading="eager"
                    decoding="auto"
                    draggable={false}
                    className="gallery-card__image"
                  />
                </article>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className={`gallery-center-action gallery-center-action--${markerPhase}`} aria-hidden="true">
        <span className="gallery-center-action__cluster">
          <span className="gallery-center-action__outer" />
          <span className="gallery-center-action__inner" />
        </span>
        <span className="gallery-center-action__text-wrap">
          <span className="gallery-center-action__text">OPEN PROJECT</span>
        </span>
      </div>

    </section>
  )
}

export default GallerySection
