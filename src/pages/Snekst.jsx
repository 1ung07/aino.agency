import { useEffect, useRef } from 'react'
import { createTextGridPhysics } from '../animations/textGridPhysics.js'
import BossOverlay from '../components/BossOverlay.jsx'

const gameWidth = 60
const gameHeight = 36
const statsWidth = 20
const backgroundChar = '\u00b7'
const cellCols = 2
const cellRows = 1
const boardCols = gameWidth / cellCols
const boardRows = gameHeight / cellRows
const initialSize = 4
const initialSpeed = 150
const speedStep = 5
const minSpeed = 50
const directions = {
  UP: { x: 0, y: -1 },
  DOWN: { x: 0, y: 1 },
  LEFT: { x: -1, y: 0 },
  RIGHT: { x: 1, y: 0 },
}

const Snekst = () => {
  const gridRef = useRef(null)
  const bossRef = useRef(null)
  const bossHandlersRef = useRef({})

  useEffect(() => {
    if (!gridRef.current) return undefined

    const gridNode = gridRef.current
    const grid = createTextGridPhysics(gridNode)
    const timers = new Set()
    const abortController = new AbortController()
    let snake = []
    let food = null
    let direction = directions.RIGHT
    let nextDirection = directions.RIGHT
    let points = []
    let isGameOver = false
    let isPlaying = false
    let moveTimer = null
    let score = 0
    let speed = initialSpeed
    let startedAt = 0
    let highscores = []
    let scoresLoaded = false
    let scoresLoadedAt = 0
    let enteringInitials = false
    let initials = ['A', 'A', 'A']
    let initialIndex = 0
    let finalScore = 0
    let initialsReady = false
    let canRestart = false
    let gameOverStartedAt = 0
    let attractStartedAt = Date.now()

    bossHandlersRef.current = {
      onPause: () => {
        if (moveTimer) {
          window.clearInterval(moveTimer)
          moveTimer = null
        }
      },
      onResume: () => {
        if (isPlaying && !isGameOver && !enteringInitials && !moveTimer) restartMoveTimer()
      },
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
      const gameCol = col + 2

      return {
        gameCol,
        gameRow: 3,
        statsCol: gameCol + gameWidth + 4,
        cols: grid.dimensions.cols,
        rows: grid.dimensions.rows,
      }
    }

    const createBackground = (layoutState, maxRows = gameHeight) => {
      const output = []
      const rows = Math.min(maxRows, gameHeight)

      for (let row = layoutState.gameRow; row < layoutState.gameRow + rows; row += 1) {
        for (let col = layoutState.gameCol; col < layoutState.gameCol + gameWidth; col += 1) {
          output.push(grid.createPoint({
            x: col / layoutState.cols,
            y: row / layoutState.rows,
            value: backgroundChar,
            context: 'background',
          }))
        }
      }

      return output
    }

    const createStats = (layoutState) => {
      const output = []
      const addRow = (label, value, row) => {
        const displayValue = String(value)
        const gap = statsWidth - label.length - displayValue.length

        output.push(...grid.createText({
          col: layoutState.statsCol,
          row: layoutState.gameRow + row,
          text: `${label}${' '.repeat(Math.max(1, gap))}${displayValue}`,
          context: 'stats',
        }))
      }

      addRow('Score', score, 0)
      addRow('Speed', Math.round((1000 / speed) * 10) / 10, 2)
      addRow('Size', snake.length, 4)
      addRow('Time', formatTime(elapsedSeconds(startedAt)), 6)

      return output
    }

    const createTitle = (layoutState) => {
      const output = [
        ...grid.createText({ text: 'Snekst', row: layoutState.gameRow, col: 0, context: 'heading' }),
      ]
      const monthlyScores = highscores.filter((entry) => isCurrentMonth(entry.created_at)).slice(0, 10)
      const firstScoreRow = layoutState.gameRow + 2
      const revealElapsed = scoresLoadedAt ? Date.now() - scoresLoadedAt : 0

      if (scoresLoaded && monthlyScores.length > 0) {
        for (let index = 0; index < monthlyScores.length && revealElapsed >= 50 * (index + 1); index += 1) {
          output.push(...grid.createText({
            text: formatScore(monthlyScores[index], index),
            row: firstScoreRow + index,
            col: 0,
            context: 'title',
          }))
        }
      } else if (scoresLoaded) {
        output.push(...grid.createText({
          text: 'No Scores Yet',
          row: firstScoreRow,
          col: 0,
          context: 'title',
        }))
      }

      return output
    }

    const spawnFood = () => {
      let nextFood = null

      do {
        nextFood = {
          x: Math.floor(Math.random() * boardCols),
          y: Math.floor(Math.random() * boardRows),
        }
      } while (snake.some((segment) => segment.x === nextFood.x && segment.y === nextFood.y))

      food = nextFood
    }

    const moveSnake = () => {
      if (isGameOver || !isPlaying) return

      direction = nextDirection

      const head = {
        x: snake[0].x + direction.x,
        y: snake[0].y + direction.y,
      }
      const hitWall = head.x < 0 || head.x >= boardCols || head.y < 0 || head.y >= boardRows
      const hitBody = snake.slice(1).some((segment) => segment.x === head.x && segment.y === head.y)

      if (hitWall || hitBody) {
        endGame()
        return
      }

      snake.unshift(head)

      if (food && head.x === food.x && head.y === food.y) {
        score += 10
        speed = Math.max(minSpeed, speed - speedStep)
        spawnFood()
        restartMoveTimer()
      } else {
        snake.pop()
      }

      renderPlaying()
    }

    const restartMoveTimer = () => {
      if (moveTimer) window.clearInterval(moveTimer)
      moveTimer = window.setInterval(moveSnake, speed)
    }

    const createSnakePoints = (layoutState) => {
      const output = []

      snake.forEach((segment, index) => {
        const value = index === 0 ? '@' : 'O'

        for (let row = 0; row < cellRows; row += 1) {
          for (let col = 0; col < cellCols; col += 1) {
            output.push(grid.createPoint({
              x: (layoutState.gameCol + segment.x * cellCols + col) / layoutState.cols,
              y: (layoutState.gameRow + segment.y * cellRows + row) / layoutState.rows,
              value,
              context: 'snake',
            }))
          }
        }
      })

      if (food) {
        for (let row = 0; row < cellRows; row += 1) {
          for (let col = 0; col < cellCols; col += 1) {
            output.push(grid.createPoint({
              x: (layoutState.gameCol + food.x * cellCols + col) / layoutState.cols,
              y: (layoutState.gameRow + food.y * cellRows + row) / layoutState.rows,
              value: '\u25cf',
              context: 'food',
            }))
          }
        }
      }

      return output
    }

    const renderPlaying = () => {
      if (isGameOver) return

      const currentLayout = layout()

      points = [
        ...createBackground(currentLayout),
        ...createTitle(currentLayout),
        ...createStats(currentLayout),
        ...createSnakePoints(currentLayout),
      ]
      grid.render(points)
    }

    const startGame = () => {
      if (isPlaying || enteringInitials || (isGameOver && !canRestart)) return

      isGameOver = false
      canRestart = false
      enteringInitials = false
      initialsReady = false
      gameOverStartedAt = 0
      isPlaying = true
      score = 0
      speed = initialSpeed
      points = []
      direction = directions.RIGHT
      nextDirection = directions.RIGHT
      startedAt = Date.now()

      const startX = Math.floor(boardCols / 2)
      const startY = Math.floor(boardRows / 2)

      snake = []
      for (let index = 0; index < initialSize; index += 1) {
        snake.push({ x: startX - index, y: startY })
      }

      spawnFood()
      restartMoveTimer()
      bossRef.current?.show()
      renderPlaying()
    }

    const endGame = () => {
      isGameOver = true
      isPlaying = false
      bossRef.current?.hide()
      if (moveTimer) {
        window.clearInterval(moveTimer)
        moveTimer = null
      }

      finalScore = score
      gameOverStartedAt = 0
      canRestart = false
      initialsReady = false

      const falling = points.filter((point) => point.context !== 'stats' && point.context !== 'heading')

      grid.gravitate(falling, { gravity: 2.5, damping: 0.85 })
      points = falling

      queueTimer(() => {
        gameOverStartedAt = Date.now()

        if (isHighscore(finalScore)) {
          enteringInitials = true
          initials = ['A', 'A', 'A']
          initialIndex = 0
        } else {
          canRestart = true
        }
      }, 2000)
    }

    const addGameOverOverlay = (currentLayout) => {
      if (!gameOverStartedAt) return

      const elapsed = Date.now() - gameOverStartedAt
      const row = currentLayout.gameRow
      const col = currentLayout.gameCol

      points = points.filter((point) => point.context !== 'gameover-overlay')

      if (elapsed > 0) {
        const progress = Math.min(1, elapsed / 500)
        const overlay = grid.createText({
          text: 'Game Over',
          row,
          col,
          context: 'gameover-overlay',
        })

        for (let index = Math.ceil(overlay.length * progress); index < overlay.length; index += 1) {
          overlay[index].value = ' '
        }

        points.push(...overlay)
      }

      if (enteringInitials) {
        if (elapsed > 1000 && !initialsReady) {
          const flashIndex = Math.floor((elapsed - 1000) / 250)

          if (flashIndex >= 6) {
            initialsReady = true
          } else if (flashIndex % 2 === 0) {
            points.push(...grid.createText({
              text: 'Enter Initials',
              row: row + 2,
              col,
              context: 'gameover-overlay',
            }))
          }
        }

        if (initialsReady) {
          points.push(
            ...grid.createText({
              text: 'Enter Initials',
              row: row + 2,
              col,
              context: 'gameover-overlay',
            }),
            ...grid.createText({
              text: initials.join(' '),
              row: row + 4,
              col,
              context: 'gameover-overlay',
            }),
            ...grid.createText({
              text: initials.map((_, index) => (index === initialIndex ? '_' : ' ')).join(' '),
              row: row + 5,
              col,
              context: 'gameover-overlay',
            }),
          )
        }
      } else if (canRestart && elapsed > 1000 && Math.floor((elapsed - 1000) / 500) % 2 === 0) {
        points.push(...grid.createText({
          text: 'Press Space',
          row: row + 2,
          col,
          context: 'gameover-overlay',
        }))
      }
    }

    const renderAttract = () => {
      const currentLayout = layout()
      const elapsed = Date.now() - attractStartedAt
      const revealRows = Math.min(gameHeight, Math.floor(elapsed / 30))
      const output = [
        ...createBackground(currentLayout, revealRows),
        ...createTitle(currentLayout),
        ...createStats(currentLayout),
      ]
      const scoreRevealDelay = 50 * (highscores.length + 1)
      const shouldBlink = Math.floor(elapsed / 500) % 2 === 0

      if (elapsed > scoreRevealDelay && shouldBlink) {
        output.push(...grid.createText({
          text: 'Press Space',
          row: currentLayout.gameRow + gameHeight - 1,
          col: 0,
          context: 'prompt',
        }))
      }

      grid.render(output)
    }

    const saveInitials = () => {
      const value = initials.join('')
      const currentLayout = layout()

      enteringInitials = false
      initialsReady = false
      gameOverStartedAt = 0
      points = points.filter((point) => point.context !== 'gameover-overlay')
      points.push(...grid.createText({
        text: 'Saving',
        row: currentLayout.gameRow,
        col: currentLayout.gameCol,
        context: 'gameover-overlay',
      }))

      fetch('/api/highscores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ game: 'snekst', initials: value, score: finalScore }),
        signal: abortController.signal,
      })
        .catch(() => {})
        .finally(() => {
          isGameOver = false
          points = []
          attractStartedAt = Date.now()
          fetchScores()
        })
    }

    const onKeyDown = (event) => {
      if (enteringInitials && initialsReady) {
        event.preventDefault()

        if (event.code === 'Enter') {
          saveInitials()
        } else if (event.code === 'Backspace') {
          if (initialIndex > 0) initialIndex -= 1
        } else if (/^[A-Za-z]$/.test(event.key)) {
          initials[initialIndex] = event.key.toUpperCase()
          if (initialIndex < 2) initialIndex += 1
        }

        return
      }

      if (event.code === 'Space' && !isPlaying) {
        event.preventDefault()
        startGame()
        return
      }

      if (!isPlaying || isGameOver) return

      if (event.code === 'Escape') {
        event.preventDefault()
        endGame()
        return
      }

      switch (event.code) {
        case 'ArrowUp':
        case 'KeyW':
          if (direction !== directions.DOWN) nextDirection = directions.UP
          event.preventDefault()
          break
        case 'ArrowDown':
        case 'KeyS':
          if (direction !== directions.UP) nextDirection = directions.DOWN
          event.preventDefault()
          break
        case 'ArrowLeft':
        case 'KeyA':
          if (direction !== directions.RIGHT) nextDirection = directions.LEFT
          event.preventDefault()
          break
        case 'ArrowRight':
        case 'KeyD':
          if (direction !== directions.LEFT) nextDirection = directions.RIGHT
          event.preventDefault()
          break
        default:
          break
      }
    }

    const onClick = () => {
      if (!isPlaying && !enteringInitials) startGame()
    }

    const isHighscore = (value) => {
      if (!scoresLoaded) return true

      const monthlyScores = highscores.filter((entry) => isCurrentMonth(entry.created_at))

      return monthlyScores.length < 10 || value > monthlyScores[monthlyScores.length - 1].score
    }

    const fetchScores = () => {
      fetch('/api/highscores?game=snekst', { signal: abortController.signal })
        .then((response) => (response.ok ? response.json() : []))
        .then((scores) => {
          highscores = Array.isArray(scores) ? scores : []
          scoresLoaded = true
          scoresLoadedAt = Date.now()
        })
        .catch((error) => {
          if (error.name === 'AbortError') return

          highscores = []
          scoresLoaded = true
          scoresLoadedAt = Date.now()
        })
    }

    const stopFrame = grid.listen('frame', ({ delta }) => {
      if ((isGameOver || enteringInitials) && points.length > 0) {
        const currentLayout = layout()

        points = points.filter((point) => point.context !== 'stats' && point.context !== 'heading')
        points.push(
          ...grid.createText({ text: 'Snekst', row: currentLayout.gameRow, col: 0, context: 'heading' }),
          ...createStats(currentLayout),
        )
        grid.applyPhysics(points, delta)
        addGameOverOverlay(currentLayout)
        grid.render(points)
      } else if (!isPlaying && !enteringInitials) {
        renderAttract()
      }
    })
    const stopResize = grid.listen('resize', () => {
      if (isPlaying) renderPlaying()
      if (!isPlaying && !isGameOver && !enteringInitials) renderAttract()
    })

    document.addEventListener('keydown', onKeyDown)
    gridNode.addEventListener('click', onClick)
    fetchScores()
    queueTimer(renderAttract, 50)

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      gridNode.removeEventListener('click', onClick)
      stopFrame()
      stopResize()
      if (moveTimer) window.clearInterval(moveTimer)
      timers.forEach((timer) => window.clearTimeout(timer))
      abortController.abort()
      bossHandlersRef.current = {}
      grid.destroy()
    }
  }, [])

  return (
    <main id="app" className="play-page">
      <BossOverlay
        ref={bossRef}
        onPause={() => bossHandlersRef.current.onPause?.()}
        onResume={() => bossHandlersRef.current.onResume?.()}
      />
      <div ref={gridRef} className="snekst-grid mono" />
    </main>
  )
}

const formatTime = (seconds) => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainingSeconds = seconds % 60

  return [
    hours.toString().padStart(2, '0'),
    minutes.toString().padStart(2, '0'),
    remainingSeconds.toString().padStart(2, '0'),
  ].join(':')
}

const elapsedSeconds = (startedAt) => (
  startedAt ? Math.floor((Date.now() - startedAt) / 1000) : 0
)

const isCurrentMonth = (dateValue) => {
  const date = new Date(dateValue)
  const now = new Date()

  return date.getUTCFullYear() === now.getUTCFullYear() && date.getUTCMonth() === now.getUTCMonth()
}

const formatScore = (entry, index) => {
  const initials = String(entry.initials || 'AAA').slice(0, 3).padEnd(3, ' ')
  const score = String(entry.score || 0)
  const rank = `${index + 1}.`.padEnd(3, ' ')
  const gap = 21 - rank.length - 1 - initials.length - score.length

  return `${rank} ${initials}${' '.repeat(Math.max(1, gap))}${score}`
}

const cssNumber = (name, fallback) => (
  Number.parseFloat(getComputedStyle(document.documentElement).getPropertyValue(name)) || fallback
)

export default Snekst
