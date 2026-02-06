import { API_BASE_URL } from "@/config/api";

export const DriverService = {
    goOnline: async (driverId: string) => {
        try {
            const response = await fetch(`${API_BASE_URL}/driver/online`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ driver_id: parseInt(driverId) }),
            });
            if (!response.ok) throw new Error("Failed to go online");
            return await response.json();
        } catch (error) {
            console.error("Driver Online Error:", error);
            throw error;
        }
    },

    goOffline: async (driverId: string) => {
        try {
            const response = await fetch(`${API_BASE_URL}/driver/offline`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ driver_id: parseInt(driverId) }),
            });
            if (!response.ok) throw new Error("Failed to go offline");
            return await response.json();
        } catch (error) {
            console.error("Driver Offline Error:", error);
            throw error;
        }
    },
};
