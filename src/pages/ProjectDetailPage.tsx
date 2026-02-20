import { ArrowRight } from 'lucide-react'
import { Navigate, useParams } from 'react-router-dom'
import SiteFooter from '../components/layout/SiteFooter/SiteFooter'
import { getProjectBySlug } from '../data/projects'
import './ProjectDetailPage.css'

function ProjectDetailPage() {
  const { projectSlug = '' } = useParams()
  const project = getProjectBySlug(projectSlug)

  if (!project) {
    return <Navigate to="/work" replace />
  }

  const hasVisitUrl = Boolean(project.visitUrl)

  return (
    <main className="project-detail-page">
      <section className="project-detail-section">
        <header className="project-detail-header">
          <div className="project-detail-block project-detail-block--project">
            <p className="project-detail-label">PROJECT</p>
            <p className="project-detail-copy">{project.description}</p>
          </div>

          <div className="project-detail-block project-detail-block--role">
            <p className="project-detail-label">ROLE</p>
            <p className="project-detail-copy project-detail-copy--role">
              {project.roles.map((role) => (
                <span key={role} className="project-detail-role-line">
                  {role}
                </span>
              ))}
            </p>
          </div>

          <a
            className={`project-detail-visit ${hasVisitUrl ? '' : 'is-disabled'}`}
            href={project.visitUrl}
            target={hasVisitUrl ? '_blank' : undefined}
            rel={hasVisitUrl ? 'noreferrer' : undefined}
            onClick={(event) => {
              if (!hasVisitUrl) {
                event.preventDefault()
              }
            }}
            aria-disabled={!hasVisitUrl}
          >
            <span className="project-detail-visit-swap">
              <span className="project-detail-visit-swap__primary">VISIT PAGE</span>
              <span className="project-detail-visit-swap__secondary" aria-hidden="true">
                VISIT PAGE
              </span>
            </span>
            <ArrowRight size={14} className="project-detail-visit__icon" />
          </a>
        </header>

        <figure className="project-detail-hero">
          <img src={project.imageSrc} alt="" className="project-detail-hero__image" />
        </figure>

        <div className="project-detail-overview project-detail-overview--right">
          <p className="project-detail-overview__label">[OVERVIEW]</p>
          <p className="project-detail-overview__headline">
            A focused digital experience shaped for clarity, rhythm, and detail, turning complex
            flows into confident, simple interactions.
          </p>
          <p className="project-detail-overview__meta">
            Built with React and TypeScript, designed with Figma, and refined with modern web
            animation and interaction patterns.
          </p>
        </div>

        <div className="project-detail-visual-stack" aria-hidden="true">
          <figure className="project-detail-visual project-detail-visual--placeholder" />
          <figure className="project-detail-visual project-detail-visual--placeholder" />
        </div>

        <div className="project-detail-overview project-detail-overview--left">
          <p className="project-detail-overview__label">[PROCESS]</p>
          <p className="project-detail-overview__headline">
            Built through iterative testing and precise visual refinements, the workflow prioritized
            clarity, speed, and consistent interaction behavior across every screen.
          </p>
          <p className="project-detail-overview__meta">
            Structured in modular components, documented with repeatable patterns, and optimized for
            maintainability as project scope evolves.
          </p>
        </div>

        <div className="project-detail-visual-stack" aria-hidden="true">
          <figure className="project-detail-visual project-detail-visual--placeholder" />
          <figure className="project-detail-visual project-detail-visual--placeholder" />
        </div>
      </section>

      <SiteFooter />
    </main>
  )
}

export default ProjectDetailPage
