import { Link } from 'react-router-dom'
import { type ProjectRecord } from '../../../data/projects'

type WorkProjectCardProps = {
  project: ProjectRecord
  onImageLoad: () => void
}

function WorkProjectCard({ project, onImageLoad }: WorkProjectCardProps) {
  return (
    <article className="work-project">
      <Link className="work-project__media" to={`/work/${project.slug}`} aria-label={`Open ${project.title}`}>
        <img
          className="work-project__image"
          src={project.imageSrc}
          alt=""
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
