import { createRoot } from 'react-dom/client'
import './index.css'
import {
  BrowserRouter,
  Routes,
  Route,
} from 'react-router-dom'
import { StrictMode } from 'react'


/** 
 * Base Application Component 
 */
export function AppComponent() {
  return (
    <StrictMode>
      <StoreProvider>
        <BrowserRouter>
          <Routes>
            
          </Routes>
        </BrowserRouter>
      </StoreProvider>
    </StrictMode>
  )
}

createRoot(document.getElementById('root')).render(
  <AppComponent/>,
)
