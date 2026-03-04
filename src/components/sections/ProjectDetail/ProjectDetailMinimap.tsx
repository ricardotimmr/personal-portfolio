import type { RefObject } from 'react'

type ProjectDetailMinimapProps = {
  minimapRef: RefObject<HTMLElement | null>
  minimapFrameRef: RefObject<HTMLDivElement | null>
  minimapHostRef: RefObject<HTMLDivElement | null>
  minimapViewportRef: RefObject<HTMLSpanElement | null>
  isReady?: boolean
}

function ProjectDetailMinimap({
  minimapRef,
  minimapFrameRef,
  minimapHostRef,
  minimapViewportRef,
  isReady = false,
}: ProjectDetailMinimapProps) {
  return (
    <aside className={`project-scroll-minimap${isReady ? ' is-ready' : ''}`} aria-hidden="true" ref={minimapRef}>
      <div className="project-scroll-minimap__frame" ref={minimapFrameRef}>
        <div className="project-scroll-minimap__host" ref={minimapHostRef} />
        <span className="project-scroll-minimap__viewport" ref={minimapViewportRef} />
      </div>
    </aside>
  )
}

export default ProjectDetailMinimap
