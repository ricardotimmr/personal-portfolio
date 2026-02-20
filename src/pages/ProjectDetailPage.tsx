import { ArrowRight } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import SiteFooter from '../components/layout/SiteFooter/SiteFooter'
import { getProjectBySlug } from '../data/projects'
import './ProjectDetailPage.css'

function ProjectDetailPage() {
  const { projectSlug = '' } = useParams()
  const project = getProjectBySlug(projectSlug)
  const mainContentRef = useRef<HTMLDivElement | null>(null)
  const minimapHostRef = useRef<HTMLDivElement | null>(null)
  const minimapViewportRef = useRef<HTMLSpanElement | null>(null)

  useEffect(() => {
    if (!project) {
      return
    }

    const source = mainContentRef.current
    const minimapHost = minimapHostRef.current
    const viewportMarker = minimapViewportRef.current
    if (!source || !minimapHost || !viewportMarker) {
      return
    }

    let rafId: number | null = null
    let sourceWidth = 0
    let sourceHeight = 0
    let scaleX = 1
    let scaleY = 1

    const clone = source.cloneNode(true) as HTMLElement
    clone.classList.add('project-scroll-minimap__clone')
    clone.setAttribute('aria-hidden', 'true')
    minimapHost.innerHTML = ''
    minimapHost.append(clone)

    const updateGeometry = () => {
      const hostWidth = minimapHost.clientWidth
      const hostHeight = minimapHost.clientHeight
      sourceWidth = Math.max(1, source.clientWidth)
      sourceHeight = Math.max(1, source.scrollHeight)

      scaleX = hostWidth / sourceWidth
      scaleY = hostHeight / sourceHeight

      clone.style.width = `${sourceWidth}px`
      clone.style.top = '0'
      clone.style.transform = `scale(${scaleX}, ${scaleY})`
    }

    const updateViewportMarker = () => {
      const documentHeight = Math.max(1, document.documentElement.scrollHeight)
      const viewportHeight = window.innerHeight
      const maxScroll = Math.max(1, documentHeight - viewportHeight)
      const scrollProgress = Math.max(0, Math.min(1, window.scrollY / maxScroll))
      const hostHeight = minimapHost.clientHeight

      const viewportHeightScaled = (viewportHeight / documentHeight) * hostHeight
      const markerHeight = Math.max(16, Math.min(hostHeight, viewportHeightScaled))
      const markerRange = Math.max(0, hostHeight - markerHeight)
      const markerTop = markerRange * scrollProgress

      viewportMarker.style.height = `${markerHeight.toFixed(3)}px`
      viewportMarker.style.transform = `translate3d(0, ${markerTop.toFixed(3)}px, 0)`
    }

    const updateAll = () => {
      rafId = null
      updateGeometry()
      updateViewportMarker()
    }

    const requestUpdate = () => {
      if (rafId !== null) {
        return
      }

      rafId = window.requestAnimationFrame(updateAll)
    }

    const resizeObserver = new ResizeObserver(requestUpdate)
    resizeObserver.observe(source)

    window.addEventListener('scroll', requestUpdate, { passive: true })
    window.addEventListener('resize', requestUpdate)
    requestUpdate()

    return () => {
      resizeObserver.disconnect()
      window.removeEventListener('scroll', requestUpdate)
      window.removeEventListener('resize', requestUpdate)
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId)
      }
    }
  }, [project])

  if (!project) {
    return <Navigate to="/work" replace />
  }

  const hasVisitUrl = Boolean(project.visitUrl)

  return (
    <main className="project-detail-page">
      <aside className="project-scroll-minimap" aria-hidden="true">
        <div className="project-scroll-minimap__frame">
          <div className="project-scroll-minimap__host" ref={minimapHostRef} />
          <span className="project-scroll-minimap__viewport" ref={minimapViewportRef} />
        </div>
      </aside>

      <div className="project-detail-content" ref={mainContentRef}>
        <section className="project-detail-section">
          <header className="project-detail-header">
            <div className="project-detail-block project-detail-block--project">
              <p className="project-detail-label">PROJECT</p>
              <p className="project-detail-copy">{project.description}</p>
            </div>

            <div className="project-detail-block project-detail-block--role">
              <p className="project-detail-label">ROLE</p>
              <p className="project-detail-copy project-detail-copy--role">
                {project.roles.map((role) => (
                  <span key={role} className="project-detail-role-line">
                    {role}
                  </span>
                ))}
              </p>
            </div>

            <a
              className={`project-detail-visit ${hasVisitUrl ? '' : 'is-disabled'}`}
              href={project.visitUrl}
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

          <figure className="project-detail-hero">
            <img src={project.imageSrc} alt="" className="project-detail-hero__image" />
          </figure>

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
              Built through iterative testing and precise visual refinements, the workflow
              prioritized clarity, speed, and consistent interaction behavior across every screen.
            </p>
            <p className="project-detail-overview__meta">
              Structured in modular components, documented with repeatable patterns, and optimized
              for maintainability as project scope evolves.
            </p>
          </div>

          <div className="project-detail-visual-stack" aria-hidden="true">
            <figure className="project-detail-visual project-detail-visual--placeholder" />
            <figure className="project-detail-visual project-detail-visual--placeholder" />
          </div>
        </section>

        <SiteFooter />
      </div>
    </main>
  )
}

export default ProjectDetailPage
