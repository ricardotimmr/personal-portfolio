export type ProjectOrientation = 'landscape' | 'portrait'

export type ProjectRecord = {
  id: string
  slug: string
  title: string
  imageSrc: string
  orientation: ProjectOrientation
  description: string
  roles: string[]
  visitUrl?: string
}

type ResolvedImageEntry = {
  key: string
  src: string
  orientation: ProjectOrientation
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

const PROJECT_ROLES = [
  ['Frontend Developer', 'UI Designer'],
  ['Product Designer', 'Frontend Developer'],
  ['Interaction Designer', 'UI Engineer'],
  ['Frontend Developer', 'Design Systems'],
  ['UX Designer', 'Frontend Developer'],
  ['Design Engineer', 'Interaction Designer'],
  ['UI Designer', 'Motion Designer'],
  ['Frontend Engineer', 'Accessibility Lead'],
]

function createProjectCopy(index: number) {
  const projectNumber = String(index + 1).padStart(2, '0')

  return `Project ${projectNumber} balances visual restraint, clear interaction pacing, and reliable implementation for polished, high-quality digital product experiences.`
}

function createProjectRoles(index: number) {
  return PROJECT_ROLES[index % PROJECT_ROLES.length]
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/\.[^/.]+$/, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function resolveImageEntries(
  originalModules: Record<string, string>,
  optimizedModules: Record<string, string>,
  optimizedBasePath: string,
  orientation: ProjectOrientation,
) {
  return Object.entries(originalModules)
    .sort(([pathA], [pathB]) => pathA.localeCompare(pathB))
    .map(([originalPath, originalSource]) => {
      const fileName = originalPath.split('/').at(-1)
      if (!fileName) {
        return null
      }

      const optimizedPath = `${optimizedBasePath}/${fileName}`
      return {
        key: slugify(fileName),
        src: optimizedModules[optimizedPath] ?? originalSource,
        orientation,
      }
    })
    .filter((entry): entry is ResolvedImageEntry => entry !== null)
}

const horizontalEntries = resolveImageEntries(
  horizontalModules,
  optimizedHorizontalModules,
  '../assets/projects-optimized/horizontal',
  'landscape',
)

const verticalEntries = resolveImageEntries(
  verticalModules,
  optimizedVerticalModules,
  '../assets/projects-optimized/vertical',
  'portrait',
)

function buildProjects() {
  const hasHorizontal = horizontalEntries.length > 0
  const hasVertical = verticalEntries.length > 0

  if (!hasHorizontal && !hasVertical) {
    return []
  }

  const mixedEntries: ResolvedImageEntry[] = []

  if (!hasHorizontal) {
    mixedEntries.push(...verticalEntries)
  } else if (!hasVertical) {
    mixedEntries.push(...horizontalEntries)
  } else {
    let horizontalIndex = 0
    let verticalIndex = 0
    const totalCount = horizontalEntries.length + verticalEntries.length

    for (let index = 0; index < totalCount; index += 1) {
      const shouldUseHorizontal =
        (index % 2 === 0 && horizontalIndex < horizontalEntries.length) ||
        verticalIndex >= verticalEntries.length

      if (shouldUseHorizontal) {
        mixedEntries.push(horizontalEntries[horizontalIndex])
        horizontalIndex += 1
      } else {
        mixedEntries.push(verticalEntries[verticalIndex])
        verticalIndex += 1
      }
    }
  }

  return mixedEntries.map((entry, index) => {
    const projectNumber = String(index + 1).padStart(2, '0')

    return {
      id: `project-${index}`,
      slug: `${projectNumber}-${entry.key}`,
      title: `PROJECT ${projectNumber}`,
      imageSrc: entry.src,
      orientation: entry.orientation,
      description: createProjectCopy(index),
      roles: createProjectRoles(index),
      visitUrl: undefined,
    }
  })
}

export const PROJECTS: ProjectRecord[] = buildProjects()

export function getProjectBySlug(slug: string) {
  return PROJECTS.find((project) => project.slug === slug) ?? null
}
