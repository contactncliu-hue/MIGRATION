import { useEffect, useState } from 'react'
import { MigrationFormModal } from '../components/transfer/MigrationFormModal'
import { UidLookupModal } from '../components/transfer/UidLookupModal'
import { WingStatusCard } from '../components/transfer/WingStatusCard'
import { translations } from '../lib/translations'
import type { LanguageCode } from '../types/user'
import './TransferPage.css'

export function TransferPage() {
  const lang = (localStorage.getItem('zoo_lang') as LanguageCode) || 'en'
  const dict = translations[lang] ?? translations.en

  const [stageReady, setStageReady] = useState(false)
  const [statusOpen, setStatusOpen] = useState(false)
  const [migrationOpen, setMigrationOpen] = useState(false)
  const [lookupOpen, setLookupOpen] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setStageReady(true), 30)
    return () => clearTimeout(timer)
  }, [])

  const stageClass = [
    'transfer-stage',
    stageReady ? 'stage-ready' : '',
    statusOpen ? 'status-open' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={stageClass}>
      <div className="scene">
        <div className="deco-bg">
          <img src="/assets/transfer-bg-deco.PNG" alt="" />
        </div>
        <div className="arch-card">
          <img className="arch-bg" src="/assets/transfer-arch.PNG" alt="" />
        </div>
        <div className="header-ribbon">
          <img src="/assets/transfer-header.PNG" alt="" />
        </div>
        <div className="bottom-fade" />

        <button className="transfer-btn" onClick={() => setMigrationOpen(true)}>
          <img src="/assets/transfer-button.PNG" alt="" />
          <span className="btn-label">{dict.migrationBtnLabel}</span>
        </button>

        <button className="status-check-btn" onClick={() => setLookupOpen(true)}>
          <img src="/assets/transfer-status-button.PNG" alt="" />
          <span className="status-check-label">{dict.checkStatusBtnLabel}</span>
        </button>
      </div>

      <WingStatusCard
        open={statusOpen}
        onToggle={() => setStatusOpen((o) => !o)}
        onClose={() => setStatusOpen(false)}
      />

      {migrationOpen && <MigrationFormModal onClose={() => setMigrationOpen(false)} />}
      {lookupOpen && <UidLookupModal onClose={() => setLookupOpen(false)} />}
    </div>
  )
}
