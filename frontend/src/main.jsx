import React from 'react'
import ReactDOM from 'react-dom/client'
import axios from 'axios'
import App from './App.jsx'
import './index.css'

// In dev, VITE_API_URL is unset so requests stay relative and hit Vite's proxy.
// In prod (Render), set VITE_API_URL to the backend Web Service URL.
axios.defaults.baseURL = import.meta.env.VITE_API_URL || ''

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
