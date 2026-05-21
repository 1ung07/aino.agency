import ImageBlock from './ImageBlock.jsx'
import VideoBlock from './VideoBlock.jsx'

const MediaBlock = ({
  image,
  video,
  type,
  src,
  url,
  className,
  children,
  ...props
}) => {
  const source = src || url || image?.src || image?.url || video?.src || video?.url
  const mediaType = getMediaType({ type, source, image, video })

  if (!source) {
    return null
  }

  if (mediaType === 'video') {
    return (
      <VideoBlock
        src={source}
        className={className}
        {...video}
        {...props}
      >
        {children}
      </VideoBlock>
    )
  }

  return (
    <ImageBlock
      src={source}
      className={className}
      {...image}
      {...props}
    >
      {children}
    </ImageBlock>
  )
}

const getMediaType = ({ type, source, image, video }) => {
  if (type) {
    return type
  }

  if (video) {
    return 'video'
  }

  if (image) {
    return 'image'
  }

  return source?.toLowerCase().endsWith('.mp4') ? 'video' : 'image'
}

export default MediaBlock
