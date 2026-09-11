import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/auth-context'
import { Field } from '../components/ui/Field'
import { FormMessage } from '../components/ui/FormMessage'
import './LoginPage.css'

const sharkFrames = [
  '/assets/shark-1.PNG',
  '/assets/shark-2.PNG',
  '/assets/shark-3.PNG',
  '/assets/shark-4.PNG',
]

function usernameToAuthEmail(username: string) {
  return username.trim().toLowerCase().replace(/\s+/g, '') + '@zoo-app.local'
}

export function LoginPage() {
  const navigate = useNavigate()
  const { user, loading: authLoading } = useAuth()
  const [stageClasses, setStageClasses] = useState<string[]>([])
  const [showForm, setShowForm] = useState(false)
  const [sharkSrc, setSharkSrc] = useState(sharkFrames[0])
  const [sharkFrameClass, setSharkFrameClass] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const usernameRef = useRef<HTMLInputElement>(null)

  // redirect if already logged in
  useEffect(() => {
    if (!authLoading && user) navigate('/')
  }, [authLoading, user, navigate])

  function addStageClass(cls: string) {
    setStageClasses((prev) => (prev.includes(cls) ? prev : [...prev, cls]))
  }
  function removeStageClasses(...classes: string[]) {
    setStageClasses((prev) => prev.filter((c) => !classes.includes(c)))
  }

  function handleLoginTrigger() {
    if (stageClasses.includes('launching')) return
    addStageClass('launching')

    setTimeout(() => addStageClass('shark-active'), 900)
    setTimeout(() => {
      setSharkSrc(sharkFrames[1])
      setSharkFrameClass('frame-2')
    }, 1200)
    setTimeout(() => {
      setSharkSrc(sharkFrames[2])
      setSharkFrameClass('frame-3')
    }, 1500)
    setTimeout(() => {
      setSharkSrc(sharkFrames[3])
      setSharkFrameClass('')
      addStageClass('chomp')
    }, 2000)
    setTimeout(() => addStageClass('fading'), 2550)
    setTimeout(() => {
      setShowForm(true)
      setSharkSrc(sharkFrames[0])
      setSharkFrameClass('')
      removeStageClasses('shark-active', 'chomp')
      usernameRef.current?.focus()
    }, 2950)
  }

  function handleGuest() {
    navigate('/')
  }

  function handleBack() {
    setShowForm(false)
    setStageClasses([])
    setSharkSrc(sharkFrames[0])
    setSharkFrameClass('')
    setError('')
    setUsername('')
    setPassword('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    const authEmail = usernameToAuthEmail(username)

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: authEmail,
        password,
      })
      if (authError) {
        setError(authError.message)
        setSubmitting(false)
        return
      }
      navigate('/')
    } catch (err) {
      console.error('Login failed:', err)
      setError(err instanceof Error ? err.message : 'Unknown error while logging in.')
      setSubmitting(false)
    }
  }

  const introHidden = showForm
  const stageClassName = ['stage', ...stageClasses].join(' ')

  return (
    <div className={stageClassName} id="stage">
      <img src="/assets/scene-left.png" className="scene scene-left" alt="" />
      <img src="/assets/scene-right.png" className="scene scene-right" alt="" />

      <div className={`intro ${introHidden ? 'hidden' : ''}`}>
        <div className="logo-wrap">
          <img src="/assets/ring.png.png" className="ring-img" alt="" />
          <img
            src={sharkSrc}
            className={`shark-sprite ${sharkFrameClass}`}
            alt=""
          />
          <img src="/assets/logo.png.PNG" className="logo-img" alt="ZOO" />
        </div>
        {/* Names the place. Without it the screen is a logo and two buttons,
            and a first-time visitor cannot tell what they arrived at. */}
        <p className="login-tagline">
          <span>Server</span>
          <b>277</b>
          <span>Migration Hub</span>
        </p>

        <img src="/assets/flame-b.png.png" className="flame flame-left" alt="" />
        <img src="/assets/flame-a.png" className="flame flame-right" alt="" />
        <div className="btn-flame-wrap">
          <button className="btn-login" onClick={handleLoginTrigger}>
            LOG IN
          </button>
        </div>
        <button className="guest-link" onClick={handleGuest}>
          PROCEED AS GUEST
        </button>
      </div>

      <form className={`login-form ${showForm ? 'visible' : ''}`} onSubmit={handleSubmit}>
        <img src="/assets/logo.png.PNG" className="form-logo" alt="ZOO" />
        <h1>Welcome back</h1>

        <FormMessage tone="error">{error}</FormMessage>

        <Field
          label="Username"
          ref={usernameRef}
          type="text"
          autoComplete="username"
          minLength={3}
          pattern="[A-Za-z0-9_\-]+"
          title="Letters, numbers, - and _ only"
          required
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <Field
          label="Password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button type="submit" className="submit-btn" disabled={submitting}>
          {submitting ? 'LOGGING IN...' : 'LOG IN'}
        </button>

        <button type="button" className="back-link" onClick={handleBack}>
          ← Back
        </button>
      </form>
    </div>
  )
}
