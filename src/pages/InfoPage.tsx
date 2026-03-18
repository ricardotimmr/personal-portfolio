import { useEffect, useMemo, useRef, type CSSProperties } from 'react'
import SiteFooter from '../components/layout/SiteFooter/SiteFooter'
import { clamp01, computeRiverRevealProgress, isRiverStationVisible } from './infoRiverReveal'
import './InfoPage.css'

type RiverStation = {
  id: string
  year: string
  title: string
  detail: string
  offset: number
}

const RIVER_STATIONS: RiverStation[] = [
  {
    id: 'top-it-recruiting',
    year: '11/2019',
    title: 'top itservices AG - Recruiting & Services',
    detail:
      'Working student role focused on sourcing, first interviews, candidate profiling and recruiting process support.',
    offset: -26,
  },
  {
    id: 'top-it-sales',
    year: '07/2020',
    title: 'top itservices AG - Sales & Business Development',
    detail:
      'Sales support phase with lead research, CRM data maintenance, campaign preparation and customer outreach workflows.',
    offset: 12,
  },
  {
    id: 'bachelor-start',
    year: '10/2022',
    title: 'B.Sc. Medieninformatik (TH Koeln)',
    detail:
      'Bachelor studies started with focus on UX/UI design, frontend development and practical product-oriented implementation.',
    offset: -6,
  },
  {
    id: 'shrinkify',
    year: '10/2024',
    title: 'Shrinkify (TH Koeln Entwicklungsprojekt)',
    detail:
      'Team project building a CMS-oriented image optimization app with admin/upload flow and modular interface architecture.',
    offset: 27,
  },
  {
    id: 'varia',
    year: '04/2025',
    title: 'Varia Praxisprojekt (TH Koeln)',
    detail:
      'Ongoing practical project for interactive, CI-consistent product modules with strong UX/UI and reusable frontend patterns.',
    offset: -31,
  },
  {
    id: 'ferchau',
    year: '11/2025',
    title: 'FERCHAU - Compliance & Legal',
    detail:
      'Working student role supporting compliance operations and privacy/data-protection topics across company processes.',
    offset: 9,
  },
  {
    id: 'uiux-frontend',
    year: 'Now',
    title: 'UI/UX + Frontend Development Track',
    detail:
      'Building and documenting product-focused interfaces in real projects, with practical coding work visible on GitHub.',
    offset: -22,
  },
]

const SKILL_LANES = [
  {
    title: 'Frontend',
    items: ['React', 'TypeScript', 'JavaScript', 'HTML5', 'CSS3', 'Tailwind CSS', 'Vite'],
  },
  {
    title: 'Backend & Processing',
    items: ['Node.js', 'Sharp', 'REST API', 'Spring'],
  },
  {
    title: 'Languages & Platforms',
    items: ['Kotlin', 'Java', 'C', 'Postman'],
  },
  {
    title: 'Workflow',
    items: [
      'Docker',
      'Figma',
      'Git',
      'GitHub',
      'Visual Studio Code',
      'IntelliJ IDEA',
      'CLion',
      'ChatGPT',
      'Claude',
      'Gemini',
    ],
  },
]

const RIVER_TOP_PADDING = 130
const RIVER_BOTTOM_PADDING = 180
const RIVER_STEP = 392
const RIVER_VIEWBOX_WIDTH = 1000
const RIVER_CENTER_X = RIVER_VIEWBOX_WIDTH * 0.5
const RIVER_X_SCALE = 11.8
const RIVER_STATION_REVEAL_LAG_PX = -42
const RIVER_Y_JITTERS = [0, 34, -26, 18, -41, 29, -12]

function supportsMaskReveal() {
  if (typeof CSS === 'undefined' || typeof CSS.supports !== 'function') {
    return false
  }

  return (
    CSS.supports('mask-image', 'linear-gradient(#000, transparent)') ||
    CSS.supports('-webkit-mask-image', 'linear-gradient(#000, transparent)')
  )
}

function supportsClipPathReveal() {
  if (typeof CSS === 'undefined' || typeof CSS.supports !== 'function') {
    return false
  }

  return CSS.supports('clip-path', 'inset(0 0 0 0)') || CSS.supports('-webkit-clip-path', 'inset(0 0 0 0)')
}

function buildRiverPath(points: Array<{ x: number; y: number }>) {
  if (points.length === 0) {
    return ''
  }

  let path = `M ${points[0].x} ${points[0].y}`
  for (let index = 1; index < points.length; index += 1) {
    const previousPoint = points[index - 1]
    const currentPoint = points[index]
    const controlY = (previousPoint.y + currentPoint.y) * 0.5
    path += ` C ${previousPoint.x} ${controlY}, ${currentPoint.x} ${controlY}, ${currentPoint.x} ${currentPoint.y}`
  }
  return path
}

function InfoPage() {
  const riverSectionRef = useRef<HTMLElement | null>(null)
  const riverPoints = useMemo(
    () =>
      RIVER_STATIONS.map((station, index) => ({
        station,
        x: RIVER_CENTER_X + station.offset * RIVER_X_SCALE,
        y: RIVER_TOP_PADDING + index * RIVER_STEP + (RIVER_Y_JITTERS[index] ?? 0),
      })),
    [],
  )

  const riverHeight = useMemo(
    () => RIVER_TOP_PADDING + RIVER_BOTTOM_PADDING + Math.max(0, riverPoints.length - 1) * RIVER_STEP,
    [riverPoints.length],
  )
  const riverPath = useMemo(
    () => buildRiverPath(riverPoints.map(({ x, y }) => ({ x, y }))),
    [riverPoints],
  )

  useEffect(() => {
    const sectionElement = riverSectionRef.current
    if (!sectionElement) {
      return
    }

    const trackElement = sectionElement.querySelector<HTMLElement>('.info-river-track')
    const pathElements = Array.from(sectionElement.querySelectorAll<SVGPathElement>('.info-river-path'))
    const stationElements = Array.from(sectionElement.querySelectorAll<HTMLElement>('.info-river-station'))
    if (!trackElement || pathElements.length === 0) {
      return
    }

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const stationRevealYPositions = riverPoints.map(({ y }) => y)
    const hasMaskSupport = supportsMaskReveal()
    const hasClipPathSupport = supportsClipPathReveal()
    const canUseClipFallback = !hasMaskSupport && hasClipPathSupport
    const canAnimateReveal = hasMaskSupport || canUseClipFallback
    trackElement.classList.toggle('info-river-track--clip-fallback', canUseClipFallback)

    const setRevealState = (progress: number, trackHeight: number) => {
      const clampedProgress = clamp01(progress)
      const safeTrackHeight = Math.max(1, trackHeight)
      trackElement.style.setProperty('--river-progress', clampedProgress.toFixed(4))
      trackElement.style.setProperty(
        '--river-reveal-cutoff-px',
        `${(clampedProgress * safeTrackHeight).toFixed(2)}px`,
      )
    }
    const resetRevealState = () => {
      trackElement.classList.remove('info-river-track--clip-fallback')
      trackElement.style.removeProperty('--river-progress')
      trackElement.style.removeProperty('--river-reveal-cutoff-px')
    }

    if (prefersReducedMotion) {
      const reducedMotionHeight = Math.max(trackElement.getBoundingClientRect().height, trackElement.offsetHeight)
      setRevealState(1, reducedMotionHeight)
      stationElements.forEach((stationElement) => stationElement.classList.add('is-visible'))
      return () => {
        resetRevealState()
      }
    }

    if (!canAnimateReveal) {
      const fallbackHeight = Math.max(trackElement.getBoundingClientRect().height, trackElement.offsetHeight)
      setRevealState(1, fallbackHeight)
      stationElements.forEach((stationElement) => stationElement.classList.add('is-visible'))
      return () => {
        resetRevealState()
      }
    }

    let rafId: number | null = null

    const updateRiverReveal = () => {
      rafId = null
      const trackRect = trackElement.getBoundingClientRect()
      const progress = computeRiverRevealProgress(trackRect.top, trackRect.height, window.innerHeight)
      setRevealState(progress, trackRect.height)

      const revealedRoadY = progress * trackRect.height
      stationElements.forEach((stationElement, stationIndex) => {
        stationElement.classList.toggle(
          'is-visible',
          isRiverStationVisible(revealedRoadY, stationRevealYPositions[stationIndex], RIVER_STATION_REVEAL_LAG_PX),
        )
      })
    }

    const requestRiverUpdate = () => {
      if (rafId !== null) {
        return
      }
      rafId = window.requestAnimationFrame(updateRiverReveal)
    }

    requestRiverUpdate()
    window.addEventListener('scroll', requestRiverUpdate, { passive: true })
    window.addEventListener('resize', requestRiverUpdate)

    return () => {
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId)
      }
      window.removeEventListener('scroll', requestRiverUpdate)
      window.removeEventListener('resize', requestRiverUpdate)
      resetRevealState()
    }
  }, [riverPoints])

  return (
    <main className="info-page">
      <section className="info-section info-section--hero">
        <div className="info-hero">
          <h1 className="info-hero__title">
            Work, Study <span>& Skills</span>
          </h1>
          <p className="info-hero__copy">
            I design and build digital products with a strong focus on clarity, motion and structure.
            This page maps the path from my bachelor studies to current project work.
          </p>
        </div>
      </section>

      <section ref={riverSectionRef} className="info-section info-section--river">
        <header className="info-river-header">
          <h2 className="info-river-header__title">[MILESTONES]</h2>
        </header>

        <div className="info-river-track" style={{ '--river-height': `${riverHeight}px` } as CSSProperties}>
          <svg
            className="info-river-track__svg"
            viewBox={`0 0 ${RIVER_VIEWBOX_WIDTH} ${riverHeight}`}
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path className="info-river-path info-river-path--outer" d={riverPath} />
            <path className="info-river-path info-river-path--inner" d={riverPath} />
            <path className="info-river-path info-river-path--middle" d={riverPath} />
          </svg>

          {riverPoints.map(({ station, x, y }, index) => {
            const xPercent = (x / RIVER_VIEWBOX_WIDTH) * 100
            const sideClassName =
              xPercent < 42 ? 'is-right' : xPercent > 58 ? 'is-left' : index % 2 === 0 ? 'is-right' : 'is-left'

            return (
              <article
                key={station.id}
                className={`info-river-station ${sideClassName}`}
                style={
                  {
                    '--station-x': `${xPercent}%`,
                    '--station-y': `${y}px`,
                    transitionDelay: `${Math.min(index * 80, 360)}ms`,
                  } as CSSProperties
                }
              >
                <span className="info-river-station__dot" aria-hidden="true" />
                <div className="info-river-station__card">
                  <p className="info-river-station__year">{station.year}</p>
                  <h3 className="info-river-station__title">{station.title}</h3>
                  <p className="info-river-station__detail">{station.detail}</p>
                </div>
              </article>
            )
          })}
        </div>
      </section>

      <section className="info-section info-section--skills">
        <header className="info-skills-header">
          <h2 className="info-skills-header__title">[SKILLSET]</h2>
        </header>

        <div className="info-skills-lanes">
          {SKILL_LANES.map((lane, laneIndex) => (
            <article
              key={lane.title}
              className="info-skills-lane"
              style={{ transitionDelay: `${100 + laneIndex * 55}ms` }}
            >
              <h3 className="info-skills-lane__title">{lane.title}</h3>
              <ul className="info-skills-lane__list">
                {lane.items.map((item) => (
                  <li key={item} className="info-skills-lane__item">
                    {item}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <SiteFooter />
    </main>
  )
}

export default InfoPage
