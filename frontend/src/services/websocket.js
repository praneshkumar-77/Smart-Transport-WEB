import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const WEBSOCKET_URL = import.meta.env.VITE_API_URL ? `https://${import.meta.env.VITE_API_URL}/ws` : 'http://localhost:8080/ws';

class WebSocketService {
    constructor() {
        this.client = null;
        this.subscriptions = {};
    }

    connect(onConnected, onError) {
        if (this.client && this.client.connected) {
            onConnected();
            return;
        }

        const socket = new SockJS(WEBSOCKET_URL);
        this.client = new Client({
            webSocketFactory: () => socket,
            reconnectDelay: 5000,
            debug: (str) => {
                console.log(str);
            },
            onConnect: () => {
                console.log('Connected to WebSocket');
                if (onConnected) onConnected();
            },
            onStompError: (frame) => {
                console.error('Broker reported error: ' + frame.headers['message']);
                console.error('Additional details: ' + frame.body);
                if (onError) onError(frame);
            },
        });

        this.client.activate();
    }

    disconnect() {
        if (this.client) {
            this.client.deactivate();
            console.log("Disconnected from WebSocket");
        }
    }

    subscribeToLocation(callback) {
        if (!this.client || !this.client.connected) {
            console.error("Cannot subscribe, WebSocket not connected");
            return null;
        }

        const sub = this.client.subscribe('/topic/trip', (message) => {
            if (message.body) {
                const locationData = JSON.parse(message.body);
                callback(locationData);
            }
        });
        this.subscriptions['/topic/trip'] = sub;
        return sub;
    }

    sendLocation(tripId, latitude, longitude) {
        if (this.client && this.client.connected) {
            const body = JSON.stringify({ tripId, latitude, longitude });
            this.client.publish({ destination: '/app/location', body });
        } else {
            console.warn("WebSocket not connected, cannot send location.");
        }
    }
}

const webSocketService = new WebSocketService();
export default webSocketService;
