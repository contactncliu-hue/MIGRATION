import { EVENT_ICONS, type ScheduleDay } from '../../lib/schedule'

type Position = 'center' | 'left' | 'right'

interface PortalCardProps {
  day: ScheduleDay
  position: Position
  today: Date
  onSelect: () => void
}

export function PortalCard({ day, position, onSelect }: PortalCardProps) {
  const isCenter = position === 'center'

  return (
    <div
      className={`home-portal home-portal-${day.color} is-${position}`}
      role="tabpanel"
      aria-hidden={!isCenter}
      onClick={isCenter ? undefined : onSelect}
    >
      <img
        className="home-portal-arch"
        src={`/assets/arch-${day.color}.PNG`}
        alt=""
        loading={isCenter ? 'eager' : 'lazy'}
      />
      <div className="home-portal-header">
        <img src={`/assets/header-${day.color}.PNG`} alt="" loading={isCenter ? 'eager' : 'lazy'} />
      </div>
      <div className="home-portal-title">
        <img src={`/assets/title-${day.color}.PNG`} alt="" loading={isCenter ? 'eager' : 'lazy'} />
      </div>

      <div className="home-schedule">
        <ul className="home-schedule-list">
          {day.events.map((event) => (
            <li className="home-schedule-row" key={event.key}>
              <img className="home-schedule-icon" src={EVENT_ICONS[event.key]} alt={event.label} />
              <div className="home-schedule-times">
                {event.times.map((t) => (
                  <span className="home-time-pill" key={t}>
                    {t}
                  </span>
                ))}
              </div>
            </li>
          ))}
        </ul>

        <p className="home-schedule-note">Server time · subject to change</p>
      </div>
    </div>
  )
}
