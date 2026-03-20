import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import App from './App'
import { StoreProvider } from './store'
import { ToastProvider } from './Toast'
import { ModalProvider } from './Modal'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <StoreProvider>
      <ToastProvider>
        <ModalProvider>
          <App/>
        </ModalProvider>
      </ToastProvider>
    </StoreProvider>
  </React.StrictMode>
)
