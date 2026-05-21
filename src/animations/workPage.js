import { createAsciiMedia } from './asciiMedia.js'
import { createPixelMedia } from './pixelMedia.js'
import { revealText } from './scrollReveal.js'

const revealDelay = 50
const revealStagger = 20

export const initWorkPageAnimations = (root) => {
  if (!root) return noop

  const gridContainer = root.querySelector('.gridcontainer')
  const listContainer = root.querySelector('.listcontainer')
  const viewMenu = root.querySelector('[data-view]')
  const projects = viewMenu?.querySelector('.projects')
  const buttons = Array.from(viewMenu?.querySelectorAll('.buttons .btn') || [])
  const cases = Array.from(gridContainer?.querySelectorAll('.case') || [])
  const cleanup = []
  const timers = new Set()
  const pixelRenderers = []
  let hoverTimer = null
  let hoveredCase = null

  const setTimer = (callback, delay) => {
    const timer = window.setTimeout(() => {
      timers.delete(timer)
      callback()
    }, delay)

    timers.add(timer)

    return timer
  }

  const clearTimers = () => {
    for (const timer of timers) window.clearTimeout(timer)
    timers.clear()
  }

  const clearGeneratedMedia = () => {
    for (const destroy of pixelRenderers.splice(0)) destroy()

    gridContainer?.querySelectorAll('.ascii, canvas.pixelate, .overlay').forEach((element) => {
      element.remove()
    })
  }

  const revealMenu = (delay = 600) => {
    if (projects) setTimer(() => revealText(projects, { speed: 0.5, duration: 500 }), delay)

    buttons.forEach((button, index) => {
      setTimer(() => revealText(button, { speed: 0.5, duration: 600 }), delay + 200 + index * 100)
    })
  }

  const revealList = () => {
    const list = listContainer?.querySelector('.linelist')

    if (list) revealText(list, { speed: 0.5, duration: 600 })
  }

  const revealGrid = () => {
    if (!gridContainer) return

    clearTimers()
    clearGeneratedMedia()

    const items = Array.from(gridContainer.querySelectorAll('.item'))

    for (const item of items) {
      item.style.opacity = '0'

      const media = item.querySelector('.image img, .image video')

      if (media) media.style.opacity = '0'
    }

    if (!isMobile()) {
      gridContainer.classList.add('loading')

      const stopLoading = () => {
        gridContainer.classList.remove('loading')
        gridContainer.removeEventListener('mousemove', stopLoading)
      }

      gridContainer.addEventListener('mousemove', stopLoading)
      cleanup.push(() => gridContainer.removeEventListener('mousemove', stopLoading))
    }

    items.forEach((item, index) => {
      const media = item.querySelector('.image img, .image video')

      if (!media) return

      setTimer(() => revealMediaItem(item, media, index), index * revealDelay)
    })
  }

  const revealMediaItem = (item, media, index) => {
    const mode = currentMode()
    const finish = () => {
      setTimer(() => {
        media.style.opacity = ''
        item.style.opacity = ''

        const ascii = media.parentNode?.querySelector('.ascii')

        if (ascii && mode !== 'text') ascii.style.display = 'none'

        if (mode === 'pixel') {
          const destroy = createPixelMedia(media, { factor: 1 })

          if (destroy) pixelRenderers.push(destroy)
        }
      }, 300 + index * revealStagger)
    }

    const existingAscii = media.parentNode?.querySelector('.ascii')

    if (existingAscii) {
      setTimer(() => {
        existingAscii.style.display = 'block'
        revealText(existingAscii, { speed: 1, random: true, duration: 400, ready: finish })
        item.style.opacity = '1'
      }, 20)
      return
    }

    const destroyAscii = createAsciiMedia(media, {
      forceShow: true,
      onReady: (ascii) => {
        setTimer(() => {
          revealText(ascii, { speed: 1, random: true, duration: 400, ready: finish })
          item.style.opacity = '1'
        }, 40)
      },
    })

    if (destroyAscii) cleanup.push(destroyAscii)
  }

  const syncMode = () => {
    for (const destroy of pixelRenderers.splice(0)) destroy()

    const mode = currentMode()

    gridContainer?.querySelectorAll('.item').forEach((item) => {
      const media = item.querySelector('.image img, .image video')
      const ascii = item.querySelector('.ascii')

      if (mode === 'text') {
        if (ascii) ascii.style.display = 'block'
      } else if (mode === 'pixel' && media) {
        if (ascii) ascii.style.display = 'none'

        const destroy = createPixelMedia(media, { factor: 1 })

        if (destroy) pixelRenderers.push(destroy)
      } else if (ascii) {
        ascii.style.display = 'none'
      }
    })
  }

  cases.forEach((caseNode) => {
    const items = Array.from(caseNode.querySelectorAll('.item'))

    items.forEach((item) => {
      const onEnter = () => {
        window.clearTimeout(hoverTimer)

        if (hoveredCase && hoveredCase !== caseNode) hoveredCase.classList.remove('hover')

        hoveredCase = caseNode
        caseNode.classList.add('hover')
      }
      const onLeave = () => {
        hoverTimer = window.setTimeout(() => {
          caseNode.classList.remove('hover')
          if (hoveredCase === caseNode) hoveredCase = null
        }, 200)
      }

      item.addEventListener('mouseenter', onEnter)
      item.addEventListener('mouseleave', onLeave)
      cleanup.push(() => {
        item.removeEventListener('mouseenter', onEnter)
        item.removeEventListener('mouseleave', onLeave)
      })
    })
  })

  if (isMobile()) {
    cases.forEach((caseNode) => {
      const info = caseNode.querySelector('.item:first-child .info')

      if (info) caseNode.after(info)
    })
  }

  const modeObserver = new MutationObserver(syncMode)

  modeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
  cleanup.push(() => modeObserver.disconnect())
  window.addEventListener('aino:modechange', syncMode)
  cleanup.push(() => window.removeEventListener('aino:modechange', syncMode))

  revealMenu(root.classList.contains('view-list') ? 0 : 600)

  if (root.classList.contains('view-list')) {
    revealList()
  } else {
    revealGrid()
  }

  return {
    revealGrid,
    revealList,
    destroy: () => {
      clearTimers()
      window.clearTimeout(hoverTimer)
      clearGeneratedMedia()
      cleanup.forEach((dispose) => dispose())
    },
  }
}

const currentMode = () => {
  if (document.documentElement.classList.contains('textmode')) return 'text'
  if (document.documentElement.classList.contains('pixelmode')) return 'pixel'

  return 'default'
}

const isMobile = () => window.matchMedia('(max-width: 768px)').matches

const noop = () => {}
