import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './WelcomePage.css'

type PanelKey = 'scroll' | 'sword' | 'mystery'

const PANEL_ORDER: PanelKey[] = ['scroll', 'sword', 'mystery']

export function WelcomePage() {
  const navigate = useNavigate()
  const [selected, setSelected] = useState<PanelKey | null>('scroll')

  const panelsRef = useRef<HTMLDivElement>(null)
  const panelRefs = useRef<Partial<Record<PanelKey, HTMLDivElement | null>>>({})
  const rafRef = useRef<number | null>(null)
  // Set while we're programmatically scrolling (from a click), so the
  // scroll listener doesn't fight the click handler's own selection.
  const isProgrammaticScroll = useRef(false)
  const programmaticScrollTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Figures out which panel's center is closest to the scroll
  // container's center, and updates `selected` if it changed. Used
  // both on swipe (scroll events) and once on mount so the initially
  // visible panel starts out highlighted.
  const updateSelectedFromScroll = () => {
    const container = panelsRef.current
    if (!container) return

    const containerRect = container.getBoundingClientRect()
    const containerCenter = containerRect.left + containerRect.width / 2

    let closestKey: PanelKey | null = null
    let closestDistance = Infinity

    for (const key of PANEL_ORDER) {
      const el = panelRefs.current[key]
      if (!el) continue
      const rect = el.getBoundingClientRect()
      const panelCenter = rect.left + rect.width / 2
      const distance = Math.abs(panelCenter - containerCenter)
      if (distance < closestDistance) {
        closestDistance = distance
        closestKey = key
      }
    }

    if (closestKey && closestKey !== selected) {
      setSelected(closestKey)
    }
  }

  const handleScroll = () => {
    if (isProgrammaticScroll.current) return
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(updateSelectedFromScroll)
  }

  const handlePanelClick = (key: PanelKey) => {
    setSelected(key)

    const el = panelRefs.current[key]
    if (!el) return

    isProgrammaticScroll.current = true
    el.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })

    // Clear the guard after the smooth scroll has had time to finish,
    // so subsequent user swipes are tracked normally again.
    if (programmaticScrollTimeout.current) clearTimeout(programmaticScrollTimeout.current)
    programmaticScrollTimeout.current = setTimeout(() => {
      isProgrammaticScroll.current = false
    }, 500)
  }

  useEffect(() => {
    // Establish initial selection based on actual scroll position
    // (relevant on mobile, where panels overflow horizontally).
    updateSelectedFromScroll()

    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
      if (programmaticScrollTimeout.current) clearTimeout(programmaticScrollTimeout.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="welcome-stage">
      <button
        className="welcome-schedule-btn"
        onClick={() => navigate('/schedule')}
        aria-label="View schedule"
      >
        Schedule
      </button>

      {/* Portrait-only header: title + line stacked above the panels
          row, matching the reference layout. Hidden on desktop via CSS
          (see .welcome-header-mobile in the stylesheet) — the desktop
          title/line/caption below are the ones shown there. */}
      <div className="welcome-header-mobile">
        <img className="welcome-title welcome-title--mobile" src="/assets/title-red.PNG" alt="zOo" />
        <img className="welcome-line welcome-line--mobile" src="/assets/Line.PNG" alt="" />
        <div className="welcome-caption welcome-caption--mobile">WELCOME TO ZO.O</div>
      </div>

      <div className="welcome-layout">
        <div className="welcome-left">
          {/* Decorative — was previously wired to navigate('/schedule'),
              which is why tapping it jumped to the schedule page. The
              "Schedule" button above already covers that action, so
              this is now just an image. */}
          <img className="welcome-feature" src="/assets/panel1.png" alt="" />
          <img className="welcome-title" src="/assets/title-red.PNG" alt="zOo" />
        </div>

        <div className="welcome-panels" ref={panelsRef} onScroll={handleScroll}>
          <div
            className={`welcome-panel ${selected === 'scroll' ? 'is-selected' : ''}`}
            ref={(el) => { panelRefs.current.scroll = el }}
            onClick={() => handlePanelClick('scroll')}
          >
            <img className="welcome-panel-bg" src="/assets/panel2.png" alt="" />
            <img className="welcome-panel-icon" src="/assets/scroll.png" alt="Scroll" />
          </div>
          <div
            className={`welcome-panel ${selected === 'sword' ? 'is-selected' : ''}`}
            ref={(el) => { panelRefs.current.sword = el }}
            onClick={() => handlePanelClick('sword')}
          >
            <img className="welcome-panel-bg" src="/assets/panel3.png" alt="" />
            <img className="welcome-panel-icon" src="/assets/sword.png" alt="Sword" />
          </div>
          <div
            className={`welcome-panel ${selected === 'mystery' ? 'is-selected' : ''}`}
            ref={(el) => { panelRefs.current.mystery = el }}
            onClick={() => handlePanelClick('mystery')}
          >
            <img className="welcome-panel-bg" src="/assets/panel4.png" alt="" />
            <img className="welcome-panel-icon" src="/assets/quest.png" alt="Mystery" />
          </div>
        </div>
      </div>

      {/* Moved out of .welcome-left so it can anchor to the true
          bottom-left corner of .welcome-stage (position: relative)
          instead of floating at the bottom of the shorter left column. */}
      <img className="welcome-branches" src="/assets/flower.PNG" alt="" />

      <img className="welcome-line" src="/assets/Line.PNG" alt="" />
      <div className="welcome-caption">WELCOME TO ZO.O</div>

      {/* Out-of-flow, pinned to the bottom-right corner — only visible
          in portrait (see .welcome-caption-fixed). Kept as a separate
          element from .welcome-caption so it can be absolutely
          positioned independent of content height above it. */}
      <div className="welcome-caption-fixed">WELCOME TO ZO.O</div>
    </div>
  )
}
