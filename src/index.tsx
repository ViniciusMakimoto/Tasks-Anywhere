/* @refresh reload */
import { render } from 'solid-js/web'
import './index.css'
import App from './App.tsx'
import { registerServiceWorker } from './services/pwaService'

const root = document.getElementById('root')

render(() => <App />, root!)

// Registra Service Worker para PWA e cache offline
registerServiceWorker()
