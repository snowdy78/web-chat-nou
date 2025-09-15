import { useState } from 'react'
import { createRoot } from 'react-dom/client'
import {
  BrowserRouter,
  Routes,
  Route,
} from 'react-router-dom'
import { StoreProvider } from "./store/hooks/useStore"
import './App.css'



function AppComponent() {
  return (
    <ScriptMode>
      <StoreProvider>
        <BrowserRouter>
          <Routes>
      
          </Routes>
        </BrowserRouter>
      </StoreProvider>
    </ScriptMode>
  )
}
createRoot(document.getElementById('root')).render(<AppComponent/>)
