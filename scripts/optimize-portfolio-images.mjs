import fs from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'

const ROOT = process.cwd()
const SOURCE_ROOT = path.join(ROOT, 'src', 'assets', 'projects')
const OUTPUT_ROOT = path.join(ROOT, 'src', 'assets', 'projects-optimized')

const CATEGORIES = ['cgi', 'automotive', 'archviz']
const VALID_EXTENSIONS = new Set([
  '.jpg',
  '.jpeg',
  '.png',
  '.webp',
  '.avif',
  '.JPG',
  '.JPEG',
  '.PNG',
  '.WEBP',
  '.AVIF',
])

const SIZES = {
  cover: {
    width: 900,
    height: 900,
    quality: 72,
  },
  hero: {
    width: 1920,
    height: 1400,
    quality: 80,
  },
  gallery: {
    width: 1800,
    height: 1800,
    quality: 78,
  },
}

function naturalSort(a, b) {
  return a.localeCompare(b, undefined, {
    numeric: true,
    sensitivity: 'base',
  })
}

function isImageFile(fileName) {
  return VALID_EXTENSIONS.has(path.extname(fileName))
}

async function ensureDir(dirPath) {
  await fs.mkdir(dirPath, { recursive: true })
}

async function fileExists(filePath) {
  try {
    await fs.access(filePath)
    return true
  } catch {
    return false
  }
}

async function clearOutputRoot() {
  await fs.rm(OUTPUT_ROOT, { recursive: true, force: true })
  await ensureDir(OUTPUT_ROOT)
}

async function listDirectories(dirPath) {
  if (!(await fileExists(dirPath))) return []

  const entries = await fs.readdir(dirPath, { withFileTypes: true })
  return entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort(naturalSort)
}

async function listImages(dirPath) {
  if (!(await fileExists(dirPath))) return []

  const entries = await fs.readdir(dirPath, { withFileTypes: true })

  return entries
    .filter((entry) => entry.isFile() && isImageFile(entry.name))
    .map((entry) => entry.name)
    .sort(naturalSort)
}

async function writeOptimizedWebp(sourceFile, outputFile, options) {
  await ensureDir(path.dirname(outputFile))

  await sharp(sourceFile, {
    failOn: 'warning',
    sequentialRead: true,
  })
    .autoOrient()
    .resize({
      width: options.width,
      height: options.height,
      fit: 'inside',
      withoutEnlargement: true,
    })
    .webp({
      quality: options.quality,
      effort: 4,
    })
    .toFile(outputFile)
}

async function processProject(category, projectId) {
  const sourceProjectDir = path.join(SOURCE_ROOT, category, projectId)
  const sourceGalleryDir = path.join(sourceProjectDir, 'gallery')
  const galleryImages = await listImages(sourceGalleryDir)

  if (!galleryImages.length) {
    return
  }

  const outputProjectDir = path.join(OUTPUT_ROOT, category, projectId)
  const outputGalleryDir = path.join(outputProjectDir, 'gallery')
  const outputCoverDir = path.join(outputProjectDir, 'cover')
  const outputHeroDir = path.join(outputProjectDir, 'hero')

  await ensureDir(outputGalleryDir)
  await ensureDir(outputCoverDir)
  await ensureDir(outputHeroDir)

  const firstImageName = galleryImages[0]
  const firstImagePath = path.join(sourceGalleryDir, firstImageName)

  await writeOptimizedWebp(
    firstImagePath,
    path.join(outputCoverDir, 'cover.webp'),
    SIZES.cover
  )

  await writeOptimizedWebp(
    firstImagePath,
    path.join(outputHeroDir, 'hero.webp'),
    SIZES.hero
  )

  for (const imageName of galleryImages) {
    const sourceImagePath = path.join(sourceGalleryDir, imageName)
    const outputImageName = `${path.parse(imageName).name}.webp`
    const outputImagePath = path.join(outputGalleryDir, outputImageName)

    await writeOptimizedWebp(sourceImagePath, outputImagePath, SIZES.gallery)
  }

  console.log(`Optimized: ${category}/${projectId} (${galleryImages.length} images)`)
}

async function main() {
  await clearOutputRoot()

  for (const category of CATEGORIES) {
    const categoryDir = path.join(SOURCE_ROOT, category)
    const projectIds = await listDirectories(categoryDir)

    for (const projectId of projectIds) {
      await processProject(category, projectId)
    }
  }

  console.log('Portfolio image optimization completed.')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})