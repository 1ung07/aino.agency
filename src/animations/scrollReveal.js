const chars = "$MBNQ\u00d8W@&R8GD6S9\u00d6OH#\u00c9E5UK0\u00c4\u00c5A2XP34ZC%VIF17YTJL[]?}{()<>|=+\\/^!\";*_:~,'-.\u00b7`\u00a0"
const lowerChars = chars.toLowerCase().replace(/[0-9@&#$%()[\]{}|\\/?!;*^]/g, '')

const activeTextNodes = new Map()
const readyCallbacks = new Map()
const ownerByNode = new Map()
const revealTimers = new Set()
let frame = null

export const initScrollReveal = (root = document) => {
  destroyScrollReveal()

  const cleanup = []

  for (const element of root.querySelectorAll('.fadein')) {
    cleanup.push(observeOnce(element, () => revealText(element, { speed: 1 }), { threshold: 0.2 }))
  }

  for (const element of root.querySelectorAll('.col.burn .image')) {
    cleanup.push(observeOnce(element, () => element.classList.add('revealed'), { threshold: 0 }))
  }

  for (const element of root.querySelectorAll('[data-animate]')) {
    cleanup.push(initDataReveal(element))
  }

  return () => {
    cleanup.forEach((dispose) => dispose?.())
    destroyScrollReveal()
  }
}

export const destroyScrollReveal = () => {
  for (const timer of revealTimers) {
    window.clearTimeout(timer)
  }
  revealTimers.clear()

  if (frame) {
    cancelAnimationFrame(frame)
    frame = null
  }

  activeTextNodes.forEach((items, node) => {
    const text = node.textContent.split('')

    for (const [index, item] of Object.entries(items)) {
      text[index] = item.char
    }

    node.textContent = text.join('')
  })

  activeTextNodes.clear()
  readyCallbacks.clear()
  ownerByNode.clear()
}

export const revealText = (
  element,
  { filter, ready, speed = 2, duration = 400, random = false } = {},
) => {
  element.style.opacity = 0

  let textNodes = getTextNodes(element)

  if (filter) {
    textNodes = textNodes.filter(filter)
  }

  if (ready) {
    readyCallbacks.set(element, ready)
  }

  for (const node of textNodes) {
    ownerByNode.set(node, element)
  }

  let totalChars = 0

  if (random) {
    for (const node of textNodes) {
      if (node.textContent.trim()) {
        for (const char of node.textContent) {
          if (char.trim()) totalChars += 1
        }
      }
    }
  }

  let offset = 0

  for (const node of textNodes) {
    if (!node.textContent.trim()) continue

    const text = node.textContent.split('')

    for (let index = 0; index < text.length; index += 1) {
      if (text[index].trim()) {
        addRevealCharacter(
          node,
          index,
          random ? Math.random() * totalChars * speed : offset,
          duration,
        )
        offset += speed
      }
    }

    node.textContent = text.map(() => '\u00a0').join('')
  }

  if (!frame) {
    frame = requestAnimationFrame(tickReveal)
  }

  const timer = window.setTimeout(() => {
    element.style.opacity = 1
    revealTimers.delete(timer)
  }, 50)

  revealTimers.add(timer)
}

export const clearRevealText = (element) => {
  for (const [node, owner] of ownerByNode) {
    if (owner === element) {
      activeTextNodes.delete(node)
      ownerByNode.delete(node)
    }
  }

  readyCallbacks.delete(element)
}

const initDataReveal = (element) => {
  const targets = Array.from(element.querySelectorAll('[data-reveal], [data-textreveal]'))
  const cleanup = []

  if (!targets.length) return noop

  cleanup.push(
    observeOnce(
      element,
      () => {
        for (const target of targets) {
          requestAnimationFrame(() => {
            target.dataset.init = 'true'
          })

          const delay = Number.parseInt(target.dataset.delay, 10) || 5
          const timer = window.setTimeout(() => {
            if (target.dataset.reveal) {
              target.classList.add('revealed')
            }

            if (target.dataset.textreveal === 'scramble') {
              revealText(target, { speed: 1 })
            }

            revealTimers.delete(timer)
          }, delay)

          revealTimers.add(timer)
          cleanup.push(() => window.clearTimeout(timer))
        }
      },
      { threshold: 0.3 },
    ),
  )

  return () => {
    cleanup.forEach((dispose) => dispose?.())
  }
}

const observeOnce = (element, callback, options) => {
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue

      callback(entry)
      observer.unobserve(element)
      observer.disconnect()
      break
    }
  }, options)

  observer.observe(element)

  return () => observer.disconnect()
}

const tickReveal = () => {
  activeTextNodes.forEach((items, node) => {
    const text = node.textContent.split('')
    let changed = false

    for (const [index, item] of Object.entries(items)) {
      const now = Date.now()

      if (item.start > now) continue

      const progress = easeInOutQuad(Math.min((now - item.start) / item.duration, 1))
      const pool = item.isLower ? lowerChars : chars
      const charIndex = pool.indexOf(item.isLower ? item.char : item.char.toUpperCase())

      if (charIndex === -1) {
        text[index] = item.char
        delete items[index]
        changed = true
        continue
      }

      const from = Math.floor(lerp(pool.length, charIndex, 0))
      text[index] = pool[Math.floor(lerp(from, charIndex, progress))]
      changed = true

      if (progress === 1) {
        text[index] = item.char
        delete items[index]
      }
    }

    if (changed) {
      node.textContent = text.join('')
    }

    if (Object.keys(items).length === 0) {
      activeTextNodes.delete(node)
      runReadyIfComplete(node)
    }
  })

  if (activeTextNodes.size) {
    frame = requestAnimationFrame(tickReveal)
  } else {
    frame = null
  }
}

const addRevealCharacter = (node, index, delay, duration) => {
  if (!activeTextNodes.has(node)) {
    activeTextNodes.set(node, {})
  }

  const active = activeTextNodes.get(node)

  if (!(index in active)) {
    const char = node.textContent.split('')[index]
    const isLower = char === char.toLowerCase() && char !== char.toUpperCase()

    active[index] = {
      start: Date.now() + delay,
      char,
      isLower,
      duration,
    }
  }
}

const runReadyIfComplete = (node) => {
  const owner = ownerByNode.get(node)

  if (!owner) return

  for (const [otherNode, otherOwner] of ownerByNode) {
    if (otherOwner === owner && activeTextNodes.has(otherNode)) {
      return
    }
  }

  const ready = readyCallbacks.get(owner)

  if (ready) {
    readyCallbacks.delete(owner)
    ready()
  }

  Array.from(ownerByNode.entries()).forEach(([otherNode, otherOwner]) => {
    if (otherOwner === owner) ownerByNode.delete(otherNode)
  })
}

const getTextNodes = (element) => {
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, null)
  const nodes = []
  let node = walker.nextNode()

  while (node) {
    nodes.push(node)
    node = walker.nextNode()
  }

  return nodes
}

const easeInOutQuad = (value) => (
  value < 0.5 ? 2 * value * value : (4 - 2 * value) * value - 1
)

const lerp = (from, to, progress) => from * (1 - progress) + to * progress

const noop = () => {}
