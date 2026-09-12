import { useEffect, useRef, useState } from 'react'
import { SCHEDULE, TODAY_INDEX, dayLabel } from '../../lib/schedule'
import { PortalCard } from './PortalCard'

const SWIPE_THRESHOLD = 40

/**
 * Three-up cover flow over the schedule days.
 *
 * Geometry and timing are carried over from the original vanilla build:
 * the centre card sits at scale 1, the neighbours at scale .7 pushed
 * ±660px so half of each peeks in from the screen edge.
 */
export function PortalCarousel({ today }: { today: Date }) {
  const [active, setActive] = useState(TODAY_INDEX)
  const touchStartX = useRef<number | null>(null)
  const n = SCHEDULE.length

  const step = (delta: number) => setActive((i) => (i + delta + n) % n)

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'ArrowLeft') step(-1)
      else if (e.key === 'ArrowRight') step(1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [n])

  return (
    <div
      className="home-carousel"
      onTouchStart={(e) => {
        touchStartX.current = e.touches[0].clientX
      }}
      onTouchEnd={(e) => {
        const start = touchStartX.current
        touchStartX.current = null
        if (start === null) return
        const dx = e.changedTouches[0].clientX - start
        if (Math.abs(dx) >= SWIPE_THRESHOLD) step(dx < 0 ? 1 : -1)
      }}
    >
      {/* Mobile-only: desktop keeps this note inside the card
          (.home-schedule-note). Hidden by default in CSS, shown only
          under the mobile media query — see .home-top-note. */}
      <p className="home-top-note">Server time · subject to change</p>

      <button
        type="button"
        className="home-arrow home-arrow-prev"
        onClick={() => step(-1)}
        aria-label="Previous day"
      >
        ‹
      </button>

      {SCHEDULE.map((day, i) => {
        // 0 = active, 1 = sits to the right, 2 = sits to the left
        const raw = (i - active + n) % n
        const position = raw === 0 ? 'center' : raw === 1 ? 'right' : 'left'
        return (
          <PortalCard
            key={day.color}
            day={day}
            position={position}
            today={today}
            onSelect={() => setActive(i)}
          />
        )
      })}

      <button
        type="button"
        className="home-arrow home-arrow-next"
        onClick={() => step(1)}
        aria-label="Next day"
      >
        ›
      </button>

      <div className="home-dots" role="tablist" aria-label="Schedule day">
        {SCHEDULE.map((day, i) => (
          <button
            key={day.color}
            type="button"
            role="tab"
            aria-selected={i === active}
            aria-label={dayLabel(day.offset)}
            className={`home-dot ${i === active ? 'is-active' : ''}`}
            onClick={() => setActive(i)}
          />
        ))}
      </div>
    </div>
  )
}
