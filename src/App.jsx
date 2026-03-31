import './index.css'
import { archvizProjects } from './data/projects'

export default function App() {
  return (
    <div className="page">
      <header className="nav">
        <div className="brand">
          <p className="kicker">Portfolio 2026</p>
          <h1>Alberto Stabile</h1>
        </div>

        <nav className="navLinks">
          <a href="#projects">Projects</a>
          <a href="#about">About</a>
          <a href="#contact">Contact</a>
        </nav>
      </header>

      <main>
        <section className="hero">
          <div className="heroText">
            <p className="eyebrow">3D Artist · CGI Artist · VR Developer</p>
            <h2>
              Cinematic visuals for automotive, architecture and immersive
              experiences.
            </h2>
            <p className="lead">
              I create premium CGI images, architectural visualization and
              real-time immersive experiences with a strong focus on mood,
              realism and storytelling.
            </p>

            <div className="ctaRow">
              <a className="btn primary" href="#projects">View Projects</a>
              <a className="btn secondary" href="#contact">Contact Me</a>
            </div>
          </div>

          <div className="heroVisual">
            <div className="visualCard">Hero image / showreel cover</div>
          </div>
        </section>

        <section id="projects" className="section">
          <p className="sectionLabel">Selected Work</p>
          <h3>Archviz Projects</h3>

          <div className="grid">
            {archvizProjects.map((project) => (
              <article className="card" key={project.id}>
                <img className="thumbImage" src={project.cover} alt={project.title} />
                <h4>{project.title}</h4>
                <p>{project.count} images loaded automatically from gallery.</p>
              </article>
            ))}
          </div>
        </section>

        {archvizProjects.map((project) => (
          <section className="section" key={project.slug}>
            <p className="sectionLabel">{project.category}</p>
            <h3>{project.title}</h3>

            <div className="galleryGrid">
              {project.gallery.map((image, index) => (
                <img
                  key={index}
                  className="galleryImage"
                  src={image}
                  alt={`${project.title} ${index + 1}`}
                />
              ))}
            </div>
          </section>
        ))}

        <section id="about" className="section">
          <p className="sectionLabel">About</p>
          <h3>Visual craft + technical execution</h3>
          <p className="textBlock">
            I work across Blender, Unreal Engine, Houdini, Substance Painter,
            Unity, Photoshop and DaVinci Resolve to create visuals that feel
            cinematic, refined and commercially strong.
          </p>
        </section>

        <section id="contact" className="section contactBox">
          <div>
            <p className="sectionLabel">Contact</p>
            <h3>Let’s build something strong</h3>
            <p className="textBlock">
              Available for selected collaborations in automotive CGI, archviz,
              cinematic content and VR experiences.
            </p>
          </div>

          <a className="btn primary" href="mailto:tuamail@email.com">
            Email Me
          </a>
        </section>
      </main>
    </div>
  )
}