import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Save reminder when closing page with data
window.addEventListener('beforeunload', (e) => {
  const profilData = localStorage.getItem('profil-store')
  const inputData = localStorage.getItem('input-store')
  if (profilData || inputData) {
    e.preventDefault()
  }
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
