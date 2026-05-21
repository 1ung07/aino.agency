import { useEffect, useRef } from 'react'
import { createTextGridPhysics } from '../animations/textGridPhysics.js'
import BossOverlay from '../components/BossOverlay.jsx'

const keyCodes = { ESC: 27, SPACE: 32, LEFT: 37, UP: 38, RIGHT: 39, DOWN: 40, P: 80 }
const scoreValues = { SINGLE: 100, DOUBLE: 300, TRIPLE: 500, TETRIS: 800, SOFT_DROP: 1, HARD_DROP: 2 }
const levelSpeeds = {
  0: 800,
  1: 720,
  2: 630,
  3: 550,
  4: 470,
  5: 380,
  6: 300,
  7: 220,
  8: 130,
  9: 100,
  10: 80,
  11: 80,
  12: 80,
  13: 70,
  14: 70,
  15: 70,
  16: 50,
  17: 50,
  18: 50,
  19: 30,
  20: 30,
}
const colors = ['none', '#111', '#222', '#444', '#666', '#aaa', '#ccc', '#ddd']
const shapes = [
  [],
  [
    [0, 0, 0, 0],
    [1, 1, 1, 1],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ],
  [
    [2, 0, 0],
    [2, 2, 2],
    [0, 0, 0],
  ],
  [
    [0, 0, 3],
    [3, 3, 3],
    [0, 0, 0],
  ],
  [
    [4, 4],
    [4, 4],
  ],
  [
    [0, 5, 5],
    [5, 5, 0],
    [0, 0, 0],
  ],
  [
    [0, 6, 0],
    [6, 6, 6],
    [0, 0, 0],
  ],
  [
    [7, 7, 0],
    [0, 7, 7],
    [0, 0, 0],
  ],
]
const densityChars = "$MBNQ\u00d8W@&R8GD6S9\u00d6OH#\u00c9E5UK0\u00c4\u00c5A2XP34ZC%VIF17YTJL[]?}{()<>|=+\\/^!\";*_:~,'-.\u00b7`\u00a0"
const canvasChars = densityChars
  .split('')
  .filter((char) => /[A-Z0-9\s]/.test(char))
  .join('')

const gameWidth = 60
const gameHeight = 36
const statsWidth = 20
const nextWidth = 16
const nextHeight = 8
const backgroundChar = '\u00b7'

const Textris = () => {
  const gridRef = useRef(null)
  const canvasRef = useRef(null)
  const bossRef = useRef(null)
  const bossHandlersRef = useRef({})

  useEffect(() => {
    if (!gridRef.current || !canvasRef.current) return undefined

    const gridNode = gridRef.current
    const canvas = canvasRef.current
    const grid = createTextGridPhysics(gridNode)
    const mainContext = canvas.getContext('2d')
    const sampleCanvas = document.createElement('canvas')
    const nextSampleCanvas = document.createElement('canvas')
    const sampleContext = sampleCanvas.getContext('2d')
    const nextSampleContext = nextSampleCanvas.getContext('2d')
    const timers = new Set()
    const abortController = new AbortController()

    mainContext.imageSmoothingEnabled = false
    canvas.width = 300
    canvas.height = 360
    sampleCanvas.width = gameWidth
    sampleCanvas.height = gameHeight
    nextSampleCanvas.width = nextWidth
    nextSampleCanvas.height = nextHeight
    sampleContext.imageSmoothingEnabled = false
    nextSampleContext.imageSmoothingEnabled = false

    let game = null
    let points = []
    let isGameOver = false
    let isPlaying = false
    let gameOverTextReady = false
    let gameOverStartedAt = 0
    let canRestart = false
    let score = 0
    let level = 0
    let lines = 0
    let startedAt = 0
    let highscores = []
    let scoresLoaded = false
    let scoresLoadedAt = 0
    let enteringInitials = false
    let initials = ['A', 'A', 'A']
    let initialIndex = 0
    let finalScore = 0
    let attractStartedAt = Date.now()

    bossHandlersRef.current = {
      onPause: () => {
        game?.pause()
      },
      onResume: () => {
        game?.pause()
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
        nextRow: 3 + gameHeight - nextHeight + 4,
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
      addRow('Level', level, 2)
      addRow('Lines', lines, 4)
      addRow('Time', formatTime(elapsedSeconds(startedAt)), 6)

      return output
    }

    const createGamePoints = (layoutState) => {
      const output = []

      sampleContext.fillStyle = '#fff'
      sampleContext.fillRect(0, 0, gameWidth, gameHeight)
      sampleContext.drawImage(canvas, 0, 0, canvas.width, canvas.height, 0, 0, gameWidth, gameHeight)
      output.push(...canvasToPoints(sampleContext, gameWidth, gameHeight, layoutState.gameCol, layoutState.gameRow, layoutState, 'game'))

      return output
    }

    const createNextPoints = (layoutState) => {
      if (!game) return []

      const output = []
      const nextCanvas = game.getNextCanvas()

      nextSampleContext.fillStyle = '#fff'
      nextSampleContext.fillRect(0, 0, nextWidth, nextHeight)
      nextSampleContext.drawImage(nextCanvas, 0, 0, nextCanvas.width, nextCanvas.height, 0, 0, nextWidth, nextHeight)
      output.push(...canvasToPoints(nextSampleContext, nextWidth, nextHeight, layoutState.statsCol, layoutState.nextRow, layoutState, 'next'))

      return output
    }

    const createTitle = (layoutState) => {
      const output = [
        ...grid.createText({ text: 'Textris', row: layoutState.gameRow, col: 0, context: 'heading' }),
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

    const renderPlaying = () => {
      if (isGameOver) return

      const currentLayout = layout()

      points = [
        ...createBackground(currentLayout),
        ...createTitle(currentLayout),
        ...createStats(currentLayout),
        ...createGamePoints(currentLayout),
        ...createNextPoints(currentLayout),
      ]
      grid.render(points)
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
          context: 'title',
        }))
      }

      grid.render(output)
    }

    const handleScore = (account) => {
      score = account.score
      level = account.level
      lines = account.lines
    }

    const handleGameOver = (account) => {
      isGameOver = true
      isPlaying = false
      bossRef.current?.hide()
      finalScore = account.score
      gameOverStartedAt = 0
      gameOverTextReady = false
      canRestart = false
      game?.destroy()
      game = null

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

    const startGame = () => {
      if (isPlaying || enteringInitials || (isGameOver && !canRestart)) return

      isGameOver = false
      canRestart = false
      gameOverStartedAt = 0
      gameOverTextReady = false
      isPlaying = true
      score = 0
      level = 0
      lines = 0
      points = []
      startedAt = Date.now()

      game?.destroy()
      game = createTetrisGame(mainContext, {
        onGameOver: handleGameOver,
        onScore: handleScore,
        onFrame: renderPlaying,
      })
      game.play()
      bossRef.current?.show()
    }

    const saveInitials = () => {
      const value = initials.join('')
      const currentLayout = layout()

      enteringInitials = false
      gameOverTextReady = false
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
        body: JSON.stringify({ game: 'textris', initials: value, score: finalScore }),
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
      if (enteringInitials && gameOverTextReady) {
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

      if (event.code === 'Escape' && isPlaying) {
        event.preventDefault()
        event.stopImmediatePropagation()
        handleGameOver({ score })
        return
      }

      if (event.code === 'Space' && !isPlaying) {
        event.preventDefault()
        startGame()
      }
    }

    const onClick = () => {
      if (!isPlaying && !enteringInitials) startGame()
    }

    const stopFrame = grid.listen('frame', ({ delta }) => {
      if ((isGameOver || enteringInitials) && points.length > 0) {
        const currentLayout = layout()

        points = points.filter((point) => point.context !== 'stats' && point.context !== 'heading')
        points.push(
          ...grid.createText({ text: 'Textris', row: currentLayout.gameRow, col: 0, context: 'heading' }),
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
      if (!isPlaying && !isGameOver && !enteringInitials) renderAttract()
      if (isPlaying) renderPlaying()
    })

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
        if (elapsed > 1000 && !gameOverTextReady) {
          const flashIndex = Math.floor((elapsed - 1000) / 250)

          if (flashIndex >= 6) {
            gameOverTextReady = true
          } else if (flashIndex % 2 === 0) {
            points.push(...grid.createText({
              text: 'Enter Initials',
              row: row + 2,
              col,
              context: 'gameover-overlay',
            }))
          }
        }

        if (gameOverTextReady) {
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

    const isHighscore = (value) => {
      if (!scoresLoaded) return true

      const monthlyScores = highscores.filter((entry) => isCurrentMonth(entry.created_at))

      return monthlyScores.length < 10 || value > monthlyScores[monthlyScores.length - 1].score
    }

    const fetchScores = () => {
      fetch('/api/highscores?game=textris', { signal: abortController.signal })
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

    document.addEventListener('keydown', onKeyDown)
    gridNode.addEventListener('click', onClick)
    fetchScores()
    queueTimer(renderAttract, 50)

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      gridNode.removeEventListener('click', onClick)
      stopFrame()
      stopResize()
      timers.forEach((timer) => window.clearTimeout(timer))
      abortController.abort()
      bossHandlersRef.current = {}
      game?.destroy()
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
      <div ref={gridRef} className="textris-grid mono" />
      <canvas ref={canvasRef} id="tetris-canvas" />
    </main>
  )
}

class Piece {
  constructor(context) {
    this.ctx = context
    this.spawn()
  }

  spawn() {
    this.typeId = Math.floor(Math.random() * (colors.length - 1) + 1)
    this.shape = shapes[this.typeId]
    this.color = colors[this.typeId]
    this.x = 0
    this.y = 0
  }

  draw() {
    this.ctx.fillStyle = this.color

    this.shape.forEach((row, rowIndex) => {
      row.forEach((value, colIndex) => {
        if (value > 0) this.ctx.fillRect(this.x + colIndex, this.y + rowIndex, 1, 1)
      })
    })
  }

  move(piece) {
    this.x = piece.x
    this.y = piece.y
    this.shape = piece.shape
  }

  setStartingPosition() {
    this.x = this.typeId === 4 ? 4 : 3
  }
}

class Board {
  constructor(context, nextContext, moves, account, time) {
    this.ctx = context
    this.ctxNext = nextContext
    this.moves = moves
    this.account = account
    this.time = time
    this.init()
  }

  init() {
    this.ctx.canvas.width = 300
    this.ctx.canvas.height = 360
    this.ctx.scale(30, 30)
  }

  reset() {
    this.grid = this.getEmptyGrid()
    this.piece = new Piece(this.ctx)
    this.piece.setStartingPosition()
    this.getNewPiece()
  }

  getNewPiece() {
    this.next = new Piece(this.ctxNext)
    this.ctxNext.clearRect(0, 0, this.ctxNext.canvas.width, this.ctxNext.canvas.height)
    this.next.draw()
  }

  draw() {
    this.piece.draw()
    this.drawBoard()
  }

  drop() {
    const move = this.moves[keyCodes.DOWN](this.piece)

    if (this.valid(move)) {
      this.piece.move(move)
    } else {
      this.freeze()
      this.clearLines()

      if (this.piece.y === 0) return false

      this.piece = this.next
      this.piece.ctx = this.ctx
      this.piece.setStartingPosition()
      this.getNewPiece()
    }

    return true
  }

  clearLines() {
    let cleared = 0

    this.grid.forEach((row, rowIndex) => {
      if (row.every((value) => value > 0)) {
        cleared += 1
        this.grid.splice(rowIndex, 1)
        this.grid.unshift(Array(10).fill(0))
      }
    })

    if (cleared > 0) {
      this.account.score += this.getLinesClearedPoints(cleared)
      this.account.lines += cleared

      if (this.account.lines >= 10) {
        this.account.level += 1
        this.account.lines -= 10
        this.time.level = levelSpeeds[this.account.level] || levelSpeeds[20]
      }
    }
  }

  valid(piece) {
    return piece.shape.every((row, rowIndex) => (
      row.every((value, colIndex) => {
        const x = piece.x + colIndex
        const y = piece.y + rowIndex

        return value === 0 || (this.insideWalls(x) && this.aboveFloor(y) && this.notOccupied(x, y))
      })
    ))
  }

  freeze() {
    this.piece.shape.forEach((row, rowIndex) => {
      row.forEach((value, colIndex) => {
        if (value > 0) this.grid[rowIndex + this.piece.y][colIndex + this.piece.x] = value
      })
    })
  }

  drawBoard() {
    this.grid.forEach((row, rowIndex) => {
      row.forEach((value, colIndex) => {
        if (value > 0) {
          this.ctx.fillStyle = colors[value]
          this.ctx.fillRect(colIndex, rowIndex, 1, 1)
        }
      })
    })
  }

  getEmptyGrid() {
    return Array.from({ length: 12 }, () => Array(10).fill(0))
  }

  insideWalls(x) {
    return x >= 0 && x < 10
  }

  aboveFloor(y) {
    return y <= 12
  }

  notOccupied(x, y) {
    return this.grid[y] && this.grid[y][x] === 0
  }

  rotate(piece) {
    const rotated = JSON.parse(JSON.stringify(piece))

    for (let row = 0; row < rotated.shape.length; row += 1) {
      for (let col = 0; col < row; col += 1) {
        ;[rotated.shape[col][row], rotated.shape[row][col]] = [rotated.shape[row][col], rotated.shape[col][row]]
      }
    }

    rotated.shape.forEach((row) => row.reverse())

    return rotated
  }

  getLinesClearedPoints(lines) {
    const baseScore =
      lines === 1
        ? scoreValues.SINGLE
        : lines === 2
          ? scoreValues.DOUBLE
          : lines === 3
            ? scoreValues.TRIPLE
            : lines === 4
              ? scoreValues.TETRIS
              : 0

    return (this.account.level + 1) * baseScore
  }
}

const createTetrisGame = (context, { onGameOver, onScore, onFrame } = {}) => {
  const nextCanvas = document.createElement('canvas')
  const nextContext = nextCanvas.getContext('2d')
  let frame = null
  let status = { gameOver: false, paused: false }
  const account = new Proxy(
    { score: 0, level: 0, lines: 0 },
    {
      set: (target, key, value) => {
        target[key] = value
        onScore?.({ ...target })
        return true
      },
    },
  )
  let time = { start: 0, elapsed: 0, level: levelSpeeds[account.level] }
  const moves = {
    [keyCodes.LEFT]: (piece) => ({ ...piece, x: piece.x - 1 }),
    [keyCodes.RIGHT]: (piece) => ({ ...piece, x: piece.x + 1 }),
    [keyCodes.DOWN]: (piece) => ({ ...piece, y: piece.y + 1 }),
    [keyCodes.SPACE]: (piece) => ({ ...piece, y: piece.y + 1 }),
    [keyCodes.UP]: (piece) => board.rotate(piece),
  }
  const board = new Board(context, nextContext, moves, account, time)

  nextCanvas.width = 120
  nextCanvas.height = 120
  nextContext.scale(30, 30)

  const onKeyDown = (event) => {
    if (status.gameOver) return

    if (event.keyCode === keyCodes.P) {
      pause()
    } else if (event.keyCode === keyCodes.ESC) {
      end()
    } else if (moves[event.keyCode]) {
      event.preventDefault()

      let move = moves[event.keyCode](board.piece)

      if (event.keyCode === keyCodes.SPACE) {
        while (board.valid(move)) {
          account.score += scoreValues.HARD_DROP
          board.piece.move(move)
          move = moves[keyCodes.DOWN](board.piece)
        }
      } else if (board.valid(move)) {
        board.piece.move(move)
        if (event.keyCode === keyCodes.DOWN) account.score += scoreValues.SOFT_DROP
      }
    }
  }

  const reset = () => {
    board.reset()
    account.score = 0
    account.lines = 0
    account.level = 0
    status = { gameOver: false, paused: false }
    time = { start: 0, elapsed: 0, level: levelSpeeds[account.level] }
    board.time = time
  }

  const tick = (timestamp = 0) => {
    time.elapsed = timestamp - time.start

    if (time.elapsed > time.level) {
      time.start = timestamp

      if (!board.drop()) {
        end()
        return
      }
    }

    context.clearRect(0, 0, context.canvas.width, context.canvas.height)
    board.draw()
    onFrame?.()
    frame = requestAnimationFrame(tick)
  }

  function pause() {
    if (!frame) {
      status.paused = false
      tick()
      return
    }

    status.paused = true
    cancelAnimationFrame(frame)
    frame = null
  }

  function end() {
    cancelAnimationFrame(frame)
    frame = null
    document.removeEventListener('keydown', onKeyDown)
    status.gameOver = true
    onGameOver?.(account)
  }

  return {
    play() {
      reset()
      time.start = performance.now()
      if (frame) cancelAnimationFrame(frame)
      status.paused = false
      status.gameOver = false
      document.addEventListener('keydown', onKeyDown)
      tick()
    },
    pause,
    destroy() {
      cancelAnimationFrame(frame)
      document.removeEventListener('keydown', onKeyDown)
    },
    getNextCanvas: () => nextCanvas,
  }
}

const canvasToPoints = (context, width, height, colOffset, rowOffset, layoutState, pointContext) => {
  const output = []
  const data = context.getImageData(0, 0, width, height).data

  for (let index = 0; index < data.length; index += 4) {
    const pixel = index / 4
    const col = pixel % width
    const row = Math.floor(pixel / width)
    const luminance = data[index] * 0.21 + data[index + 1] * 0.72 + data[index + 2] * 0.07

    if (luminance < 250) {
      const value = canvasChars[Math.ceil(((canvasChars.length - 1) * luminance) / 255)] || ' '

      if (value.trim()) {
        output.push({
          x: (colOffset + col) / layoutState.cols,
          y: (rowOffset + row) / layoutState.rows,
          value,
          context: pointContext,
          vx: 0,
          vy: 0,
          gravity: 0,
          damping: 0.7,
          spring: 0.4,
          friction: 0.9,
          uid: Math.random().toString(36).slice(2, 10),
        })
      }
    }
  }

  return output
}

const cssNumber = (name, fallback) => (
  Number.parseFloat(getComputedStyle(document.documentElement).getPropertyValue(name)) || fallback
)

const elapsedSeconds = (startedAt) => (startedAt ? Math.floor((Date.now() - startedAt) / 1000) : 0)

const formatTime = (seconds) => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const rest = seconds % 60

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(rest).padStart(2, '0')}`
}

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

export default Textris
