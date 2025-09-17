import React from 'react';
import {MRootStore} from '../stores/RootStore';

export const StoreContext = React.createContext({store: MRootStore.create({})});

export function useStore() {
	const context = React.useContext(StoreContext);
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