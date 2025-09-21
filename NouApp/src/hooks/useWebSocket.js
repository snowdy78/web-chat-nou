import React from 'react';
import { SERVER_URL } from '../config';

/**
 * creates connection to server and close connection on component destroy
 * @param {() => void} callback 
 * @returns web socket ref
 */
export function useWebSocket(callback) {
    const ws = React.useRef(null);
    React.useEffect(() => {
        ws.current = new WebSocket(SERVER_URL);
        if (callback) {
            callback();
        }
        return () => {
            if (ws.current.readyState) {
                ws.current.close();
            }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    return ws;
}