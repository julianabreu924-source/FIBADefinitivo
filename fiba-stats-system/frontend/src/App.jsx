import { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import AdminPage from './pages/AdminPage'
import ElectronicoPage from './pages/ElectronicoPage'
import ScoreboardPage from './pages/ScoreboardPage'
import HistorialPage from './pages/HistorialPage'
import ReportesPage from './pages/ReportesPage' // Existing but empty, may use later
import PublicScoreboardPage from './pages/PublicScoreboardPage'
import SplashScreen from './components/SplashScreen'

export default function App() {
  const [loading, setLoading] = useState(true)

  if (loading) {
    // Note: Prop updated to onComplete to match the new professional SplashScreen component
    return <SplashScreen onComplete={() => setLoading(false)} />
  }

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/admin" />} />

      {/* Entity & Asset Management */}
      <Route path="/admin" element={<AdminPage />} />

      {/* Operational Consoles */}
      <Route path="/electronico" element={<ElectronicoPage />} />
      <Route path="/operacion/:id" element={<ElectronicoPage />} />

      {/* Broadcast Views */}
      <Route path="/panel-de-datos" element={<ScoreboardPage />} />
      <Route path="/public-scoreboard" element={<PublicScoreboardPage />} />

      {/* Data Archives */}
      <Route path="/historial" element={<HistorialPage />} />

      {/* Technical Summaries (Placeholder or refined page) */}
      <Route path="/resumen/:id" element={<HistorialPage />} />

      {/* Analytics Hub */}
      <Route path="/reportes" element={<ReportesPage />} />

      {/* Fallback to primary node */}
      <Route path="*" element={<Navigate to="/admin" />} />
    </Routes>
  )
}
