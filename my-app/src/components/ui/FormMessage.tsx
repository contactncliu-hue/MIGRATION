type Tone = 'error' | 'success'

/** Inline form feedback. Renders nothing when there is no message. */
export function FormMessage({ tone, children }: { tone: Tone; children?: React.ReactNode }) {
  if (!children) return null

  return (
    <div className={`form-${tone} visible`} role={tone === 'error' ? 'alert' : 'status'}>
      {children}
    </div>
  )
}
