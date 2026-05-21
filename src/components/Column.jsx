const Column = ({
  as: Tag = 'div',
  children,
  className = '',
  width,
  top,
  left,
  middle = false,
  bottom = false,
  between = false,
  sticky = false,
  solid = false,
  burn = false,
  border = false,
  text = false,
  halfWidth = false,
  link,
  style,
  ...props
}) => {
  const classes = [
    'col',
    width && `w${width}`,
    middle && 'middle',
    bottom && 'bottom',
    between && 'between',
    sticky && 'sticky',
    solid && 'solid',
    burn && 'burn',
    border && 'border',
    text && 'text',
    halfWidth && 'halfwidth',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  const columnStyle = {
    ...createColumnOffsetStyles({ top, left }),
    ...style,
  }

  const content = (
    <Tag className={classes} style={columnStyle} {...props}>
      {children}
    </Tag>
  )

  if (!link) {
    return content
  }

  return (
    <a href={link} className={classes} style={columnStyle} {...props}>
      {children}
    </a>
  )
}

const createColumnOffsetStyles = ({ top, left }) => {
  const styles = {}

  if (top !== undefined) {
    styles.top = `calc(var(--line) * ${top})`
  }

  if (left !== undefined) {
    styles.left = `calc(var(--char2) * ${left})`
  }

  return styles
}

export default Column
