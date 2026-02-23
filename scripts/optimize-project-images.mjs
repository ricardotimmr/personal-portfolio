import {
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  statSync,
  unlinkSync,
} from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const repoRoot = path.resolve(__dirname, '..')
const projectContentPath = path.resolve(repoRoot, 'src/content/projects/projects.json')
const rawRoot = path.resolve(repoRoot, 'content/projects/raw')
const archiveRoot = path.resolve(repoRoot, 'content/projects/archive')
const generatedRoot = path.resolve(repoRoot, 'src/assets/projects/generated')

const allowedSourceExtensions = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif', '.tiff'])
const strictMaxSourceMegabytes = 18
const strictMaxSourcePixels = 8400
const preserveQualityWhenSourceAtMostMegabytes = 2
const preserveQualityWhenSourceMaxEdgeAtMostPx = 2600

const variantPlanBySlot = {
  thumbnail: {
    widths: [640, 1280, 1920],
    quality: { jpeg: 88, webp: 84, avif: 70 },
  },
  'detail-01': {
    widths: [960, 1600, 2400],
    quality: { jpeg: 90, webp: 86, avif: 72 },
  },
  'detail-02': {
    widths: [960, 1600, 2400],
    quality: { jpeg: 90, webp: 86, avif: 72 },
  },
  'detail-03': {
    widths: [960, 1600, 2400],
    quality: { jpeg: 90, webp: 86, avif: 72 },
  },
  'detail-04': {
    widths: [960, 1600, 2400],
    quality: { jpeg: 90, webp: 86, avif: 72 },
  },
}

const slots = ['thumbnail', 'detail-01', 'detail-02', 'detail-03', 'detail-04']
const supportedCliOptions = new Set(['--project', '--slot'])

function parseCliOptions() {
  const options = {
    project: null,
    slots: null,
  }

  const args = process.argv.slice(2)
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index]

    if (!supportedCliOptions.has(arg)) {
      throw new Error(
        `Unknown option "${arg}". Supported options: --project <slug>, --slot <slot|comma,list>.`,
      )
    }

    const value = args[index + 1]
    if (!value || value.startsWith('--')) {
      throw new Error(`Missing value for ${arg}.`)
    }

    if (arg === '--project') {
      options.project = value
      index += 1
      continue
    }

    if (arg === '--slot') {
      const requestedSlots = value
        .split(',')
        .map((slot) => slot.trim())
        .filter((slot) => slot.length > 0)

      const invalid = requestedSlots.filter((slot) => !slots.includes(slot))
      if (invalid.length > 0) {
        throw new Error(
          `Invalid slot(s): ${invalid.join(', ')}. Allowed: ${slots.join(', ')}`,
        )
      }

      options.slots = requestedSlots.length > 0 ? requestedSlots : null
      index += 1
    }
  }

  return options
}

async function loadSharpOrThrow() {
  try {
    const sharpModule = await import('sharp')
    return sharpModule.default
  } catch {
    throw new Error(
      'Missing dependency "sharp". Run "npm install" and then run "npm run optimize:projects" again.',
    )
  }
}

function formatMegabytes(bytes) {
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

function ensureDir(dirPath) {
  mkdirSync(dirPath, { recursive: true })
}

function listImages(dirPath) {
  if (!existsSync(dirPath)) {
    return []
  }

  return readdirSync(dirPath)
    .filter((entry) => allowedSourceExtensions.has(path.extname(entry).toLowerCase()))
    .sort((a, b) => a.localeCompare(b))
}

function resolveRawSource(projectSlug, slot) {
  const projectRawDir = path.resolve(rawRoot, projectSlug)
  const candidates = listImages(projectRawDir)
  const preferredPrefix = `${slot}.`
  const exactMatch = candidates.find((fileName) => fileName.startsWith(preferredPrefix))

  if (!exactMatch) {
    return null
  }

  return path.resolve(projectRawDir, exactMatch)
}

function assertSourceWithinLimits(sourcePath, metadata) {
  const stats = statSync(sourcePath)
  if (stats.size > strictMaxSourceMegabytes * 1024 * 1024) {
    throw new Error(
      `Source image exceeds ${strictMaxSourceMegabytes} MB: ${path.relative(repoRoot, sourcePath)}`,
    )
  }

  if (!metadata.width || !metadata.height) {
    throw new Error(`Could not read dimensions for ${path.relative(repoRoot, sourcePath)}`)
  }

  if (metadata.width > strictMaxSourcePixels || metadata.height > strictMaxSourcePixels) {
    throw new Error(
      `Source image exceeds max dimension ${strictMaxSourcePixels}px: ${path.relative(
        repoRoot,
        sourcePath,
      )} (${metadata.width}x${metadata.height})`,
    )
  }
}

function getEncodePlan(inputPath, metadata, slotConfig) {
  const inputStats = statSync(inputPath)
  const sourceMegabytes = inputStats.size / (1024 * 1024)
  const maxEdge = Math.max(metadata.width ?? 0, metadata.height ?? 0)
  const sourceWidth = metadata.width ?? slotConfig.widths[slotConfig.widths.length - 1]
  const standardWidths = slotConfig.widths.filter((width) => width <= sourceWidth)
  const resolvedStandardWidths =
    standardWidths.length > 0 ? standardWidths : [Math.min(sourceWidth, slotConfig.widths[0])]

  const shouldPreserveQuality =
    sourceMegabytes <= preserveQualityWhenSourceAtMostMegabytes ||
    maxEdge <= preserveQualityWhenSourceMaxEdgeAtMostPx

  if (!shouldPreserveQuality) {
    return {
      mode: 'standard',
      widths: resolvedStandardWidths,
      quality: slotConfig.quality,
      inputBytes: inputStats.size,
    }
  }

  return {
    mode: 'preserve',
    widths: [sourceWidth],
    quality: {
      jpeg: 96,
      webp: 95,
      avif: 88,
    },
    inputBytes: inputStats.size,
  }
}

async function optimizeSlotImage(sharp, inputPath, outputBasePath, slotConfig) {
  const metadata = await sharp(inputPath).metadata()
  assertSourceWithinLimits(inputPath, metadata)

  const encodePlan = getEncodePlan(inputPath, metadata, slotConfig)
  let outputBytes = 0

  for (const width of encodePlan.widths) {
    const base = sharp(inputPath).rotate().resize({ width, withoutEnlargement: true })

    const jpegOutput = `${outputBasePath}-w${width}.jpg`
    await base
      .clone()
      .jpeg({ quality: encodePlan.quality.jpeg, mozjpeg: true, progressive: true })
      .toFile(jpegOutput)
    outputBytes += statSync(jpegOutput).size

    const webpOutput = `${outputBasePath}-w${width}.webp`
    await base.clone().webp({ quality: encodePlan.quality.webp, effort: 5 }).toFile(webpOutput)
    outputBytes += statSync(webpOutput).size

    const avifOutput = `${outputBasePath}-w${width}.avif`
    await base
      .clone()
      .avif({ quality: encodePlan.quality.avif, effort: 5, chromaSubsampling: '4:4:4' })
      .toFile(avifOutput)
    outputBytes += statSync(avifOutput).size
  }

  return {
    inputBytes: encodePlan.inputBytes,
    outputBytes,
    width: metadata.width,
    height: metadata.height,
    mode: encodePlan.mode,
  }
}

function removeExistingGeneratedSlotFiles(projectOutputDir, slot) {
  if (!existsSync(projectOutputDir)) {
    return
  }

  const entryNames = readdirSync(projectOutputDir)
  const slotPrefix = `${slot}-w`
  entryNames.forEach((entryName) => {
    if (!entryName.startsWith(slotPrefix)) {
      return
    }

    const extension = path.extname(entryName).toLowerCase()
    if (!['.jpg', '.jpeg', '.webp', '.avif'].includes(extension)) {
      return
    }

    unlinkSync(path.resolve(projectOutputDir, entryName))
  })
}

async function run() {
  const sharp = await loadSharpOrThrow()
  const cliOptions = parseCliOptions()

  const content = JSON.parse(readFileSync(projectContentPath, 'utf8'))
  if (!Array.isArray(content)) {
    throw new Error('Expected src/content/projects/projects.json to be an array.')
  }

  ensureDir(generatedRoot)
  ensureDir(archiveRoot)

  let totalInputBytes = 0
  let totalOutputBytes = 0
  let processedSlots = 0

  const selectedProjects = content.filter((project) => {
    if (!project || typeof project !== 'object' || typeof project.slug !== 'string') {
      return false
    }

    if (!cliOptions.project) {
      return true
    }

    return project.slug === cliOptions.project
  })

  if (cliOptions.project && selectedProjects.length === 0) {
    throw new Error(`Project "${cliOptions.project}" not found in content JSON.`)
  }

  const activeSlots = cliOptions.slots ?? slots

  for (const project of selectedProjects) {
    if (!project || typeof project !== 'object' || typeof project.slug !== 'string') {
      continue
    }

    const projectSlug = project.slug
    const projectOutputDir = path.resolve(generatedRoot, projectSlug)
    const slotSources = activeSlots
      .map((slot) => ({ slot, sourcePath: resolveRawSource(projectSlug, slot) }))
      .filter((entry) => entry.sourcePath !== null)

    // Keep existing generated variants when no new raw sources are present.
    if (slotSources.length === 0) {
      console.log(`Skipping ${projectSlug}: no raw slot images found.`)
      continue
    }

    ensureDir(projectOutputDir)

    const projectArchiveDir = path.resolve(archiveRoot, projectSlug)
    ensureDir(projectArchiveDir)

    for (const { slot, sourcePath } of slotSources) {
      // Replace only this slot's generated variants, keep other slots intact.
      removeExistingGeneratedSlotFiles(projectOutputDir, slot)

      const sourceFileName = path.basename(sourcePath)
      const archiveTarget = path.resolve(projectArchiveDir, sourceFileName)
      cpSync(sourcePath, archiveTarget, { force: true })

      const outputBasePath = path.resolve(projectOutputDir, slot)
      const result = await optimizeSlotImage(sharp, sourcePath, outputBasePath, variantPlanBySlot[slot])

      totalInputBytes += result.inputBytes
      totalOutputBytes += result.outputBytes
      processedSlots += 1

      console.log(
        `${projectSlug}/${slot} [${result.mode}] (${result.width}x${result.height}) ${formatMegabytes(
          result.inputBytes,
        )} -> ${formatMegabytes(result.outputBytes)}`,
      )
    }
  }

  const savedBytes = Math.max(0, totalInputBytes - totalOutputBytes)
  console.log(
    `Processed ${processedSlots} slot image sets. Total source ${formatMegabytes(
      totalInputBytes,
    )}, generated ${formatMegabytes(totalOutputBytes)}, saved ${formatMegabytes(savedBytes)}.`,
  )
}

run().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error))
  process.exitCode = 1
})
