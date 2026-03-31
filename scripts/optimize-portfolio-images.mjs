import fs from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'

const ROOT = process.cwd()

const PROJECTS_SOURCE_ROOT = path.join(ROOT, 'src', 'assets', 'projects')
const PROJECTS_OUTPUT_ROOT = path.join(ROOT, 'src', 'assets', 'projects-optimized')

const PROFILE_SOURCE_ROOT = path.join(ROOT, 'src', 'assets', 'profile')
const PROFILE_OUTPUT_ROOT = path.join(ROOT, 'src', 'assets', 'profile-optimized')

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
  profile: {
    width: 1200,
    height: 1200,
    quality: 80,
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

async function clearOutputDir(dirPath) {
  await fs.rm(dirPath, { recursive: true, force: true })
  await ensureDir(dirPath)
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
  const sourceProjectDir = path.join(PROJECTS_SOURCE_ROOT, category, projectId)
  const sourceGalleryDir = path.join(sourceProjectDir, 'gallery')
  const galleryImages = await listImages(sourceGalleryDir)

  if (!galleryImages.length) {
    return
  }

  const outputProjectDir = path.join(PROJECTS_OUTPUT_ROOT, category, projectId)
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

  console.log(`Optimized project: ${category}/${projectId} (${galleryImages.length} images)`)
}

async function findProfileSourceFile() {
  const images = await listImages(PROFILE_SOURCE_ROOT)
  if (!images.length) return null

  const exactMatch = images.find((fileName) => path.parse(fileName).name === 'profile')
  if (exactMatch) {
    return path.join(PROFILE_SOURCE_ROOT, exactMatch)
  }

  return path.join(PROFILE_SOURCE_ROOT, images[0])
}

async function processProfileImage() {
  const sourceProfileFile = await findProfileSourceFile()

  if (!sourceProfileFile) {
    console.log('No profile image found. Skipping profile optimization.')
    return
  }

  const outputProfileFile = path.join(PROFILE_OUTPUT_ROOT, 'profile.webp')

  await ensureDir(PROFILE_OUTPUT_ROOT)
  await writeOptimizedWebp(sourceProfileFile, outputProfileFile, SIZES.profile)

  console.log('Optimized profile image.')
}

async function main() {
  await clearOutputDir(PROJECTS_OUTPUT_ROOT)
  await clearOutputDir(PROFILE_OUTPUT_ROOT)

  for (const category of CATEGORIES) {
    const categoryDir = path.join(PROJECTS_SOURCE_ROOT, category)
    const projectIds = await listDirectories(categoryDir)

    for (const projectId of projectIds) {
      await processProject(category, projectId)
    }
  }

  await processProfileImage()

  console.log('Portfolio image optimization completed.')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})