import { Navigate, useParams } from 'react-router-dom'
import SiteFooter from '../components/layout/SiteFooter/SiteFooter'
import ResponsiveImage from '../components/common/ResponsiveImage'
import ProjectDetailHeader from '../components/sections/ProjectDetail/ProjectDetailHeader'
import ProjectDetailMinimap from '../components/sections/ProjectDetail/ProjectDetailMinimap'
import ProjectDetailNarrative from '../components/sections/ProjectDetail/ProjectDetailNarrative'
import { useProjectDetailMinimap } from '../components/sections/ProjectDetail/useProjectDetailMinimap'
import { getProjectBySlug } from '../data/projects'
import './ProjectDetailPage.css'

function ProjectDetailPage() {
  const { projectSlug = '' } = useParams()
  const project = getProjectBySlug(projectSlug)

  const {
    mainContentRef,
    minimapRef,
    minimapFrameRef,
    minimapHostRef,
    minimapViewportRef,
    heroRef,
  } = useProjectDetailMinimap(project?.slug)

  if (!project) {
    return <Navigate to="/work" replace />
  }

  return (
    <main className="project-detail-page">
      <ProjectDetailMinimap
        minimapRef={minimapRef}
        minimapFrameRef={minimapFrameRef}
        minimapHostRef={minimapHostRef}
        minimapViewportRef={minimapViewportRef}
      />

      <div className="project-detail-content" ref={mainContentRef}>
        <section className="project-detail-section">
          <ProjectDetailHeader
            title={project.title}
            description={project.description}
            roles={project.roles}
            visitUrl={project.visitUrl}
          />

          <figure className="project-detail-hero" ref={heroRef}>
            <ResponsiveImage image={project.heroImage} className="project-detail-hero__image" />
          </figure>

          <ProjectDetailNarrative narrative={project.narrative} detailImages={project.detailImages} />
        </section>

        <SiteFooter />
      </div>
    </main>
  )
}

export default ProjectDetailPage
