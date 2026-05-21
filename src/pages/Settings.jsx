import { useState } from 'react'

const Settings = ({ onClose }) => {
  const [appearance, setAppearance] = useState(() => (
    document.documentElement.classList.contains('light') ? 'light' : 'dark'
  ))
  const [mode, setMode] = useState(() => (
    document.documentElement.classList.contains('textmode')
      ? 'text'
      : document.documentElement.classList.contains('pixelmode')
        ? 'pixel'
        : 'default'
  ))

  const chooseAppearance = (nextAppearance) => {
    const isDark = nextAppearance !== 'light'

    setAppearance(nextAppearance)
    localStorage.setItem('aino-appearance', nextAppearance)
    document.documentElement.classList.toggle('dark', isDark)
    document.documentElement.classList.toggle('light', !isDark)
  }

  const chooseMode = (nextMode) => {
    setMode(nextMode)
    localStorage.setItem('aino-mode', nextMode)
    document.documentElement.classList.toggle('textmode', nextMode === 'text')
    document.documentElement.classList.toggle('pixelmode', nextMode === 'pixel')
    window.dispatchEvent(new CustomEvent('aino:modechange'))
  }

  return (
    <div className="settings-page menu-page">
      <button className="menu-page-backdrop ghost" type="button" aria-label="Close settings" onClick={onClose} />
      <section id="side-dialog" data-dialog="settings" className="menu-page-panel settings-page-panel">
        <div className="dialog-header">
          <span>Settings</span>
          <button className="ghost" type="button" onClick={onClose}>
            Close
          </button>
        </div>
        <div className="settings">
          <div className="settings-group">
            <h3>Mood</h3>
            <ul className="appearance">
              {['dark', 'light'].map((option) => (
                <li key={option} className={option === appearance ? 'active' : undefined}>
                  <button
                    className="ghost"
                    type="button"
                    aria-pressed={option === appearance}
                    onClick={() => chooseAppearance(option)}
                  >
                    <span className="settings-dot" />
                    {capitalize(option)}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <div className="settings-group">
            <h3>Mode</h3>
            <ul className="appearance">
              {['default', 'text', 'pixel'].map((option) => (
                <li key={option} className={option === mode ? 'active' : undefined}>
                  <button
                    className="ghost"
                    type="button"
                    aria-pressed={option === mode}
                    onClick={() => chooseMode(option)}
                  >
                    <span className="settings-dot" />
                    {capitalize(option)}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </div>
  )
}

const capitalize = (value) => value.charAt(0).toUpperCase() + value.slice(1)

export default Settings
