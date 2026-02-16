import { copyFileSync, mkdirSync, readdirSync, statSync } from 'node:fs'
import path from 'node:path'
import { spawnSync } from 'node:child_process'

const jobs = [
  {
    sourceDir: path.resolve('src/assets/projects/horizontal'),
    targetDir: path.resolve('src/assets/projects-optimized/horizontal'),
  },
  {
    sourceDir: path.resolve('src/assets/projects/vertical'),
    targetDir: path.resolve('src/assets/projects-optimized/vertical'),
  },
]

const supportedExtensions = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif'])
const maxDimension = 2600
const jpegQuality = '82'

const formatSize = (bytes) => `${(bytes / (1024 * 1024)).toFixed(2)} MB`

const optimizeWithSips = (inputFile, outputFile, extension) => {
  const isJpeg = extension === '.jpg' || extension === '.jpeg'
  const args = isJpeg
    ? [
        '-s',
        'format',
        'jpeg',
        '-s',
        'formatOptions',
        jpegQuality,
        '--resampleHeightWidthMax',
        String(maxDimension),
        inputFile,
        '--out',
        outputFile,
      ]
    : ['--resampleHeightWidthMax', String(maxDimension), inputFile, '--out', outputFile]

  const result = spawnSync('sips', args, { encoding: 'utf8' })
  if (result.status !== 0) {
    throw new Error(result.stderr || result.stdout || `sips failed for ${inputFile}`)
  }
}

let optimizedCount = 0
let copiedCount = 0
let inputTotal = 0
let outputTotal = 0

jobs.forEach(({ sourceDir, targetDir }) => {
  mkdirSync(targetDir, { recursive: true })
  const files = readdirSync(sourceDir).sort((a, b) => a.localeCompare(b))

  files.forEach((fileName) => {
    const extension = path.extname(fileName).toLowerCase()
    if (!supportedExtensions.has(extension)) {
      return
    }

    const sourceFile = path.join(sourceDir, fileName)
    const targetFile = path.join(targetDir, fileName)
    const sourceStats = statSync(sourceFile)

    inputTotal += sourceStats.size

    if (sourceStats.size === 0) {
      copyFileSync(sourceFile, targetFile)
      copiedCount += 1
      return
    }

    optimizeWithSips(sourceFile, targetFile, extension)
    optimizedCount += 1

    const targetStats = statSync(targetFile)
    outputTotal += targetStats.size
    console.log(
      `${path.relative(process.cwd(), sourceFile)} -> ${path.relative(process.cwd(), targetFile)} (${formatSize(
        sourceStats.size,
      )} -> ${formatSize(targetStats.size)})`,
    )
  })
})

const saved = Math.max(0, inputTotal - outputTotal)
console.log(
  `Optimized ${optimizedCount} files, copied ${copiedCount} files. Total: ${formatSize(
    inputTotal,
  )} -> ${formatSize(outputTotal)} (saved ${formatSize(saved)}).`,
)
