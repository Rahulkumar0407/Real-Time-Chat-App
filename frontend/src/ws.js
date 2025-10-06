import { io } from 'socket.io-client';

export function connectWS() {
    // This uses the environment variable you set on Render
    return io(import.meta.env.https://real-time-chat-app-um6p.onrender.com);
}