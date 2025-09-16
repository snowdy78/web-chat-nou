import { createRoot } from 'react-dom/client'
import './index.css'
import {
  BrowserRouter,
  Routes,
  Route,
} from 'react-router-dom'
import { StrictMode } from 'react'
import { IndexComponent } from './components/IndexComponent'


/** 
 * Base Application Component 
 */
export function AppComponent() {
  return (
    <StrictMode>
      <BrowserRouter>
        <Routes>
          <Route path="/" Component={() => <IndexComponent />}/>
        </Routes>
      </BrowserRouter>
    </StrictMode>
  )
}

createRoot(document.getElementById('root')).render(
  <AppComponent/>,
)
