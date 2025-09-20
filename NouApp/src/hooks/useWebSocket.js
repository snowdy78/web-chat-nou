import React from 'react';
import { SERVER_URL } from '../config';

export function useWebSocket(callback, deps = []) {
    const ws = React.useRef(null);
    React.useEffect(() => {
        ws.current = new WebSocket(SERVER_URL);
        if (callback) {
            callback();
        }
        return () => {
            ws.current.close();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [callback, ws, ...deps]);
    return ws;
}