import { type CSSProperties, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import ResponsiveImage from '../components/common/ResponsiveImage'
import ProjectDetailHeader from '../components/sections/ProjectDetail/ProjectDetailHeader'
import ProjectDetailMinimap from '../components/sections/ProjectDetail/ProjectDetailMinimap'
import ProjectDetailNarrative from '../components/sections/ProjectDetail/ProjectDetailNarrative'
import { useProjectDetailMinimap } from '../components/sections/ProjectDetail/useProjectDetailMinimap'
import { getProjectBySlug, PROJECTS } from '../data/projects'
import './ProjectDetailPage.css'

type BoundaryDirection = 'prev' | 'next'

const EDGE_NAV_THRESHOLD = 1700
const MAX_DELTA_CONTRIBUTION = 42
const EDGE_EPSILON = 1
const EDGE_NAV_COOLDOWN_MS = 900
const EDGE_NAV_COMPLETE_HOLD_MS = 360
const EDGE_DIM_BASE_OPACITY = 0.08
const EDGE_DIM_PROGRESS_OPACITY = 0.48
const EDGE_GLOBAL_SCROLL_LOCK_MS = 2200

type ProjectTransitionWindow = Window & {
  __projectOutgoingDimOpacity?: number
  __projectBoundaryScrollLockUntil?: number
}

type ProjectDetailPageProps = {
  isPageTransitioning?: boolean
}

function ProjectDetailPage({ isPageTransitioning = false }: ProjectDetailPageProps) {
  const { projectSlug = '' } = useParams()
  const navigate = useNavigate()
  const project = getProjectBySlug(projectSlug)
  const [edgeDirection, setEdgeDirection] = useState<BoundaryDirection | null>(null)
  const [edgeProgress, setEdgeProgress] = useState(0)
  const [dimDirection, setDimDirection] = useState<BoundaryDirection>('next')
  const edgeDirectionRef = useRef<BoundaryDirection | null>(null)
  const edgeProgressRef = useRef(0)
  const edgeAccumulatedRef = useRef(0)
  const isNavigatingRef = useRef(false)
  const navigationCooldownUntilRef = useRef(0)
  const pendingNavigationTimeoutRef = useRef<number | null>(null)
  const lastSlugRef = useRef(projectSlug)

  const projectIndex = useMemo(
    () => PROJECTS.findIndex((candidate) => candidate.slug === projectSlug),
    [projectSlug],
  )
  const hasProjectLoop = projectIndex >= 0 && PROJECTS.length > 1
  const previousProject = hasProjectLoop
    ? PROJECTS[(projectIndex - 1 + PROJECTS.length) % PROJECTS.length]
    : null
  const nextProject = hasProjectLoop ? PROJECTS[(projectIndex + 1) % PROJECTS.length] : null

  const {
    mainContentRef,
    minimapRef,
    minimapFrameRef,
    minimapHostRef,
    minimapViewportRef,
    heroRef,
  } = useProjectDetailMinimap(project?.slug)

  useEffect(() => {
    edgeDirectionRef.current = edgeDirection
    edgeProgressRef.current = edgeProgress
  }, [edgeDirection, edgeProgress])

  useEffect(() => {
    if (edgeDirection) {
      setDimDirection(edgeDirection)
    }
  }, [edgeDirection])

  useEffect(() => {
    if (!isPageTransitioning) {
      isNavigatingRef.current = false
      return
    }

    const transitionWindow = window as ProjectTransitionWindow
    transitionWindow.__projectBoundaryScrollLockUntil = Date.now() + EDGE_GLOBAL_SCROLL_LOCK_MS

    if (pendingNavigationTimeoutRef.current !== null) {
      window.clearTimeout(pendingNavigationTimeoutRef.current)
      pendingNavigationTimeoutRef.current = null
    }

    isNavigatingRef.current = true
    edgeAccumulatedRef.current = 0
    edgeDirectionRef.current = null
    edgeProgressRef.current = 0
    setEdgeDirection(null)
    setEdgeProgress(0)
  }, [isPageTransitioning])

  useLayoutEffect(() => {
    if (lastSlugRef.current === projectSlug) {
      return
    }

    lastSlugRef.current = projectSlug

    if (pendingNavigationTimeoutRef.current !== null) {
      window.clearTimeout(pendingNavigationTimeoutRef.current)
      pendingNavigationTimeoutRef.current = null
    }

    navigationCooldownUntilRef.current = Date.now() + EDGE_NAV_COOLDOWN_MS
    edgeAccumulatedRef.current = 0
    edgeDirectionRef.current = null
    edgeProgressRef.current = 0
    isNavigatingRef.current = false
    setEdgeDirection(null)
    setEdgeProgress(0)
    setDimDirection('next')
  }, [projectSlug])

  useEffect(() => {
    const resetProgress = () => {
      edgeAccumulatedRef.current = 0
      edgeDirectionRef.current = null
      edgeProgressRef.current = 0
      setEdgeDirection(null)
      setEdgeProgress(0)
    }

    const handleWheel = (event: WheelEvent) => {
      if (isPageTransitioning) {
        return
      }

      const transitionWindow = window as ProjectTransitionWindow
      const lockUntil = transitionWindow.__projectBoundaryScrollLockUntil ?? 0
      if (Date.now() < lockUntil) {
        return
      }

      if (isNavigatingRef.current) {
        return
      }

      if (Date.now() < navigationCooldownUntilRef.current) {
        return
      }

      const direction: BoundaryDirection | null =
        event.deltaY < 0 ? 'prev' : event.deltaY > 0 ? 'next' : null
      if (!direction) {
        return
      }

      const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight)
      const scrollY = window.scrollY
      const isAtTop = scrollY <= EDGE_EPSILON
      const isAtBottom = maxScroll - scrollY <= EDGE_EPSILON

      const isBoundaryScroll =
        (direction === 'prev' && isAtTop && Boolean(previousProject)) ||
        (direction === 'next' && isAtBottom && Boolean(nextProject))

      if (!isBoundaryScroll) {
        if (edgeProgressRef.current > 0 || edgeDirectionRef.current) {
          resetProgress()
        }
        return
      }

      if (edgeDirectionRef.current && edgeDirectionRef.current !== direction) {
        edgeAccumulatedRef.current = 0
      }

      const contribution = Math.min(Math.abs(event.deltaY), MAX_DELTA_CONTRIBUTION)
      edgeAccumulatedRef.current += contribution
      const progress = Math.min(1, edgeAccumulatedRef.current / EDGE_NAV_THRESHOLD)

      edgeDirectionRef.current = direction
      edgeProgressRef.current = progress
      setEdgeDirection(direction)
      setEdgeProgress(progress)

      if (progress < 1) {
        return
      }

      const target = direction === 'prev' ? previousProject : nextProject
      if (!target) {
        resetProgress()
        return
      }

      isNavigatingRef.current = true
      navigationCooldownUntilRef.current = Date.now() + EDGE_NAV_COOLDOWN_MS
      transitionWindow.__projectBoundaryScrollLockUntil = Date.now() + EDGE_GLOBAL_SCROLL_LOCK_MS
      pendingNavigationTimeoutRef.current = window.setTimeout(() => {
        pendingNavigationTimeoutRef.current = null
        transitionWindow.__projectOutgoingDimOpacity = EDGE_DIM_BASE_OPACITY + EDGE_DIM_PROGRESS_OPACITY
        navigate(`/work/${target.slug}`)
      }, EDGE_NAV_COMPLETE_HOLD_MS)
    }

    window.addEventListener('wheel', handleWheel, { passive: true })
    return () => {
      if (pendingNavigationTimeoutRef.current !== null) {
        window.clearTimeout(pendingNavigationTimeoutRef.current)
        pendingNavigationTimeoutRef.current = null
      }
      window.removeEventListener('wheel', handleWheel)
    }
  }, [isPageTransitioning, navigate, nextProject, previousProject, projectSlug])

  if (!project) {
    return <Navigate to="/work" replace />
  }

  const bottomTextProgress = Math.min(1, edgeProgress / 0.25)
  const bottomLineProgress = edgeProgress <= 0.25 ? 0 : Math.min(1, (edgeProgress - 0.25) / 0.75)
  const edgeDimOpacity = edgeDirection
    ? (EDGE_DIM_BASE_OPACITY + edgeProgress * EDGE_DIM_PROGRESS_OPACITY).toFixed(3)
    : '0'

  return (
    <main className="project-detail-page">
      <div
        className={`project-edge-dim is-${dimDirection}`}
        style={{ opacity: edgeDimOpacity }}
        aria-hidden="true"
      />

      <ProjectDetailMinimap
        minimapRef={minimapRef}
        minimapFrameRef={minimapFrameRef}
        minimapHostRef={minimapHostRef}
        minimapViewportRef={minimapViewportRef}
      />

      <div className="project-detail-content" ref={mainContentRef}>
        <section className="project-detail-section">
          <p
            className={`project-edge-hint project-edge-hint--top${edgeDirection === 'prev' ? ' is-visible' : ''}`}
            style={{ '--edge-progress': edgeProgress.toFixed(3) } as CSSProperties}
            aria-hidden={edgeDirection !== 'prev'}
          >
            <span className="project-edge-hint__fill">scroll up to previous project</span>
          </p>

          <ProjectDetailHeader
            title={project.title}
            description={project.description}
            roles={project.roles}
            visitUrl={project.visitUrl}
          />

          <figure className="project-detail-hero" ref={heroRef}>
            <ResponsiveImage image={project.heroImage} className="project-detail-hero__image" />
          </figure>

          <ProjectDetailNarrative narrative={project.narrative} detailImages={project.detailImages} />

          <div
            className={`project-edge-hint-row project-edge-hint-row--bottom${edgeDirection === 'next' ? ' is-visible' : ''}`}
            aria-hidden={edgeDirection !== 'next'}
          >
            <p
              className="project-edge-hint project-edge-hint--bottom"
              style={{ '--edge-progress': bottomTextProgress.toFixed(3) } as CSSProperties}
            >
              <span className="project-edge-hint__fill">scroll down for next project</span>
            </p>
            <span className="project-edge-line" aria-hidden="true">
              <span
                className="project-edge-line__fill"
                style={{ transform: `scaleX(${bottomLineProgress.toFixed(3)})` }}
              />
            </span>
          </div>
        </section>
        <nav className="project-detail-legal" aria-label="Legal">
          <Link className="project-detail-legal__link" to="/privacy-policy">
            Datenschutz
          </Link>
          <span className="project-detail-legal__divider" aria-hidden="true">
            ·
          </span>
          <Link className="project-detail-legal__link" to="/legal-notice">
            Impressum
          </Link>
        </nav>
      </div>
    </main>
  )
}

export default ProjectDetailPage
