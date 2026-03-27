import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { ErrorBoundary } from './components/ErrorBoundary'
import { ToastProvider } from './Toast'
import { ModalProvider } from './Modal'
import { AuthProvider } from './context/AuthContext'

console.log(
  "%cZeroHour 🚀\nAI Defence Prep System",
  "color: #00ffc3; font-size: 16px; font-weight: bold;"
);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <AuthProvider>
        <ToastProvider>
          <ModalProvider>
            <App/>
          </ModalProvider>
        </ToastProvider>
      </AuthProvider>
    </ErrorBoundary>
  </React.StrictMode>
)
