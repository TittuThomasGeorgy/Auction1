// socketClient.ts
import { enqueueSnackbar } from "notistack";
import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

/**
 * Initialize or return the existing WebSocket connection.
 * @returns {Socket} The WebSocket connection instance.
 */
export const initSocket = (): Socket => {
    if (!socket) {
        socket = io(import.meta.env.VITE_SOCKET_SERVER_URL, {
            reconnection: true, // Enable automatic reconnection
            reconnectionAttempts: Infinity, // Or a finite number of attempts
            reconnectionDelay: 1000, // Wait 1 second before retrying
            reconnectionDelayMax: 5000, // Max delay between attempts is 5 seconds
            randomizationFactor: 0.5, // To spread out connection attempts from multiple clients
            transports: ['websocket'], // Use WebSocket for better performance
        });

        socket.on("connect", () => {
            console.log("Connected to server:", socket?.id);
        });

        socket.on('disconnect', (reason) => {
            console.log('Socket disconnected:', reason);
            enqueueSnackbar({ variant: 'warning', message: 'Lost connection, attempting to reconnect...' });
        });

        // Add other custom event listeners here
    }
    return socket;
};

/**
 * Disconnect the WebSocket connection (cleanup function).
 */
export const disconnectSocket = (): void => {
    if (socket) {
        socket.disconnect();
        socket = null;
        console.log("Socket disconnected and cleaned up.");
    }
};
