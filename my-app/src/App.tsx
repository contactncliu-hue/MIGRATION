import { Routes, Route } from 'react-router-dom'
import { Layout } from './components/Layout'
import { RequireAdmin } from './components/RequireAdmin'
import { WelcomePage } from './pages/WelcomePage'
import { HomePage } from './pages/HomePage'
import { TransferPage } from './pages/TransferPage'
import { LoginPage } from './pages/LoginPage'
import { AdminPage } from './pages/AdminPage'

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/schedule" element={<HomePage />} />
        <Route path="/transfer" element={<TransferPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/admin"
          element={
            <RequireAdmin>
              <AdminPage />
            </RequireAdmin>
          }
        />
      </Routes>
    </Layout>
  )
}

export default App
