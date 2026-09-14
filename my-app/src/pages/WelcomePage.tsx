import { useNavigate } from 'react-router-dom'
import './WelcomePage.css'

export function WelcomePage() {
  const navigate = useNavigate()

  return (
    <div className="welcome-stage">
      <button
        className="welcome-schedule-btn"
        onClick={() => navigate('/schedule')}
        aria-label="View schedule"
      >
        Schedule
      </button>

      <div className="welcome-brand">
        <img className="welcome-logo" src="/assets/logo.png.PNG" alt="zOo" />
        <img className="welcome-flower" src="/assets/flower.PNG" alt="" />
      </div>

      <div className="welcome-panels">
        <img className="welcome-panel welcome-panel-feature" src="/assets/panel1.png" alt="" />

        <div className="welcome-panel welcome-panel-frame">
          <img className="welcome-panel-bg" src="/assets/panel2.png" alt="" />
          <img className="welcome-panel-icon" src="/assets/scroll.png" alt="Scroll" />
        </div>

        <div className="welcome-panel welcome-panel-frame">
          <img className="welcome-panel-bg" src="/assets/panel3.png" alt="" />
          <img className="welcome-panel-icon" src="/assets/sword.png" alt="Sword" />
        </div>

        <div className="welcome-panel welcome-panel-frame">
          <img className="welcome-panel-bg" src="/assets/panel4.png" alt="" />
          <img className="welcome-panel-icon" src="/assets/quest.png" alt="Mystery" />
        </div>
      </div>

      <div className="welcome-caption">WELCOME TO ZO.O</div>
    </div>
  )
}
