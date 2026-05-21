const vertexShaderSource = `
attribute vec2 position;
varying vec2 vUv;

void main() {
  vUv = position * 0.5 + 0.5;
  gl_Position = vec4(position, 0.0, 1.0);
}
`

const fragmentShaderSource = `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform float uSpeed;
uniform float uGrain;
uniform float uMinBrightness;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uDark;
uniform sampler2D uTouchTexture;

float hash(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

float height(vec2 p, float t) {
  float h = sin(p.x * 1.3 - p.y * 0.7 + t * 0.12) * 0.5;
  h += sin(-p.x * 0.8 + p.y * 1.5 + t * 0.09) * 0.5;
  h += sin(p.x * 0.5 + p.y * 0.9 - t * 0.1) * 0.4;
  h += sin(p.x * 2.5 + p.y * 1.8 + t * 0.15) * 0.2;
  h += sin(-p.x * 1.9 + p.y * 2.6 - t * 0.13) * 0.2;
  h += sin(p.x * 3.1 - p.y * 1.4 + t * 0.18) * 0.15;
  h += sin(p.x * 4.5 + p.y * 3.2 - t * 0.2) * 0.08;
  h += sin(-p.x * 3.8 + p.y * 4.7 + t * 0.17) * 0.08;

  vec2 w = vec2(
    sin(p.y * 1.5 + t * 0.07) * 0.3,
    cos(p.x * 1.3 - t * 0.06) * 0.3
  );

  h += sin((p.x + w.x) * 2.0 + (p.y + w.y) * 2.0 + t * 0.11) * 0.25;
  return h;
}

vec3 getNormal(vec2 p, float t) {
  float eps = 0.005;
  float h = height(p, t);
  float hx = height(p + vec2(eps, 0.0), t);
  float hy = height(p + vec2(0.0, eps), t);

  return normalize(vec3(
    -(hx - h) / eps,
    -(hy - h) / eps,
    0.18
  ));
}

void main() {
  vec2 uv = vUv;
  vec4 touch = texture2D(uTouchTexture, uv);
  float tvx = -(touch.r * 2.0 - 1.0);
  float tvy = -(touch.g * 2.0 - 1.0);
  float intensity = touch.b;

  uv.x += tvx * 0.5 * intensity;
  uv.y += tvy * 0.5 * intensity;

  float dist = length(uv - vec2(0.5));
  uv += vec2(sin(dist * 15.0 - uTime * 2.0) * 0.03 * intensity);

  float t = uTime * uSpeed;
  vec2 pan = vec2(
    sin(t * 0.015) * 0.5 + sin(t * 0.009) * 0.3 + t * 0.004,
    cos(t * 0.012) * 0.5 + cos(t * 0.017) * 0.3 + t * 0.003
  );
  float zoom = 0.9 + 0.15 * sin(t * 0.01) + 0.1 * sin(t * 0.018);
  float rot = sin(t * 0.008) * 0.25 + sin(t * 0.013) * 0.1;

  vec2 p = uv - 0.5;
  float cr = cos(rot);
  float sr = sin(rot);
  p = vec2(p.x * cr - p.y * sr, p.x * sr + p.y * cr);
  p = p * zoom + pan;

  vec3 n = getNormal(p, t);
  float blend = (n.x + n.y) * 0.5 + 0.5;
  vec3 color = mix(uColorA, uColorB, blend);
  vec3 lightDir = normalize(vec3(
    sin(t * 0.025) * 0.4 + 0.3,
    cos(t * 0.03) * 0.4 + 0.3,
    1.0
  ));
  float diffuse = max(dot(n, lightDir), 0.0);
  vec3 viewDir = vec3(0.0, 0.0, 1.0);
  vec3 reflDir = reflect(-lightDir, n);
  float spec = pow(max(dot(reflDir, viewDir), 0.0), 24.0);
  vec3 ambient = color * uMinBrightness;
  vec3 lit = ambient + color * diffuse * 0.75 + vec3(1.0) * spec * 0.15;
  float lum = dot(lit, vec3(0.299, 0.587, 0.114));

  lit = mix(vec3(lum), lit, 1.4);
  lit += hash(uv * uResolution + fract(uTime * 100.0)) * uGrain - uGrain * 0.5;
  lit = mix(uDark, lit, smoothstep(0.0, 0.15, lum));

  gl_FragColor = vec4(clamp(lit, vec3(0.0), vec3(1.0)), 1.0);
}
`

export const initFractalCanvases = (root = document) => {
  const destroyers = Array.from(root.querySelectorAll('.fractal'))
    .map((element) => createFractalCanvas(element))
    .filter(Boolean)

  return () => {
    destroyers.forEach((destroy) => destroy())
  }
}

const createFractalCanvas = (element) => {
  const canvas = element.querySelector('.fractal-canvas')

  if (!canvas) return null

  const colors = (element.dataset.colors || '#1a0533,#ff6b35').split(',').map(parseHexColor)
  const dark = parseHexColor(element.dataset.dark || '#0a0a12')
  const speed = Number.parseFloat(element.dataset.speed) || 0.2
  const grain = Number.parseFloat(element.dataset.grain) || 0.15
  const minBrightness = Number.parseFloat(element.dataset.minBrightness) || 0.25
  const timeOffset = 10000 * Math.random()
  const gl = canvas.getContext('webgl', {
    alpha: false,
    antialias: false,
    depth: false,
    stencil: false,
    preserveDrawingBuffer: true,
  })

  if (!gl) return null

  const vertexShader = compileShader(gl, gl.VERTEX_SHADER, vertexShaderSource)
  const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource)

  if (!vertexShader || !fragmentShader) return null

  const program = createProgram(gl, vertexShader, fragmentShader)

  if (!program) return null

  gl.useProgram(program)

  const buffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
    gl.STATIC_DRAW,
  )

  const position = gl.getAttribLocation(program, 'position')
  gl.enableVertexAttribArray(position)
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0)

  const uniforms = {
    time: gl.getUniformLocation(program, 'uTime'),
    resolution: gl.getUniformLocation(program, 'uResolution'),
    speed: gl.getUniformLocation(program, 'uSpeed'),
    grain: gl.getUniformLocation(program, 'uGrain'),
    touchTexture: gl.getUniformLocation(program, 'uTouchTexture'),
    minBrightness: gl.getUniformLocation(program, 'uMinBrightness'),
    colorA: gl.getUniformLocation(program, 'uColorA'),
    colorB: gl.getUniformLocation(program, 'uColorB'),
    dark: gl.getUniformLocation(program, 'uDark'),
  }
  const colorA = colors[0]
  const colorB = colors[1] || colorA
  const touchTexture = new TouchTexture()
  const texture = gl.createTexture()
  let frame = null
  let width = 0
  let height = 0
  let alive = true

  gl.uniform1f(uniforms.speed, speed)
  gl.uniform1f(uniforms.grain, grain)
  gl.uniform1f(uniforms.minBrightness, minBrightness)
  gl.uniform3f(uniforms.colorA, colorA[0], colorA[1], colorA[2])
  gl.uniform3f(uniforms.colorB, colorB[0], colorB[1], colorB[2])
  gl.uniform3f(uniforms.dark, dark[0], dark[1], dark[2])
  gl.activeTexture(gl.TEXTURE0)
  gl.bindTexture(gl.TEXTURE_2D, texture)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
  gl.uniform1i(uniforms.touchTexture, 0)

  const resize = () => {
    const ratio = Math.min(window.devicePixelRatio || 1, 2)
    const nextWidth = Math.round(canvas.clientWidth * ratio)
    const nextHeight = Math.round(canvas.clientHeight * ratio)

    if (!nextWidth || !nextHeight || (nextWidth === width && nextHeight === height)) return

    canvas.width = nextWidth
    canvas.height = nextHeight
    gl.viewport(0, 0, nextWidth, nextHeight)
    gl.uniform2f(uniforms.resolution, nextWidth, nextHeight)
    width = nextWidth
    height = nextHeight
  }

  const addPointer = (clientX, clientY) => {
    const bounds = element.getBoundingClientRect()

    if (!bounds.width || !bounds.height) return

    touchTexture.addTouch(
      (clientX - bounds.left) / bounds.width,
      1 - (clientY - bounds.top) / bounds.height,
    )
  }
  const onMouseMove = (event) => addPointer(event.clientX, event.clientY)
  const onTouchMove = (event) => {
    const touch = event.touches[0]

    if (touch) addPointer(touch.clientX, touch.clientY)
  }
  const render = (time) => {
    if (!alive) return

    resize()
    touchTexture.update()
    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, texture)
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      touchTexture.canvas,
    )
    gl.uniform1f(uniforms.time, time * 0.001 + timeOffset)
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
    frame = requestAnimationFrame(render)
  }

  element.addEventListener('mousemove', onMouseMove)
  element.addEventListener('touchmove', onTouchMove, { passive: true })
  frame = requestAnimationFrame(render)

  return () => {
    alive = false
    element.removeEventListener('mousemove', onMouseMove)
    element.removeEventListener('touchmove', onTouchMove)

    if (frame) {
      cancelAnimationFrame(frame)
    }

    gl.deleteTexture(texture)
    gl.deleteProgram(program)
    gl.deleteShader(vertexShader)
    gl.deleteShader(fragmentShader)
    gl.deleteBuffer(buffer)
  }
}

class TouchTexture {
  constructor() {
    this.size = 64
    this.maxAge = 64
    this.radius = 0.25 * this.size
    this.speed = 1 / this.maxAge
    this.trail = []
    this.last = null
    this.canvas = document.createElement('canvas')
    this.canvas.width = this.size
    this.canvas.height = this.size
    this.context = this.canvas.getContext('2d')
    this.context.fillStyle = 'black'
    this.context.fillRect(0, 0, this.size, this.size)
  }

  update() {
    this.context.fillStyle = 'black'
    this.context.fillRect(0, 0, this.size, this.size)

    for (let index = this.trail.length - 1; index >= 0; index -= 1) {
      const point = this.trail[index]
      const force = point.force * this.speed * (1 - point.age / this.maxAge)

      point.x += point.vx * force
      point.y += point.vy * force
      point.age += 1

      if (point.age > this.maxAge) {
        this.trail.splice(index, 1)
      } else {
        this.drawPoint(point)
      }
    }
  }

  addTouch(x, y) {
    let force = 0
    let vx = 0
    let vy = 0

    if (this.last) {
      const dx = x - this.last.x
      const dy = y - this.last.y

      if (dx === 0 && dy === 0) return

      const distance = dx * dx + dy * dy
      const length = Math.sqrt(distance)

      vx = dx / length
      vy = dy / length
      force = Math.min(20000 * distance, 2)
    }

    this.last = { x, y }
    this.trail.push({ x, y, age: 0, force, vx, vy })
  }

  drawPoint(point) {
    const x = point.x * this.size
    const y = (1 - point.y) * this.size
    let intensity

    if (point.age < 0.3 * this.maxAge) {
      intensity = Math.sin((point.age / (0.3 * this.maxAge)) * (Math.PI / 2))
    } else {
      const fade = 1 - (point.age - 0.3 * this.maxAge) / (0.7 * this.maxAge)
      intensity = -fade * (fade - 2)
    }

    intensity *= point.force

    const color = [
      ((point.vx + 1) / 2) * 255,
      ((point.vy + 1) / 2) * 255,
      255 * intensity,
    ].join(', ')
    const offset = 5 * this.size

    this.context.shadowOffsetX = offset
    this.context.shadowOffsetY = offset
    this.context.shadowBlur = this.radius
    this.context.shadowColor = `rgba(${color},${0.2 * intensity})`
    this.context.beginPath()
    this.context.fillStyle = 'rgba(255,0,0,1)'
    this.context.arc(x - offset, y - offset, this.radius, 0, 2 * Math.PI)
    this.context.fill()
  }
}

const compileShader = (gl, type, source) => {
  const shader = gl.createShader(type)

  gl.shaderSource(shader, source)
  gl.compileShader(shader)

  if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    return shader
  }

  gl.deleteShader(shader)
  return null
}

const createProgram = (gl, vertexShader, fragmentShader) => {
  const program = gl.createProgram()

  gl.attachShader(program, vertexShader)
  gl.attachShader(program, fragmentShader)
  gl.linkProgram(program)

  if (gl.getProgramParameter(program, gl.LINK_STATUS)) {
    return program
  }

  gl.deleteProgram(program)
  return null
}

const parseHexColor = (value) => {
  const color = value.trim()

  return [
    Number.parseInt(color.slice(1, 3), 16) / 255,
    Number.parseInt(color.slice(3, 5), 16) / 255,
    Number.parseInt(color.slice(5, 7), 16) / 255,
  ]
}
