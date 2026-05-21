import { Link } from 'react-router-dom'

const LineList = ({ items = [], className = '', activeHref, out = false, onItemClick }) => {
  return (
    <ul className={['linelist', out && 'out', className].filter(Boolean).join(' ')}>
      {items.map((item, index) => (
        <LineListItem
          key={`${item.number}-${item.title}`}
          item={item}
          index={index}
          active={Boolean(activeHref && item.href === activeHref)}
          onItemClick={onItemClick}
        />
      ))}
    </ul>
  )
}

const LineListItem = ({ item, index, active, onItemClick }) => {
  const row = (
    <>
      <span>{item.number}</span>
      <span className="wide">{item.title}</span>
      <span>{item.year}</span>
    </>
  )

  return (
    <li data-index={index} className={active ? 'active' : undefined}>
      {item.href ? (
        <Link
          to={item.href}
          className="line"
          onClick={(event) => onItemClick?.(event, item, index)}
        >
          {row}
        </Link>
      ) : (
        <div className="line inactive">{row}</div>
      )}
    </li>
  )
}

export default LineList
