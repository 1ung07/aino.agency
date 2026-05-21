import { asset } from '../data/data.js'

const defaultWidths = [160, 320, 640, 960, 1280, 1600, 1920, 2240]

const ImageBlock = ({
  src,
  srcSet,
  widths = defaultWidths,
  sizes,
  alt = 'Aino Agency',
  width,
  height,
  aspectRatio,
  type,
  originalSrc,
  className = '',
  imgClassName = '',
  children,
  ...props
}) => {
  const source = src || originalSrc
  const resolvedSrc = asset.image(source)
  const resolvedSrcSet = srcSet || createSrcSet(resolvedSrc, widths)
  const wrapperStyle = aspectRatio ? { aspectRatio } : undefined

  return (
    <div className={['image', className].filter(Boolean).join(' ')} style={wrapperStyle}>
      <img
        src={resolvedSrc}
        srcSet={resolvedSrcSet}
        sizes={sizes}
        alt={alt}
        width={width}
        height={height}
        className={imgClassName || undefined}
        data-media-type={type || undefined}
        {...props}
      />
      {children}
    </div>
  )
}

const createSrcSet = (src, widths) => {
  if (!src || src.startsWith('data:') || !Array.isArray(widths)) {
    return undefined
  }

  return widths.map((size) => `${src} ${size}w`).join(', ')
}

export default ImageBlock
