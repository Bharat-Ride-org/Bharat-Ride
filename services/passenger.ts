import { API_BASE_URL } from "@/config/api";

export const PassengerService = {
    getNearbyDrivers: async (lat: number, lng: number) => {
        try {
            const response = await fetch(`${API_BASE_URL}/passenger/nearby?lat=${lat}&lng=${lng}`);

            if (!response.ok) throw new Error("Failed to fetch nearby drivers");
            return await response.json();
        } catch (error) {
            console.error("Fetch Nearby Error:", error);
            return [];
        }
    },

    pingDriver: async (passengerId: string, driverId: string | number, etaMinutes: number) => {
        try {
            const response = await fetch(`${API_BASE_URL}/passenger/ping`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    passenger_id: parseInt(passengerId),
                    driver_id: typeof driverId === 'string' ? parseInt(driverId) : driverId,
                    eta_minutes: etaMinutes
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || "Failed to ping driver");
            }
            return await response.json();
        } catch (error) {
            console.error("Ping Driver Error:", error);
            throw error;
        }
    }
};
