import CaseFooter from '../components/CaseFooter.jsx'
import Column from '../components/Column.jsx'
import MediaBlock from '../components/MediaBlock.jsx'
import Section from '../components/Section.jsx'
import { media } from '../data/data.js'

const introPrinciples = [
  {
    title: 'Turning shopping into brand experience',
    text: 'Our work brings brand and commerce together to spark real connections - where people are, and where they buy.',
  },
  {
    title: 'Creative meets commercial',
    text: 'We blend brand storytelling with performance to create experiences where bold ideas, culture, and commerce drive results.',
  },
  {
    title: 'People before products',
    text: 'Inspired by what truly matters to the audience, we design experiences that make brands feel more human, relevant, and present in their lives.',
  },
  {
    title: 'Embrace Simplicity',
    text: 'Cutting through noise requires careful attention to the art of elimination. Every interaction, every pixel counts in our pursuit of perfection.',
  },
]

const practicePrinciples = [
  {
    title: 'Concept to code',
    text: 'We help brands go from first idea to full delivery. From commerce platforms to campaign sites and digital identities, we combine creative direction, design, and development in one team.',
  },
  {
    title: 'Rooted in humanity',
    text: "We believe inspiration comes from life's most meaningful moments. It's not just about aesthetics; it's about creating an experience that resonates with the real people who engage with your brand.",
  },
  {
    title: 'Built for ambition',
    text: 'Our clients range from fast-moving fashion brands to established global corporations. We honor the power of close collaboration - shaped by ideas and defined by the ambition to move the needle.',
  },
  {
    title: 'Business and pleasure',
    text: "We're not trying to be everything. But we are very good at the two things that matter most for us: taste and execution. We believe design is a competitive advantage - and technology is how we deliver.",
  },
]

const facts = [
  { title: 'Facts' },
  { title: 'Founded', text: '2011' },
  { title: 'Employees', text: '11' },
  { title: 'Offices', text: 'Gothenburg + Oslo' },
]

const About = () => {
  return (
    <main id="app" className="about-page">
      <div className="sections" data-slug="about">
        <Section first>
          <Column width={6} text>
            <div className="html">
              <h1 className="mega">
                Scandinavian design and technology agency committed to innovation and
                collaboration. For over fifteen years, Aino has helped brands find their
                inner voice and stay relevant in a sloppy digital world ruled by sameness.
              </h1>
            </div>
          </Column>
        </Section>

        <Section space />

        <TextColumns items={introPrinciples} leadingWidth={4} />

        <Section space />

        <ImageRow items={[media.about.intro[0], media.about.intro[1], null, media.about.intro[2]]} />

        <Section space />

        <Section>
          <Column />
          <Column width={6}>
            <div className="html">
              <p className="mega">
                We are a team of designers, developers, and strategists on a mission to
                bring back creativity and humanity to digital commerce. Our work lives in
                the intersection of concept and execution, where design and technology
                evolve together.
              </p>
            </div>
          </Column>
        </Section>

        <Section spaceSmall />

        <TextColumns items={practicePrinciples} leadingWidth={2} />

        <Section spaceSmall />
        <Section space />

        <ImageRow items={[media.about.people[0], null, media.about.people[1], media.about.people[2]]} />

        <Section space />

        <Section fadein>
          {facts.map((fact) => (
            <Column key={fact.title}>
              <div className="html">
                <h2>{fact.title}</h2>
                {fact.text && <p>{fact.text}</p>}
              </div>
            </Column>
          ))}
        </Section>
      </div>

      <Section space />
      <CaseFooter />
    </main>
  )
}

const TextColumns = ({ items, leadingWidth }) => (
  <Section>
    <Column width={leadingWidth} />
    <Column text>
      <div className="html">
        {items.slice(0, 2).map((item) => (
          <TextBlock key={item.title} item={item} />
        ))}
      </div>
    </Column>
    <Column text>
      <div className="html">
        {items.slice(2).map((item) => (
          <TextBlock key={item.title} item={item} />
        ))}
      </div>
    </Column>
  </Section>
)

const TextBlock = ({ item }) => (
  <>
    <h2>{item.title}</h2>
    <p>{item.text}</p>
  </>
)

const ImageRow = ({ items }) => (
  <Section>
    {items.map((item, index) => (
      <Column key={item?.originalSrc || `empty-${index}`} burn={Boolean(item)}>
        {item && <MediaBlock image={item} />}
      </Column>
    ))}
  </Section>
)

export default About
