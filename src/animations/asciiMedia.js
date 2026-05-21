const asciiChars = 'NO0A869452I3?!<>=+/:-\u00b7 '

let activeRenderers = []
let modeObserver = null
let modeListener = null

export const initAsciiMediaMode = (root = document) => {
  destroyAsciiMediaMode()

  const apply = () => {
    clearRenderers()

    if (!document.documentElement.classList.contains('textmode')) return

    activeRenderers = Array.from(root.querySelectorAll('img:not(.raw), video:not(.raw)'))
      .filter((media) => !media.closest('.gridcontainer'))
      .map((media) => createAsciiMedia(media))
      .filter(Boolean)
  }

  modeObserver = new MutationObserver(apply)
  modeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })

  modeListener = apply
  window.addEventListener('aino:modechange', modeListener)

  apply()

  return destroyAsciiMediaMode
}

export const destroyAsciiMediaMode = () => {
  clearRenderers()

  if (modeObserver) {
    modeObserver.disconnect()
    modeObserver = null
  }

  if (modeListener) {
    window.removeEventListener('aino:modechange', modeListener)
    modeListener = null
  }
}

const clearRenderers = () => {
  activeRenderers.forEach((destroy) => destroy())
  activeRenderers = []
}

export const createAsciiMedia = (media, options = {}) => {
  const parent = media.parentNode
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d', { willReadFrequently: true })
  const ascii = document.createElement('div')
  const state = {
    frame: null,
    videoFrame: null,
    playHandler: null,
    resizeObserver: null,
    ready: false,
    source: null,
    sourceWidth: 0,
    sourceHeight: 0,
    text: null,
    firstRender: true,
    alive: true,
  }

  if (!parent || !context) return null

  ascii.className = 'ascii'

  if (options.forceShow) {
    ascii.style.display = 'block'
  }

  parent.appendChild(ascii)

  const objectFit = getStyle(media, 'object-fit')
  const filter = options.filter || ((value) => value)

  if (options.fadein) {
    ascii.style.opacity = 0
  }

  const render = () => {
    if (!state.ready || !media || !state.alive) return

    const bounds = media.getBoundingClientRect()
    const width = bounds.width
    const height = bounds.height

    if (!width || !height) return

    const charWidth = cssNumber('--ch', 8)
    const lineHeight = cssNumber('--line', cssNumber('--line-height', 16))

    canvas.width = Math.max(1, Math.round(width / charWidth))
    canvas.height = Math.max(1, Math.round(height / lineHeight))

    if (media.src.endsWith('.svg')) {
      context.fillStyle = '#fff'
      context.fillRect(0, 0, canvas.width, canvas.height)
    }

    if (options.opacity !== undefined) {
      context.fillStyle = '#fff'
      context.fillRect(0, 0, canvas.width, canvas.height)
      context.globalAlpha = typeof options.opacity === 'number' ? options.opacity : 0.5
    }

    if (objectFit === 'cover') {
      drawCover(context, media, state, canvas)
    } else {
      context.drawImage(media, 0, 0, canvas.width, canvas.height)
    }

    context.globalAlpha = 1

    const image = context.getImageData(0, 0, canvas.width, canvas.height)
    let text = ''

    for (let index = 0; index < image.data.length; index += 4) {
      const red = image.data[index]
      const green = image.data[index + 1]
      const blue = image.data[index + 2]
      const luminance = red * 0.21 + green * 0.72 + blue * 0.07
      const isLineEnd = (index / 4 + 1) % canvas.width === 0

      text += `${charFromLuminance(luminance)}${isLineEnd ? '\n' : ''}`
    }

    state.text = text
    ascii.innerText = filter(text)

    if (state.firstRender && options.onReady) {
      state.firstRender = false
      options.onReady(ascii)
    }
  }

  const setReady = () => {
    const isVideo = media.tagName === 'VIDEO'

    if (objectFit === 'cover' && !isVideo && media.srcset) {
      state.source = new Image()
      state.source.onload = () => {
        state.sourceWidth = state.source.width
        state.sourceHeight = state.source.height
        state.ready = true
        render()
        if (options.fadein) startFadeLoop(ascii, filter, state, options.fadein)
      }
      state.source.src = media.srcset.split(', ')[1]?.split(' ')[0] || media.currentSrc || media.src
      return
    }

    state.sourceWidth = isVideo ? media.videoWidth : media.naturalWidth || media.width
    state.sourceHeight = isVideo ? media.videoHeight : media.naturalHeight || media.height
    state.ready = true
    render()

    if (options.fadein) {
      startFadeLoop(ascii, filter, state, options.fadein)
    }
  }

  const startVideo = () => {
    if ('requestVideoFrameCallback' in HTMLVideoElement.prototype) {
      const frame = () => {
        render()
        state.videoFrame = media.requestVideoFrameCallback(frame)
      }

      state.videoFrame = media.requestVideoFrameCallback(frame)
      return
    }

    let lastTime = 0
    const frame = () => {
      if (!media.paused && !media.ended) {
        const currentTime = media.currentTime

        if (Math.abs(currentTime - lastTime) >= 0.016) {
          lastTime = currentTime
          render()
        }

        state.frame = requestAnimationFrame(frame)
      }
    }

    state.frame = requestAnimationFrame(frame)
  }

  const prepareVideo = () => {
    if (isPlaying(media)) {
      startVideo()
    } else {
      state.playHandler = () => startVideo()
      media.addEventListener('play', state.playHandler, { once: true })
    }
  }

  state.resizeObserver = new ResizeObserver(render)
  state.resizeObserver.observe(media)

  if (media.tagName === 'IMG') {
    if (media.complete) {
      setReady()
    } else {
      media.addEventListener('load', setReady, { once: true })
    }
  } else if (media.tagName === 'VIDEO') {
    if (media.readyState === 4 || isPlaying(media)) {
      setReady()
      prepareVideo()
    } else {
      media.addEventListener('loadeddata', () => {
        setReady()
        prepareVideo()
      }, { once: true })
    }
  } else if (media.tagName === 'CANVAS') {
    state.ready = true
    render()
  }

  return () => {
    state.alive = false
    ascii.remove()
    state.resizeObserver?.disconnect()

    if (state.frame) {
      cancelAnimationFrame(state.frame)
    }

    if (
      state.videoFrame !== null &&
      media.tagName === 'VIDEO' &&
      'cancelVideoFrameCallback' in HTMLVideoElement.prototype
    ) {
      media.cancelVideoFrameCallback(state.videoFrame)
    }

    if (state.playHandler) {
      media.removeEventListener('play', state.playHandler)
    }
  }
}

const drawCover = (context, media, state, canvas) => {
  const [positionX, positionY] = getStyle(media, 'object-position').split(' ')
  const scale = Math.max(
    canvas.width / state.sourceWidth,
    (canvas.height / state.sourceHeight) * 2,
  )
  const width = state.sourceWidth * scale
  const height = state.sourceHeight * scale * 0.5
  const x = (canvas.width - width) * (Number.parseFloat(positionX) / 100)
  const y = (canvas.height - height) * (Number.parseFloat(positionY) / 100)

  context.drawImage(
    state.source || media,
    0,
    0,
    state.sourceWidth,
    state.sourceHeight,
    x,
    y,
    width,
    height,
  )
}

const startFadeLoop = (element, filter, state, options) => {
  const fadeFilter = createFadeFilter({
    ...(options === true ? {} : options),
    onStart: options?.onStart,
    onComplete: () => {
      if (state.frame) {
        cancelAnimationFrame(state.frame)
        state.frame = null
      }
      options?.onComplete?.()
    },
  })

  const frame = () => {
    if (state.text) {
      element.innerText = fadeFilter(filter(state.text))
    }
    state.frame = requestAnimationFrame(frame)
  }

  state.frame = requestAnimationFrame(frame)
}

const createFadeFilter = ({
  duration = 1500,
  delay = 50,
  sweep = 0,
  onComplete,
  onStart,
} = {}) => {
  const start = Date.now()
  let didComplete = false
  let didStart = false

  return (text) => {
    const elapsed = Date.now() - start - delay

    if (elapsed < 0) return text.replace(/[^\n]/g, ' ')

    if (!didStart) {
      didStart = true
      onStart?.()
    }

    const total = duration + sweep

    if (Math.min(elapsed / total, 1) >= 1) {
      if (!didComplete) {
        didComplete = true
        onComplete?.()
      }
      return text
    }

    let rows = 0

    for (const char of text) {
      if (char === '\n') rows += 1
    }

    if (!rows) rows = 1

    let row = 0
    let output = ''

    for (let index = 0; index < text.length; index += 1) {
      const char = text[index]

      if (char === '\n') {
        output += char
        row += 1
        continue
      }

      if (char === ' ') {
        output += char
        continue
      }

      const localElapsed = elapsed - (sweep ? (row / rows) * sweep : 0)
      const progress = easeInOutQuad(Math.max(0, Math.min(localElapsed / duration, 1)))
      const charIndex = asciiChars.indexOf(char)
      const nextIndex = Math.floor(lerp(23, charIndex >= 0 ? charIndex : 0, progress))

      output += nextIndex >= 23 ? ' ' : asciiChars[Math.max(0, Math.min(nextIndex, 22))] || char
    }

    return output
  }
}

const isPlaying = (media) => (
  media.currentTime > 0 && !media.paused && !media.ended && media.readyState > 2
)

const charFromLuminance = (value) => asciiChars[Math.ceil(((asciiChars.length - 1) * value) / 255)]

const getStyle = (element, property) => getComputedStyle(element).getPropertyValue(property)

const cssNumber = (name, fallback) => (
  Number.parseFloat(getComputedStyle(document.documentElement).getPropertyValue(name)) || fallback
)

const easeInOutQuad = (value) => (
  value < 0.5 ? 2 * value * value : (4 - 2 * value) * value - 1
)

const lerp = (from, to, progress) => from * (1 - progress) + to * progress
