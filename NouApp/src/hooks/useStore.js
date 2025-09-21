import React from 'react';
import {MRootStore} from '../stores/RootStore';

export const StoreContext = React.createContext({store: MRootStore.create({})});
/**
 * creates store context or load it from session 
 * @returns return store model
 */
export function useStore() {
	const context = React.useContext(StoreContext);
	// loading user from session
	const sessionUser = sessionStorage.getItem('user');
	if (!sessionUser) {
		return context.store;
	}
	const userData = JSON.parse(sessionUser);
	if (userData.name && userData.channels) {
		context.store.initUser(userData.name, userData.channels);
	}
	return context.store;
}