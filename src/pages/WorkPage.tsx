import { useCallback, useEffect, useMemo, useRef, type MouseEvent } from 'react'
import SiteFooter from '../components/layout/SiteFooter/SiteFooter'
import WorkProjectCard from '../components/sections/WorkGallery/WorkProjectCard'
import WorkProjectPanelContent from '../components/sections/WorkGallery/WorkProjectPanelContent'
import {
  useWorkProjectPanelState,
} from '../components/sections/WorkGallery/useWorkProjectPanelState'
import { PROJECTS } from '../data/projects'
import './WorkPage.css'

const workCardAlignmentTargetViewportRatio = 0.5
const workCardNavigationAlignmentThresholdPx = 6
const workCardScrollAnimationMinDurationMs = 360
const workCardScrollAnimationMaxDurationMs = 760
const workCardScrollAnimationDistanceForMaxDurationPx = 520

function WorkPage() {
  const projects = useMemo(() => PROJECTS, [])
  const sectionRef = useRef<HTMLElement | null>(null)
  const { activeProjectIndex, isPanelFadedOut, panelTransition, updateScrollLinkedState } =
    useWorkProjectPanelState(sectionRef, projects.length)
  const cardFocusScrollRafRef = useRef<number | null>(null)

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

  const focusProjectCardIntoViewportAlignment = useCallback((cardElement: HTMLElement) => {
    const cardRect = cardElement.getBoundingClientRect()
    const cardCenterY = cardRect.top + cardRect.height * 0.5
    const targetCenterY = window.innerHeight * workCardAlignmentTargetViewportRatio
    const centerDelta = cardCenterY - targetCenterY

    if (Math.abs(centerDelta) <= workCardNavigationAlignmentThresholdPx) {
      return
    }

    const maxScrollY = Math.max(0, document.documentElement.scrollHeight - window.innerHeight)
    const nextScrollY = Math.max(0, Math.min(maxScrollY, window.scrollY + centerDelta))
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) {
      window.scrollTo({ top: nextScrollY })
      return
    }

    if (cardFocusScrollRafRef.current !== null) {
      window.cancelAnimationFrame(cardFocusScrollRafRef.current)
      cardFocusScrollRafRef.current = null
    }

    const startScrollY = window.scrollY
    const travel = nextScrollY - startScrollY
    if (Math.abs(travel) <= 0.5) {
      window.scrollTo({ top: nextScrollY })
      return
    }

    const distanceFactor = Math.min(
      1,
      Math.abs(travel) / workCardScrollAnimationDistanceForMaxDurationPx,
    )
    const durationMs =
      workCardScrollAnimationMinDurationMs +
      (workCardScrollAnimationMaxDurationMs - workCardScrollAnimationMinDurationMs) * distanceFactor
    const startTime = performance.now()
    const easeInOutCubic = (t: number) =>
      t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2

    const animate = (timestamp: number) => {
      const elapsed = timestamp - startTime
      const progress = Math.min(1, elapsed / durationMs)
      const easedProgress = easeInOutCubic(progress)
      window.scrollTo({ top: startScrollY + travel * easedProgress })

      if (progress >= 1) {
        cardFocusScrollRafRef.current = null
        return
      }

      cardFocusScrollRafRef.current = window.requestAnimationFrame(animate)
    }

    cardFocusScrollRafRef.current = window.requestAnimationFrame(animate)
  }, [])

  const isProjectCardAlignedForNavigation = useCallback((cardElement: HTMLElement) => {
    const cardRect = cardElement.getBoundingClientRect()
    const cardCenterY = cardRect.top + cardRect.height * 0.5
    const targetCenterY = window.innerHeight * workCardAlignmentTargetViewportRatio
    return Math.abs(cardCenterY - targetCenterY) <= workCardNavigationAlignmentThresholdPx
  }, [])

  const handleProjectCardClick = useCallback(
    (event: MouseEvent<HTMLAnchorElement>) => {
      if (event.defaultPrevented) {
        return
      }

      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return
      }

      // Keep keyboard-triggered link activation immediate.
      if (event.detail === 0) {
        return
      }

      const clickedCard = event.currentTarget
      if (isProjectCardAlignedForNavigation(clickedCard)) {
        return
      }

      event.preventDefault()
      focusProjectCardIntoViewportAlignment(clickedCard)
    },
    [focusProjectCardIntoViewportAlignment, isProjectCardAlignedForNavigation],
  )

  useEffect(
    () => () => {
      if (cardFocusScrollRafRef.current !== null) {
        window.cancelAnimationFrame(cardFocusScrollRafRef.current)
      }
    },
    [],
  )

  return (
    <main className="work-page">
      <section ref={sectionRef} className="work-section work-section--gallery">
        <div className="work-gallery-layout">
          <div className="work-gallery">
            {projects.map((project) => (
              <WorkProjectCard
                key={project.id}
                project={project}
                onImageLoad={() => updateScrollLinkedState(true)}
                onProjectClick={handleProjectCardClick}
              />
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
