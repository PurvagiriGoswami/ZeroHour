import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import App from './App'
import { ToastProvider } from './Toast'
import { ModalProvider } from './Modal'

console.log(
  "%cZeroHour 🚀\nAI Defence Prep System",
  "color: #00ffc3; font-size: 16px; font-weight: bold;"
);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ToastProvider>
      <ModalProvider>
        <App/>
      </ModalProvider>
    </ToastProvider>
  </React.StrictMode>
)
