import './Badge.css'

type BadgeVariant = 'pending' | 'approved' | 'rejected' | 'manual' | 'auto' | 'neutral'

/** Small pill label used across the admin tables. */
export function Badge({
  variant,
  children,
}: {
  variant: BadgeVariant
  children: React.ReactNode
}) {
  return <span className={`badge badge-${variant}`}>{children}</span>
}
