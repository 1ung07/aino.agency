import { useEffect, useRef, useState } from 'react'
import { initFooterLogoHover } from '../animations/footerLogoHover.js'

const Footer = () => {
  const footerRef = useRef(null)
  const [time, setTime] = useState('')

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      const weekday = now.toLocaleDateString('en-US', { weekday: 'long' })
      const clock = now.toLocaleTimeString('en-GB', { hour12: false })

      setTime(`${weekday} ${clock}`)
    }

    updateTime()
    const timer = window.setInterval(updateTime, 1000)

    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => initFooterLogoHover(footerRef.current), [])

  return (
    <>
      <footer id="footer" ref={footerRef} data-component="footer">
        <div className="image logo">
          <img src="/aino-agency.svg" width="719" height="107" alt="Aino" />
        </div>
        <section className="section shortcuts wrap">
          <div className="col loctime">
            <div className="location">
              GBG/OSL
            </div>
            <div className="time">
              {time}
            </div>
          </div>
          <div className="col w4 halfwidth">
            <h2>
              New Business
            </h2>
            <a href="mailto:julie@aino.agency">
              julie@aino.agency
              <span />
            </a>
          </div>
          <div className="col halfwidth">
            <a href="https://linkedin.com/company/aino" target="_blank" rel="noreferrer">
              Linkedin
              <span />
            </a>
            <a href="https://instagram.com/aino.agency" target="_blank" rel="noreferrer">
              Instagram
              <span />
            </a>
          </div>
        </section>
      </footer>
      <div className="fonts" aria-hidden="true">
        <span className="f1">.</span>
      </div>
    </>
  )
}

export default Footer
