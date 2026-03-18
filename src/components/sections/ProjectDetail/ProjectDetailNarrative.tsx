import ResponsiveImage from '../../common/ResponsiveImage'
import {
  getLocalizedProjectText,
  type ProjectNarrativeContent,
  type ResponsiveProjectImage,
} from '../../../data/projects'
import { useSiteLanguage } from '../../../context/LanguageContext'

type ProjectDetailNarrativeProps = {
  narrative: ProjectNarrativeContent
  detailImages: [
    ResponsiveProjectImage,
    ResponsiveProjectImage,
    ResponsiveProjectImage,
    ResponsiveProjectImage,
  ]
}

function ProjectDetailNarrative({ narrative, detailImages }: ProjectDetailNarrativeProps) {
  const { language } = useSiteLanguage()

  return (
    <>
      <div className="project-detail-overview project-detail-overview--right">
        <p className="project-detail-overview__label">{language === 'de' ? '[UEBERBLICK]' : '[OVERVIEW]'}</p>
        <p className="project-detail-overview__headline">
          {getLocalizedProjectText(narrative.overviewHeadline, language)}
        </p>
        <p className="project-detail-overview__meta">
          {getLocalizedProjectText(narrative.overviewMeta, language)}
        </p>
      </div>

      <div className="project-detail-visual-stack" aria-hidden="true">
        <figure className="project-detail-visual">
          <ResponsiveImage image={detailImages[0]} className="project-detail-visual__image" loading="lazy" />
        </figure>
        <figure className="project-detail-visual">
          <ResponsiveImage image={detailImages[1]} className="project-detail-visual__image" loading="lazy" />
        </figure>
      </div>

      <div className="project-detail-overview project-detail-overview--left">
        <p className="project-detail-overview__label">{language === 'de' ? '[PROZESS]' : '[PROCESS]'}</p>
        <p className="project-detail-overview__headline">
          {getLocalizedProjectText(narrative.processHeadline, language)}
        </p>
        <p className="project-detail-overview__meta">
          {getLocalizedProjectText(narrative.processMeta, language)}
        </p>
      </div>

      <div className="project-detail-visual-stack" aria-hidden="true">
        <figure className="project-detail-visual">
          <ResponsiveImage image={detailImages[2]} className="project-detail-visual__image" loading="lazy" />
        </figure>
        <figure className="project-detail-visual">
          <ResponsiveImage image={detailImages[3]} className="project-detail-visual__image" loading="lazy" />
        </figure>
      </div>
    </>
  )
}

export default ProjectDetailNarrative
