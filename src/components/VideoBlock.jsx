import { asset } from '../data/data.js'

const VideoBlock = ({
  src,
  poster,
  width,
  height,
  aspectRatio,
  type,
  originalSrc,
  className = '',
  videoClassName = '',
  autoPlay = true,
  playsInline = true,
  loop = true,
  muted = true,
  preload = 'auto',
  controls = false,
  wrapperClassName = 'video',
  preserveRatio = true,
  children,
  ...props
}) => {
  const source = src || originalSrc
  const resolvedSrc = asset.video(source)
  const resolvedPoster = poster ? asset.image(poster) : undefined
  const ratio = preserveRatio ? aspectRatio || (width && height ? `${width} / ${height}` : undefined) : undefined
  const wrapperStyle = ratio ? { aspectRatio: ratio } : undefined

  return (
    <div className={[wrapperClassName, className].filter(Boolean).join(' ')} style={wrapperStyle}>
      <video
        src={resolvedSrc}
        poster={resolvedPoster}
        autoPlay={autoPlay}
        playsInline={playsInline}
        loop={loop}
        muted={muted}
        preload={preload}
        controls={controls}
        width={width}
        height={height}
        crossOrigin="anonymous"
        className={videoClassName || undefined}
        data-media-type={type || undefined}
        {...props}
      />
      {children}
    </div>
  )
}

export default VideoBlock
