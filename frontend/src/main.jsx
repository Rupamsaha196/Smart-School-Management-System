import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './auth/AuthContext.jsx'
import App from './App.jsx'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
        <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999 }}>
          <a href="https://wa.me/1234567890" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '56px', height: '56px', background: '#25D366', borderRadius: '50%', boxShadow: '0 4px 12px rgba(37,211,102,0.3)', transition: 'transform 0.2s' }} onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'} onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
            <svg viewBox="0 0 24 24" width="32" height="32" fill="white">
              <path d="M12.031 21.053c-1.503 0-2.981-.39-4.296-1.127l-.307-.174-3.189.81 1.002-3.111-.19-.297c-.821-1.282-1.254-2.776-1.254-4.305 0-4.464 3.738-8.102 8.234-8.102 2.2 0 4.269.831 5.823 2.342 1.554 1.51 2.41 3.518 2.41 5.759 0 4.464-3.738 8.105-8.233 8.105zm0-17.731C6.732 3.322 2.43 7.502 2.43 12.637c0 1.62.433 3.193 1.256 4.606l-1.685 5.228 5.485-1.393c1.378.736 2.923 1.125 4.545 1.125h.004c5.298 0 9.602-4.18 9.602-9.314 0-2.505-1.005-4.862-2.83-6.636C17.003 4.498 14.646 3.322 12.031 3.322zm5.27 12.637c-.288-.14-1.705-.815-1.968-.908-.262-.093-.453-.14-.645.14-.191.279-.742.908-.91 1.094-.168.187-.336.21-.624.07-.288-.14-1.217-.435-2.317-1.393-.856-.745-1.433-1.666-1.6-1.946-.168-.279-.018-.43.126-.57.129-.126.288-.326.432-.49.144-.163.191-.279.288-.466.096-.187.048-.35-.024-.49-.072-.14-.645-1.503-.884-2.062-.234-.543-.472-.47-.645-.479-.168-.009-.36-.009-.552-.009s-.504.07-.768.35c-.264.279-1.008.955-1.008 2.329s1.032 2.699 1.176 2.885c.144.187 2.023 2.99 4.896 4.195 2.115.885 2.89.745 3.418.63.593-.131 1.705-.675 1.945-1.328.24-.652.24-1.21.168-1.328-.072-.116-.264-.187-.552-.326z"/>
            </svg>
          </a>
        </div>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#1a2342',
              color: '#f1f5f9',
              border: '1px solid rgba(148, 163, 184, 0.12)',
              borderRadius: '10px',
              fontSize: '0.875rem',
            },
            success: {
              iconTheme: { primary: '#10b981', secondary: '#f1f5f9' },
            },
            error: {
              iconTheme: { primary: '#ef4444', secondary: '#f1f5f9' },
            },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
