import { type ProjectRecord } from '../../../data/projects'

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

export default WorkProjectPanelContent
