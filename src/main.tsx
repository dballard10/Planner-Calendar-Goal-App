import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { AppSettingsProvider } from './context/AppSettingsContext'
import { NotificationsProvider } from './context/NotificationsContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppSettingsProvider>
      <NotificationsProvider>
        <App />
      </NotificationsProvider>
    </AppSettingsProvider>
  </StrictMode>,
)
