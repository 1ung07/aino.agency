import Navigation from './Navigation.jsx'

const Header = ({ activeMenu, onOpenMenu, onCloseMenu }) => {
  return (
    <header data-component="header">
      <Navigation activeMenu={activeMenu} onOpenMenu={onOpenMenu} onCloseMenu={onCloseMenu} />
    </header>
  )
}

export default Header
