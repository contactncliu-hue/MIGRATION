import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { GuestActions } from '../components/home/GuestActions'
import { PortalCarousel } from '../components/home/PortalCarousel'
import './HomePage.css'

export function HomePage() {
  const today = useMemo(() => new Date(), [])
  const navigate = useNavigate()

  return (
    <div className="home-stage">
      <img className="home-scene home-scene-left" src="/assets/scene-left.png" alt="" />
      <img className="home-scene home-scene-right" src="/assets/scene-right.png" alt="" />

      <button className="home-info-btn" onClick={() => navigate('/')} aria-label="Back to welcome">
        i
      </button>

      <PortalCarousel today={today} />
      <GuestActions />
      <div className="home-fade" />
    </div>
  )
}
