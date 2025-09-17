import React from 'react';
import { SERVER_URL } from '../config';

export function useWebSocket(callback) {
    const ws = React.useRef(null);
    React.useEffect(() => {
        ws.current = new WebSocket(SERVER_URL);
        if (callback) {
            callback();
        }
    }, []);
    return ws;
}