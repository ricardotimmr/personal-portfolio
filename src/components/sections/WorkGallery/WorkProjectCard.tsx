import { Link } from 'react-router-dom'
import type { MouseEventHandler } from 'react'
import ResponsiveImage from '../../common/ResponsiveImage'
import { type ProjectRecord } from '../../../data/projects'

type WorkProjectCardProps = {
  project: ProjectRecord
  onImageLoad: () => void
  onProjectClick: MouseEventHandler<HTMLAnchorElement>
}

function WorkProjectCard({ project, onImageLoad, onProjectClick }: WorkProjectCardProps) {
  return (
    <article className="work-project">
      <Link
        className="work-project__media"
        to={`/work/${project.slug}`}
        aria-label={`Open ${project.title}`}
        onClick={onProjectClick}
      >
        <ResponsiveImage
          className="work-project__image"
          image={project.thumbnailImage}
          loading="eager"
          onLoad={onImageLoad}
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
  )
}

export default WorkProjectCard
