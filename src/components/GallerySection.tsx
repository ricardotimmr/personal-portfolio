import { ChevronDown } from 'lucide-react'
import { useEffect, useMemo, useRef, type WheelEvent } from 'react'
import './GallerySection.css'

type SlideOrientation = 'landscape' | 'portrait'
type PlaceholderTone = 'dark' | 'accent'

type GallerySlide = {
  id: number
  orientation: SlideOrientation
  imageSrc: string | null
  placeholderTone: PlaceholderTone
}

const projectImageModules = import.meta.glob('../assets/projects/*.{png,jpg,jpeg,webp,avif}', {
  eager: true,
  import: 'default',
}) as Record<string, string>

const projectImages = Object.entries(projectImageModules)
  .sort(([pathA], [pathB]) => pathA.localeCompare(pathB))
  .map(([, source]) => source)

const minimumSlides = 10
const snapIdleDelayMs = 820
const snapRetryMs = 120
const snapMotionThresholdPx = 10
const snapMinDistancePx = 8
const wheelDragFactor = 0.22
const inertialLerp = 0.042

function GallerySection() {
  const sectionRef = useRef<HTMLElement | null>(null)
  const viewportRef = useRef<HTMLDivElement | null>(null)
  const firstSetRef = useRef<HTMLDivElement | null>(null)
  const setWidthRef = useRef(0)
  const targetScrollRef = useRef(0)
  const animationFrameRef = useRef<number | null>(null)
  const snapTimeoutRef = useRef<number | null>(null)
  const lastWheelAtRef = useRef(0)

  const gallerySlides = useMemo<GallerySlide[]>(() => {
    const slideCount = Math.max(projectImages.length, minimumSlides)

    return Array.from({ length: slideCount }, (_, index) => ({
      id: index,
      orientation: index % 2 === 0 ? 'landscape' : 'portrait',
      imageSrc: projectImages[index] ?? null,
      placeholderTone: index % 2 === 0 ? 'dark' : 'accent',
    }))
  }, [])

  const normalizeScroll = () => {
    const viewport = viewportRef.current
    const setWidth = setWidthRef.current
    if (!viewport || setWidth === 0) {
      return
    }

    while (viewport.scrollLeft < setWidth * 0.5) {
      viewport.scrollLeft += setWidth
      targetScrollRef.current += setWidth
    }

    while (viewport.scrollLeft > setWidth * 2.5) {
      viewport.scrollLeft -= setWidth
      targetScrollRef.current -= setWidth
    }
  }

  const runAnimation = () => {
    const viewport = viewportRef.current
    if (!viewport) {
      animationFrameRef.current = null
      return
    }

    const difference = targetScrollRef.current - viewport.scrollLeft
    if (Math.abs(difference) <= 0.4) {
      viewport.scrollLeft = targetScrollRef.current
      normalizeScroll()
      animationFrameRef.current = null
      return
    }

    viewport.scrollLeft += difference * inertialLerp
    normalizeScroll()
    animationFrameRef.current = window.requestAnimationFrame(runAnimation)
  }

  const startAnimation = () => {
    if (animationFrameRef.current !== null) {
      return
    }

    animationFrameRef.current = window.requestAnimationFrame(runAnimation)
  }

  const snapToNearestCard = () => {
    const viewport = viewportRef.current
    if (!viewport) {
      return false
    }

    const cards = viewport.querySelectorAll<HTMLElement>('.gallery-card')
    if (cards.length === 0) {
      return false
    }

    const viewportRect = viewport.getBoundingClientRect()
    const viewportCenter = viewport.scrollLeft + viewport.clientWidth / 2

    let nearestCenter = viewportCenter
    let nearestDistance = Number.POSITIVE_INFINITY

    cards.forEach((card) => {
      const cardRect = card.getBoundingClientRect()
      const cardCenter =
        viewport.scrollLeft + (cardRect.left - viewportRect.left) + cardRect.width / 2
      const distance = Math.abs(cardCenter - viewportCenter)

      if (distance < nearestDistance) {
        nearestDistance = distance
        nearestCenter = cardCenter
      }
    })

    if (nearestDistance <= snapMinDistancePx) {
      return false
    }

    targetScrollRef.current = nearestCenter - viewport.clientWidth / 2
    return true
  }

  const scheduleSnapCheck = () => {
    if (snapTimeoutRef.current !== null) {
      window.clearTimeout(snapTimeoutRef.current)
    }

    const checkAndSnap = () => {
      const viewport = viewportRef.current
      if (!viewport) {
        return
      }

      const idleForMs = performance.now() - lastWheelAtRef.current
      const remainingMotion = Math.abs(targetScrollRef.current - viewport.scrollLeft)

      if (idleForMs < snapIdleDelayMs || remainingMotion > snapMotionThresholdPx) {
        snapTimeoutRef.current = window.setTimeout(checkAndSnap, snapRetryMs)
        return
      }

      const didSnap = snapToNearestCard()
      if (didSnap) {
        startAnimation()
      }
    }

    snapTimeoutRef.current = window.setTimeout(checkAndSnap, snapIdleDelayMs)
  }

  useEffect(() => {
    const viewport = viewportRef.current
    const firstSet = firstSetRef.current
    if (!viewport || !firstSet) {
      return
    }

    const recalculateTrack = () => {
      setWidthRef.current = firstSet.scrollWidth
      if (setWidthRef.current > 0) {
        viewport.scrollLeft = setWidthRef.current
        targetScrollRef.current = viewport.scrollLeft
      }
    }

    recalculateTrack()
    window.addEventListener('resize', recalculateTrack)

    return () => {
      window.removeEventListener('resize', recalculateTrack)
      if (animationFrameRef.current !== null) {
        window.cancelAnimationFrame(animationFrameRef.current)
      }
      if (snapTimeoutRef.current !== null) {
        window.clearTimeout(snapTimeoutRef.current)
      }
    }
  }, [gallerySlides.length])

  const handleWheel = (event: WheelEvent<HTMLDivElement>) => {
    const section = sectionRef.current
    const viewport = viewportRef.current
    const setWidth = setWidthRef.current
    if (!section || !viewport || setWidth === 0) {
      return
    }

    const sectionRect = section.getBoundingClientRect()
    const isFullViewportInFocus =
      sectionRect.top <= 24 && sectionRect.bottom >= window.innerHeight - 24
    if (!isFullViewportInFocus) {
      return
    }

    event.preventDefault()
    lastWheelAtRef.current = performance.now()

    const dominantDelta =
      Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY

    targetScrollRef.current += dominantDelta * wheelDragFactor

    while (targetScrollRef.current < setWidth * 0.5) {
      targetScrollRef.current += setWidth
    }

    while (targetScrollRef.current > setWidth * 2.5) {
      targetScrollRef.current -= setWidth
    }

    startAnimation()
    scheduleSnapCheck()
  }

  return (
    <section className="index-section section--gallery" ref={sectionRef}>
      <div className="gallery-slider" ref={viewportRef} onWheel={handleWheel} data-gallery-scroll>
        {[0, 1, 2].map((setIndex) => (
          <div
            className="gallery-slider__set"
            key={`gallery-set-${setIndex}`}
            ref={setIndex === 0 ? firstSetRef : undefined}
            aria-hidden={setIndex !== 1}
          >
            {gallerySlides.map((slide) => (
              <article
                key={`${setIndex}-${slide.id}`}
                className={`gallery-card gallery-card--${slide.orientation} gallery-card--placeholder-${slide.placeholderTone}`}
              >
                {slide.imageSrc ? (
                  <img src={slide.imageSrc} alt="" loading="lazy" className="gallery-card__image" />
                ) : null}
              </article>
            ))}
          </div>
        ))}
      </div>

      <div className="gallery-scroll-hint" aria-hidden="true">
        <ChevronDown size={14} />
        <span>MY EXPERTISE</span>
        <ChevronDown size={14} />
      </div>
    </section>
  )
}

export default GallerySection
