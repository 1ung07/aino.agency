const chars = "$MBNQ\u00d8W@&R8GD6S9\u00d6OH#\u00c9E5UK0\u00c4\u00c5A2XP34ZC%VIF17YTJL[]?}{()<>|=+\\/^!\";*_:~,'-.\u00b7`\u00a0"
const charsWithSpace = `${chars} `
const emptyChar = '\u00a0'

export const createTextGridPhysics = (element) => {
  let width = 0
  let height = 0
  let cols = 0
  let rows = 0
  let textArr = []
  let listeners = {}
  let frame = null
  let previousTime = 0
  const canvases = []

  const emit = (eventName, payload) => {
    if (listeners[eventName]) {
      for (const listener of listeners[eventName]) listener(payload)
    }
  }

  const resize = () => {
    const charWidth = cssNumber('--ch', 8)
    const lineHeight = cssNumber('--line', cssNumber('--line-height', 16))
    const bounds = element.getBoundingClientRect()

    width = bounds.width
    height = bounds.height
    cols = Math.max(1, Math.round(width / charWidth))
    rows = Math.max(1, Math.round(height / lineHeight))

    for (const canvas of canvases) {
      canvas.width = cols
      canvas.height = rows
    }

    const size = cols * rows

    if (size !== textArr.length) {
      textArr = new Array(size).fill(emptyChar)
    }

    emit('resize', { cols, rows, width, height })
  }

  const observer = new ResizeObserver(resize)
  observer.observe(element)
  resize()

  const tick = (timestamp) => {
    frame = requestAnimationFrame(tick)

    const delta = timestamp - previousTime
    previousTime = timestamp
    emit('frame', {
      delta,
      timestamp,
      fps: delta ? 1000 / delta : 0,
    })
  }

  frame = requestAnimationFrame(tick)

  const createCanvas = () => {
    const canvas = document.createElement('canvas')

    canvas.width = cols
    canvas.height = rows
    canvases.push(canvas)

    return canvas
  }

  const createPoint = ({ x, y, value, context = '' }) => ({
    x: x + 0.002 * (Math.random() - 0.5),
    y: clamp(y, 0, 1),
    value,
    context,
    vx: 0,
    vy: 0,
    gravity: 0,
    damping: 0.7,
    spring: 0.4,
    friction: 0.9,
    uid: uid(),
  })

  const createText = ({
    row = 0,
    col = 0,
    text,
    context = '',
    align = 'left',
  }) => {
    if (!text) return []

    const normalized = text.toUpperCase()
    const points = []
    let startCol = col

    if (align === 'center') {
      startCol = Math.floor((cols - normalized.length) / 2)
    }

    for (let index = 0; index < normalized.length; index += 1) {
      const value = normalized[index]
      const x = (startCol + index) / cols
      const y = row / rows

      if (value.trim()) {
        points.push(createPoint({ x, y, value, context }))
      }
    }

    return points
  }

  const render = (...groups) => {
    textArr.fill(emptyChar)

    for (const points of groups) {
      emit('render', points)

      for (const point of points) {
        const x = Math.round(point.x * cols)
        const y = Math.round(point.y * rows)
        let value = point.value

        if (point.filter) value = point.filter(value)
        if (/^\s$/.test(value)) value = emptyChar

        if (y < rows && x < cols && y >= 0 && x >= 0) {
          const index = cols * y + x

          if (textArr[index]?.trim() && point.morph?.removeAfter) continue
          textArr[index] = value
        }
      }
    }

    element.textContent = wrapText(textArr, cols).join('')
  }

  const morph = (
    points,
    target,
    {
      discardUnused = true,
      contextFilter = null,
      duration = 1700,
    } = {},
  ) => {
    ;[target, points].forEach((group) => {
      if (!group.length) {
        group.push(createPoint({ x: 0.5, y: 0.5, value: emptyChar }))
      }
    })

    let removeExtra = false
    let remaining = target.slice()
    const byValue = new Map()

    rebuildValueMap(remaining, byValue)

    for (const point of points) {
      if (contextFilter && point.context !== contextFilter) continue

      if (remaining.length === 0 && discardUnused) {
        remaining = target.slice()
        byValue.clear()
        rebuildValueMap(remaining, byValue)
        removeExtra = true
      }

      if (remaining.length === 0) break

      const candidates = byValue.get(point.value)?.length ? byValue.get(point.value) : remaining
      const match = closestPoint(point, candidates)

      if (!match) break

      removePointByUid(remaining, match.uid)

      if (byValue.has(match.value)) {
        removePointByUid(byValue.get(match.value), match.uid)
      }

      point.morph = {
        removeAfter: removeExtra,
        target: match,
        start: Date.now(),
        duration,
      }
    }

    if (!removeExtra) {
      let source = contextFilter
        ? points.filter((point) => point.context === contextFilter)
        : points.slice()

      for (const targetPoint of remaining) {
        if (source.length === 0) source = points.slice()

        const match = closestPoint(targetPoint, source)

        if (!match) break

        removePointByUid(source, match.uid)
        points.push({
          ...match,
          context: targetPoint.context,
          value: emptyChar,
          morph: {
            target: targetPoint,
            removeAfter: false,
            start: Date.now(),
            duration,
          },
        })
      }
    }
  }

  const applyPhysics = (points, delta = 0) => {
    const step = Math.min(0.1, delta / 1000)
    const floor = (rows - 1) / rows

    applyMorphPhysics(points, step)

    const occupied = []
    const collisions = []
    const now = Date.now()
    const isResting = (point) => (
      Math.abs(point.vy) < 0.001 &&
      Math.abs(point.vx) < 0.001 &&
      point.y === floor &&
      point.gravity
    )
    const stopTinyFloorMotion = (point) => {
      if (point.y === floor && Math.abs(point.vy) < 0.005) {
        point.vy = 0
        point.vx *= 0.95
        if (Math.abs(point.vx) < 0.005) point.vx = 0
      }
    }

    for (let index = points.length - 1; index >= 0; index -= 1) {
      const point = points[index]
      const pointCol = Math.round(point.x * cols)
      const pointRow = Math.round(point.y * rows)

      if (point.removeAt && now > point.removeAt) {
        points[index] = points[points.length - 1]
        points.pop()
        continue
      }

      occupied[pointRow] ||= []

      if (
        occupied[pointRow][pointCol] &&
        point.vx &&
        point.vy &&
        occupied[pointRow][pointCol].vy &&
        occupied[pointRow][pointCol].vx
      ) {
        collisions.push([point, occupied[pointRow][pointCol]])
      } else {
        occupied[pointRow][pointCol] = point
      }

      if (isResting(point) && !point.removeAt) {
        point.removeAt = now + 800
      }

      if (point.removeAt && now > point.removeAt && isResting(point)) {
        points[index] = points[points.length - 1]
        points.pop()
        continue
      }

      point.vy += point.gravity * step
      point.x += point.vx * step
      point.y += point.vy * step

      if (point.x <= 0 || point.x >= 1) {
        point.vx *= -point.damping
        point.x = clamp(point.x, 0, 1)
      }

      if (point.y >= floor) {
        point.vy *= -point.damping
        point.y = floor
      }

      if (point.y <= 0) {
        point.vy *= -point.damping
        point.y = 0
      }

      stopTinyFloorMotion(point)
    }

    for (const [a, b] of collisions) {
      const deltaPoint = { x: a.x - b.x, y: a.y - b.y }
      const distance = Math.sqrt(deltaPoint.x * deltaPoint.x + deltaPoint.y * deltaPoint.y)

      if (!distance) continue

      const normal = { x: deltaPoint.x / distance, y: deltaPoint.y / distance }
      const relativeVelocity = { x: b.vx - a.vx, y: b.vy - a.vy }
      const velocity = relativeVelocity.x * normal.x + relativeVelocity.y * normal.y

      if (velocity >= 0) {
        const impulse = velocity

        b.vx -= impulse * normal.x * b.damping
        b.vy -= impulse * normal.y * b.damping
        a.vx += impulse * normal.x * a.damping
        a.vy += impulse * normal.y * a.damping
      }

      stopTinyFloorMotion(a)
      stopTinyFloorMotion(b)
    }
  }

  const createFromCanvas = (canvas, { context = 'canvas', includeEmpty = false, chars: pool = charsWithSpace } = {}) => {
    const points = []
    const data = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height).data

    for (let index = 0; index < data.length; index += 4) {
      const pixel = index / 4
      const x = pixel % canvas.width
      const y = Math.floor(pixel / canvas.width)
      const luminance = data[index] * 0.21 + data[index + 1] * 0.72 + data[index + 2] * 0.07
      const value = charFromLuminance(luminance, pool)

      if ((value.trim() && luminance !== 255) || includeEmpty) {
        points.push(createPoint({ x: x / cols, y: y / rows, value, context }))
      }
    }

    return points
  }

  const paintCanvas = (canvas, source, { cover = false, scale = 1, alpha = 1, x, y } = {}) => {
    const sourceWidth = source.videoWidth || source.width
    const sourceHeight = source.videoHeight || source.height

    if (!sourceWidth || !sourceHeight) return { x: 0, y: 0, w: 0, h: 0 }

    const zoom = Math[cover ? 'max' : 'min'](canvas.width / sourceWidth, (canvas.height / sourceHeight) * 2) * scale
    const drawWidth = sourceWidth * zoom
    const drawHeight = sourceHeight * zoom * 0.5
    const context = canvas.getContext('2d')
    const drawX = Math.round(typeof x === 'number' ? x : canvas.width / 2 - drawWidth / 2)
    const drawY = Math.round(typeof y === 'number' ? y : canvas.height / 2 - drawHeight / 2)

    context.globalAlpha = 1
    context.fillStyle = '#fff'
    context.fillRect(0, 0, canvas.width, canvas.height)
    context.globalAlpha = alpha
    context.drawImage(source, drawX, drawY, drawWidth, drawHeight)
    context.globalAlpha = 1

    return { x: drawX, y: drawY, w: drawWidth, h: drawHeight }
  }

  const api = {
    render,
    morph,
    blend: (points, target, { opacity = 1 } = {}) => {
      for (const point of points) {
        const x = Math.round(point.x * cols)
        const y = Math.round(point.y * rows)
        const match = target.find((item) => (
          Math.round(item.x * cols) === x && Math.round(item.y * rows) === y
        ))

        if (match) point.value = blendChars(point.value, match.value, opacity)
      }
    },
    explode: (points, { spread = 0.3 } = {}) => {
      let minX = Infinity
      let maxX = -Infinity

      for (const point of points) {
        if (point.x < minX) minX = point.x
        if (point.x > maxX) maxX = point.x
      }

      if (minX === maxX) {
        minX = 0
        maxX = 1
      }

      for (const point of points) {
        const progress = (point.x - minX) / (maxX - minX)

        point.vx += lerp(-spread, spread, progress) + (Math.random() - 0.5) * spread * 0.5
        point.vy += lerp(-0.5, -1, Math.random() * (2 * spread))
      }
    },
    createCanvas,
    applyPhysics,
    createText,
    createRectangle: ({
      col = 0,
      row = 0,
      cols: rectCols = 1,
      rows: rectRows = 1,
      context = '',
      fade = 0,
    }) => {
      const points = []

      for (let y = 0; y < rectRows; y += 1) {
        for (let x = 0; x < rectCols; x += 1) {
          points.push(...createText({
            row: row + y,
            col: col + x,
            text: chars[Math.floor(73 * fade)] || '#',
            context,
          }))
        }
      }

      return points
    },
    createParagraph: ({
      text,
      width: lineWidth = 40,
      col = 0,
      row = 0,
      align = 'left',
      context = '',
    }) => createParagraphPoints({ text, lineWidth, col, row, align, context, createText, cols, rows }),
    createFromCanvas,
    paintCanvas,
    gravitate: (points, { gravity = 3, damping = 0.8 } = {}) => {
      for (const point of points) {
        delete point.morph
        point.vx = 0.02 * Math.random() - 0.005
        Object.assign(point, { gravity, damping })
      }
    },
    createPoint,
    randomize: (points, { spread = 1 } = {}) => {
      for (const point of points) {
        point.x = lerp(point.x, Math.random(), spread)
        point.y = lerp(point.y, Math.random(), spread)
      }
    },
    listen: (eventName, listener) => {
      listeners[eventName] ||= []
      listeners[eventName].push(listener)

      return () => {
        listeners[eventName] = listeners[eventName]?.filter((item) => item !== listener)
      }
    },
    emit,
    setOpacity: (points, opacity) => {
      for (const point of points) {
        point.value = fadeChar(point.value, opacity)
      }
    },
    destroy: () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
      listeners = {}
    },
    createVideo: async (src) => {
      const points = []
      const canvas = createCanvas()
      const video = document.createElement('video')

      const populatePoints = () => {
        points.length = 0

        for (let row = 0; row < rows; row += 1) {
          for (let col = 0; col < cols; col += 1) {
            points.push(createPoint({ x: col / cols, y: row / rows, value: emptyChar }))
          }
        }
      }

      populatePoints()

      video.src = src
      video.muted = true
      video.playsInline = true
      video.preload = 'auto'

      return {
        blend: (sourcePoints, opacity = 1) => {
          if (!video.videoWidth || !video.videoHeight) return

          paintCanvas(canvas, video, { cover: true })

          const framePoints = createFromCanvas(canvas, { includeEmpty: true })
          const values = new Map()

          for (const point of framePoints) {
            const col = Math.round(point.x * cols)
            const row = Math.round(point.y * rows)

            values.set(row * cols + col, point.value)
          }

          for (const point of sourcePoints) {
            const col = Math.round(point.x * cols)
            const row = Math.round(point.y * rows)
            const value = values.get(row * cols + col)

            if (value) point.value = blendChars(point.value, value, opacity)
          }
        },
        resize: populatePoints,
        points,
        video,
        destroy: () => {
          video.pause()
          video.removeAttribute('src')
          video.load()
        },
      }
    },
    dimensions: {
      get width() {
        return width
      },
      get height() {
        return height
      },
      get rows() {
        return rows
      },
      get cols() {
        return cols
      },
    },
    textArr,
  }

  return api
}

const applyMorphPhysics = (points, step) => {
  for (let index = points.length - 1; index >= 0; index -= 1) {
    const point = points[index]

    if (!point.morph) continue

    const fields = ['x', 'y', 'vx', 'vy', 'gravity', 'spring', 'friction', 'damping']
    const now = Date.now()
    const target = point.morph.target

    if (
      Math.abs(point.x - target.x) < 0.001 &&
      Math.abs(point.y - target.y) < 0.001 &&
      Math.abs(point.vx - target.vx) < 0.001 &&
      Math.abs(point.vy - target.vy) < 0.001 &&
      point.value === target.value
    ) {
      if (point.morph.removeAfter) {
        points[index] = points[points.length - 1]
        points.pop()
      } else {
        points[index] = { ...target }
        delete points[index].morph
      }
      continue
    }

    const progress = easeInOutQuad((now - point.morph.start) / point.morph.duration)
    const spring = (from, to) => from + (to - from) * (step * lerp(0, 10, progress))

    for (const field of fields) {
      if (target[field] !== undefined) {
        point[field] = spring(point[field], target[field])
      }
    }

    point.value = blendChars(point.value, target.value, progress)
  }
}

const createParagraphPoints = ({ text, lineWidth, col, row, align, context, createText, cols, rows }) => {
  const points = []

  if (!text || !cols || !rows) return points

  const chunks = text.toUpperCase().split(/(\n)/)
  const lines = []
  let currentLine = []

  for (const chunk of chunks) {
    if (chunk === '\n') {
      lines.push(currentLine.join(' '))
      currentLine = []
      continue
    }

    const words = chunk.split(/\s+/).filter(Boolean)

    for (const word of words) {
      const currentLength = currentLine.join(' ').length

      if (currentLength + word.length + (currentLength > 0 ? 1 : 0) <= lineWidth) {
        currentLine.push(word)
      } else {
        lines.push(currentLine.join(' '))
        currentLine = [word]
      }
    }
  }

  if (currentLine.length) lines.push(currentLine.join(' '))

  const formatted = lines.map((line) => {
    if (align === 'center') {
      return `${' '.repeat(Math.max(0, Math.floor((lineWidth - line.length) / 2)))}${line}`
    }

    if (align === 'right') return line.padStart(lineWidth, ' ')

    if (align === 'justified') {
      const words = line.split(' ')

      if (words.length === 1) return line.padEnd(lineWidth, ' ')

      const spaces = lineWidth - words.reduce((sum, word) => sum + word.length, 0)
      const gaps = words.length - 1
      const base = Math.floor(spaces / gaps)
      const extra = spaces % gaps
      let output = ''

      for (let index = 0; index < words.length; index += 1) {
        output += words[index]
        if (index < gaps) output += ' '.repeat(base + (index < extra ? 1 : 0))
      }

      return output
    }

    return line.padEnd(lineWidth, ' ')
  })

  for (let index = 0; index < formatted.length && index + row < rows; index += 1) {
    points.push(...createText({
      row: row + index,
      col,
      text: formatted[index].slice(0, cols - col),
      context,
    }))
  }

  return points
}

const rebuildValueMap = (points, map) => {
  for (const point of points) {
    if (!map.has(point.value)) map.set(point.value, [])
    map.get(point.value).push(point)
  }
}

const removePointByUid = (points, uidValue) => {
  const index = points.findIndex((point) => point.uid === uidValue)

  if (index !== -1) {
    points[index] = points[points.length - 1]
    points.pop()
  }
}

const closestPoint = (point, candidates) => {
  let distance = Infinity
  let match = null

  for (const candidate of candidates) {
    const dx = point.x - candidate.x
    const dy = point.y - candidate.y
    const nextDistance = dx * dx + dy * dy

    if (nextDistance < distance) {
      distance = nextDistance
      match = candidate
    }
  }

  return match
}

const wrapText = (characters, cols) => {
  const output = []

  for (let index = 0; index < characters.length; index += 1) {
    output.push(characters[index])

    if ((index + 1) % cols === 0 && index !== characters.length - 1) {
      output.push('\n')
    }
  }

  return output
}

const charFromLuminance = (value, pool = charsWithSpace) => (
  pool[Math.ceil(((pool.length - 1) * value) / 255)]
)

const fadeChar = (value, opacity) => {
  if (opacity === 1) return value

  const index = charsWithSpace.indexOf(value)

  return index === -1 ? value : charsWithSpace[Math.floor(lerp(index, charsWithSpace.length - 1, 1 - opacity))]
}

const blendChars = (from, to, opacity) => {
  const fromIndex = charsWithSpace.indexOf(from)
  const toIndex = charsWithSpace.indexOf(to)

  return fromIndex === -1 || toIndex === -1 || opacity === 1 || fromIndex === toIndex
    ? to
    : charsWithSpace[Math.floor(lerp(fromIndex, toIndex, opacity))]
}

const uid = () => {
  let value = ''
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'

  for (let index = 0; index < 8; index += 1) {
    value += alphabet[Math.floor(alphabet.length * Math.random())]
  }

  return value
}

const cssNumber = (name, fallback) => (
  Number.parseFloat(getComputedStyle(document.documentElement).getPropertyValue(name)) || fallback
)

const clamp = (value, min, max) => Math.max(min, Math.min(max, value))

const easeInOutQuad = (value) => {
  const progress = clamp(value, 0, 1)

  return progress < 0.5 ? 2 * progress * progress : (4 - 2 * progress) * progress - 1
}

const lerp = (from, to, progress) => from * (1 - progress) + to * progress
