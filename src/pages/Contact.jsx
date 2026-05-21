const contactEmail = 'julie@aino.agency'

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

const Contact = ({ onClose }) => {
  return (
    <div className="contact-page menu-page">
      <button className="menu-page-backdrop ghost" type="button" aria-label="Close contact" onClick={onClose} />
      <section id="side-dialog" data-dialog="contact" className="menu-page-panel contact-page-panel">
        <div className="dialog-header">
          <span>Contact</span>
          <button className="ghost" type="button" onClick={onClose}>
            Close
          </button>
        </div>

        <div className="contact-dialog">
          <div className="form">
            <p className="big">Let's build something great.</p>
            <div className="email">
              <h2>New Business</h2>
              <p>
                <a href={`mailto:${contactEmail}`}>{contactEmail}</a>
              </p>
            </div>
            <div className="actions">
              <a className="button contact-button" href={`https://mail.google.com/mail/?view=cm&fs=1&to=${contactEmail}`} target="_blank" rel="noreferrer">
                Open Gmail
              </a>
              <button
                className="contact-button"
                type="button"
                onClick={() => navigator.clipboard?.writeText(contactEmail)}
              >
                Copy Email
              </button>
            </div>
          </div>

          <div className="info contact-footer">
            <div className="follow">
              <h2>Follow</h2>
              <br />
              <ul className="socials">
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
            <div className="office-grid">
              {offices.map((office) => (
                <Office key={office.title} office={office} />
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

const Office = ({ office }) => (
  <div>
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
  </div>
)

export default Contact
