import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react'

const bossReport = [
  '┌' + '─'.repeat(76) + '┐',
  row('  ACME CORP — Q4 REVENUE REPORT                        FY2024 · FINAL'),
  divider(),
  row(),
  row('  DEPARTMENT          Q1        Q2        Q3        Q4     TOTAL   YoY%'),
  divider(),
  row('  Sales            42,180    48,320    51,740    63,210   205,450  +18%'),
  row('  Marketing        18,500    21,300    19,800    24,100    83,700  +12%'),
  row('  Engineering      31,200    33,400    35,100    38,600   138,300  +15%'),
  row('  Operations       12,400    11,800    13,200    14,500    51,900   +8%'),
  row('  Support           8,300     9,100     8,900    10,200    36,500  +11%'),
  row('  HR                4,200     4,500     4,300     4,800    17,800   +6%'),
  divider(),
  row('  TOTAL           116,780   128,420   133,040   155,410   533,650  +14%'),
  row(),
  row('  QUARTERLY TREND'),
  row(),
  row('  155K |                                        ████████'),
  row('  140K |                        ████████'),
  row('  130K |            ████████'),
  row('  120K |  ████████'),
  row('  100K |────────────────────────────────────────────────'),
  row('       |     Q1        Q2          Q3          Q4'),
  row(),
  row('  TOP PERFORMERS'),
  divider(),
  row('  1. J. Henderson     Sales          $127,400    *****'),
  row('  2. M. Kowalski      Engineering    $118,200    ****'),
  row('  3. R. Yamamoto      Sales          $104,800    ****'),
  row('  4. S. Okonkwo       Marketing      $ 98,500    ***'),
  row('  5. L. Pettersson    Engineering    $ 94,100    ***'),
  row(),
  row('  NOTES'),
  row('  · Q4 driven by enterprise deal closures (Initech, Globex, Umbrella)'),
  row('  · Marketing spend optimization reduced CPA by 22%'),
  row('  · Engineering headcount +3 FTE in Q3, reflected in Q4 output'),
  row('  · Support ticket volume down 15% after KB refresh'),
  row(),
  row('  FORECAST FY2025: $612,000 (+14.7%)'),
  row(),
  '└' + '─'.repeat(76) + '┘',
].join('\n')

const BossOverlay = forwardRef(({ onPause, onResume }, ref) => {
  const [visible, setVisible] = useState(false)
  const [open, setOpen] = useState(false)
  const openRef = useRef(false)
  const visibleRef = useRef(false)

  const close = useCallback(() => {
    if (!openRef.current) return

    openRef.current = false
    setOpen(false)
    onResume?.()
  }, [onResume])

  const show = useCallback(() => {
    visibleRef.current = true
    setVisible(true)
  }, [])

  const hide = useCallback(() => {
    visibleRef.current = false
    setVisible(false)
    close()
  }, [close])

  const openOverlay = useCallback((event) => {
    event.stopPropagation()
    if (openRef.current || !visibleRef.current) return

    openRef.current = true
    setOpen(true)
    onPause?.()
  }, [onPause])

  useImperativeHandle(ref, () => ({
    show,
    hide,
    isOpen: () => openRef.current,
  }), [hide, show])

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.code !== 'Escape' || !openRef.current) return

      event.stopPropagation()
      event.preventDefault()
      close()
    }

    document.addEventListener('keydown', onKeyDown, true)

    return () => {
      document.removeEventListener('keydown', onKeyDown, true)
    }
  }, [close])

  return (
    <>
      <button
        className="boss-btn ghost monocaps"
        hidden={!visible}
        type="button"
        onClick={openOverlay}
      >
        [!]
      </button>
      <div className="boss-overlay" style={{ display: open ? 'flex' : 'none' }}>
        <button className="boss-close ghost" type="button" onClick={close}>
          [X]
        </button>
        <pre>{bossReport}</pre>
      </div>
    </>
  )
})

BossOverlay.displayName = 'BossOverlay'

function row(value = '') {
  return `│${value.padEnd(76)}│`
}

function divider() {
  return row('  ' + '─'.repeat(72) + '  ')
}

export default BossOverlay
