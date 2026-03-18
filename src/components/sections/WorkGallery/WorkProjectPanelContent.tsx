import {
  getLocalizedProjectStringList,
  getLocalizedProjectText,
  type ProjectRecord,
} from '../../../data/projects'
import { useSiteLanguage } from '../../../context/LanguageContext'

type WorkProjectPanelContentProps = {
  project: ProjectRecord
}

function WorkProjectPanelContent({ project }: WorkProjectPanelContentProps) {
  const { language } = useSiteLanguage()
  const description = getLocalizedProjectText(project.description, language)
  const roles = getLocalizedProjectStringList(project.roles, language)

  return (
    <div className="work-project-panel-fixed__content">
      <div className="work-project__block work-project__block--project">
        <p className="work-project__label">{language === 'de' ? 'PROJEKT' : 'PROJECT'}</p>
        <p className="work-project__copy work-project__copy--project">{description}</p>
        <p className="work-project__hint" aria-hidden="true">
          {language === 'de' ? '[KLICK FUER MEHR]' : '[CLICK PROJECT FOR MORE]'}
        </p>
      </div>

      <div className="work-project__block work-project__block--role">
        <p className="work-project__label">{language === 'de' ? 'ROLLE' : 'ROLE'}</p>
        <p className="work-project__copy work-project__copy--role">
          {roles.map((role) => (
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
