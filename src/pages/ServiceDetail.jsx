import { Link, Navigate, useOutletContext, useParams } from 'react-router-dom'
import Column from '../components/Column.jsx'
import ImageBlock from '../components/ImageBlock.jsx'
import Section from '../components/Section.jsx'
import VideoBlock from '../components/VideoBlock.jsx'
import { serviceDetailsBySlug, servicesFooterLinks } from '../data/serviceDetails.js'

const ServiceDetail = ({ slug: fixedSlug }) => {
  const { id } = useParams()
  const { openMenu } = useOutletContext()
  const service = serviceDetailsBySlug.get(fixedSlug || id)

  if (!service) {
    return <Navigate to="/services" replace />
  }

  return (
    <main id="app" className="services-page service-detail-page">
      <div className="container">
        <Section first>
          <Column width={2} />
          <Column width={6}>
            <h1 className="mega">{service.intro}</h1>
          </Column>
        </Section>

        {service.highlights && (
          <>
            <Section space />
            <Section>
              {service.highlights.map((item) => (
                <TextColumn key={item.title} item={item} />
              ))}
            </Section>
          </>
        )}

        {service.projects && (
          <>
            <Section space />
            <CaseGrid title={service.projectsTitle} items={service.projects} />
          </>
        )}

        {service.included && (
          <>
            <Section space />
            <FeatureList title={service.includedTitle} items={service.included} />
          </>
        )}

        {service.blocks?.map((block) => (
          <ServiceBlock key={block.title} block={block} onContact={() => openMenu('contact')} />
        ))}

        {service.textGroups?.map((group, index) => (
          <div key={group.map((item) => item.title).join('-')}>
            <Section space />
            <Section>
              <Column width={2} />
              {group.map((item) => (
                <TextColumn key={item.title} item={item} />
              ))}
            </Section>
            {service.mediaGroups?.[index] && (
              <>
                <Section space />
                <MediaRow items={service.mediaGroups[index]} />
              </>
            )}
          </div>
        ))}

        {service.process && (
          <>
            <Section space hr={service.slug === 'shopify'} />
            <Section>
              <Column width={2}>
                <div className="text">
                  <h2>{service.processTitle}</h2>
                </div>
              </Column>
              {service.process.map((item) => (
                <TextColumn key={item.title} item={item} />
              ))}
            </Section>
          </>
        )}

        {service.quote && (
          <>
            <Section space />
            <Section>
              <Column width={6}>
                <p className="mega">{service.quote}</p>
                <span className="source">{service.source}</span>
              </Column>
            </Section>
          </>
        )}

        {service.bigText && (
          <>
            <Section spaceBig />
            <Section>
              <Column width={2} />
              <Column width={4}>
                <div className="text">
                  {service.bigText.map((paragraph) => (
                    <p key={paragraph} className="big">
                      {paragraph}
                    </p>
                  ))}
                  {service.cta && (
                    <div className="actions">
                      <button className="button" type="button" onClick={() => openMenu('contact')}>
                        {service.cta}
                      </button>
                    </div>
                  )}
                </div>
              </Column>
            </Section>
          </>
        )}

        {service.media && (
          <>
            <Section space />
            <MediaRow items={service.media} />
          </>
        )}

        <Section space />
        <ServicesFooter onContact={() => openMenu('contact')} />
      </div>
    </main>
  )
}

const ServiceBlock = ({ block, onContact }) => (
  <>
    <Section space hr>
      <Column width={2}>
        <h2>{block.title}</h2>
      </Column>
      <Column width={4}>
        <p className="big">{block.lead}</p>
      </Column>
    </Section>

    {block.columns && (
      <Section>
        <Column width={2} />
        {block.columns.map((item) => (
          <TextColumn key={item.title} item={item} />
        ))}
      </Section>
    )}

    {block.included && (
      <Section>
        <Column width={2}>
          <h3>{block.includedTitle}</h3>
        </Column>
        <Column width={4}>
          <ul className="features">
            {block.included.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          {block.cta && (
            <div className="actions">
              <button className="button" type="button" onClick={onContact}>
                {block.cta}
              </button>
            </div>
          )}
        </Column>
      </Section>
    )}
  </>
)

const FeatureList = ({ title, items }) => (
  <Section>
    <Column width={2}>
      <h2>{title}</h2>
    </Column>
    <Column width={4}>
      <ul className="features">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </Column>
  </Section>
)

const TextColumn = ({ item }) => (
  <Column width={2}>
    <div className="text">
      <h3>{item.title}</h3>
      <p>{item.text}</p>
      {item.items && (
        <ul>
          {item.items.map((bullet) => (
            <li key={bullet}>{bullet}</li>
          ))}
        </ul>
      )}
    </div>
  </Column>
)

const MediaRow = ({ items }) => (
  <Section>
    {items.map((item) => (
      <Column key={item.image || item.video} width={item.width || 4} burn={Boolean(item.image)}>
        {item.video ? (
          <VideoBlock src={item.video} width={item.mediaWidth} height={item.mediaHeight} />
        ) : (
          <ImageBlock src={item.image} sizes="(max-width: 768px) 100vw, 50vw" />
        )}
      </Column>
    ))}
  </Section>
)

const CaseGrid = ({ title, items }) => (
  <div className="case-grid-container">
    <h3>{title}</h3>
    <div className="case-grid" data-blocks>
      {items.map((item) => (
        <div key={item.number} className="case-grid-item">
          <Link to={item.to}>
            <div className="images">
              {item.video ? (
                <VideoBlock
                  src={item.video}
                  width={item.width}
                  height={item.height}
                  wrapperClassName="image"
                  preserveRatio={false}
                />
              ) : (
                <ImageBlock
                  src={item.image}
                  width={item.width}
                  height={item.height}
                  sizes="(max-width: 768px) 75vw, 25vw"
                />
              )}
            </div>
            <div className="info">
              <div className="number">{item.number}</div>
              <div className="name">{item.name}</div>
            </div>
          </Link>
        </div>
      ))}
    </div>
  </div>
)

const ServicesFooter = ({ onContact }) => (
  <Section className="services-footer">
    <Column width={2}>
      <h2>Find out more</h2>
    </Column>
    <Column width={2}>
      <ul>
        {servicesFooterLinks.map((link) => (
          <li key={link.to}>
            <Link to={link.to}>
              <span>{link.label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </Column>
    <Column width={2} />
    <Column width={2}>
      <h2 className="monocaps">
        Join us in building the
        <br />
        future of digital commerce.
      </h2>
      <div className="main-cta">
        <p>
          <button className="button inverted" type="button" onClick={onContact}>
            Start a project
          </button>
        </p>
      </div>
    </Column>
  </Section>
)

export default ServiceDetail
