import { Navigate, useParams } from 'react-router-dom'
import CaseFooter from '../../components/CaseFooter.jsx'
import Column from '../../components/Column.jsx'
import MediaBlock from '../../components/MediaBlock.jsx'
import Section from '../../components/Section.jsx'
import { caseStudiesBySlug } from '../../data/caseStudies.js'

const CaseDetail = ({ slug: fixedSlug }) => {
  const { id } = useParams()
  const study = caseStudiesBySlug.get(fixedSlug || id)

  if (!study) {
    return <Navigate to="/work" replace />
  }

  const [hero, secondary, tertiary, feature, supporting, fullBleed, last] = study.media

  return (
    <main id="app" className="case-page">
      <Section first className="worktitle" fadein>
        <Column className="position">
          <div>{study.number}</div>
          <h1>{study.title}</h1>
        </Column>
        <Column width={4}>
          <h2>Solutions</h2>
          <p className="solutions">
            {study.solutions.map((solution, index) => (
              <span key={solution}>
                {solution}
                {index < study.solutions.length - 1 && <span className="sep">, </span>}
              </span>
            ))}
          </p>
        </Column>
        <Column>
          <div>{study.year}</div>
          {study.url && (
            <p>
              <a href={study.url} target="_blank" rel="noopener noreferrer">
                {study.linkLabel || study.url.replace(/^https?:\/\//, '')}
              </a>
            </p>
          )}
        </Column>
      </Section>

      <div className="sections" data-slug={study.slug}>
        <Section>
          <Column width={8} burn>
            <CaseMedia src={hero} sizes="(max-width: 768px) 100vw, 100vw" />
          </Column>
        </Section>

        <Section marginTop={4}>
          <Column width={6}>
            <div className="html">
              <p className="mega">{study.intro}</p>
            </div>
          </Column>
        </Section>

        <Section marginTop={2}>
          <Column width={4} />
          {createTextColumns(study).map((section) => (
            <Column key={section.title} text>
              <div className="html">
                <h2>{section.title}</h2>
                {section.body.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </Column>
          ))}
        </Section>

        <Section marginTop={4} between>
          <Column width={4} burn>
            <CaseMedia src={secondary} sizes="(max-width: 768px) 100vw, 50vw" />
          </Column>
          <Column width={2} text burn>
            <CaseMedia src={tertiary} sizes="(max-width: 768px) 100vw, 25vw" />
          </Column>
        </Section>

        <Section marginTop={8}>
          <Column width={8} burn>
            <CaseMedia src={feature} sizes="(max-width: 768px) 100vw, 100vw" />
          </Column>
        </Section>

        <Section marginTop={5}>
          <Column width={6} text>
            <div className="html">
              <h2 className="mega">{study.title} in focus: a digital experience shaped around brand, product, and performance.</h2>
            </div>
          </Column>
        </Section>

        <Section marginTop={5} between>
          <Column width={4} burn>
            <CaseMedia src={supporting} sizes="(max-width: 768px) 100vw, 50vw" />
          </Column>
          <Column width={2} burn>
            <CaseMedia src={last || tertiary} sizes="(max-width: 768px) 100vw, 25vw" />
          </Column>
        </Section>

        {fullBleed && (
          <Section marginTop={8}>
            <Column width={8} burn>
              <CaseMedia src={fullBleed} sizes="(max-width: 768px) 100vw, 100vw" />
            </Column>
          </Section>
        )}
      </div>

      <CaseFooter reveal={false} />
    </main>
  )
}

const CaseMedia = ({ src, ...props }) => {
  if (!src) return null

  return <MediaBlock src={src} type={src.endsWith('.mp4') ? 'video' : 'image'} {...props} />
}

const createTextColumns = (study) => {
  if (study.sections?.length) {
    return study.sections
  }

  return [
    {
      title: 'Digital foundation',
      body: [
        `The ${study.title} case brings strategy, design, and implementation into a single commerce experience built around the needs of the brand.`,
      ],
    },
    {
      title: 'Designed to scale',
      body: [
        'The result is a focused digital system with room for storytelling, product discovery, and day-to-day operations across markets.',
      ],
    },
  ]
}

export default CaseDetail
