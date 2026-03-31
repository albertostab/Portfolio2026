import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import './index.css'
import { portfolioCategories } from './data/projects'
import { profile } from './data/profile'
import profileImage from './assets/profile/profile.png'

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  },
}

function getDisplayLabel(categoryId, fallbackLabel = '') {
  if (categoryId === 'cgi') return 'Showreel'
  if (categoryId === 'automotive') return 'Automotive'
  if (categoryId === 'archviz') return 'Archviz'
  return fallbackLabel
}

export default function App() {
  const categories = useMemo(() => {
    const orderedIds = ['cgi', 'automotive', 'archviz']

    return orderedIds
      .map((id) => portfolioCategories.find((category) => category.id === id))
      .filter(Boolean)
  }, [])

  const firstAvailableCategoryId =
    categories.find((category) => category.projects.length > 0)?.id ||
    categories[0]?.id ||
    ''

  const [activeCategoryId, setActiveCategoryId] = useState(firstAvailableCategoryId)

  const [activeProjectId, setActiveProjectId] = useState(() => {
    const firstCategory = categories.find(
      (category) => category.id === firstAvailableCategoryId
    )
    return firstCategory?.projects[0]?.id || ''
  })

  useEffect(() => {
    const activeCategory = categories.find(
      (category) => category.id === activeCategoryId
    )

    const firstProjectId = activeCategory?.projects[0]?.id || ''

    const hasActiveProject = activeCategory?.projects.some(
      (project) => project.id === activeProjectId
    )

    if (!hasActiveProject) {
      setActiveProjectId(firstProjectId)
    }
  }, [activeCategoryId, activeProjectId, categories])

  const activeCategory =
    categories.find((category) => category.id === activeCategoryId) ||
    categories[0] ||
    null

  const activeProject =
    activeCategory?.projects.find((project) => project.id === activeProjectId) ||
    activeCategory?.projects[0] ||
    null

  const heroImage = activeProject?.hero || activeProject?.cover || ''

  return (
    <div className="site">
      <header className="topbar">
        <a className="brand" href="#top">
          <span className="brandKicker">Portfolio 2026</span>
          <span className="brandName">Alberto Stabile</span>
        </a>

        <nav className="nav">
          <a href="#projects">Projects</a>
          <a href="#about">About</a>
          <a href="#contact">Contact</a>
        </nav>
      </header>

      <main id="top">
        <section className="hero">
          <AnimatePresence mode="wait">
            {heroImage && (
              <motion.img
                key={heroImage}
                className="heroBg"
                src={heroImage}
                alt={activeProject?.title || 'Featured project'}
                loading="eager"
                fetchPriority="high"
                decoding="async"
                initial={{ opacity: 0, scale: 1.04 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              />
            )}
          </AnimatePresence>

          <div className="heroOverlay" />

          <div className="heroInner">
            <motion.div
              className="heroCopy"
              variants={fadeUp}
              initial="hidden"
              animate="show"
            >
              <p className="eyebrow">
                3D Artist <span className="metaDot" aria-hidden="true">&bull;</span> CGI Artist{' '}
                <span className="metaDot" aria-hidden="true">&bull;</span> VR Developer
              </p>

              <h1>Premium visuals for architecture, automotive and immersive experiences.</h1>

              <p className="heroLead">
                I create cinematic CGI, architectural visualization and real-time
                interactive work with a strong focus on atmosphere, realism and
                presentation.
              </p>

              <div className="heroActions">
                <a className="btn btnPrimary" href="#projects">
                  Selected Work
                </a>
                <a className="btn btnSecondary" href="#contact">
                  Contact
                </a>
              </div>
            </motion.div>

            <motion.aside
              className="heroPanel"
              variants={fadeUp}
              initial="hidden"
              animate="show"
              transition={{ delay: 0.08 }}
            >
              <p className="panelLabel">Featured Project</p>
              <h2>{activeProject?.title || 'No project selected'}</h2>
              <p className="panelMeta">
                {getDisplayLabel(activeProject?.category, activeProject?.categoryLabel || 'Portfolio')}
                <span className="metaDot" aria-hidden="true">&bull;</span>
                {activeProject?.folderId || '--'}
              </p>
            </motion.aside>
          </div>
        </section>

        <motion.section
          className="section"
          id="projects"
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.15 }}
        >
          <div className="sectionHead">
            <div>
              <p className="sectionEyebrow">Selected Work</p>
              <h2>Projects</h2>
            </div>
          </div>

          <div className="categoryTabs">
            {categories.map((category) => {
              const isActive = category.id === activeCategoryId
              const isEmpty = category.projects.length === 0

              return (
                <button
                  key={category.id}
                  type="button"
                  className={isActive ? 'categoryTab isActive' : 'categoryTab'}
                  onClick={() => {
                    setActiveCategoryId(category.id)
                    setActiveProjectId(category.projects[0]?.id || '')
                  }}
                  disabled={isEmpty}
                >
                  <span>{getDisplayLabel(category.id, category.label)}</span>
                  <span className="categoryCount">{category.projects.length}</span>
                </button>
              )
            })}
          </div>

          {activeCategory?.id !== 'cgi' && (
            <AnimatePresence mode="wait">
              <motion.div
                key={activeCategoryId}
                className="projectGrid"
                initial={{ opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              >
                {activeCategory?.projects.length ? (
                  activeCategory.projects.map((project, index) => (
                    <motion.button
                      key={project.id}
                      type="button"
                      className={
                        project.id === activeProject?.id
                          ? 'projectCard isActive'
                          : 'projectCard'
                      }
                      onClick={() => setActiveProjectId(project.id)}
                      initial={{ opacity: 0, y: 18 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.06, duration: 0.35 }}
                    >
                      <div className="projectImageWrap">
                        <img
                          className="projectImage"
                          src={project.cover}
                          alt={project.title}
                          loading="lazy"
                          decoding="async"
                        />
                      </div>

                      <div className="projectMeta">
                        <p className="projectCategory">
                          {getDisplayLabel(project.category, project.categoryLabel)}
                        </p>
                        <h3>{project.title}</h3>
                        <p className="projectCount">{project.count} images</p>
                      </div>
                    </motion.button>
                  ))
                ) : (
                  <div className="emptyState">
                    No {getDisplayLabel(activeCategory?.id, activeCategory?.label)} projects yet.
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          )}
        </motion.section>

        <AnimatePresence mode="wait">
          {activeProject && (
            <motion.section
              key={activeProject.id}
              className="section activeProjectSection"
              id="active-project"
              initial={{ opacity: 0, y: 26 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -18 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="sectionHead">
                <div>
                  <p className="sectionEyebrow">Current Project</p>
                  <h2>{activeProject.title}</h2>
                </div>
              </div>

              {activeProject.isVideoProject ? (
                <div className="projectPreviewVideo">
                  <iframe
                    key={activeProject.id}
                    src={activeProject.embedUrl}
                    title={activeProject.title}
                    allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                    allowFullScreen
                    referrerPolicy="strict-origin-when-cross-origin"
                  />
                </div>
              ) : (
                <div className="galleryGrid">
                  {activeProject.gallery.map((image, index) => (
                    <motion.figure
                      className={
                        index === 0 ? 'galleryItem galleryItemLarge' : 'galleryItem'
                      }
                      key={`${activeProject.id}-${index}`}
                      initial={{ opacity: 0, y: 18 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.04, duration: 0.35 }}
                    >
                      <img
                        className="galleryImage"
                        src={image}
                        alt={`${activeProject.title} ${index + 1}`}
                        loading={index === 0 ? 'eager' : 'lazy'}
                        fetchPriority={index === 0 ? 'high' : 'auto'}
                        decoding="async"
                      />
                    </motion.figure>
                  ))}
                </div>
              )}
            </motion.section>
          )}
        </AnimatePresence>

        <motion.section
          className="section aboutSection"
          id="about"
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
        >
          <div className="sectionHead narrow">
            <div>
              <p className="sectionEyebrow">About</p>
              <h2>Visual craft with technical execution.</h2>
            </div>
          </div>

          <div className="aboutLayout">
            <div className="aboutImageWrap">
              <img
                className="aboutImage"
                src={profileImage}
                alt={profile.name}
                loading="lazy"
                decoding="async"
              />
            </div>

            <div className="aboutContent">
              <p className="aboutRole">{profile.role}</p>
              <p className="aboutText">{profile.bio}</p>
            </div>
          </div>
        </motion.section>

        <motion.section
          className="section contactSection"
          id="contact"
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
        >
          <div className="contactCard">
            <div>
              <p className="sectionEyebrow">Contact</p>
              <h2>Let’s build something strong.</h2>

              <div className="contactLinks">
                <a href="mailto:a.stabile.vr@gmail.com">a.stabile.vr@gmail.com</a>
                <a href="tel:+393349115851">+39 334 911 5851</a>
              </div>
            </div>

            <div className="heroActions">
              <a className="btn btnPrimary" href="mailto:a.stabile.vr@gmail.com">
                Email Me
              </a>
              <a className="btn btnSecondary" href="tel:+393349115851">
                Call Me
              </a>
            </div>
          </div>
        </motion.section>
      </main>
    </div>
  )
}