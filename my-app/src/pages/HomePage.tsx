import { useMemo } from 'react'
import { GuestActions } from '../components/home/GuestActions'
import { PortalCarousel } from '../components/home/PortalCarousel'
import './HomePage.css'

export function HomePage() {
  // One Date for the whole render so every card labels off the same "now".
  const today = useMemo(() => new Date(), [])

  return (
    <div className="home-stage">
      <img className="home-scene home-scene-left" src="/assets/scene-left.png" alt="" />
      <img className="home-scene home-scene-right" src="/assets/scene-right.png" alt="" />

      <PortalCarousel today={today} />

      <GuestActions />

      <div className="home-fade" />
    </div>
  )
}
