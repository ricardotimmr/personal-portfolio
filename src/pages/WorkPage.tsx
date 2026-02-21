import { useMemo, useRef } from 'react'
import SiteFooter from '../components/layout/SiteFooter/SiteFooter'
import WorkProjectCard from '../components/sections/WorkGallery/WorkProjectCard'
import WorkProjectPanelContent from '../components/sections/WorkGallery/WorkProjectPanelContent'
import {
  useWorkProjectPanelState,
} from '../components/sections/WorkGallery/useWorkProjectPanelState'
import { PROJECTS } from '../data/projects'
import './WorkPage.css'

function WorkPage() {
  const projects = useMemo(() => PROJECTS, [])
  const sectionRef = useRef<HTMLElement | null>(null)
  const { activeProjectIndex, isPanelFadedOut, panelTransition, updateScrollLinkedState } =
    useWorkProjectPanelState(sectionRef, projects.length)

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
              <WorkProjectCard
                key={project.id}
                project={project}
                onImageLoad={() => updateScrollLinkedState(true)}
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
