import { Link, useOutletContext } from 'react-router-dom'
import Column from '../components/Column.jsx'
import FractalBlock from '../components/FractalBlock.jsx'
import ImageBlock from '../components/ImageBlock.jsx'
import Section from '../components/Section.jsx'
import VideoBlock from '../components/VideoBlock.jsx'

const serviceCards = [
  {
    title: 'E-commerce Storefronts',
    text: 'Enterprise storefronts on Centra and Shopify, built on a shared commerce engine refined over a decade of launches.',
    actions: [
      { to: '/services/centra', label: 'Centra' },
      { to: '/services/shopify', label: 'Shopify' },
    ],
  },
  {
    title: 'Design Studio',
    text: 'Our design team translates core brand values into pixel-perfect, interactive shopping experiences worth putting your name on.',
    actions: [{ to: '/services/design', label: 'Read more' }],
  },
  {
    title: 'Intelligence Layer',
    text: 'AI-native tools to accelerate your daily operations. From product discovery and translations to content creation and business insights.',
    actions: [{ to: '/services/intelligence', label: 'Read more' }],
  },
]

const featuredWork = [
  {
    to: '/work/nudie-jeans',
    number: 'A001',
    name: 'Nudie Jeans',
    image: '/media/01ff5eb734-nudie_embedded-DzvuvJrQnzDei01Ccu80dH5yYw0xO4.jpg',
    width: 2000,
    height: 2500,
  },
  {
    to: '/work/samsoe-samsoe',
    number: 'A004',
    name: 'Samsoe Samsoe',
    video: '/media/8d760306bb-samsoe_desktomob-jTnGxZE32YXB0ZknrflbcoCqHp8ROt-KZXyEHUOto59Zk3C8jARuwOYjg98TZ.mp4',
    width: 1498,
    height: 1874,
  },
  {
    to: '/work/emmas',
    number: 'A020',
    name: 'Emma S',
    image: '/media/1308f1b79b-plp-vxsOIjIRQau3uLP4TswXU6Mx0KD1rq.png',
    width: 1080,
    height: 1350,
  },
  {
    to: '/work/beyond-medals',
    number: 'A011',
    name: 'Beyond Medals',
    image: '/media/8effdd5588-67-h8uyhGbReuP1HZYYHLX4lxe6a8Qeaz.png',
    width: 1500,
    height: 1875,
  },
]

const capabilities = [
  ['Creative Direction', 'Ideation & Strategy', 'Visual Identity', 'UI+UX Design', 'Design Systems', 'E-commerce Design', 'Motion Design'],
  ['Interactive Design', 'Agentic Engineering', 'Frontend Development', 'Backend Development', 'Shopify Development', 'Shopify Apps', 'Integrations'],
  ['Replatforming', 'E-commerce Strategy', 'Solution Architecture', 'Centra', 'Shopify', 'Performance Optimization', 'CRO+SEO'],
]

const serviceLinks = [
  { to: '/services', label: 'Our services' },
  { to: '/services/centra', label: 'Centra Accelerator' },
  { to: '/services/shopify', label: 'Shopify Accelerator' },
  { to: '/services/design', label: 'Design Studio' },
  { to: '/services/intelligence', label: 'Intelligence Layer' },
]

const Services = () => {
  const { openMenu } = useOutletContext()

  return (
    <main id="app" className="services-page">
      <div className="container">
        <Section first>
          <Column width={6}>
            <h1 className="mega">
              A design agency that can build things, and a tech partner that cares about taste.
              We align brand, experience, and agentic engineering so the creative idea survives
              contact with real commerce.
            </h1>
          </Column>
          <Column width={2}>
            <FractalBlock />
          </Column>
        </Section>

        <Section spaceBig />

        <Section>
          <Column width={2} />
          {serviceCards.map((card) => (
            <ServiceCard key={card.title} card={card} />
          ))}
        </Section>
      </div>

      <Section space />

      <Section>
        <Column width={8}>
          <div className="case-grid-container">
            <h3>Explore our work</h3>
            <div className="case-grid" data-blocks>
              {featuredWork.map((item) => (
                <CaseGridItem key={item.number} item={item} />
              ))}
            </div>
          </div>
        </Column>
      </Section>

      <Section space />

      <Section>
        <Column width={2}>
          <h2>Capabilities</h2>
        </Column>
        {capabilities.map((group) => (
          <Column key={group[0]} width={2}>
            <ul>
              {group.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </Column>
        ))}
      </Section>

      <Section space />

      <Section className="services-footer">
        <Column width={2}>
          <h2>Find out more</h2>
        </Column>
        <Column width={2}>
          <ul>
            {serviceLinks.map((link) => (
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
              <button className="button inverted" type="button" onClick={() => openMenu('contact')}>
                Start a project
              </button>
            </p>
          </div>
        </Column>
      </Section>
    </main>
  )
}

const ServiceCard = ({ card }) => (
  <Column width={2}>
    <div className="text">
      <h2>{card.title}</h2>
      <p>{card.text}</p>
    </div>
    <div className="actions">
      {card.actions.map((action) => (
        <Link key={action.to} to={action.to} className="button">
          {action.label}
        </Link>
      ))}
    </div>
    <br />
  </Column>
)

const CaseGridItem = ({ item }) => (
  <div className="case-grid-item">
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
)

export default Services
