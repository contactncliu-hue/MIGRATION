import './index.css'
import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './lib/auth'
import { LanguageProvider } from './lib/language-context'
import App from './App'

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { error: null }
  }
  static getDerivedStateFromError(error: Error) {
    return { error }
  }
  render() {
    if (this.state.error) {
      return (
        <pre style={{ padding: 20, color: 'red', whiteSpace: 'pre-wrap', fontSize: 14 }}>
          {this.state.error.stack || this.state.error.message}
        </pre>
      )
    }
    return this.props.children
  }
}

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <AuthProvider>
      <LanguageProvider>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </LanguageProvider>
    </AuthProvider>
  </BrowserRouter>
)
