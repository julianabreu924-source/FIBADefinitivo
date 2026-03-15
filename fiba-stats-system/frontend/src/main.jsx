import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'

// Impedir que se usen atajos de navegador que rompan la experiencia de programa
if (typeof window !== 'undefined') {
  // 1. Bloquear Zoom de teclado (Control +/-)
  window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && (e.key === '=' || e.key === '-' || e.key === '+' || e.key === '0')) {
      e.preventDefault();
    }
    // 2. Bloquear F12 (DevTools) y atajos de inspección opcionalmente
    // if (e.key === 'F12' || ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'I')) {
    //   e.preventDefault();
    // }
  });

  // 3. Bloquear Zoom de ratón (Ctrl + Scroll)
  window.addEventListener('wheel', (e) => {
    if (e.ctrlKey) e.preventDefault();
  }, { passive: false });

  // 4. Bloquear el menú contextual globalmente
  window.addEventListener('contextmenu', (e) => e.preventDefault());
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </StrictMode>
)
