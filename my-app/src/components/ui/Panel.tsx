/** White card section with a heading, used to group admin controls. */
export function Panel({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle?: string
  children: React.ReactNode
}) {
  return (
    <section className="panel">
      <h2>{title}</h2>
      {subtitle && <p className="panel-sub">{subtitle}</p>}
      {children}
    </section>
  )
}
