import { useCallback, useEffect, useLayoutEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Header from './Header.jsx'
import Footer from './Footer.jsx'
import { routeByPath } from '../routes.js'
import Contact from '../pages/Contact.jsx'
import Settings from '../pages/Settings.jsx'
import { caseStudiesByPath } from '../data/caseStudies.js'
import { serviceDetailsByPath } from '../data/serviceDetails.js'
import { initHoverCharacters } from '../animations/hoverCharacters.js'
import { initScrollReveal } from '../animations/scrollReveal.js'
import { initAsciiMediaMode } from '../animations/asciiMedia.js'
import { initPixelMediaMode } from '../animations/pixelMedia.js'
import { initFractalCanvases } from '../animations/fractalCanvas.js'

const Layout = () => {
  const { pathname } = useLocation()
  const route = routeByPath.get(pathname) || getDynamicRoute(pathname)
  const [menuState, setMenuState] = useState({ pathname, activeMenu: null })
  const activeMenu = menuState.pathname === pathname ? menuState.activeMenu : null
  const setActiveMenu = useCallback((nextMenu) => {
    setMenuState({
      pathname,
      activeMenu: typeof nextMenu === 'function' ? nextMenu(activeMenu) : nextMenu,
    })
  }, [activeMenu, pathname])

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  useEffect(() => {
    applyAppearance(localStorage.getItem('aino-appearance') || 'dark')
    applyMode(localStorage.getItem('aino-mode') || 'default')
  }, [])

  useEffect(() => {
    const root = document.querySelector('.app-shell') || document

    return initHoverCharacters(root)
  }, [pathname, activeMenu])

  useEffect(() => {
    const root = document.querySelector('.app-shell') || document

    return initScrollReveal(root)
  }, [pathname])

  useEffect(() => {
    const root = document.querySelector('.app-shell') || document

    return initAsciiMediaMode(root)
  }, [pathname])

  useEffect(() => {
    const root = document.querySelector('.app-shell') || document

    return initPixelMediaMode(root)
  }, [pathname])

  useEffect(() => {
    const root = document.querySelector('.app-shell') || document

    return initFractalCanvases(root)
  }, [pathname])

  useEffect(() => {
    if (!activeMenu) return undefined

    const closeOnEscape = (event) => {
      if (event.key === 'Escape') {
        setActiveMenu(null)
      }
    }

    window.addEventListener('keydown', closeOnEscape)

    return () => {
      window.removeEventListener('keydown', closeOnEscape)
    }
  }, [activeMenu, setActiveMenu])

  useLayoutEffect(() => {
    const root = document.documentElement
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent)

    const setGridVariables = () => {
      const viewportWidth = window.innerWidth
      const isMobile = viewportWidth < 769
      let ch = isMobile ? 8 : 7.5
      let cols = Math.round(viewportWidth / ch)
      let col = 0

      const createDesktopGrid = (value) => {
        let nextCols = value - 18
        nextCols -= nextCols % 16
        nextCols += 18
        ch = viewportWidth / nextCols
        col = Math.ceil((viewportWidth / ch - 18) / 8)
        cols = nextCols
      }

      if (isMobile) {
        cols -= 6
        cols -= cols % 2
        cols += 6
        ch = viewportWidth / cols
        col = Math.ceil((viewportWidth / ch - 5) / 2)
      } else {
        createDesktopGrid(Math.round(viewportWidth / ch))

        if (ch > 8.8) {
          ch = 8
          createDesktopGrid(Math.round(viewportWidth / ch))
        }
      }

      const fontSize = ch / 0.6 - 0.9
      const lineHeight = 2 * ch
      const letterSpacing = 0.6 * (ch / 0.6 - fontSize)
      const renderedLine = isSafari ? Math.round(lineHeight) : lineHeight

      root.style.setProperty('--ch', ch)
      root.style.setProperty('--cols', cols)
      root.style.setProperty('--col', 2 * col + 2)
      root.style.setProperty('--rows', Math.floor(window.innerHeight / lineHeight))
      root.style.setProperty('--letter-spacing', `${letterSpacing}px`)
      root.style.setProperty('--font-size', `${fontSize}px`)
      root.style.setProperty('--line-height', `${lineHeight}px`)
      root.style.setProperty('--line', `${renderedLine}px`)
      root.style.setProperty('--screen-height', window.screen.availHeight)

      for (let index = 0; index < 8; index += 1) {
        root.style.setProperty(`--strip-${index + 1}`, col + index * (col + 2))
      }
    }

    setGridVariables()
    window.addEventListener('resize', setGridVariables)
    window.addEventListener('orientationchange', setGridVariables)

    return () => {
      window.removeEventListener('resize', setGridVariables)
      window.removeEventListener('orientationchange', setGridVariables)
    }
  }, [])

  useEffect(() => {
    const keepHomeReady = pathname === '/' && (
      document.body.classList.contains('ready') ||
      window._ainoHomeVisited
    )

    document.body.className = [
      route?.bodyClass || 'not-found',
      keepHomeReady ? 'ready' : '',
      activeMenu ? 'menu-open' : '',
      activeMenu ? `menu-${activeMenu}` : '',
    ].filter(Boolean).join(' ')
    document.documentElement.classList.add('js')

    return () => {
      document.body.className = ''
    }
  }, [route, activeMenu, pathname])

  return (
    <div className="app-shell" data-route={pathname}>
      <Header
        activeMenu={activeMenu}
        onOpenMenu={setActiveMenu}
        onCloseMenu={() => setActiveMenu(null)}
      />
      <div className="route-view">
        <Outlet context={{ openMenu: setActiveMenu }} />
      </div>
      {activeMenu === 'settings' && <Settings onClose={() => setActiveMenu(null)} />}
      {activeMenu === 'contact' && <Contact onClose={() => setActiveMenu(null)} />}
      <Footer />
    </div>
  )
}

const getDynamicRoute = (pathname) => {
  const service = serviceDetailsByPath.get(pathname)

  if (service || /^\/services\/[^/]+\/?$/.test(pathname)) {
    return {
      bodyClass: ['services', service && `services-${service.slug}`].filter(Boolean).join(' '),
      pageClass: 'services-page',
    }
  }

  if (caseStudiesByPath.has(pathname) || /^\/work\/[^/]+\/?$/.test(pathname)) {
    return { bodyClass: 'case', pageClass: 'case-page' }
  }

  return null
}

export default Layout

const applyAppearance = (appearance) => {
  const isDark = appearance !== 'light'

  document.documentElement.classList.toggle('dark', isDark)
  document.documentElement.classList.toggle('light', !isDark)
}

const applyMode = (mode) => {
  document.documentElement.classList.toggle('textmode', mode === 'text')
  document.documentElement.classList.toggle('pixelmode', mode === 'pixel')
}
