import { API_BASE_URL } from "@/config/api";

// const API_URL = "http://localhost:8000"; // Moved to config


export const AuthService = {
    login: async (phone: string, role: string) => {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ phone, role: role.toUpperCase() }),
            });

            if (!response.ok) {
                throw new Error("Login failed");
            }

            return await response.json();
        } catch (error) {
            console.error("Auth API Error:", error);
            throw error;
        }
    },
};
