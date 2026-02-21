function ProjectDetailNarrative() {
  return (
    <>
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
    </>
  )
}

export default ProjectDetailNarrative
