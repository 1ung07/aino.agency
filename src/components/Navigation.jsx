import { useEffect, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'

const primaryLinks = [
  { to: '/work', label: 'Work', className: 'work' },
  { to: '/services', label: 'Services' },
  { to: '/about', label: 'About', className: 'about' },
  { to: '/play', label: 'Play' },
]

const Navigation = ({ activeMenu, onOpenMenu, onCloseMenu }) => {
  const { pathname } = useLocation()
  const [mobileState, setMobileState] = useState({ open: false, pathname })
  const mobileOpen = mobileState.open && mobileState.pathname === pathname && !activeMenu
  const activeLabel = activeMenu === 'settings' ? 'Settings' : activeMenu === 'contact' ? 'Contact' : null

  const openOverlay = (menu) => {
    setMobileState({ open: false, pathname })
    onOpenMenu(menu)
  }

  return (
    <>
      <nav id="nav" className="hoverchar">
        <div>
          <NavLink to="/" rel="prefetch" className={getNavClass('home')} end>
            Aino
          </NavLink>
        </div>
        <div>
          {primaryLinks.slice(0, 2).map((link) => (
            <NavItem key={link.to} {...link} />
          ))}
        </div>
        <div className="secondary">
          {primaryLinks.slice(2, 4).map((link) => (
            <NavItem key={link.to} {...link} />
          ))}
        </div>
        <div className="last">
          {activeLabel ? (
            <>
              <span className="menu-state">{activeLabel}</span>
              <button className="ghost menu-close" type="button" onClick={onCloseMenu}>
                Close
              </button>
            </>
          ) : (
            <>
              <button className="ghost toggler" type="button" onClick={() => onOpenMenu('settings')}>
                Settings
              </button>
              <button className="ghost" type="button" onClick={() => onOpenMenu('contact')}>
                Contact
              </button>
            </>
          )}
        </div>
        <div className={`mobile ${mobileOpen ? 'close' : ''}`}>
          {activeLabel ? (
            <>
              <span className="menu-state">{activeLabel}</span>
              <button className="ghost menu-close" type="button" onClick={onCloseMenu}>
                Close
              </button>
            </>
          ) : (
            <>
              {!mobileOpen && (
                <button className="ghost mobile-contact" type="button" onClick={() => openOverlay('contact')}>
                  Contact
                </button>
              )}
              <button
                className="ghost mobile-close"
                type="button"
                onClick={() => {
                  setMobileState((state) => ({
                    open: state.pathname === pathname ? !state.open : true,
                    pathname,
                  }))
                }}
              >
                {mobileOpen ? 'Close' : 'Menu'}
              </button>
            </>
          )}
        </div>
      </nav>
      {mobileOpen && (
        <MobileMenu
          pathname={pathname}
          onClose={() => setMobileState({ open: false, pathname })}
          onOpenSettings={() => openOverlay('settings')}
        />
      )}
    </>
  )
}

const NavItem = ({ to, label, className = '' }) => (
  <NavLink
    to={to}
    rel="prefetch"
    className={getNavClass(className)}
  >
    {label}
  </NavLink>
)

const getNavClass =
  (baseClass = '') =>
  ({ isActive }) =>
    [baseClass, isActive ? 'active' : ''].filter(Boolean).join(' ')

const mobileLinks = primaryLinks.filter((link) => link.label !== 'Play')

const MobileMenu = ({ pathname, onClose, onOpenSettings }) => {
  const [revealed, setRevealed] = useState(false)

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setRevealed(true))

    return () => window.cancelAnimationFrame(frame)
  }, [])

  const currentPath = normalizePath(pathname)

  return (
    <div className="mobile-container">
      <div className="mobile-nav text">
        {mobileLinks.map((link, index) => (
          <NavLink
            key={link.to}
            to={link.to}
            rel="prefetch"
            className={({ isActive }) => ['mega', isActive ? 'active' : ''].filter(Boolean).join(' ')}
            style={{
              opacity: revealed ? 1 : 0,
              transition: 'opacity 0.2s ease-out',
              transitionDelay: `${60 * (index + 1)}ms`,
            }}
            onClick={() => {
              if (normalizePath(link.to) === currentPath) onClose()
            }}
          >
            {link.label}
          </NavLink>
        ))}
      </div>
      <div className="mobile-footer">
        <div
          className="newbusiness"
          style={{
            opacity: revealed ? 1 : 0,
            transition: 'opacity 0.35s ease-out',
            transitionDelay: `${60 * (mobileLinks.length + 1)}ms`,
          }}
        >
          <h2>New Business</h2>
          <ul>
            <li>Julie Nord</li>
            <li>
              <a href="tel:+4792208467">T: +47 922 08 467</a>
            </li>
            <li>
              <a href="mailto:julie@aino.agency">E: julie@aino.agency</a>
            </li>
          </ul>
        </div>
        <button className="ghost settings" type="button" onClick={onOpenSettings}>
          Settings
        </button>
      </div>
    </div>
  )
}

const normalizePath = (path) => (path || '/').replace(/\/$/, '') || '/'

export default Navigation
