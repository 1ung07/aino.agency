import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import { initWorkPageAnimations } from '../animations/workPage.js'
import ImageBlock from '../components/ImageBlock.jsx'
import LineList from '../components/LineList.jsx'
import Section from '../components/Section.jsx'
import VideoBlock from '../components/VideoBlock.jsx'
import { workGridProjects } from '../data/data.js'
import { workItems } from '../data/workItems.js'

const workCardAspectRatio = '0.8 / 1'

const Work = () => {
  const rootRef = useRef(null)
  const animationRef = useRef(null)
  const didInitRef = useRef(false)
  const [view, setView] = useState('grid')
  const [activeHref, setActiveHref] = useState('')
  const [listOut, setListOut] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    animationRef.current = initWorkPageAnimations(rootRef.current)

    return () => {
      animationRef.current?.destroy?.()
      animationRef.current = null
    }
  }, [])

  useEffect(() => {
    if (!didInitRef.current) {
      didInitRef.current = true
      return
    }

    if (view === 'grid') {
      animationRef.current?.revealGrid?.()
    } else {
      animationRef.current?.revealList?.()
    }
  }, [view])

  const handleViewChange = (nextView) => {
    if (nextView === view) return

    setView(nextView)
  }

  const handleListClick = (event, item) => {
    if (!item.href) return

    event.preventDefault()
    setActiveHref(item.href)
    setListOut(true)
    window.setTimeout(() => navigate(item.href), 400)
  }

  return (
    <main id="app" ref={rootRef} className={`work-page view-${view}`}>
      <Section className="menu" data-view>
        <div className="col">
          <div className="monocaps projects">Projects</div>
        </div>
        <div className="col">
          <div className="buttons">
            <div className="btn">
              <button
                className={`ghost monocaps ${view === 'grid' ? 'active' : ''}`}
                name="grid"
                type="button"
                onClick={() => handleViewChange('grid')}
              >
                Grid
              </button>
            </div>
            <div className="btn">
              <button
                className={`ghost monocaps ${view === 'list' ? 'active' : ''}`}
                name="list"
                type="button"
                onClick={() => handleViewChange('list')}
              >
                List
              </button>
            </div>
          </div>
        </div>
      </Section>

      <Section className="gridcontainer">
        <div className="span-4">
          <div className="items">
            {workGridProjects.map((project) => (
              <ProjectCase key={project.number} project={project} />
            ))}
          </div>
        </div>
      </Section>

      <Section className="listcontainer">
        <div className="span-4">
          <LineList
            items={workItems}
            activeHref={activeHref}
            out={listOut}
            onItemClick={handleListClick}
          />
        </div>
      </Section>
    </main>
  )
}

const ProjectCase = ({ project }) => (
  <div className="case">
    {project.media.map((media, index) => (
      <ProjectItem key={`${project.number}-${index}`} project={project} media={media} />
    ))}
  </div>
)

const ProjectItem = ({ project, media }) => (
  <div className="item">
    <Link to={project.href}>
      <WorkMedia media={media} />
    </Link>
    <div className="info">
      <div className="number">{project.number}</div>
      <div className="name">{project.name}</div>
      <div className="year">{project.year}</div>
    </div>
  </div>
)

const WorkMedia = ({ media }) => {
  if (media.type === 'video') {
    return <VideoBlock {...media} wrapperClassName="image" aspectRatio={workCardAspectRatio} />
  }

  return (
    <ImageBlock
      {...media}
      aspectRatio={workCardAspectRatio}
      sizes="(max-width: 768px) 75vw, 25vw"
    />
  )
}

export default Work
