const chars = '$MBNQ\u00d8W@&R8GD6S9\u00d6OH#\u00c9E5UK0\u00c4\u00c5A2XP34ZC%VIF17YTJL*'
const lowerChars = chars.toLowerCase().replace(/[0-9@&#$%()[\]{}|\\/?!;*^]/g, '')

const activeTextNodes = new Map()
const lockedButtons = new Map()
const listeners = []
let timer = null

export const initHoverCharacters = (root = document) => {
  destroyHoverCharacters()
  tick()

  for (const element of root.querySelectorAll('a, button, .hoverchar')) {
    if (element.dataset.active || element.closest('.text p')) continue

    element.dataset.active = 'true'

    const dy = Number(element.dataset.dy || 0)
    const dx = Number(element.dataset.dx || 1)
    const duration = Number(element.dataset.duration || 1000)
    const handler = (event) => {
      const point = event.touches?.[0] || event
      animateFromPoint(element, point, { dx, dy, duration })
    }

    if (matchMedia('(hover: none)').matches) {
      element.addEventListener('touchmove', handler, { passive: true })
      listeners.push({ element, type: 'touchmove', handler })
    } else {
      element.addEventListener('mousemove', handler)
      listeners.push({ element, type: 'mousemove', handler })
    }
  }

  return destroyHoverCharacters
}

export const scrambleHoverCharacters = (element, pointer, options = {}) => {
  if (!element || !pointer) return

  if (!timer) tick()

  animateFromPoint(element, pointer, {
    dx: Number(options.dx ?? element.dataset.dx ?? 1),
    dy: Number(options.dy ?? element.dataset.dy ?? 0),
    duration: Number(options.duration ?? element.dataset.duration ?? 1000),
  })
}

export const destroyHoverCharacters = () => {
  clearTimeout(timer)
  timer = null

  activeTextNodes.forEach((items, node) => {
    const text = node.textContent.split('')

    Object.entries(items).forEach(([index, { char }]) => {
      text[index] = char
    })

    node.textContent = text.join('')
  })
  activeTextNodes.clear()

  lockedButtons.forEach((nodes, button) => {
    button.style.width = ''
    nodes.clear()
  })
  lockedButtons.clear()

  for (const { element, type, handler } of listeners) {
    element.removeEventListener(type, handler)
    delete element.dataset.active
  }
  listeners.length = 0
}

const animateFromPoint = (element, pointer, { dx, dy, duration }) => {
  const ch = cssNumber('--ch', 8)
  const { clientX, clientY } = pointer

  for (let row = -dy; row <= dy; row += 1) {
    for (let col = -dx; col <= dx; col += 1) {
      const x = clientX + col * ch
      const y = clientY + row * ch * 2
      const range = rangeFromPoint(x, y)

      if (!range) break

      const rects = range.getClientRects()
      if (!rects.length) break

      const rect = [...rects][0]
      const node = range.startContainer
      const offset = range.startOffset

      if (x > rect.left + ch * offset) break

      if (
        node &&
        node.nodeType === Node.TEXT_NODE &&
        element.contains(node) &&
        !node.parentNode.closest('.big, .mega')
      ) {
        const text = (node.textContent || '').split('')
        const char = text[offset]

        if (
          offset >= 0 &&
          offset < text.length &&
          char.trim() &&
          (chars.includes(char.toUpperCase()) || lowerChars.includes(char))
        ) {
          addCharacter(node, offset, Math.abs(col * row), duration)
        }

        node.textContent = text.join('')
      }
    }
  }
}

const addCharacter = (node, index, distance, duration) => {
  if (!activeTextNodes.has(node)) {
    activeTextNodes.set(node, {})
    lockParentButton(node)
  }

  const active = activeTextNodes.get(node)

  if (!(index in active)) {
    const char = node.textContent.split('')[index]
    const isLower = char === char.toLowerCase() && char !== char.toUpperCase()

    active[index] = {
      distance,
      start: Date.now(),
      char,
      isLower,
      duration,
    }
  }
}

const lockParentButton = (node) => {
  const button = node.parentNode?.closest('button, a.button')

  if (!button || button.classList.contains('fullwidth')) return

  if (!lockedButtons.has(button)) {
    button.style.width = `${button.getBoundingClientRect().width}px`
    lockedButtons.set(button, new Set())
  }

  lockedButtons.get(button).add(node)
}

const tick = () => {
  activeTextNodes.forEach((items, node) => {
    const text = node.textContent.split('')
    let changed = false

    Object.entries(items).forEach(([index, item]) => {
      const progress = easeOutQuint(Math.min((Date.now() - item.start) / item.duration, 1))
      const wave = 1 - 2 * Math.abs(progress - 0.5)
      const pool = item.isLower ? lowerChars : chars
      const charIndex = pool.indexOf(item.isLower ? item.char : item.char.toUpperCase())
      const edge = charIndex < pool.length / 2 ? pool.length - 1 : 0

      text[index] = pool[Math.floor(lerp(charIndex, edge, wave))]
      changed = true

      if (progress >= 0.99) {
        text[index] = item.char
        delete items[index]
      }
    })

    if (changed) {
      node.textContent = text.join('')
    }

    if (Object.keys(items).length === 0) {
      activeTextNodes.delete(node)
      unlockParentButton(node)
    }
  })

  timer = setTimeout(tick, 25)
}

const unlockParentButton = (node) => {
  for (const [button, nodes] of lockedButtons) {
    nodes.delete(node)

    if (nodes.size === 0) {
      button.style.width = ''
      lockedButtons.delete(button)
    }
  }
}

const rangeFromPoint = (x, y) => {
  if (document.caretPositionFromPoint) {
    const position = document.caretPositionFromPoint(x, y)
    if (!position) return null

    const range = document.createRange()
    range.setStart(position.offsetNode, position.offset)
    range.setEnd(position.offsetNode, position.offset)
    return range
  }

  return document.caretRangeFromPoint?.(x, y) || null
}

const cssNumber = (name, fallback) => (
  Number.parseFloat(getComputedStyle(document.documentElement).getPropertyValue(name)) || fallback
)

const easeOutQuint = (value) => 1 + (value - 1) ** 5

const lerp = (from, to, progress) => from * (1 - progress) + to * progress
