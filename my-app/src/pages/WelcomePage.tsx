import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Modal } from '../components/ui/Modal'
import { RankingPanel } from '../components/welcome/RankingPanel'
import { ServerInfoPanel } from '../components/welcome/ServerInfoPanel'
import { RequirementsPanel } from '../components/welcome/RequirementsPanel'
import { AdditionalInfoPanel } from '../components/welcome/AdditionalInfoPanel'
import './WelcomePage.css'

type PanelKey = 'feature' | 'scroll' | 'sword' | 'mystery'

const PANEL_ORDER: PanelKey[] = ['feature', 'scroll', 'sword', 'mystery']

const PANEL_TITLES: Record<PanelKey, string> = {
  feature: 'Rankings',
  scroll: 'Server Information',
  sword: 'Server Requirements',
  mystery: 'Additional Information',
}

// Returns this panel's distance (0-3) from the selected panel, going
// forward through PANEL_ORDER with wraparound. 0 = front/selected,
// 1 = next (right peek), 2 = back-center, 3 = one step back with
// wraparound (left peek). Returns -1 when nothing is selected yet
// (fully hidden).
function getStackPosition(key: PanelKey, selected: PanelKey | null): number {
  if (!selected) return -1
  const total = PANEL_ORDER.length
  const selectedIndex = PANEL_ORDER.indexOf(selected)
  const index = PANEL_ORDER.indexOf(key)
  return (index - selectedIndex + total) % total
}

// Builds the full className for a panel div: base class, the mobile-carousel
// stack-position class, and `is-selected` when this is the active panel.
// `is-selected` is what actually reveals the panel icon on desktop (see
// .welcome-panel.is-selected .welcome-panel-icon in WelcomePage.css) — the
// welcome-panel-pos-0 class only does that for the portrait carousel.
function getPanelClassName(key: PanelKey, selected: PanelKey | null, extra?: string): string {
  const classes = ['welcome-panel']
  if (extra) classes.push(extra)
  classes.push(`welcome-panel-pos-${getStackPosition(key, selected)}`)
  if (key === selected) classes.push('is-selected')
  return classes.join(' ')
}

export function WelcomePage() {
  const navigate = useNavigate()
  const [selected, setSelected] = useState<PanelKey | null>('feature')
  const [openPanel, setOpenPanel] = useState<PanelKey | null>(null)

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
    setOpenPanel(key)
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

      {/* Portrait-only header: just the divider line above the panels
          row now — the title png moved down into panel1's own div
          (see welcome-panel-title-mobile-only below) so it travels
          with panel1 through the carousel instead of staying pinned
          at the top. Hidden on desktop via CSS (see
          .welcome-header-mobile in the stylesheet) — the desktop
          title/line/caption below are the ones shown there. */}
      <div className="welcome-header-mobile">
        <img className="welcome-line welcome-line--mobile" src="/assets/Line.PNG" alt="" />
        <div className="welcome-caption welcome-caption--mobile">WELCOME TO ZO.O</div>
      </div>

      <div className="welcome-layout">
        <div className="welcome-left">
          {/* Desktop/iPad only — hidden in portrait, where panel1 lives
              inside .welcome-panels instead (welcome-panel-feature-mobile-only
              below) so it can take part in the carousel. Now clickable
              to open the Rankings popup, matching the mobile carousel copy. */}
          <img
            className="welcome-feature"
            src="/assets/panel1.png"
            alt=""
            onClick={() => handlePanelClick('feature')}
            style={{ cursor: 'pointer' }}
          />
          <img className="welcome-title" src="/assets/title-red.PNG" alt="zOo" />
        </div>

        <div className="welcome-panels" ref={panelsRef} onScroll={handleScroll}>
          {/* Portrait-only carousel copy of panel1. Hidden on desktop/iPad
              via .welcome-panel-feature-mobile-only so it never doubles up
              with .welcome-left above. Stack position (pos-0..pos-3) is
              computed from distance-from-selected with wraparound — see
              getStackPosition() above — not from DOM adjacency. The title
              png is nested inside this same panel div (mobile-only), so
              it inherits panel1's transform/opacity and rotates through
              the stack right along with it. `is-selected` is also applied
              here (see getPanelClassName) so desktop click-to-reveal works
              consistently even though this particular div is mobile-only. */}
          <div
            className={getPanelClassName('feature', selected, 'welcome-panel-feature-mobile-only')}
            ref={(el) => { panelRefs.current.feature = el }}
            onClick={() => handlePanelClick('feature')}
          >
            <img className="welcome-panel-bg" src="/assets/panel1.png" alt="" />
            <img className="welcome-panel-title-mobile-only" src="/assets/title-red.PNG" alt="zOo" />
          </div>
          <div
            className={getPanelClassName('scroll', selected)}
            ref={(el) => { panelRefs.current.scroll = el }}
            onClick={() => handlePanelClick('scroll')}
          >
            <img className="welcome-panel-bg" src="/assets/panel2.png" alt="" />
            <img className="welcome-panel-icon" src="/assets/scroll.png" alt="Scroll" />
          </div>
          <div
            className={getPanelClassName('sword', selected)}
            ref={(el) => { panelRefs.current.sword = el }}
            onClick={() => handlePanelClick('sword')}
          >
            <img className="welcome-panel-bg" src="/assets/panel3.png" alt="" />
            <img className="welcome-panel-icon" src="/assets/sword.png" alt="Sword" />
          </div>
          <div
            className={getPanelClassName('mystery', selected)}
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

      <Modal
        open={openPanel !== null}
        onClose={() => setOpenPanel(null)}
        title={openPanel ? PANEL_TITLES[openPanel] : ''}
      >
        {openPanel === 'feature' && <RankingPanel />}
        {openPanel === 'scroll' && <ServerInfoPanel />}
        {openPanel === 'sword' && <RequirementsPanel />}
        {openPanel === 'mystery' && <AdditionalInfoPanel />}
      </Modal>
    </div>
  )
}
