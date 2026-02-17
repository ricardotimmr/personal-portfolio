import SiteFooter from '../components/SiteFooter'

type WorkProject = {
  id: string
  imageSrc: string
}

const horizontalModules = import.meta.glob('../assets/projects/horizontal/*.{png,jpg,jpeg,webp,avif}', {
  eager: true,
  import: 'default',
}) as Record<string, string>

const verticalModules = import.meta.glob('../assets/projects/vertical/*.{png,jpg,jpeg,webp,avif}', {
  eager: true,
  import: 'default',
}) as Record<string, string>

const optimizedHorizontalModules = import.meta.glob(
  '../assets/projects-optimized/horizontal/*.{png,jpg,jpeg,webp,avif}',
  {
    eager: true,
    import: 'default',
  },
) as Record<string, string>

const optimizedVerticalModules = import.meta.glob(
  '../assets/projects-optimized/vertical/*.{png,jpg,jpeg,webp,avif}',
  {
    eager: true,
    import: 'default',
  },
) as Record<string, string>

function resolveImageSources(
  originalModules: Record<string, string>,
  optimizedModules: Record<string, string>,
  optimizedBasePath: string,
) {
  return Object.entries(originalModules)
    .sort(([pathA], [pathB]) => pathA.localeCompare(pathB))
    .map(([originalPath, originalSource]) => {
      const fileName = originalPath.split('/').at(-1)
      if (!fileName) {
        return originalSource
      }

      const optimizedPath = `${optimizedBasePath}/${fileName}`
      return optimizedModules[optimizedPath] ?? originalSource
    })
}

const horizontalImages = resolveImageSources(
  horizontalModules,
  optimizedHorizontalModules,
  '../assets/projects-optimized/horizontal',
)

const verticalImages = resolveImageSources(
  verticalModules,
  optimizedVerticalModules,
  '../assets/projects-optimized/vertical',
)

function buildWorkProjects(): WorkProject[] {
  const hasHorizontal = horizontalImages.length > 0
  const hasVertical = verticalImages.length > 0

  if (!hasHorizontal && !hasVertical) {
    return []
  }

  if (!hasHorizontal) {
    return verticalImages.map((imageSrc, index) => ({
      id: `v-${index}`,
      imageSrc,
    }))
  }

  if (!hasVertical) {
    return horizontalImages.map((imageSrc, index) => ({
      id: `h-${index}`,
      imageSrc,
    }))
  }

  const projectCount = horizontalImages.length + verticalImages.length
  return Array.from({ length: projectCount }, (_, index) => {
    const prefersHorizontal = index % 2 === 0
    const imageSrc = prefersHorizontal
      ? horizontalImages[(index / 2) % horizontalImages.length]
      : verticalImages[Math.floor(index / 2) % verticalImages.length]

    return {
      id: `project-${index}`,
      imageSrc,
    }
  })
}

function WorkPage() {
  const projects = buildWorkProjects()

  return (
    <main className="work-page">
      <section className="work-section work-section--gallery">
        <div className="work-gallery">
          {projects.map((project) => (
            <article key={project.id} className="work-project">
              <figure className="work-project__media">
                <img className="work-project__image" src={project.imageSrc} alt="" loading="eager" />
                <div className="work-project-action" aria-hidden="true">
                  <span className="work-project-action__cluster">
                    <span className="work-project-action__outer" />
                    <span className="work-project-action__inner" />
                  </span>
                  <span className="work-project-action__text-wrap">
                    <span className="work-project-action__text">OPEN PROJECT</span>
                  </span>
                </div>
              </figure>

              <div className="work-project__content">
                <div className="work-project__block">
                  <p className="work-project__label">PROJECT</p>
                  <p className="work-project__copy">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer facilisis,
                    massa non efficitur viverra, nisl velit posuere neque, ut feugiat justo leo
                    quis est. Donec at lacus et erat luctus feugiat.
                  </p>
                </div>

                <div className="work-project__block work-project__block--role">
                  <p className="work-project__label">ROLE</p>
                  <p className="work-project__copy">
                    Frontend Developer
                    <br />
                    UI Designer
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
      <SiteFooter />
    </main>
  )
}

export default WorkPage
