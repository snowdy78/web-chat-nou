import React from 'react';
import { SERVER_URL } from '../config';

/**
 * creates connection to server and close connection on component destroy
 * @returns web socket ref
 */
export function useWebSocket({
    onUserChannels, 
    onChannel, 
    onMessage, 
    onRemoveMember, 
    onUser, 
    onError, 
    onWarning,
    init,
}) {
    const ws = React.useRef(null);
    const webSocketActions = React.useRef({
        userchannels: onUserChannels,
        channel: onChannel,
        message: onMessage,
        removemember: onRemoveMember,
        user: onUser,
    });
    React.useEffect(() => {
        ws.current = new WebSocket(SERVER_URL);
        ws.current.onopen = () => {
            ws.current.onmessage = (messageEvent) => {
                const response = JSON.parse(messageEvent.data);
                // catching response errors and warnings
                if (response.error) {
                    onError(response.error.message);
                    return;
                }
                if (response.warn) {
                    onWarning(response.warn.message);
                    return;
                }
                if (
                    response &&
                    response.type &&
                    webSocketActions.current[response.type]
                ) {
                    webSocketActions.current[response.type](response);
                }
            };
            init();
        };
        return () => {
            if (ws.current.readyState) {
                ws.current.close();
            }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    return ws;
}