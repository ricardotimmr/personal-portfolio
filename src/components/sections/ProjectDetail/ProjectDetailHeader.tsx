import { ArrowRight } from 'lucide-react'

type ProjectDetailHeaderProps = {
  description: string
  roles: string[]
  visitUrl?: string
}

function ProjectDetailHeader({ description, roles, visitUrl }: ProjectDetailHeaderProps) {
  const hasVisitUrl = Boolean(visitUrl)

  return (
    <header className="project-detail-header">
      <div className="project-detail-block project-detail-block--project">
        <p className="project-detail-label">PROJECT</p>
        <p className="project-detail-copy">{description}</p>
      </div>

      <div className="project-detail-block project-detail-block--role">
        <p className="project-detail-label">ROLE</p>
        <p className="project-detail-copy project-detail-copy--role">
          {roles.map((role) => (
            <span key={role} className="project-detail-role-line">
              {role}
            </span>
          ))}
        </p>
      </div>

      <a
        className={`project-detail-visit ${hasVisitUrl ? '' : 'is-disabled'}`}
        href={visitUrl}
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
  )
}

export default ProjectDetailHeader
