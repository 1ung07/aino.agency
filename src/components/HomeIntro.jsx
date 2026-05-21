import { useEffect, useRef } from 'react'
import { createAsciiMedia } from '../animations/asciiMedia.js'
import { revealText } from '../animations/scrollReveal.js'
import { createTextGridPhysics } from '../animations/textGridPhysics.js'
import introVideoSrc from '../assets/media/sm4.mp4'

const densityChars = "$MBNQ\u00d8W@&R8GD6S9\u00d6OH#\u00c9E5UK0\u00c4\u00c5A2XP34ZC%VIF17YTJL[]?}{()<>|=+\\/^!\";*_:~,'-.\u00b7`\u00a0"
const textChars = String(densityChars).replace(/\s/g, '')

const HomeIntro = () => {
  const gridRef = useRef(null)

  useEffect(() => {
    if (!gridRef.current) return undefined

    const gridNode = gridRef.current
    const grid = createTextGridPhysics(gridNode)
    const scratch = grid.createCanvas()
    const cleanup = [() => grid.destroy()]
    const timers = new Set()
    const isTouch = matchMedia('(hover: none)').matches
    let points = []
    let navLayer = []
    let navTarget = []
    let navRevealStarted = false
    let progress = 0
    let navProgress = 0
    let pointerX = window.innerWidth / 2
    let pointerY = window.innerHeight / 2
    let smoothX = pointerX
    let smoothY = pointerY
    let waveX = pointerX
    let started = false
    let ready = false
    let blendingVideo = false
    let blendOpacity = 0
    let logoScale = 0
    let logoX = undefined
    let videoStartedAt = 0
    let logoPoints = []
    let logoImage = null
    let videoObject = null
    let finishing = false
    let introRevealStarted = false

    const queueTimer = (callback, delay) => {
      const timer = window.setTimeout(() => {
        timers.delete(timer)
        callback()
      }, delay)

      timers.add(timer)

      return timer
    }

    const markReady = ({ revealHome = false } = {}) => {
      if (ready) return

      ready = true
      window._ainoHomeVisited = true
      document.body.classList.add('ready')

      if (revealHome) {
        revealHomeContent()
      }
    }

    const revealHomeContent = () => {
      if (introRevealStarted) return

      introRevealStarted = true

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const visibleMedia = Array.from(document.querySelectorAll(
            '.home-content .image img, .home-content .video video',
          )).filter((media) => media.getBoundingClientRect().top < window.innerHeight - 10)

          for (const media of visibleMedia) {
            media.style.opacity = '0'

            const destroyAscii = createAsciiMedia(media, {
              forceShow: true,
              fadein: { duration: 1000, sweep: 800 },
              opacity: 1,
            })

            if (destroyAscii) cleanup.push(destroyAscii)

            const timer = queueTimer(() => {
              const ascii = media.parentNode?.querySelector('.ascii')

              if (ascii) {
                ascii.style.transition = 'opacity 1.8s cubic-bezier(1,.02,.37,.97)'
                ascii.style.opacity = '0'
              }

              media.style.transition = 'opacity 1.8s cubic-bezier(1,.02,.37,.97)'
              media.style.opacity = '1'
              media.style.zIndex = '5'
              media.style.position = 'relative'
            }, 800)

            cleanup.push(() => window.clearTimeout(timer))
          }

          const visibleHtml = Array.from(document.querySelectorAll('.home-content .html'))
            .filter((element) => element.getBoundingClientRect().top < window.innerHeight - 10)

          for (const element of visibleHtml) {
            revealText(element, { speed: 6, duration: 1200 })
          }
        })
      })
    }

    if (window._ainoHomeVisited) {
      markReady()

      return () => {
        cleanup.forEach((dispose) => dispose())
      }
    }

    document.body.classList.remove('ready')

    const setPointer = (event) => {
      if (event.target.closest('.settings')) return

      pointerX = event.clientX
      pointerY = event.clientY
    }

    const createNavPoints = () => {
      const col = cssNumber('--col', 20)
      const output = [
        ...grid.createText({ col: 2, row: 1, context: 'text', text: 'Aino' }),
      ]

      if (window.innerWidth < 768) {
        output.push(
          ...grid.createText({
            col: Math.max(2, grid.dimensions.cols - 15),
            row: 1,
            context: 'text',
            text: 'Contact',
          }),
          ...grid.createText({
            col: Math.max(2, grid.dimensions.cols - 6),
            row: 1,
            context: 'text',
            text: 'Menu',
          }),
        )
      } else {
        output.push(
          ...grid.createText({ col: col + 4, row: 1, context: 'text', text: 'Work  Services' }),
          ...grid.createText({ col: 2 * col + 6, row: 1, context: 'text', text: 'About  Play' }),
          ...grid.createText({ col: 3 * col + 8, row: 1, context: 'text', text: 'Settings' }),
          ...grid.createText({ col: Math.max(2, grid.dimensions.cols - 9), row: 1, context: 'text', text: 'Contact' }),
        )
      }

      return output
    }

    const showRealNav = () => {
      const nav = document.querySelector('#nav')

      if (nav) nav.style.opacity = '1'
    }

    const hideRealNav = () => {
      const nav = document.querySelector('#nav')

      if (nav && !document.body.classList.contains('ready')) nav.style.opacity = ''
    }

    const createWave = (timestamp) => {
      const output = []
      const rows = grid.dimensions.rows
      const cols = grid.dimensions.cols

      for (let row = 0; row < rows; row += 1) {
        const rowEase = cycle(timestamp + row * lerp(50, 150, cycle(timestamp, 4000)), 3000)
        const widthEase = cycle(timestamp, 8000)
        const waveWidth = lerp(0, lerp(30, cols - 2, widthEase), rowEase)
        const centerCol = Math.floor(cols / 2)
        const halfWidth = Math.max(1, Math.floor(waveWidth / 2))

        for (let offset = -halfWidth; offset <= halfWidth; offset += 1) {
          const col = centerCol + offset

          if (col < 0 || col >= cols) continue

          const normalized = (offset + halfWidth) / (2 * halfWidth)
          const phase = 0.003 * (timestamp + (row / 6) * lerp(10, 20, cycle(timestamp, 4000)))
          const pointer = waveX / window.innerWidth
          const luminance = Math.min(
            1,
            (Math.cos(lerp(3, -3, pointer) * Math.PI * (normalized - pointer) + phase) + 1) / 2 +
              (1 - navProgress),
          )
          const charIndex = Number.isNaN(luminance)
            ? textChars.length - 2
            : Math.floor(lerp(0, textChars.length - (navProgress < 0.95 ? 1 : 2), luminance))
          const value = textChars[charIndex]

          if (value?.trim() && navProgress) {
            output.push(grid.createPoint({
              x: col / cols,
              y: row / rows,
              context: 'animation',
              value,
            }))
          }
        }
      }

      if (isTouch && navProgress) {
        output.push(...grid.createText({
          col: 2,
          row: rows - 1,
          context: 'text',
          text: 'Tap to continue',
        }))
      } else if (pointerY > cssNumber('--line', 16) * 2.5 && navProgress) {
        const clickCol = clamp(Math.floor((smoothX / grid.dimensions.width) * cols) - 2, 0, Math.max(0, cols - 5))
        const clickRow = clamp(Math.floor((smoothY / grid.dimensions.height) * rows), 3, Math.max(3, rows - 1))

        output.push(...grid.createText({
          col: clickCol,
          row: clickRow,
          context: 'text',
          text: 'Click',
        }))
      }

      return output
    }

    const startIntroExit = async () => {
      if (started) return

      started = true

      try {
        grid.gravitate(points, { gravity: 2, damping: 0.9 })
        grid.explode(points, { spread: 0.4 })
        await wait(200, queueTimer)

        if (!logoImage) logoImage = await loadImage('/aino.svg')
        grid.paintCanvas(scratch, logoImage, { alpha: 0.25, scale: 0.7 })
        logoPoints = grid.createFromCanvas(scratch, { context: 'logo' })
        grid.morph(points, logoPoints)

        await wait(1400, queueTimer)
        videoObject = await grid.createVideo(introVideoSrc)
        const { video } = videoObject
        await video.play().catch(() => {})

        points = logoPoints
        blendingVideo = true
        videoStartedAt = Date.now()
        animate({
          duration: 2000,
          easing: easeInQuad,
          onFrame: (value) => {
            blendOpacity = value
          },
        })
        animate({
          duration: 2000,
          easing: easeInQuint,
          onFrame: (value) => {
            logoScale = value
          },
        })

        const finishOnPointer = () => finishIntro()

        gridNode.addEventListener('pointerdown', finishOnPointer, { once: true })
        cleanup.push(() => gridNode.removeEventListener('pointerdown', finishOnPointer))
        video.addEventListener('ended', finishIntro, { once: true })
        cleanup.push(() => video.removeEventListener('ended', finishIntro))
      } catch {
        markReady({ revealHome: true })
      }
    }

    const finishIntro = async () => {
      if (ready || finishing) return

      finishing = true
      videoObject?.video.pause()

      points = points.filter((point) => point.value.trim())
      grid.explode(points)
      grid.gravitate(points)
      await wait(2000, queueTimer)
      markReady({ revealHome: true })
    }

    const stopFrame = grid.listen('frame', ({ delta, timestamp }) => {
      const frameDelta = Math.min(delta, 50)

      smoothX += (frameDelta / 200) * (pointerX - smoothX)
      smoothY += (frameDelta / 200) * (pointerY - smoothY)
      waveX += 0.01 * (pointerX - waveX)

      if (ready) {
        if (points.length > 0) {
          grid.applyPhysics(points, frameDelta)
          grid.render(points)
        }

        return
      }

      if (started) {
        grid.applyPhysics(points, frameDelta)

        if (blendingVideo && videoObject) {
          if (Date.now() - videoStartedAt < 4000 && logoImage) {
            const painted = grid.paintCanvas(scratch, logoImage, {
              alpha: 0.2,
              scale: lerp(0.7, 20, logoScale),
              x: logoX,
            })

            logoX = (scratch.width / 2 - painted.w / 2) * lerp(1, 0.9, logoScale)
            points = grid.createFromCanvas(scratch, { context: 'logo' })
          }

          if (!finishing) videoObject.blend(points, blendOpacity)
        }

        grid.render(points)
        return
      }

      progress = Math.min(1, progress + frameDelta / 1000)
      points = createWave(timestamp)

      if (progress < 0.998) {
        navLayer = grid.createText({
          col: 2,
          row: 1,
          context: 'text',
          text: Array(Math.ceil((grid.dimensions.cols - 4) * progress)).fill('=').join(''),
        })
      } else {
        if (!navRevealStarted) {
          navRevealStarted = true
          navTarget = createNavPoints()
          grid.morph(navLayer, navTarget, { duration: 1000 })
          animate({
            duration: 3000,
            easing: easeInQuad,
            onFrame: (value) => {
              navProgress = value
            },
          })
          queueTimer(() => {
            showRealNav()
            navLayer.forEach((point) => {
              point.value = '\u00a0'
            })
          }, 1400)
        }

        grid.applyPhysics(navLayer, frameDelta)
      }

      grid.applyPhysics(points, frameDelta)
      grid.render(points, navLayer)
    })

    const stopResize = grid.listen('resize', () => {
      if (navRevealStarted) {
        navTarget = createNavPoints()
      }

      videoObject?.resize()
    })

    window.addEventListener('pointermove', setPointer)
    gridNode.addEventListener('pointerdown', startIntroExit, { once: true })
    cleanup.push(
      stopFrame,
      stopResize,
      () => window.removeEventListener('pointermove', setPointer),
      () => gridNode.removeEventListener('pointerdown', startIntroExit),
      () => videoObject?.destroy(),
      hideRealNav,
    )

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer))
      cleanup.forEach((dispose) => dispose())
    }
  }, [])

  return (
    <section className="gridcontainer home-intro" aria-hidden="true">
      <div ref={gridRef} className="grid mono" />
    </section>
  )
}

const wait = (duration, queueTimer) => (
  new Promise((resolve) => {
    queueTimer(resolve, duration)
  })
)

const loadImage = (src) => (
  new Promise((resolve, reject) => {
    const image = new Image()

    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error(`Failed to load ${src}`))
    image.src = src
  })
)

const animate = ({ duration, easing = (value) => value, onFrame }) => {
  const startedAt = performance.now()

  const tick = (timestamp) => {
    const progress = Math.min(1, (timestamp - startedAt) / duration)

    onFrame(easing(progress))
    if (progress < 1) requestAnimationFrame(tick)
  }

  requestAnimationFrame(tick)
}

const cssNumber = (name, fallback) => (
  Number.parseFloat(getComputedStyle(document.documentElement).getPropertyValue(name)) || fallback
)

const cycle = (value, duration) => {
  const progress = (value % duration) / duration

  return (1 - Math.cos(2 * Math.PI * progress)) / 2
}

const easeInQuad = (value) => value * value

const easeInQuint = (value) => value ** 5

const lerp = (from, to, progress) => from * (1 - progress) + to * progress

const clamp = (value, min, max) => Math.max(min, Math.min(max, value))

export default HomeIntro
