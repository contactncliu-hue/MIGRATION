import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './WelcomePage.css'

export function WelcomePage() {
  const navigate = useNavigate()
  const [selected, setSelected] = useState(null) // 'scroll' | 'sword' | 'mystery' | null

  return (
    <div className="welcome-stage">
      <button
        className="welcome-schedule-btn"
        onClick={() => navigate('/schedule')}
        aria-label="View schedule"
      >
        Schedule
      </button>

      <div className="welcome-layout">
        <div className="welcome-left">
          <img
            className="welcome-feature"
            src="/assets/panel1.png"
            alt=""
            onClick={() => navigate('/schedule')}
          />
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
    </div>
  )
}
