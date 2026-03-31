const projectImages = import.meta.glob(
  '../assets/projects-optimized/{archviz,automotive,cgi}/*/gallery/*.{webp,avif,png,jpg,jpeg,WEBP,AVIF,PNG,JPG,JPEG}',
  { eager: true, import: 'default' }
)

const projectCovers = import.meta.glob(
  '../assets/projects-optimized/{archviz,automotive,cgi}/*/cover/*.{webp,avif,png,jpg,jpeg,WEBP,AVIF,PNG,JPG,JPEG}',
  { eager: true, import: 'default' }
)

const projectHeroes = import.meta.glob(
  '../assets/projects-optimized/{archviz,automotive,cgi}/*/hero/*.{webp,avif,png,jpg,jpeg,WEBP,AVIF,PNG,JPG,JPEG}',
  { eager: true, import: 'default' }
)

const CATEGORY_LABELS = {
  cgi: 'Showreel',
  automotive: 'Automotive',
  archviz: 'Archviz',
}

const YOUTUBE_VIDEOS = {
  cgi: {
    '01': 'Fh2MtmAMtN4',
  },
  automotive: {},
  archviz: {},
}

const TITLE_OVERRIDES = {
  cgi: {
    '01': 'Showreel',
  },
  automotive: {},
  archviz: {},
}

function naturalSort(a, b) {
  return a.localeCompare(b, undefined, {
    numeric: true,
    sensitivity: 'base',
  })
}

function formatProjectTitle(category, folderId) {
  const override = TITLE_OVERRIDES[category]?.[folderId]
  if (override) return override

  if (/^\d+$/.test(folderId)) {
    return `${CATEGORY_LABELS[category]} ${folderId}`
  }

  return folderId
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

function buildEmbedUrl(videoId) {
  if (!videoId) return null

  return `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=1&rel=0&playsinline=1`
}

function buildYoutubeThumbnail(videoId) {
  if (!videoId) return ''
  return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`
}

function buildAssetMap(files, segmentName) {
  const map = {}

  for (const [path, src] of Object.entries(files)) {
    const match = path.match(
      new RegExp(
        `projects-optimized\\/(archviz|automotive|cgi)\\/([^/]+)\\/${segmentName}\\/([^/]+)$`
      )
    )

    if (!match) continue

    const [, category, folderId] = match
    const key = `${category}/${folderId}`

    if (!map[key]) {
      map[key] = []
    }

    map[key].push(src)
  }

  for (const key of Object.keys(map)) {
    map[key].sort(naturalSort)
  }

  return map
}

function buildPortfolioCategories() {
  const grouped = {
    cgi: {},
    automotive: {},
    archviz: {},
  }

  for (const [path, src] of Object.entries(projectImages)) {
    const match = path.match(
      /projects-optimized\/(archviz|automotive|cgi)\/([^/]+)\/gallery\/([^/]+)$/
    )

    if (!match) continue

    const [, category, folderId, fileName] = match

    if (!grouped[category][folderId]) {
      grouped[category][folderId] = []
    }

    grouped[category][folderId].push({
      src,
      fileName,
    })
  }

  for (const [category, videos] of Object.entries(YOUTUBE_VIDEOS)) {
    for (const folderId of Object.keys(videos)) {
      if (!grouped[category][folderId]) {
        grouped[category][folderId] = []
      }
    }
  }

  const coverMap = buildAssetMap(projectCovers, 'cover')
  const heroMap = buildAssetMap(projectHeroes, 'hero')

  return ['cgi', 'automotive', 'archviz'].map((category) => {
    const projects = Object.entries(grouped[category])
      .sort((a, b) => naturalSort(a[0], b[0]))
      .map(([folderId, images]) => {
        const sortedImages = [...images].sort((a, b) =>
          naturalSort(a.fileName, b.fileName)
        )

        const youtubeId = YOUTUBE_VIDEOS[category]?.[folderId] || null
        const embedUrl = buildEmbedUrl(youtubeId)
        const youtubeThumbnail = buildYoutubeThumbnail(youtubeId)

        const key = `${category}/${folderId}`
        const customCover = coverMap[key]?.[0] || ''
        const customHero = heroMap[key]?.[0] || ''

        const cover = customCover || sortedImages[0]?.src || youtubeThumbnail || ''
        const hero = customHero || cover || youtubeThumbnail || ''

        return {
          id: `${category}-${folderId}`,
          folderId,
          slug: `${category}-${folderId}`,
          category,
          categoryLabel: CATEGORY_LABELS[category],
          title: formatProjectTitle(category, folderId),
          cover,
          hero,
          gallery: sortedImages.map((img) => img.src),
          count: sortedImages.length,
          youtubeId,
          embedUrl,
          isVideoProject: Boolean(embedUrl),
        }
      })

    return {
      id: category,
      label: CATEGORY_LABELS[category],
      projects,
    }
  })
}

export const portfolioCategories = buildPortfolioCategories()