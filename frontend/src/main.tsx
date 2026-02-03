// import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App.tsx'
import {ResultPage} from './pages/result.tsx'
// import ActIndicator from './components/activityIndicator.tsx'

createRoot(document.getElementById('root')!).render(
  // <StrictMode>
  <>
    {/* <ActIndicator/> */}
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/results" element={<ResultPage />} />
      </Routes>
    </BrowserRouter>
    </>
  // </StrictMode>,
)
