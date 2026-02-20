import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import SiteFooter from '../components/layout/SiteFooter/SiteFooter'
import { PROJECTS, type ProjectRecord } from '../data/projects'
import './WorkPage.css'

type PanelTransitionState = {
  fromIndex: number
  toIndex: number
  progress: number
  direction: 1 | -1
}

const PANEL_TRANSITION_BAND_PX = 120

type WorkProjectPanelContentProps = {
  project: ProjectRecord
}

function WorkProjectPanelContent({ project }: WorkProjectPanelContentProps) {
  return (
    <div className="work-project-panel-fixed__content">
      <div className="work-project__block work-project__block--project">
        <p className="work-project__label">PROJECT</p>
        <p className="work-project__copy work-project__copy--project">{project.description}</p>
        <p className="work-project__hint" aria-hidden="true">
          [CLICK PROJECT FOR MORE]
        </p>
      </div>

      <div className="work-project__block work-project__block--role">
        <p className="work-project__label">ROLE</p>
        <p className="work-project__copy work-project__copy--role">
          {project.roles.map((role) => (
            <span key={role} className="work-project__role-line">
              {role}
            </span>
          ))}
        </p>
      </div>
    </div>
  )
}

function WorkPage() {
  const projects = useMemo(() => PROJECTS, [])
  const [activeProjectIndex, setActiveProjectIndex] = useState(0)
  const [isPanelFadedOut, setIsPanelFadedOut] = useState(false)
  const [panelTransition, setPanelTransition] = useState<PanelTransitionState | null>(null)
  const sectionRef = useRef<HTMLElement | null>(null)
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
    if (mediaElements.length === 0 || projects.length === 0) {
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
  }, [projects.length])

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

  const activeProject = projects[activeProjectIndex] ?? null
  const outgoingProject = panelTransition ? projects[panelTransition.fromIndex] ?? null : null
  const incomingProject = panelTransition ? projects[panelTransition.toIndex] ?? null : null
  const outgoingTranslatePercent = panelTransition
    ? panelTransition.direction === 1
      ? -panelTransition.progress * 100
      : panelTransition.progress * 100
    : 0
  const incomingTranslatePercent = panelTransition
    ? panelTransition.direction === 1
      ? (1 - panelTransition.progress) * 100
      : -(1 - panelTransition.progress) * 100
    : 0

  return (
    <main className="work-page">
      <section ref={sectionRef} className="work-section work-section--gallery">
        <div className="work-gallery-layout">
          <div className="work-gallery">
            {projects.map((project) => (
              <article key={project.id} className="work-project">
                <Link
                  className="work-project__media"
                  to={`/work/${project.slug}`}
                  aria-label={`Open ${project.title}`}
                >
                  <img
                    className="work-project__image"
                    src={project.imageSrc}
                    alt=""
                    loading="eager"
                    onLoad={() => updateScrollLinkedState(true)}
                  />
                  <div className="work-project-action" aria-hidden="true">
                    <span className="work-project-action__cluster">
                      <span className="work-project-action__outer" />
                      <span className="work-project-action__inner" />
                    </span>
                    <span className="work-project-action__text-wrap">
                      <span className="work-project-action__text">OPEN PROJECT</span>
                    </span>
                  </div>
                </Link>
              </article>
            ))}
          </div>
          <aside className="work-project-panel" aria-hidden="true" />
        </div>

        {activeProject ? (
          <aside
            className={`work-project-panel-fixed ${isPanelFadedOut ? 'is-faded-out' : ''}`}
            aria-live="polite"
          >
            <div className="work-project-panel-fixed__viewport">
              <div className="work-project-panel-fixed__sizer" aria-hidden="true">
                <WorkProjectPanelContent project={activeProject} />
              </div>

              {panelTransition && outgoingProject && incomingProject ? (
                <>
                  <div
                    className="work-project-panel-fixed__layer"
                    style={{ transform: `translate3d(0, ${outgoingTranslatePercent}%, 0)` }}
                  >
                    <WorkProjectPanelContent project={outgoingProject} />
                  </div>
                  <div
                    className="work-project-panel-fixed__layer"
                    style={{ transform: `translate3d(0, ${incomingTranslatePercent}%, 0)` }}
                  >
                    <WorkProjectPanelContent project={incomingProject} />
                  </div>
                </>
              ) : (
                <div className="work-project-panel-fixed__layer">
                  <WorkProjectPanelContent project={activeProject} />
                </div>
              )}
            </div>
          </aside>
        ) : null}
      </section>
      <SiteFooter />
    </main>
  )
}

export default WorkPage
