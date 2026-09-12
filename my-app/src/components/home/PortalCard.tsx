import { EVENT_ICONS, type ScheduleDay } from '../../lib/schedule'

type Position = 'center' | 'left' | 'right'

interface PortalCardProps {
  day: ScheduleDay
  position: Position
  today: Date
  onSelect: () => void
}

/**
 * One day of the schedule, painted on its arch artwork.
 *
 * The times live in the DOM rather than in the artwork, so the schedule can
 * be corrected without an image editor and stays readable to screen readers.
 */
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
              <img className="home-schedule-icon" src={EVENT_ICONS[event.key]} alt="" />
              <span className="home-schedule-label">{event.label}</span>
              <span className="home-schedule-times">
                {event.times.map((t) => (
                  <span className="home-time-pill" key={t}>
                    {t}
                  </span>
                ))}
              </span>
            </li>
          ))}
        </ul>

        <p className="home-schedule-note">Server time · subject to change</p>
      </div>
    </div>
  )
}
