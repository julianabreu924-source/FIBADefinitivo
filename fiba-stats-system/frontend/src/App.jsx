import { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import AdminPage from './pages/AdminPage'
import ElectronicoPage from './pages/ElectronicoPage'
import ScoreboardPage from './pages/ScoreboardPage'
import HistorialPage from './pages/HistorialPage'
import ReportesPage from './pages/ReportesPage'
import PublicScoreboardPage from './pages/PublicScoreboardPage'
import LoginPage from './pages/LoginPage'
import SplashScreen from './components/SplashScreen'
import PrintableActaPage from './pages/PrintableActaPage'

// Helper component to safeguard admin routes
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('fiba_token')
  if (!token) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  const [loading, setLoading] = useState(true)

  if (loading) {
    return <SplashScreen onComplete={() => setLoading(false)} />
  }

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/admin" />} />
      <Route path="/login" element={<LoginPage />} />

      {/* Entity & Asset Management (Protected) */}
      <Route path="/admin" element={
        <ProtectedRoute><AdminPage /></ProtectedRoute>
      } />

      {/* Operational Consoles (Protected) */}
      <Route path="/electronico" element={
        <ProtectedRoute><ElectronicoPage /></ProtectedRoute>
      } />
      <Route path="/operacion/:id" element={
        <ProtectedRoute><ElectronicoPage /></ProtectedRoute>
      } />

      {/* Broadcast Views (Public) */}
      <Route path="/panel-de-datos" element={<ScoreboardPage />} />
      <Route path="/public-scoreboard" element={<PublicScoreboardPage />} />

      {/* Data Archives (Protected) */}
      <Route path="/historial" element={
        <ProtectedRoute><HistorialPage /></ProtectedRoute>
      } />

      {/* Technical Summaries (Protected) */}
      <Route path="/resumen/:id" element={
        <ProtectedRoute><HistorialPage /></ProtectedRoute>
      } />

      {/* Printable Protocol Page */}
      <Route path="/acta" element={
        <ProtectedRoute><PrintableActaPage /></ProtectedRoute>
      } />

      {/* Analytics Hub (Protected) */}
      <Route path="/reportes" element={
        <ProtectedRoute><ReportesPage /></ProtectedRoute>
      } />

      <Route path="*" element={<Navigate to="/admin" />} />
    </Routes>
  )
}
