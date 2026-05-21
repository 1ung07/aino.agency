import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { createTextGridPhysics } from '../animations/textGridPhysics.js'

const games = [
  { name: 'Textris', slug: 'textris', url: '/play/textris' },
  { name: 'Snekst', slug: 'snekst', url: '/play/snekst' },
  { name: 'Pakku', slug: 'pakku', url: '/play/pakku' },
]

const introDuration = 500
const letterDelay = 30
const fadeDuration = 500
const easeOutCubic = (value) => 1 - (1 - value) ** 3

const Play = () => {
  const gridRef = useRef(null)
  const containerRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (!gridRef.current || !containerRef.current) return undefined

    const gridNode = gridRef.current
    const containerNode = containerRef.current
    const originalParent = gridNode.parentNode
    const originalNextSibling = gridNode.nextSibling
    const originalStyle = gridNode.getAttribute('style')
    const grid = createTextGridPhysics(gridNode)
    const cleanup = []
    const timers = new Set()
    const abortController = new AbortController()
    const highscoresBySlug = {}
    const state = {
      selected: 0,
      exiting: false,
      introStartedAt: Date.now(),
      points: [],
      selectedPoints: [],
      fallingPoints: [],
      transitionStartedAt: 0,
    }

    const queueTimer = (callback, delay) => {
      const timer = window.setTimeout(() => {
        timers.delete(timer)
        callback()
      }, delay)

      timers.add(timer)

      return timer
    }

    const layout = () => {
      const col = cssNumber('--col', 20)

      return {
        gameCol: col + 2,
        scoresCol: 2 * col + 6,
        championsCol: 3 * col + 6,
        cols: grid.dimensions.cols,
        rows: grid.dimensions.rows,
      }
    }

    const positionButtons = () => {
      const charWidth = cssNumber('--ch', 8)
      const lineHeight = cssNumber('--line', 16)
      const { gameCol } = layout()

      buttons.forEach((button, index) => {
        button.style.position = 'absolute'
        button.style.left = `${(gameCol + 2) * charWidth}px`
        button.style.top = `${(3 + index) * lineHeight}px`
        button.style.pointerEvents = 'auto'
        button.style.zIndex = '10'
      })
    }

    const createMenuPoints = () => {
      const { gameCol, scoresCol, championsCol } = layout()
      const points = [
        ...grid.createText({ text: 'Play', row: 3, col: 0, context: 'menu' }),
      ]

      games.forEach((game, index) => {
        const marker = index === state.selected ? '\u25cf' : '\u25cb'

        points.push(
          ...grid.createText({
            text: `${marker} `,
            row: 3 + index,
            col: gameCol,
            context: 'menu',
          }),
          ...grid.createText({
            text: game.name,
            row: 3 + index,
            col: gameCol + 2,
            context: `game-${index}`,
          }),
        )
      })

      points.push(
        ...grid.createText({
          text: 'Arrows to Select',
          row: 3 + games.length + 1,
          col: gameCol,
          context: 'menu',
        }),
        ...grid.createText({
          text: 'Enter to Play',
          row: 3 + games.length + 2,
          col: gameCol,
          context: 'menu',
        }),
      )

      const scores = highscoresBySlug[games[state.selected].slug]
      const monthlyScores = scores
        ? scores.filter((score) => isCurrentMonth(score.created_at)).slice(0, 10)
        : []
      const champions = scores ? scores.slice(0, 3) : []

      if (monthlyScores.length > 0) {
        points.push(
          ...grid.createText({
            text: 'Highscores',
            row: 3,
            col: scoresCol - 2,
            context: 'highscores',
          }),
        )

        monthlyScores.forEach((score, index) => {
          points.push(
            ...grid.createText({
              text: formatScore(score, index),
              row: 5 + index,
              col: scoresCol - 2,
              context: 'highscores',
            }),
          )
        })
      } else {
        points.push(
          ...grid.createText({
            text: scores ? 'No Highscores Yet' : 'Loading Highscores',
            row: 3,
            col: scoresCol - 2,
            context: 'highscores',
          }),
        )
      }

      if (champions.length > 0) {
        points.push(
          ...grid.createText({
            text: 'Grand Champions',
            row: 3,
            col: championsCol,
            context: 'champions',
          }),
        )

        champions.forEach((score, index) => {
          points.push(
            ...grid.createText({
              text: formatScore(score, index),
              row: 5 + index,
              col: championsCol,
              context: 'champions',
            }),
          )
        })
      }

      points.forEach((point) => {
        point.targetValue = point.value
      })

      return points
    }

    const renderIntro = () => {
      const elapsed = Date.now() - state.introStartedAt

      for (const point of state.points) {
        let delay = 0

        if (point.context === 'highscores') delay = 200
        if (point.context === 'champions') delay = 400

        const progress = Math.min(1, Math.max(0, (elapsed - delay) / fadeDuration))

        point.value = fadeChar(point.targetValue || point.value, progress)
      }

      grid.render(state.points)
    }

    const drawMenu = () => {
      if (state.exiting) return

      state.points = createMenuPoints()
      positionButtons()
      renderIntro()
    }

    const startGame = () => {
      if (state.exiting) return

      state.exiting = true
      state.points.forEach((point) => {
        if (point.targetValue) point.value = point.targetValue
      })

      const activeContext = `game-${state.selected}`
      state.selectedPoints = state.points.filter((point) => point.context === activeContext)
      state.fallingPoints = state.points.filter((point) => point.context !== activeContext)

      const bounds = gridNode.getBoundingClientRect()
      const viewportWidth = window.innerWidth
      const viewportHeight = window.innerHeight
      const charWidth = cssNumber('--ch', 8)
      const lineHeight = cssNumber('--line', 16)

      for (const point of state.fallingPoints) {
        point.x = (bounds.left + point.x * bounds.width) / viewportWidth
        point.y = (bounds.top + point.y * bounds.height) / viewportHeight
        point.vy = 0.8 * Math.random() - 0.2
      }

      for (const point of state.selectedPoints) {
        point.x = (bounds.left + point.x * bounds.width) / viewportWidth
        point.y = (bounds.top + point.y * bounds.height) / viewportHeight
      }

      state.selectedPoints
        .sort((a, b) => a.x - b.x)
        .forEach((point, index) => {
          point.startX = point.x
          point.startY = point.y
          point.targetX = ((2 + index) * charWidth) / viewportWidth
          point.targetY = (6 * lineHeight) / viewportHeight
        })

      document.body.appendChild(gridNode)
      Object.assign(gridNode.style, {
        position: 'fixed',
        top: '0',
        left: '0',
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: '9999',
      })

      grid.gravitate(state.fallingPoints, { gravity: 1, damping: 0.6 })
      state.fallingPoints.forEach((point) => {
        point.vx = Math.random() - 0.5
      })
      state.transitionStartedAt = Date.now()

      queueTimer(() => {
        navigate(games[state.selected].url)
      }, introDuration + letterDelay * state.selectedPoints.length + 100)
    }

    const buttons = games.map((game, index) => {
      const button = document.createElement('button')
      const label = document.createElement('span')

      button.className = 'ghost game-btn mono'
      label.textContent = game.name
      label.style.opacity = '0'
      button.appendChild(label)
      containerNode.appendChild(button)
      button.addEventListener('mouseenter', () => {
        if (!state.exiting) {
          state.selected = index
          drawMenu()
        }
      })
      button.addEventListener('click', (event) => {
        event.stopPropagation()
        state.selected = index
        startGame()
      })

      return button
    })

    cleanup.push(() => buttons.forEach((button) => button.remove()))

    games.forEach((game) => {
      fetch(`/api/highscores?game=${game.slug}`, { signal: abortController.signal })
        .then((response) => (response.ok ? response.json() : []))
        .then((scores) => {
          highscoresBySlug[game.slug] = Array.isArray(scores) ? scores : []
          drawMenu()
        })
        .catch((error) => {
          if (error.name === 'AbortError') return

          highscoresBySlug[game.slug] = []
          drawMenu()
        })
    })

    const onKeyDown = (event) => {
      if (state.exiting) return

      if (event.code === 'ArrowUp' || event.code === 'KeyK') {
        event.preventDefault()
        document.activeElement?.blur()
        state.selected = (state.selected - 1 + games.length) % games.length
        drawMenu()
      } else if (event.code === 'ArrowDown' || event.code === 'KeyJ') {
        event.preventDefault()
        document.activeElement?.blur()
        state.selected = (state.selected + 1) % games.length
        drawMenu()
      } else if (event.code === 'Enter' || event.code === 'Space') {
        event.preventDefault()
        startGame()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    cleanup.push(() => document.removeEventListener('keydown', onKeyDown))

    const stopFrame = grid.listen('frame', ({ delta }) => {
      if (state.exiting && (state.fallingPoints.length > 0 || state.selectedPoints.length > 0)) {
        grid.applyPhysics(state.fallingPoints, delta)

        const elapsed = Date.now() - state.transitionStartedAt

        state.selectedPoints.forEach((point, index) => {
          const progress = easeOutCubic(Math.min(1, Math.max(0, (elapsed - index * letterDelay) / introDuration)))

          point.x = point.startX + (point.targetX - point.startX) * progress
          point.y = point.startY + (point.targetY - point.startY) * progress
        })

        grid.render([...state.fallingPoints, ...state.selectedPoints])
        return
      }

      if (!state.exiting && Date.now() - state.introStartedAt < fadeDuration + 400) {
        renderIntro()
      }
    })
    const stopResize = grid.listen('resize', drawMenu)

    cleanup.push(stopFrame, stopResize)
    queueTimer(drawMenu, 50)

    return () => {
      cleanup.forEach((dispose) => dispose?.())
      timers.forEach((timer) => window.clearTimeout(timer))
      abortController.abort()

      if (gridNode.parentNode === document.body) {
        if (originalParent?.isConnected) {
          originalParent.insertBefore(
            gridNode,
            originalNextSibling?.parentNode === originalParent ? originalNextSibling : null,
          )
        } else {
          gridNode.remove()
        }
      }

      if (originalStyle === null) {
        gridNode.removeAttribute('style')
      } else {
        gridNode.setAttribute('style', originalStyle)
      }

      grid.destroy()
    }
  }, [navigate])

  return (
    <main id="app" className="play-page">
      <section ref={containerRef} className="gridcontainer play-container">
        <div ref={gridRef} className="grid mono play-grid" />
      </section>
    </main>
  )
}

const fadeChar = (value, opacity) => {
  const chars = "$MBNQ\u00d8W@&R8GD6S9\u00d6OH#\u00c9E5UK0\u00c4\u00c5A2XP34ZC%VIF17YTJL[]?}{()<>|=+\\/^!\";*_:~,'-.\u00b7`\u00a0 "

  if (opacity === 1) return value

  const index = chars.indexOf(value)

  return index === -1 ? value : chars[Math.floor(lerp(index, chars.length - 1, 1 - opacity))]
}

const cssNumber = (name, fallback) => (
  Number.parseFloat(getComputedStyle(document.documentElement).getPropertyValue(name)) || fallback
)

const lerp = (from, to, progress) => from * (1 - progress) + to * progress

const isCurrentMonth = (dateValue) => {
  const date = new Date(dateValue)
  const now = new Date()

  return date.getUTCFullYear() === now.getUTCFullYear() && date.getUTCMonth() === now.getUTCMonth()
}

const formatScore = ({ initials = '', score = 0 }, index) => {
  const rank = `${index + 1}.`.padEnd(3, ' ')
  const value = String(score)
  const gap = 21 - rank.length - 1 - 3 - value.length

  return `${rank} ${initials}${' '.repeat(Math.max(1, gap))}${value}`
}

export default Play
