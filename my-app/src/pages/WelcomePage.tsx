import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './WelcomePage.css'

type PanelKey = 'scroll' | 'sword' | 'mystery'

export function WelcomePage() {
  const navigate = useNavigate()
  const [selected, setSelected] = useState<PanelKey | null>(null)

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
          <img className="welcome-branches" src="/assets/flower.PNG" alt="" />
        </div>

        <div className="welcome-panels">
          <div
            className={`welcome-panel ${selected === 'scroll' ? 'is-selected' : ''}`}
            onClick={() => setSelected('scroll')}
          >
            <img className="welcome-panel-bg" src="/assets/panel2.png" alt="" />
            <img className="welcome-panel-icon" src="/assets/scroll.png" alt="Scroll" />
          </div>
          <div
            className={`welcome-panel ${selected === 'sword' ? 'is-selected' : ''}`}
            onClick={() => setSelected('sword')}
          >
            <img className="welcome-panel-bg" src="/assets/panel3.png" alt="" />
            <img className="welcome-panel-icon" src="/assets/sword.png" alt="Sword" />
          </div>
          <div
            className={`welcome-panel ${selected === 'mystery' ? 'is-selected' : ''}`}
            onClick={() => setSelected('mystery')}
          >
            <img className="welcome-panel-bg" src="/assets/panel4.png" alt="" />
            <img className="welcome-panel-icon" src="/assets/quest.png" alt="Mystery" />
          </div>
        </div>
      </div>

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
