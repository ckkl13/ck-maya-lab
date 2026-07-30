import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { DownloadHistoryPage } from './components/DownloadHistoryPage'
import './index.css'
import './history.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <DownloadHistoryPage />
  </StrictMode>,
)

