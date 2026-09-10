import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { MenuToggle } from './MenuToggle'

interface LayoutProps {
  children: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation()
  const hideSidebar = location.pathname === '/login'

  const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth > 760)

  useEffect(() => {
    function handleResize() {
      // Only auto-correct at the breakpoint crossing, don't fight manual toggles mid-session.
      if (window.innerWidth <= 760) setSidebarOpen(false)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  if (hideSidebar) {
    return <div className="app-shell">{children}</div>
  }

  return (
    <div className="app-shell">
      <Sidebar isOpen={sidebarOpen} />
      {sidebarOpen && (
        <div className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} />
      )}
      <main className="main-content" style={{ marginLeft: sidebarOpen ? 240 : 0 }}>
        <MenuToggle isOpen={sidebarOpen} onClick={() => setSidebarOpen((o) => !o)} />
        {children}
      </main>
    </div>
  )
}
