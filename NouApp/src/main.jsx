import React from 'react';
import { createRoot } from 'react-dom/client';
import {
  BrowserRouter,
  Routes,
  Route,
} from 'react-router-dom';
import { MRootStore } from './stores/RootStore';
import { Channel } from './components/Channel';
import { Channels } from './components/Channels';
import { SessionCreate } from './components/SessionCreate';
import './index.css';
import { StoreContext } from './hooks/useStore';

/** 
 * Base Application Component 
 */
export function AppComponent() {
  const [store] = React.useState(MRootStore.create({}))
  return (
	<React.StrictMode>
		<StoreContext.Provider value={{store}}>
			<BrowserRouter>
				<Routes>
					<Route path="/" Component={() => <SessionCreate />}/>
					<Route path="/channels" Component={() => <Channels/>}/>
					<Route path="/channel/:name" Component={() => <Channel/>}/>
				</Routes>
			</BrowserRouter>
		</StoreContext.Provider>
	</React.StrictMode>
  )
}

createRoot(document.getElementById('root')).render(
  <AppComponent/>,
)
