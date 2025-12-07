import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css' // Importo los estilos de Tailwind (clave para que se vea lindo)
import { BrowserRouter } from 'react-router-dom' // Esto habilita la navegación sin recargar
import React from 'react'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>

    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)