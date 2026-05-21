import { useEffect, useRef } from 'react'
import { createTextGridPhysics } from '../animations/textGridPhysics.js'
import BossOverlay from '../components/BossOverlay.jsx'

const gameWidth = 60
const gameHeight = 36
const statsWidth = 20
const cellCols = 2
const cellRows = 1
const initialSpeed = 150
const levelSpeedStep = 8
const minSpeed = 70
const empty = 0
const wall = 1
const dot = 2
const powerDot = 3
const house = 4
const door = 5
const up = 0
const down = 1
const left = 2
const right = 3
const dx = [0, 0, -1, 1]
const dy = [-1, 1, 0, 0]
const reverseDir = [down, up, right, left]
const chase = 0
const frightened = 2
const scatterTargets = [
  { x: 26, y: 0 },
  { x: 1, y: 0 },
  { x: 27, y: 30 },
  { x: 0, y: 30 },
]
const modeSchedule = [
  [chase, 47],
  [1, 133],
  [chase, 47],
  [1, 133],
  [chase, 33],
  [1, 133],
  [chase, 33],
  [1, Infinity],
]
const frightDurations = [40, 35, 30, 25, 20, 15, 10, 10, 5, 5]
const ghostScores = [200, 400, 800, 1600]
const ghostStart = [
  { x: 14, y: 11 },
  { x: 14, y: 14 },
  { x: 12, y: 14 },
  { x: 16, y: 14 },
]
const ghostExitDots = [0, 0, 30, 60]
const ghostChars = ['M', 'W', 'N', 'Q']
const frightenedChar = '~'
const eatenChar = '"'
const mazeSource = [
  'WWWWWWWWWWWWWWWWWWWWWWWWWWWW',
  'W............WW............W',
  'W.WWWW.WWWWW.WW.WWWWW.WWWW.W',
  'WoWWWW.WWWWW.WW.WWWWW.WWWWoW',
  'W.WWWW.WWWWW.WW.WWWWW.WWWW.W',
  'W..........................W',
  'W.WWWW.WW.WWWWWWWW.WW.WWWW.W',
  'W.WWWW.WW.WWWWWWWW.WW.WWWW.W',
  'W......WW....WW....WW......W',
  'WWWWWW.WWWWW_WW_WWWWW.WWWWWW',
  '_____W.WWWWW_WW_WWWWW.W_____',
  '_____W.WW__________WW.W_____',
  '_____W.WW_WWW--WWW_WW.W_____',
  'WWWWWW.WW_WHHHHHHW_WW.WWWWWW',
  '______.___WHHHHHHW___.______',
  'WWWWWW.WW_WHHHHHHW_WW.WWWWWW',
  '_____W.WW_WWWWWWWW_WW.W_____',
  '_____W.WW__________WW.W_____',
  '_____W.WW_WWWWWWWW_WW.W_____',
  'WWWWWW.WW_WWWWWWWW_WW.WWWWWW',
  'W............WW............W',
  'W.WWWW.WWWWW.WW.WWWWW.WWWW.W',
  'W.WWWW.WWWWW.WW.WWWWW.WWWW.W',
  'Wo..WW................WW..oW',
  'WWW.WW.WW.WWWWWWWW.WW.WW.WWW',
  'WWW.WW.WW.WWWWWWWW.WW.WW.WWW',
  'W......WW....WW....WW......W',
  'W.WWWWWWWWWW.WW.WWWWWWWWWW.W',
  'W.WWWWWWWWWW.WW.WWWWWWWWWW.W',
  'W..........................W',
  'WWWWWWWWWWWWWWWWWWWWWWWWWWWW',
]
const mazeCols = 28
const mazeRows = 31
const tunnelRow = 14
const playerStart = { x: 14, y: 23 }
const fruitPosition = { x: 14, y: 17 }

const Pakku = () => {
  const gridRef = useRef(null)
  const bossRef = useRef(null)
  const bossHandlersRef = useRef({})

  useEffect(() => {
    if (!gridRef.current) return undefined

    const gridNode = gridRef.current
    const grid = createTextGridPhysics(gridNode)
    const timers = new Set()
    const abortController = new AbortController()
    let playerX = playerStart.x
    let playerY = playerStart.y
    let direction = left
    let nextDirection = left
    let maze = []
    let dotsTotal = 0
    let dotsEaten = 0
    let ghosts = []
    let score = 0
    let lives = 3
    let level = 1
    let ghostEatStreak = 0
    let scheduleIndex = 0
    let scheduleCounter = 0
    let frightTimer = 0
    let currentMode = chase
    let isPlaying = false
    let isGameOver = false
    let isPaused = false
    let interval = null
    let points = []
    let fruit = null
    let fruitTimer = 0
    let gainedExtraLife = false
    let speed = initialSpeed
    let highscores = []
    let scoresLoaded = false
    let scoresLoadedAt = 0
    let enteringInitials = false
    let initials = ['A', 'A', 'A']
    let initialIndex = 0
    let finalScore = 0
    let gameOverStartedAt = 0
    let initialsReady = false
    let canRestart = false
    let attractStartedAt = Date.now()
    let dying = false
    let deathFrame = 0
    let levelClearing = false
    let levelClearFrame = 0

    bossHandlersRef.current = {
      onPause: () => {
        isPaused = true
      },
      onResume: () => {
        isPaused = false
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

    const initMaze = () => {
      maze = []
      dotsTotal = 0

      for (let row = 0; row < mazeRows; row += 1) {
        const cells = []

        for (let col = 0; col < mazeCols; col += 1) {
          const source = mazeSource[row][col]
          let cell = empty

          if (source === 'W') {
            cell = wall
          } else if (source === '.') {
            cell = dot
            dotsTotal += 1
          } else if (source === 'o') {
            cell = powerDot
            dotsTotal += 1
          } else if (source === 'H') {
            cell = house
          } else if (source === '-') {
            cell = door
          }

          cells.push(cell)
        }

        maze.push(cells)
      }
    }

    const tileAt = (x, y) => {
      if (y < 0 || y >= mazeRows) return wall
      if (x < 0 || x >= mazeCols) return y === tunnelRow ? empty : wall

      return maze[y][x]
    }

    const wrapX = (value) => {
      if (value < 0) return mazeCols - 1
      if (value >= mazeCols) return 0
      return value
    }

    const canMove = (x, y, dir, allowHouse) => {
      let nextX = x + dx[dir]
      const nextY = y + dy[dir]

      if (nextY === tunnelRow) nextX = wrapX(nextX)

      const tile = tileAt(nextX, nextY)

      return tile !== wall && (tile !== door || allowHouse) && (tile !== house || allowHouse)
    }

    const distanceSq = (x1, y1, x2, y2) => (x1 - x2) ** 2 + (y1 - y2) ** 2

    const chooseGhostDirection = (ghost) => {
      if (ghost.inHouse) {
        const targetX = 13
        const targetY = 12

        if (ghost.y > targetY) return up
        if (ghost.y < targetY) return down
        if (ghost.x < targetX) return right
        if (ghost.x > targetX) return left
        return up
      }

      if (ghost.mode === frightened) {
        const options = [up, down, left, right].filter((dir) => (
          dir !== reverseDir[ghost.dir] && canMove(ghost.x, ghost.y, dir, true)
        ))

        return options.length ? options[Math.floor(Math.random() * options.length)] : reverseDir[ghost.dir]
      }

      let target

      if (currentMode === chase && ghost.mode !== frightened) {
        if (ghost.index === 0) {
          target = { x: playerX, y: playerY }
        } else if (ghost.index === 1) {
          target = { x: playerX + 4 * dx[direction], y: playerY + 4 * dy[direction] }
        } else if (ghost.index === 2) {
          const blinky = ghosts[0]
          const aheadX = playerX + 2 * dx[direction]
          const aheadY = playerY + 2 * dy[direction]

          target = { x: 2 * aheadX - blinky.x, y: 2 * aheadY - blinky.y }
        } else {
          target = distanceSq(ghost.x, ghost.y, playerX, playerY) > 64
            ? { x: playerX, y: playerY }
            : scatterTargets[3]
        }
      } else {
        target = scatterTargets[ghost.index]
      }

      const options = [up, down, left, right].filter((dir) => (
        dir !== reverseDir[ghost.dir] && canMove(ghost.x, ghost.y, dir, true)
      ))

      if (!options.length) return reverseDir[ghost.dir]

      let best = options[0]
      let bestDistance = Infinity

      for (const option of options) {
        let nextX = ghost.x + dx[option]
        const nextY = ghost.y + dy[option]

        if (nextY === tunnelRow) nextX = wrapX(nextX)

        const distance = distanceSq(nextX, nextY, target.x, target.y)

        if (distance < bestDistance) {
          best = option
          bestDistance = distance
        }
      }

      return best
    }

    const resetPositions = () => {
      playerX = playerStart.x
      playerY = playerStart.y
      direction = left
      nextDirection = left
      ghosts = ghostStart.map((start, index) => ({
        x: start.x,
        y: start.y,
        dir: index === 0 ? left : up,
        mode: chase,
        index,
        exitDots: ghostExitDots[index],
        inHouse: index > 0,
        eaten: false,
      }))
      ghostEatStreak = 0
      scheduleIndex = 0
      scheduleCounter = 0
      frightTimer = 0
      currentMode = chase
    }

    const moveGhostToHouse = (ghost) => {
      const targetX = 14
      const targetY = 14
      const options = [up, down, left, right].filter((dir) => canMove(ghost.x, ghost.y, dir, true))
      let best = ghost.dir
      let bestDistance = Infinity

      for (const option of options) {
        let nextX = ghost.x + dx[option]
        const nextY = ghost.y + dy[option]

        if (nextY === tunnelRow) nextX = wrapX(nextX)

        const distance = distanceSq(nextX, nextY, targetX, targetY)

        if (distance < bestDistance) {
          best = option
          bestDistance = distance
        }
      }

      ghost.dir = best
      ghost.x += dx[ghost.dir]
      ghost.y += dy[ghost.dir]
      if (ghost.y === tunnelRow) ghost.x = wrapX(ghost.x)

      if (ghost.x === targetX && ghost.y === targetY) {
        ghost.eaten = false
        ghost.inHouse = false
        ghost.x = 14
        ghost.y = 11
        ghost.dir = left
        ghost.mode = frightTimer > 0 ? frightened : currentMode
      }
    }

    const tickGame = () => {
      if (!isPlaying || isPaused || dying || levelClearing || isGameOver) return

      if (frightTimer > 0) {
        frightTimer -= 1

        if (frightTimer === 0) {
          for (const ghost of ghosts) {
            if (ghost.mode === frightened) ghost.mode = currentMode
          }
          ghostEatStreak = 0
        }
      } else {
        scheduleCounter += 1
        const schedule = modeSchedule[scheduleIndex]

        if (schedule && scheduleCounter >= schedule[1]) {
          scheduleIndex = Math.min(scheduleIndex + 1, modeSchedule.length - 1)
          scheduleCounter = 0

          const nextMode = modeSchedule[scheduleIndex][0]

          if (nextMode !== currentMode) {
            currentMode = nextMode

            for (const ghost of ghosts) {
              if (!ghost.inHouse && !ghost.eaten) {
                ghost.dir = reverseDir[ghost.dir]
                ghost.mode = currentMode
              }
            }
          }
        }
      }

      if (canMove(playerX, playerY, nextDirection, false)) direction = nextDirection

      if (canMove(playerX, playerY, direction, false)) {
        playerX += dx[direction]
        playerY += dy[direction]
        if (playerY === tunnelRow) playerX = wrapX(playerX)
      }

      eatCurrentTile()
      updateFruit()
      moveGhosts()
      checkCollisions()

      if (dotsEaten >= dotsTotal) {
        completeLevel()
      } else {
        renderPlaying()
      }
    }

    const eatCurrentTile = () => {
      if (playerX < 0 || playerX >= mazeCols || playerY < 0 || playerY >= mazeRows) return

      const tile = maze[playerY][playerX]

      if (tile === dot) {
        maze[playerY][playerX] = empty
        score += 10
        dotsEaten += 1
        checkExtraLife()
      } else if (tile === powerDot) {
        maze[playerY][playerX] = empty
        score += 50
        dotsEaten += 1
        checkExtraLife()

        const duration = frightDurations[Math.min(level - 1, frightDurations.length - 1)]

        if (duration > 0) {
          frightTimer = duration
          ghostEatStreak = 0

          for (const ghost of ghosts) {
            if (!ghost.inHouse && !ghost.eaten) {
              ghost.dir = reverseDir[ghost.dir]
              ghost.mode = frightened
            }
          }
        }
      }
    }

    const updateFruit = () => {
      if (!fruit && (dotsEaten === 70 || dotsEaten === 170)) {
        fruit = { ...fruitPosition }
        fruitTimer = 60
      }

      if (!fruit) return

      fruitTimer -= 1

      if (fruitTimer <= 0) {
        fruit = null
      } else if (playerX === fruit.x && playerY === fruit.y) {
        score += Math.min(500, 100 * level)
        checkExtraLife()
        fruit = null
      }
    }

    const moveGhosts = () => {
      for (const ghost of ghosts) {
        if (ghost.inHouse) {
          if (dotsEaten < ghost.exitDots) continue

          ghost.inHouse = false
          ghost.x = 14
          ghost.y = 11
          ghost.dir = left
          ghost.mode = frightTimer > 0 ? frightened : currentMode
        }

        if (ghost.eaten) {
          moveGhostToHouse(ghost)
          continue
        }

        ghost.dir = chooseGhostDirection(ghost)
        ghost.x += dx[ghost.dir]
        ghost.y += dy[ghost.dir]
        if (ghost.y === tunnelRow) ghost.x = wrapX(ghost.x)
      }
    }

    const checkCollisions = () => {
      for (const ghost of ghosts) {
        if (ghost.inHouse || ghost.x !== playerX || ghost.y !== playerY) continue

        if (ghost.mode === frightened && !ghost.eaten) {
          ghost.eaten = true
          ghost.mode = currentMode

          const value = ghostScores[Math.min(ghostEatStreak, ghostScores.length - 1)]

          score += value
          ghostEatStreak += 1
          checkExtraLife()
        } else if (!ghost.eaten) {
          loseLife()
          break
        }
      }
    }

    const checkExtraLife = () => {
      if (!gainedExtraLife && score >= 10000) {
        lives += 1
        gainedExtraLife = true
      }
    }

    const loseLife = () => {
      if (interval) {
        window.clearInterval(interval)
        interval = null
      }

      dying = true
      deathFrame = 0

      const deathTimer = window.setInterval(() => {
        deathFrame += 1
        renderPlaying()

        if (deathFrame >= 12) {
          window.clearInterval(deathTimer)
          dying = false
          lives -= 1

          if (lives <= 0) {
            endGame()
          } else {
            resetPositions()
            speed = moveSpeed()
            interval = window.setInterval(tickGame, speed)
            renderPlaying()
          }
        }
      }, 100)
    }

    const completeLevel = () => {
      if (interval) {
        window.clearInterval(interval)
        interval = null
      }

      levelClearing = true
      levelClearFrame = 0

      const clearTimer = window.setInterval(() => {
        levelClearFrame += 1
        renderPlaying()

        if (levelClearFrame >= 16) {
          window.clearInterval(clearTimer)
          levelClearing = false
          level += 1
          dotsEaten = 0
          fruit = null
          initMaze()
          resetPositions()
          speed = moveSpeed()
          interval = window.setInterval(tickGame, speed)
          renderPlaying()
        }
      }, 150)
    }

    const moveSpeed = () => Math.max(minSpeed, initialSpeed - (level - 1) * levelSpeedStep)

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

      const lifeText = '\u25cf'.repeat(Math.min(lives, 5))

      output.push(
        ...grid.createText({
          col: layoutState.statsCol,
          row: layoutState.gameRow + 4,
          text: 'Lives',
          context: 'stats',
        }),
        ...grid.createText({
          col: layoutState.statsCol + statsWidth - lifeText.length,
          row: layoutState.gameRow + 4,
          text: lifeText,
          context: 'stats',
        }),
      )

      return output
    }

    const createTitle = (layoutState) => {
      const output = [
        ...grid.createText({ text: 'Pakku', row: layoutState.gameRow, col: 0, context: 'heading' }),
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

    const createMazePoints = (layoutState, maxRows = mazeRows) => {
      const output = []
      const flashing = levelClearing && levelClearFrame % 4 < 2
      const rows = Math.min(maxRows, mazeRows)

      for (let row = 0; row < rows; row += 1) {
        for (let col = 0; col < mazeCols; col += 1) {
          const tile = maze[row][col]
          let value = null

          if (tile === wall) {
            value = flashing ? ' ' : '#'
          } else if (tile === dot) {
            value = '\u00b7'
          } else if (tile === powerDot) {
            value = scheduleCounter % 4 < 2 ? 'O' : 'o'
          } else if (tile === door) {
            value = '-'
          }

          if (!value) continue

          const baseCol = layoutState.gameCol + col * cellCols
          const baseRow = layoutState.gameRow + row * cellRows

          for (let repeatCol = 0; repeatCol < cellCols; repeatCol += 1) {
            output.push(grid.createPoint({
              x: (baseCol + repeatCol) / layoutState.cols,
              y: baseRow / layoutState.rows,
              value,
              context: 'maze',
            }))
          }
        }
      }

      return output
    }

    const createEntityPoints = (layoutState) => {
      const output = []

      if (!dying || deathFrame < 12) {
        const deathChars = '@&8O0A2%!;:~,. '
        const value = dying ? deathChars[Math.min(Math.floor((deathFrame / 12) * 15), 14)] : '\u25cf'
        const baseCol = layoutState.gameCol + playerX * cellCols
        const baseRow = layoutState.gameRow + playerY * cellRows

        for (let repeatCol = 0; repeatCol < cellCols; repeatCol += 1) {
          output.push(grid.createPoint({
            x: (baseCol + repeatCol) / layoutState.cols,
            y: baseRow / layoutState.rows,
            value,
            context: 'entity',
          }))
        }
      }

      for (const ghost of ghosts) {
        if (ghost.inHouse && dotsEaten < ghost.exitDots) continue

        let value

        if (ghost.eaten) {
          value = eatenChar
        } else if (ghost.mode === frightened) {
          value = frightTimer < 10 && frightTimer % 2 === 0 ? ghostChars[ghost.index] : frightenedChar
        } else {
          value = ghostChars[ghost.index]
        }

        const baseCol = layoutState.gameCol + ghost.x * cellCols
        const baseRow = layoutState.gameRow + ghost.y * cellRows

        for (let repeatCol = 0; repeatCol < cellCols; repeatCol += 1) {
          output.push(grid.createPoint({
            x: (baseCol + repeatCol) / layoutState.cols,
            y: baseRow / layoutState.rows,
            value,
            context: 'entity',
          }))
        }
      }

      if (fruit) {
        const baseCol = layoutState.gameCol + fruit.x * cellCols
        const baseRow = layoutState.gameRow + fruit.y * cellRows

        for (let repeatCol = 0; repeatCol < cellCols; repeatCol += 1) {
          output.push(grid.createPoint({
            x: (baseCol + repeatCol) / layoutState.cols,
            y: baseRow / layoutState.rows,
            value: '%',
            context: 'entity',
          }))
        }
      }

      return output
    }

    const renderPlaying = () => {
      if (isGameOver) return

      const currentLayout = layout()

      points = [
        ...createTitle(currentLayout),
        ...createStats(currentLayout),
        ...createMazePoints(currentLayout),
        ...createEntityPoints(currentLayout),
      ]
      grid.render(points)
    }

    const renderAttract = () => {
      const currentLayout = layout()
      const elapsed = Date.now() - attractStartedAt
      const revealRows = Math.min(mazeRows, Math.floor(elapsed / 30))
      const output = [
        ...createTitle(currentLayout),
        ...createStats(currentLayout),
        ...createMazePoints(currentLayout, revealRows),
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

    const startGame = () => {
      if (isPlaying || enteringInitials || (isGameOver && !canRestart)) return

      isGameOver = false
      canRestart = false
      enteringInitials = false
      initialsReady = false
      gameOverStartedAt = 0
      isPlaying = true
      score = 0
      lives = 3
      level = 1
      dotsEaten = 0
      gainedExtraLife = false
      fruit = null
      points = []
      initMaze()
      resetPositions()
      speed = moveSpeed()

      if (interval) window.clearInterval(interval)
      interval = window.setInterval(tickGame, speed)
      bossRef.current?.show()
      renderPlaying()
    }

    const endGame = () => {
      isGameOver = true
      isPlaying = false
      bossRef.current?.hide()
      if (interval) {
        window.clearInterval(interval)
        interval = null
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
        body: JSON.stringify({ game: 'pakku', initials: value, score: finalScore }),
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
          nextDirection = up
          event.preventDefault()
          break
        case 'ArrowDown':
        case 'KeyS':
          nextDirection = down
          event.preventDefault()
          break
        case 'ArrowLeft':
        case 'KeyA':
          nextDirection = left
          event.preventDefault()
          break
        case 'ArrowRight':
        case 'KeyD':
          nextDirection = right
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
      fetch('/api/highscores?game=pakku', { signal: abortController.signal })
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
          ...grid.createText({ text: 'Pakku', row: currentLayout.gameRow, col: 0, context: 'heading' }),
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
    initMaze()
    resetPositions()
    fetchScores()
    queueTimer(renderAttract, 50)

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      gridNode.removeEventListener('click', onClick)
      stopFrame()
      stopResize()
      if (interval) window.clearInterval(interval)
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
      <div ref={gridRef} className="pakku-grid mono" />
    </main>
  )
}

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

export default Pakku
