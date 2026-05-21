const palettes = {
  fantasy: [
    [29, 43, 83],
    [126, 37, 83],
    [0, 135, 81],
    [171, 82, 54],
    [95, 87, 79],
    [194, 195, 199],
    [255, 241, 232],
    [255, 0, 77],
    [255, 163, 0],
    [255, 236, 39],
    [0, 228, 54],
    [41, 173, 255],
    [131, 118, 156],
    [255, 119, 168],
    [255, 204, 170],
  ],
  c64: [
    [136, 0, 0],
    [170, 255, 238],
    [204, 68, 204],
    [0, 204, 85],
    [0, 0, 170],
    [238, 238, 119],
    [221, 136, 85],
    [102, 68, 0],
    [255, 119, 119],
    [51, 51, 51],
    [119, 119, 119],
    [170, 255, 102],
    [0, 136, 255],
    [187, 187, 187],
  ],
  ansi: [
    [0, 128, 128],
    [0, 192, 192],
    [0, 255, 255],
    [128, 255, 255],
    [192, 255, 255],
  ],
  nes: [
    [124, 124, 124],
    [0, 0, 252],
    [0, 0, 188],
    [68, 40, 188],
    [148, 0, 132],
    [168, 0, 32],
    [168, 16, 0],
    [136, 20, 0],
    [80, 48, 0],
    [0, 120, 0],
    [0, 104, 0],
    [0, 88, 0],
    [0, 64, 88],
    [188, 188, 188],
  ],
  db16: [
    [68, 36, 52],
    [48, 52, 109],
    [78, 74, 78],
    [133, 76, 48],
    [52, 101, 36],
    [208, 70, 72],
    [117, 113, 97],
    [89, 125, 206],
    [210, 125, 44],
    [133, 149, 161],
    [109, 170, 44],
    [210, 170, 153],
    [109, 194, 202],
    [218, 212, 94],
    [222, 238, 214],
  ],
}

let activeRenderers = []
let modeObserver = null
let modeListener = null

export const initPixelMediaMode = (root = document) => {
  destroyPixelMediaMode()

  const apply = () => {
    clearRenderers()

    if (!document.documentElement.classList.contains('pixelmode')) return

    activeRenderers = Array.from(root.querySelectorAll('img:not(.raw), video:not(.raw)'))
      .filter((media) => !media.closest('.gridcontainer'))
      .map((media) => createPixelMedia(media, {
        factor: 1,
        invertOnDarkMode: Boolean(media.closest('#footer')),
      }))
      .filter(Boolean)
  }

  modeObserver = new MutationObserver(apply)
  modeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })

  modeListener = apply
  window.addEventListener('aino:modechange', modeListener)

  apply()

  return destroyPixelMediaMode
}

export const destroyPixelMediaMode = () => {
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

export const createPixelMedia = (media, { factor = 1, invertOnDarkMode = false } = {}) => {
  const parent = media.parentNode
  const pixelCanvas = document.createElement('canvas')
  const pixelContext = pixelCanvas.getContext('2d', { willReadFrequently: true })
  const overlay = document.createElement('div')
  const overlayCanvas = document.createElement('canvas')
  const state = {
    frame: null,
    videoFrame: null,
    playHandler: null,
    resizeObserver: null,
    alive: true,
    ready: false,
  }

  if (!parent || !pixelContext) return null

  pixelCanvas.className = 'pixelate'
  overlay.className = 'overlay'
  overlay.appendChild(overlayCanvas)
  parent.appendChild(pixelCanvas)
  parent.appendChild(overlay)

  const resize = () => {
    const bounds = media.getBoundingClientRect()
    const charWidth = cssNumber('--ch', 8)
    const lineHeight = cssNumber('--line', cssNumber('--line-height', 16))
    const width = Math.round(bounds.width / charWidth) * factor
    const height = Math.round(bounds.height / lineHeight) * factor

    if (!width || !height) return false

    pixelCanvas.width = Math.max(1, width)
    pixelCanvas.height = Math.max(1, height)
    pixelCanvas.style.width = `${width * charWidth}px`
    pixelCanvas.style.height = `${height * lineHeight}px`
    overlay.style.width = `${width * charWidth}px`
    overlay.style.height = `${height * lineHeight}px`

    return true
  }

  const drawPixels = () => {
    if (!state.ready || !state.alive || !pixelCanvas.width || !pixelCanvas.height) return

    try {
      pixelContext.drawImage(media, 0, 0, pixelCanvas.width, pixelCanvas.height)
      quantizeCanvas(pixelContext, pixelCanvas, invertOnDarkMode && isDarkMode())
    } catch {
      // A cross-origin media source can taint canvas. The original effect skips those frames.
    }
  }

  const drawOverlay = () => {
    if (!pixelCanvas.width || !pixelCanvas.height) return

    const charWidth = cssNumber('--ch', 8)
    const lineHeight = cssNumber('--line', cssNumber('--line-height', 16))
    const background = cssRgb(isDarkMode() ? '--dark' : '--light')
    const context = overlayCanvas.getContext('2d')

    if (!context) return

    overlayCanvas.width = pixelCanvas.width * charWidth
    overlayCanvas.height = pixelCanvas.height * lineHeight
    overlayCanvas.style.width = `${pixelCanvas.width * charWidth}px`
    overlayCanvas.style.height = `${pixelCanvas.height * lineHeight}px`

    const ratio = window.devicePixelRatio || 1
    overlayCanvas.width = overlayCanvas.offsetWidth * ratio
    overlayCanvas.height = overlayCanvas.offsetHeight * ratio
    context.setTransform(ratio, 0, 0, ratio, 0, 0)

    const width = overlayCanvas.offsetWidth
    const height = overlayCanvas.offsetHeight
    const cellWidth = charWidth - 2
    const cellHeight = lineHeight - 2
    const radius = Math.min(cellWidth, cellHeight) / 3

    context.clearRect(0, 0, width, height)
    context.fillStyle = `rgb(${background.join(',')})`
    context.fillRect(0, 0, width, height)
    context.globalCompositeOperation = 'destination-out'

    for (let y = 0.5; y < height; y += lineHeight) {
      for (let x = 0.5; x < width; x += charWidth) {
        context.beginPath()
        roundedRect(context, x, y, cellWidth, cellHeight, radius)
        context.fill()
      }
    }

    context.globalCompositeOperation = 'source-over'
  }

  const render = () => {
    if (!state.alive || !resize()) return
    drawPixels()
    drawOverlay()
  }

  const setReady = () => {
    state.ready = true
    render()

    if (media.tagName === 'VIDEO') {
      prepareVideo()
    }
  }

  const startVideo = () => {
    if (typeof HTMLVideoElement !== 'undefined' && 'requestVideoFrameCallback' in HTMLVideoElement.prototype) {
      const frame = () => {
        drawPixels()
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
          drawPixels()
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
    } else {
      media.addEventListener('loadeddata', setReady, { once: true })
    }
  } else {
    return null
  }

  return () => {
    state.alive = false
    state.resizeObserver?.disconnect()
    media.removeEventListener('load', setReady)
    media.removeEventListener('loadeddata', setReady)
    pixelCanvas.remove()
    overlay.remove()

    if (state.frame) {
      cancelAnimationFrame(state.frame)
    }

    if (
      state.videoFrame !== null &&
      media.tagName === 'VIDEO' &&
      typeof HTMLVideoElement !== 'undefined' &&
      'cancelVideoFrameCallback' in HTMLVideoElement.prototype
    ) {
      media.cancelVideoFrameCallback(state.videoFrame)
    }

    if (state.playHandler) {
      media.removeEventListener('play', state.playHandler)
    }
  }
}

const quantizeCanvas = (context, canvas, invert = false) => {
  const image = context.getImageData(0, 0, canvas.width, canvas.height)
  const { data } = image

  for (let index = 0; index < data.length; index += 4) {
    let red = data[index]
    let green = data[index + 1]
    let blue = data[index + 2]
    const alpha = data[index + 3]

    if (invert) {
      red = 255 - red
      green = 255 - green
      blue = 255 - blue
    }

    const [nextRed, nextGreen, nextBlue] = nearestPaletteColor([red, green, blue, alpha], invert)

    data[index] = nextRed
    data[index + 1] = nextGreen
    data[index + 2] = nextBlue
    data[index + 3] = 255
  }

  context.putImageData(image, 0, 0)
}

const nearestPaletteColor = ([red, green, blue, alpha], invert = false) => {
  const opacity = alpha / 255
  const background = cssRgb(invert ? '--dark' : '--light')
  const blended = [
    red * opacity + background[0] * (1 - opacity),
    green * opacity + background[1] * (1 - opacity),
    blue * opacity + background[2] * (1 - opacity),
  ]
  let match = null
  let distance = Infinity

  for (const color of currentPalette()) {
    const [nextRed, nextGreen, nextBlue] = color
    const nextDistance = (
      (nextRed - blended[0]) ** 2 +
      (nextGreen - blended[1]) ** 2 +
      (nextBlue - blended[2]) ** 2 +
      50 * (1 - saturation(nextRed, nextGreen, nextBlue))
    )

    if (nextDistance < distance) {
      distance = nextDistance
      match = color
    }
  }

  return match || blended
}

const currentPalette = () => {
  const theme = getStoredTheme()
  const palette = palettes[theme] || palettes.fantasy

  return [
    ...palette,
    cssRgb('--dark'),
    cssRgb('--light'),
  ]
}

const getStoredTheme = () => {
  try {
    return JSON.parse(localStorage.getItem('site') || '{}')?.theme || 'fantasy'
  } catch {
    return 'fantasy'
  }
}

const roundedRect = (context, x, y, width, height, radius) => {
  if (typeof context.roundRect === 'function') {
    context.roundRect(x, y, width, height, radius)
    return
  }

  context.moveTo(x + radius, y)
  context.lineTo(x + width - radius, y)
  context.quadraticCurveTo(x + width, y, x + width, y + radius)
  context.lineTo(x + width, y + height - radius)
  context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
  context.lineTo(x + radius, y + height)
  context.quadraticCurveTo(x, y + height, x, y + height - radius)
  context.lineTo(x, y + radius)
  context.quadraticCurveTo(x, y, x + radius, y)
}

const isPlaying = (media) => (
  media.currentTime > 0 && !media.paused && !media.ended && media.readyState > 2
)

const isDarkMode = () => document.documentElement.classList.contains('dark')

const saturation = (red, green, blue) => {
  const max = Math.max(red, green, blue)

  return max === 0 ? 0 : (max - Math.min(red, green, blue)) / max
}

const cssRgb = (name) => getComputedStyle(document.documentElement)
  .getPropertyValue(name)
  .split(',')
  .map((value) => Number.parseFloat(value.trim()) || 0)

const cssNumber = (name, fallback) => (
  Number.parseFloat(getComputedStyle(document.documentElement).getPropertyValue(name)) || fallback
)
