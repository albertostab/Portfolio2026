const archvizImages = import.meta.glob(
  '../assets/projects/archviz/*/gallery/*.{png,jpg,jpeg,webp,PNG,JPG,JPEG,WEBP}',
  { eager: true, import: 'default' }
)

function buildArchvizProjects() {
  const grouped = {}

  for (const [path, src] of Object.entries(archvizImages)) {
    const match = path.match(/archviz\/([^/]+)\/gallery\/([^/]+)$/)
    if (!match) continue

    const [, folderId, fileName] = match

    if (!grouped[folderId]) {
      grouped[folderId] = []
    }

    grouped[folderId].push({
      src,
      fileName,
    })
  }

  return Object.entries(grouped)
    .sort((a, b) => Number(a[0]) - Number(b[0]))
    .map(([id, images]) => {
      const sortedImages = images.sort((a, b) =>
        a.fileName.localeCompare(b.fileName, undefined, {
          numeric: true,
          sensitivity: 'base',
        })
      )

      return {
        id,
        slug: `archviz-${id}`,
        title: `Archviz Project ${id}`,
        category: 'Archviz',
        cover: sortedImages[0]?.src || '',
        gallery: sortedImages.map((img) => img.src),
        count: sortedImages.length,
      }
    })
}

export const archvizProjects = buildArchvizProjects()