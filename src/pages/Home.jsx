import { Link } from 'react-router-dom'
import Column from '../components/Column.jsx'
import HomeIntro from '../components/HomeIntro.jsx'
import MediaBlock from '../components/MediaBlock.jsx'
import Section from '../components/Section.jsx'
import { homeProjects } from '../data/data.js'

const homeRows = [
  { marginTop: 0, projects: homeProjects.slice(0, 2) },
  { marginTop: 5, between: true, projects: homeProjects.slice(2, 4) },
  { marginTop: 6, projects: homeProjects.slice(4, 6) },
  { marginTop: 6, projects: homeProjects.slice(6, 7) },
  { marginTop: 6, projects: homeProjects.slice(7, 10) },
  { marginTop: 6, projects: homeProjects.slice(10, 11) },
]

const Home = () => {
  return (
    <main id="app" className="home-page">
      <HomeIntro />
      <div className="home-content">
        <div className="sections" data-slug="home">
          <WorkRow row={homeRows[0]} />
          <IntroSection />
          {homeRows.slice(1).map((row) => (
            <WorkRow key={row.marginTop + row.projects[0].href} row={row} />
          ))}
        </div>
        <Section className="space" />
      </div>
    </main>
  )
}

const WorkRow = ({ row }) => (
  <Section marginTop={row.marginTop} between={row.between}>
    {row.projects.map((project) => (
      <ProjectCard key={project.href} project={project} />
    ))}
  </Section>
)

const ProjectCard = ({ project }) => (
  <Column as={Link} to={project.href} width={project.width} burn>
    <MediaBlock {...project.media} />
    <div className="html">
      <h3>{project.title}</h3>
    </div>
  </Column>
)

const IntroSection = () => (
  <Section marginTop={5}>
    <Column width={5}>
      <div className="html">
        <p className="mega">
          We build premium storefronts where brands grow and consumers fall in love.
        </p>
        <br />
        <div className="home-actions">
          <Link to="/work" className="button">
            All work
          </Link>
          <Link to="/services" className="button">
            Our services
          </Link>
        </div>
      </div>
    </Column>
  </Section>
)

export default Home
