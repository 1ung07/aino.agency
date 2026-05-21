const Section = ({
  as: Tag = 'section',
  children,
  className = '',
  first = false,
  space = false,
  spaceSmall = false,
  spaceBig = false,
  hr = false,
  hrBottom = false,
  between = false,
  center = false,
  end = false,
  wrap = false,
  outline = false,
  fadein = false,
  marginTop,
  marginBottom,
  style,
  ...props
}) => {
  const classes = [
    'section',
    first && 'first',
    space && 'space',
    spaceSmall && 'spacesmall',
    spaceBig && 'spacebig',
    hr && 'hr',
    hrBottom && 'hrbottom',
    between && 'between',
    center && 'center',
    end && 'end',
    wrap && 'wrap',
    outline && 'outline',
    fadein && 'fadein',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  const sectionStyle = {
    ...createSectionOffsetStyles({ marginTop, marginBottom }),
    ...style,
  }

  return (
    <Tag className={classes} style={sectionStyle} {...props}>
      {children}
    </Tag>
  )
}

const createSectionOffsetStyles = ({ marginTop, marginBottom }) => {
  const styles = {}

  if (marginTop !== undefined) {
    styles.marginTop = `calc(var(--line) * ${marginTop})`
  }

  if (marginBottom !== undefined) {
    styles.marginBottom = `calc(var(--line) * ${marginBottom})`
  }

  return styles
}

export default Section
