import { useRef } from 'react'
import ContactBounce from '../components/ContactBounce.jsx'

const people = [
  {
    title: 'New Business',
    name: 'Julie Nord',
    phone: '+47 922 08 467',
    phoneHref: 'tel:+4792208467',
    email: 'julie@aino.agency',
  },
  {
    title: 'Partnership',
    name: 'David Hellsing',
    phone: '+46 735 45 84 32',
    phoneHref: 'tel:+46735458432',
    email: 'david@aino.agency',
  },
  {
    title: 'Career & finance',
    name: 'Linnea Furhammar',
    phone: '+46 704 97 25 97',
    phoneHref: 'tel:+46704972597',
    email: 'linnea@aino.agency',
  },
]

const offices = [
  {
    title: 'GBG',
    href: 'https://maps.app.goo.gl/3bRxQXZnA3edfqDP6',
    lines: ['Viktoriagatan 2a', '411 25', 'Gothenburg, Sweden'],
  },
  {
    title: 'OSL',
    href: 'https://maps.app.goo.gl/kWA2VoyJDv4XvuWQ6',
    lines: ['Storgata 36d', '0182', 'Oslo, Norway'],
  },
]

const ContactPage = () => {
  const infoRef = useRef(null)

  return (
    <main id="app" className="contact-page">
      <div className="sections" data-slug="contact">
        <section className="section first">
          <div className="split col">
            <ContactBounce infoRef={infoRef} />
            <div ref={infoRef} className="info fadein">
              <div>
                <h2>Aino</h2>
                <p>Scandinavian design and technology agency.</p>
              </div>
              <div>
                <h2>Contact</h2>
                <p>GBG/OSL</p>
              </div>
            </div>
          </div>

          <div className="col bottom fadein halfwidth w2">
            <div className="html">
              {people.map((person) => (
                <ContactPerson key={person.email} person={person} />
              ))}
            </div>
          </div>

          <div className="col bottom fadein halfwidth w2">
            <div className="html">
              {offices.map((office) => (
                <Office key={office.title} office={office} />
              ))}
              <br />
              <ul>
                <li>
                  <a href="https://instagram.com/aino.agency" target="_blank" rel="noreferrer">
                    Instagram
                  </a>
                </li>
                <li>
                  <a href="https://linkedin.com/company/aino" target="_blank" rel="noreferrer">
                    Linkedin
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}

const ContactPerson = ({ person }) => (
  <>
    <h2>{person.title}</h2>
    <ul>
      <li>{person.name}</li>
      <li>
        <a href={person.phoneHref}>T: {person.phone}</a>
      </li>
      <li>
        <a href={`mailto:${person.email}`}>E: {person.email}</a>
      </li>
    </ul>
    <br />
  </>
)

const Office = ({ office }) => (
  <>
    <h2>{office.title}</h2>
    <a href={office.href} target="_blank" rel="noreferrer" data-dy="1">
      <address>
        {office.lines.map((line) => (
          <span key={line}>
            {line}
            <br />
          </span>
        ))}
      </address>
    </a>
    <br />
  </>
)

export default ContactPage
