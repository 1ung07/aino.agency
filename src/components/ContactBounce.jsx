import { useEffect, useRef } from 'react'
import { createTextGridPhysics } from '../animations/textGridPhysics.js'

const ContactBounce = ({ infoRef }) => {
  const bounceRef = useRef(null)

  useEffect(() => {
    if (!bounceRef.current) return undefined

    const bounceNode = bounceRef.current
    const parent = bounceNode.parentElement
    const grid = createTextGridPhysics(bounceNode)
    const disposers = [() => grid.destroy()]

    const resize = () => {
      const infoNode = infoRef?.current
      const line = cssNumber('--line', 16)
      const fallbackHeight = line * 10
      const height = infoNode?.offsetTop || Number.parseFloat(getComputedStyle(infoNode || bounceNode).marginTop)

      bounceNode.style.height = `${Number.isFinite(height) && height > 0 ? height : fallbackHeight}px`
    }

    const observer = new ResizeObserver(resize)

    if (parent) observer.observe(parent)
    if (infoRef?.current) observer.observe(infoRef.current)

    disposers.push(() => observer.disconnect())
    resize()

    const points = grid.createText({ text: 'Contact', col: 0, row: 0 })

    for (const point of points) {
      point.x = Math.random()
      point.vx = lerp(-0.5, 0.5, Math.random())
      point.vy -= lerp(0, 0.05, Math.random())
    }

    grid.gravitate(points, { damping: 1.01 })

    disposers.push(grid.listen('frame', ({ delta }) => {
      grid.applyPhysics(points, delta)
      grid.render(points)
    }))

    return () => {
      disposers.forEach((dispose) => dispose())
    }
  }, [infoRef])

  return <div ref={bounceRef} className="bounce mono" aria-hidden="true" />
}

const cssNumber = (name, fallback) => (
  Number.parseFloat(getComputedStyle(document.documentElement).getPropertyValue(name)) || fallback
)

const lerp = (from, to, progress) => from * (1 - progress) + to * progress

export default ContactBounce
