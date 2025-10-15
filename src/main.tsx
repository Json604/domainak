import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import Loader from './components/loader.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Loader/>
    <App />
  </StrictMode>,
)
