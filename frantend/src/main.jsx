import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import store from './redux/store.js'
import { SocketContextProvider } from './context/SocketContext.jsx'
import { CallProvider } from './context/CallContext.jsx'

import axios from 'axios';

axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

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
