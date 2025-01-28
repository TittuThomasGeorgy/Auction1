// socketClient.ts
import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

/**
 * Initialize or return the existing WebSocket connection.
 * @returns {Socket} The WebSocket connection instance.
 */
export const initSocket = (): Socket => {
    if (!socket) {
        socket = io(import.meta.env.VITE_SOCKET_SERVER_URL, {
            transports: ["websocket"], // Force WebSocket for reliability
        });

        socket.on("connect", () => {
            console.log("Connected to server:", socket?.id);
        });

        // socket.on("disconnect", () => {
        //     console.log("Disconnected from server");
        // });

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
