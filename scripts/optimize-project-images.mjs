import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync } from 'node:fs'
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

const variantPlanBySlot = {
  thumbnail: {
    widths: [360, 560, 760, 960],
    quality: { jpeg: 78, webp: 72, avif: 56 },
  },
  'detail-01': {
    widths: [640, 960, 1280, 1600],
    quality: { jpeg: 80, webp: 74, avif: 58 },
  },
  'detail-02': {
    widths: [640, 960, 1280, 1600],
    quality: { jpeg: 80, webp: 74, avif: 58 },
  },
  'detail-03': {
    widths: [640, 960, 1280, 1600],
    quality: { jpeg: 80, webp: 74, avif: 58 },
  },
  'detail-04': {
    widths: [640, 960, 1280, 1600],
    quality: { jpeg: 80, webp: 74, avif: 58 },
  },
}

const slots = ['thumbnail', 'detail-01', 'detail-02', 'detail-03', 'detail-04']

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

async function optimizeSlotImage(sharp, inputPath, outputBasePath, slotConfig) {
  const metadata = await sharp(inputPath).metadata()
  assertSourceWithinLimits(inputPath, metadata)

  let outputBytes = 0
  const maxWidth = metadata.width ?? slotConfig.widths[slotConfig.widths.length - 1]
  const widths = slotConfig.widths.filter((width) => width <= maxWidth)
  const finalWidths = widths.length > 0 ? widths : [Math.min(maxWidth, slotConfig.widths[0])]

  for (const width of finalWidths) {
    const base = sharp(inputPath).rotate().resize({ width, withoutEnlargement: true })

    const jpegOutput = `${outputBasePath}-w${width}.jpg`
    await base
      .clone()
      .jpeg({ quality: slotConfig.quality.jpeg, mozjpeg: true, progressive: true })
      .toFile(jpegOutput)
    outputBytes += statSync(jpegOutput).size

    const webpOutput = `${outputBasePath}-w${width}.webp`
    await base.clone().webp({ quality: slotConfig.quality.webp, effort: 5 }).toFile(webpOutput)
    outputBytes += statSync(webpOutput).size

    const avifOutput = `${outputBasePath}-w${width}.avif`
    await base
      .clone()
      .avif({ quality: slotConfig.quality.avif, effort: 6, chromaSubsampling: '4:2:0' })
      .toFile(avifOutput)
    outputBytes += statSync(avifOutput).size
  }

  return {
    inputBytes: statSync(inputPath).size,
    outputBytes,
    width: metadata.width,
    height: metadata.height,
  }
}

async function run() {
  const sharp = await loadSharpOrThrow()

  const content = JSON.parse(readFileSync(projectContentPath, 'utf8'))
  if (!Array.isArray(content)) {
    throw new Error('Expected src/content/projects/projects.json to be an array.')
  }

  ensureDir(generatedRoot)
  ensureDir(archiveRoot)

  let totalInputBytes = 0
  let totalOutputBytes = 0
  let processedSlots = 0

  for (const project of content) {
    if (!project || typeof project !== 'object' || typeof project.slug !== 'string') {
      continue
    }

    const projectSlug = project.slug
    const projectOutputDir = path.resolve(generatedRoot, projectSlug)
    ensureDir(projectOutputDir)

    // Replace only the project's generated variants to avoid stale files.
    rmSync(projectOutputDir, { recursive: true, force: true })
    ensureDir(projectOutputDir)

    const projectArchiveDir = path.resolve(archiveRoot, projectSlug)
    ensureDir(projectArchiveDir)

    for (const slot of slots) {
      const sourcePath = resolveRawSource(projectSlug, slot)
      if (!sourcePath) {
        continue
      }

      const sourceFileName = path.basename(sourcePath)
      const archiveTarget = path.resolve(projectArchiveDir, sourceFileName)
      cpSync(sourcePath, archiveTarget, { force: true })

      const outputBasePath = path.resolve(projectOutputDir, slot)
      const result = await optimizeSlotImage(sharp, sourcePath, outputBasePath, variantPlanBySlot[slot])

      totalInputBytes += result.inputBytes
      totalOutputBytes += result.outputBytes
      processedSlots += 1

      console.log(
        `${projectSlug}/${slot} (${result.width}x${result.height}) ${formatMegabytes(
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
