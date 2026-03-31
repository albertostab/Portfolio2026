const projectImages = import.meta.glob(
  '../assets/projects/{archviz,automotive,cgi}/*/gallery/*.{png,jpg,jpeg,webp,avif,PNG,JPG,JPEG,WEBP,AVIF}',
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

function buildPortfolioCategories() {
  const grouped = {
    cgi: {},
    automotive: {},
    archviz: {},
  }

  for (const [path, src] of Object.entries(projectImages)) {
    const match = path.match(
      /projects\/(archviz|automotive|cgi)\/([^/]+)\/gallery\/([^/]+)$/
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
        const cover = sortedImages[0]?.src || youtubeThumbnail || ''

        return {
          id: `${category}-${folderId}`,
          folderId,
          slug: `${category}-${folderId}`,
          category,
          categoryLabel: CATEGORY_LABELS[category],
          title: formatProjectTitle(category, folderId),
          cover,
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