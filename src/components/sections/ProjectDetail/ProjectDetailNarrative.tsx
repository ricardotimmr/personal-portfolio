import ResponsiveImage from '../../common/ResponsiveImage'
import type { ProjectNarrativeContent, ResponsiveProjectImage } from '../../../data/projects'

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
  return (
    <>
      <div className="project-detail-overview project-detail-overview--right">
        <p className="project-detail-overview__label">[OVERVIEW]</p>
        <p className="project-detail-overview__headline">{narrative.overviewHeadline}</p>
        <p className="project-detail-overview__meta">{narrative.overviewMeta}</p>
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
        <p className="project-detail-overview__label">[PROCESS]</p>
        <p className="project-detail-overview__headline">{narrative.processHeadline}</p>
        <p className="project-detail-overview__meta">{narrative.processMeta}</p>
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
