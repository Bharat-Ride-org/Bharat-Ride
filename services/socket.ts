import { io, Socket } from "socket.io-client";
import { WS_BASE_URL } from "@/config/api";

let socket: Socket | null = null;

export const SocketService = {
    connect: (userId: string, role: string) => {
        if (socket?.connected) return socket;

        socket = io(WS_BASE_URL, {
            query: { id: userId, role: role.toLowerCase() }, // Ensure lowercase for backend consistency if needed, though backend splits logic
            transports: ["websocket"],
            reconnection: true,
        });

        socket.on("connect", () => {
            console.log("Socket connected:", socket?.id);
        });

        socket.on("disconnect", () => {
            console.log("Socket disconnected");
        });

        return socket;
    },

    disconnect: () => {
        if (socket) {
            socket.disconnect();
            socket = null;
        }
    },

    emitLocation: (data: { driver_id: number; lat: number; lng: number }) => {
        if (socket && socket.connected) {
            console.log("📍 Emitting location:", data);
            socket.emit("driver_location", data);
        } else {
            console.warn("⚠️ Socket not connected, cannot emit location");
        }
    },

    getSocket: () => socket,
};
