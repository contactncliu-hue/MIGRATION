import { useAuth } from '../lib/auth-context'
import { WingSettingsPanel } from '../components/admin/WingSettingsPanel'
import { MemberAssignmentsPanel } from '../components/admin/MemberAssignmentsPanel'
import './AdminPage.css'

export function AdminPage() {
  const { loading } = useAuth()

  // RequireAdmin gates the route; this only avoids a flash before auth resolves.
  if (loading) return null

  return (
    <div className="admin-page">
      <div className="page-title">Admin &amp; Management</div>
      <div className="page-sub">
        Wing thresholds, seat capacity, and manual member assignments.
      </div>

      <div className="admin-content visible">
        <WingSettingsPanel />
        <MemberAssignmentsPanel />
      </div>
    </div>
  )
}
