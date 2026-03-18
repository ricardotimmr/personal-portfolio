import { ArrowRight } from 'lucide-react'
import { useSiteLanguage } from '../../../context/LanguageContext'

type ProjectDetailHeaderProps = {
  title: string
  description: string
  roles: string[]
  visitUrl?: string
}

function ProjectDetailHeader({ title, description, roles, visitUrl }: ProjectDetailHeaderProps) {
  const { language } = useSiteLanguage()
  const hasVisitUrl = Boolean(visitUrl)
  const projectLabel = language === 'de' ? 'PROJEKT' : 'PROJECT'
  const roleLabel = language === 'de' ? 'ROLLE' : 'ROLE'
  const visitPageLabel = language === 'de' ? 'SEITE BESUCHEN' : 'VISIT PAGE'

  return (
    <header className="project-detail-header">
      <div className="project-detail-block project-detail-block--project">
        <p className="project-detail-label-row">
          <span className="project-detail-label">{projectLabel}</span>
          <span className="project-detail-title">{title}</span>
        </p>
        <p className="project-detail-copy">{description}</p>
      </div>

      <div className="project-detail-block project-detail-block--role">
        <p className="project-detail-label">{roleLabel}</p>
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
          <span className="project-detail-visit-swap__primary">{visitPageLabel}</span>
          <span className="project-detail-visit-swap__secondary" aria-hidden="true">
            {visitPageLabel}
          </span>
        </span>
        <ArrowRight size={14} className="project-detail-visit__icon" />
      </a>
    </header>
  )
}

export default ProjectDetailHeader
