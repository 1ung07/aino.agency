const FractalBlock = ({
  colors = '#1a0533,#ff6b35',
  dark = '#0a0a12',
  speed = 0.2,
  grain = 0.15,
  minBrightness = 0.25,
  children,
}) => (
  <div
    className="fractal"
    data-colors={colors}
    data-dark={dark}
    data-speed={speed}
    data-grain={grain}
    data-min-brightness={minBrightness}
  >
    <canvas className="fractal-canvas" />
    {children && (
      <div className="fractal-content">
        {children}
      </div>
    )}
  </div>
)

export default FractalBlock
