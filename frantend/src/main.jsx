import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import store from './redux/store.js'
import { SocketContextProvider } from './context/SocketContext.jsx'
import { CallProvider } from './context/CallContext.jsx'

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
  <Provider store={store}>
    <SocketContextProvider>
      <CallProvider>
        <App />
      </CallProvider>
    </SocketContextProvider>
  </Provider>
   </BrowserRouter>
    
  
)
