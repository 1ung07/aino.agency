import { createAsciiMedia } from './asciiMedia.js'
import { scrambleHoverCharacters } from './hoverCharacters.js'

export const initFooterLogoHover = (footer) => {
  if (!footer || !window.matchMedia('(hover: hover)').matches) return noop

  const logo = footer.querySelector('.logo')
  const image = logo?.querySelector('img')

  if (!logo || !image) return noop

  let active = false
  let destroyAscii = null
  let activeAscii = null

  const animateAscii = (ascii, event) => {
    if (!ascii) return

    activeAscii = ascii
    ascii.classList.add('hoverchar')
    ascii.dataset.dy = '1'
    ascii.dataset.dx = '2'
    ascii.dataset.duration = '2000'
    scrambleHoverCharacters(ascii, event || pointerFromElement(ascii), {
      dy: 1,
      dx: 2,
      duration: 2000,
    })
  }

  const onEnter = (event) => {
    if (active) return

    active = true
    const mode = currentMode()
    const ascii = logo.querySelector('.ascii')

    if (mode === 'text' && ascii) {
      animateAscii(ascii, event)
      return
    }

    if (mode === 'pixel') {
      setPixelLayersVisible(logo, false)
    } else {
      image.style.opacity = '0'
    }

    destroyAscii = createAsciiMedia(image, {
      forceShow: true,
      onReady: (nextAscii) => animateAscii(nextAscii, event),
    })
  }

  const onMove = (event) => {
    if (!active) return

    const ascii = activeAscii || logo.querySelector('.ascii')

    if (ascii) {
      scrambleHoverCharacters(ascii, event, {
        dy: 1,
        dx: 2,
        duration: 2000,
      })
    }
  }

  const onLeave = () => {
    if (!active) return

    active = false
    activeAscii?.classList.remove('hoverchar')
    activeAscii = null
    setPixelLayersVisible(logo, true)

    if (destroyAscii) {
      destroyAscii()
      destroyAscii = null
    }

    image.style.opacity = ''
  }

  logo.addEventListener('mouseenter', onEnter)
  logo.addEventListener('mousemove', onMove)
  logo.addEventListener('mouseleave', onLeave)

  return () => {
    onLeave()
    logo.removeEventListener('mouseenter', onEnter)
    logo.removeEventListener('mousemove', onMove)
    logo.removeEventListener('mouseleave', onLeave)
  }
}

const currentMode = () => {
  if (document.documentElement.classList.contains('textmode')) return 'text'
  if (document.documentElement.classList.contains('pixelmode')) return 'pixel'

  return 'image'
}

const setPixelLayersVisible = (logo, visible) => {
  logo.querySelectorAll('.pixelate, .overlay').forEach((element) => {
    element.style.opacity = visible ? '' : '0'
    element.style.pointerEvents = visible ? '' : 'none'
  })
}

const pointerFromElement = (element) => {
  const rect = element.getBoundingClientRect()

  return {
    clientX: rect.left + rect.width / 2,
    clientY: rect.top + rect.height / 2,
  }
}

const noop = () => {}
