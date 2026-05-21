import { useLocation } from 'react-router-dom'
import { workItems } from '../data/workItems.js'
import LineList from './LineList.jsx'

const CaseFooter = ({ items = workItems, className = '' }) => {
  const { pathname } = useLocation()

  return (
    <section className={['casefooter', 'fadein', className].filter(Boolean).join(' ')}>
      <div className="span-4">
        <LineList items={items} activeHref={pathname} />
      </div>
    </section>
  )
}

export default CaseFooter
