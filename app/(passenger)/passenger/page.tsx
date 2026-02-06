"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PassengerService } from "@/services/passenger";
import { SocketService } from "@/services/socket";
import confetti from "canvas-confetti";
import { useUserStore } from "@/store/useUserStore";

// Types
type TripTime = "2 min" | "5 min";
type PingState = "none" | "sending" | "sent";

// Driver Interface matching Backend Response
interface Driver {
    id: number;  // Backend returns 'id', not 'driver_id'
    lat: number;
    lng: number;
}

// Helper to convert backend driver to UI Rickshaw
const mapDriverToRickshaw = (driver: Driver) => ({
    id: driver.id.toString(),
    x: ((driver.lng - 77.2000) * 10000) % 100, // Simple projection for demo
    y: ((driver.lat - 28.6000) * 10000) % 100, // Simple projection for demo
    rotation: Math.random() * 360, // Random rotation for now
});


export default function PassengerHome() {
    const { userId } = useUserStore();
    const [nearbyDrivers, setNearbyDrivers] = useState<Driver[]>([]);
    const [selectedRickshawId, setSelectedRickshawId] = useState<string | null>(null);
    const [pingState, setPingState] = useState<PingState>("none");
    const [acceptedDriverId, setAcceptedDriverId] = useState<number | null>(null);
    const [showAcceptedModal, setShowAcceptedModal] = useState(false);
    const router = useRouter();

    // Initial Auth Check & Setup
    useEffect(() => {
        useUserStore.getState().initialize();
        const storedAuth = localStorage.getItem("is_auth");
        if (!storedAuth) {
            router.replace("/");
        }
    }, [router]);

    // Socket Connection
    useEffect(() => {
        if (userId) {
            const socket = SocketService.connect(userId, "passenger");

            socket?.on("ride_accepted", (data: any) => {
                console.log("Ride Accepted:", data);
                setAcceptedDriverId(data.driver_id);
                setShowAcceptedModal(true);
                setPingState("none");

                // Confetti celebration!
                confetti({
                    particleCount: 100,
                    spread: 70,
                    origin: { y: 0.6 }
                });
            });
        }
        return () => {
            // Optional: Disconnect based on improved logic? 
            // For now keep as is for navigating around
            // SocketService.disconnect();
        };
    }, [userId]);

    // Fetch Nearby Drivers Loop
    useEffect(() => {
        const fetchDrivers = async () => {
            // Mock center (Delhi CP)
            const centerLat = 28.6139;
            const centerLng = 77.2090;
            const drivers = await PassengerService.getNearbyDrivers(centerLat, centerLng);
            setNearbyDrivers(drivers);
        };

        fetchDrivers(); // Initial
        const interval = setInterval(fetchDrivers, 5000); // Poll every 5s

        return () => clearInterval(interval);
    }, []);

    const [selectedTime, setSelectedTime] = useState<TripTime | null>(null);

    const handleRickshawTap = (id: string) => {
        if (pingState === "sent") return;
        setSelectedRickshawId(id);
    };

    const handleBackgroundTap = () => {
        if (pingState === "sent") return;
        setSelectedRickshawId(null);
    };

    const handlePing = async (time: TripTime) => {
        if (!selectedRickshawId) return;

        setSelectedTime(time);
        setPingState("sending");

        try {
            if (!userId) throw new Error("No User ID");

            await PassengerService.pingDriver(
                userId,
                selectedRickshawId,
                time === "2 min" ? 2 : 5
            );

            setPingState("sent");

            // Celebration Confetti!
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#FFC107', '#22C55E'] // Yellow & Green
            });

        } catch (error) {
            alert("Failed to ping driver. Try again.");
            setPingState("none");
        }
    };

    // UI Transformation
    const displayedRickshaws = nearbyDrivers.map(mapDriverToRickshaw);

    return (
        <div className="relative flex h-screen flex-col overflow-hidden bg-zinc-50 font-sans">
            {/* 1. Map Container */}
            <div
                className="absolute inset-0 z-0 bg-[#eef0f3]"
                onClick={handleBackgroundTap}
            >
                {/* Mock Map Texture - subtle roads */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                    style={{
                        backgroundImage: `
                 linear-gradient(#000 2px, transparent 2px),
                 linear-gradient(90deg, #000 2px, transparent 2px),
                 linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
                 linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)
               `,
                        backgroundSize: '100px 100px, 100px 100px, 20px 20px, 20px 20px'
                    }}
                />

                {/* GPS Badge */}
                <div className="absolute top-14 left-4 z-10 flex items-center gap-2 rounded-full bg-white px-3 py-1.5 shadow-sm border border-zinc-100/50">
                    <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse"></span>
                    <span className="text-xs font-semibold text-zinc-700">GPS Active</span>
                </div>

                {/* User Marker (Center) */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
                    <div className="relative">
                        <div className="absolute top-1/2 left-1/2 h-20 w-20 -translate-x-1/2 -translate-y-1/2 animate-ping rounded-full bg-blue-500/10"></div>
                        <div className="h-4 w-4 rounded-full border-[3px] border-white bg-blue-600 shadow-md"></div>
                    </div>
                </div>

                {/* Rickshaw Markers REFACTORED */}
                {displayedRickshaws.map((rickshaw) => {
                    const isSelected = selectedRickshawId === rickshaw.id;
                    const isPinged = isSelected && pingState === "sent";

                    return (
                        <button
                            key={rickshaw.id}
                            onClick={(e) => {
                                e.stopPropagation();
                                handleRickshawTap(rickshaw.id);
                            }}
                            style={{
                                top: `${rickshaw.y}%`,
                                left: `${rickshaw.x}%`,
                            }}
                            className={`absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ${isSelected ? "scale-110 z-30" : "scale-100 z-10 hover:scale-105"
                                }`}
                        >
                            {/* Pulse when selected */}
                            {isSelected && !isPinged && (
                                <div className="absolute top-1/2 left-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 animate-ping rounded-full bg-green-500/20"></div>
                            )}

                            <div
                                className="text-4xl filter drop-shadow-md transition-all duration-300"
                                style={{
                                    filter: isPinged
                                        ? 'sepia(1) saturate(1000%) hue-rotate(0deg) drop-shadow(0 0 8px #EAB308)' // Yellow/Gold
                                        : 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
                                }}
                            >
                                🛺
                            </div>

                            {/* Distance Label */}
                            {isSelected && !isPinged && (
                                <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-white px-2 py-1 text-[10px] font-bold text-zinc-800 shadow-md border border-zinc-100">
                                    ~350m
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* 2. Bottom Sheet */}
            <div className="absolute bottom-0 left-0 right-0 z-30 flex flex-col items-center justify-end pointer-events-none">
                {/* Card Content container - pointer events auto to allow interaction */}
                <div className="pointer-events-auto w-full max-w-md rounded-t-4xl bg-white p-6 pb-8 shadow-[0_-8px_30px_rgba(0,0,0,0.04)] ring-1 ring-zinc-100">

                    {/* Drag Handle */}
                    <div className="mx-auto mb-6 h-1 w-12 rounded-full bg-zinc-200"></div>

                    {/* State 1: Home (No Selection) */}
                    {!selectedRickshawId && (
                        <div className="flex flex-col items-center gap-1 text-center pb-2">
                            <h2 className="text-xl font-semibold text-zinc-900">
                                {nearbyDrivers.length > 0 ? `${nearbyDrivers.length} rickshaws nearby` : "Searching for rickshaws..."}
                            </h2>
                            <p className="text-sm text-zinc-500 animate-pulse">
                                {nearbyDrivers.length > 0 ? "Select a vehicle on the map" : "Please wait..."}
                            </p>

                            {/* Decorative icons */}
                            <div className="mt-4 flex gap-2 opacity-30 grayscale">
                                <span>🛺</span>
                                <span>🛺</span>
                                <span>🛺</span>
                            </div>
                        </div>
                    )}

                    {/* State 2 & 3: Selection / Ping */}
                    {selectedRickshawId && (
                        <div className="flex flex-col animate-in slide-in-from-bottom-5 duration-300">

                            {/* Driver Header */}
                            <div className="flex items-start justify-between mb-6">
                                <div className="flex gap-4">
                                    <div className={`flex h-14 w-14 items-center justify-center rounded-2xl text-2xl border transition-colors ${pingState === "sent"
                                        ? "bg-yellow-50 border-yellow-200 text-yellow-600"
                                        : "bg-green-50 border-green-100 text-green-600"
                                        }`}>
                                        🛺
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg text-zinc-900 leading-tight">
                                            {pingState === "sent" ? "Driver Notified" : `Rickshaw #${selectedRickshawId}`}
                                        </h3>
                                        <div className="flex items-center gap-2 text-sm text-zinc-500 mt-0.5">
                                            <span>📍 ~350m away</span>
                                            <span>•</span>
                                            <span>⭐ 4.8</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Close Button */}
                                {pingState === "none" && (
                                    <button
                                        onClick={() => setSelectedRickshawId(null)}
                                        className="rounded-full bg-zinc-100 p-2 text-zinc-400 hover:bg-zinc-200"
                                    >
                                        ✕
                                    </button>
                                )}
                            </div>

                            {/* Actions */}
                            {pingState === "none" ? (
                                // Selection Actions
                                <div className="space-y-3">
                                    <button
                                        onClick={() => handlePing("2 min")}
                                        className="w-full h-14 rounded-2xl bg-blue-600 text-lg font-semibold text-white shadow-lg shadow-blue-200 active:scale-[0.98] transition-all"
                                    >
                                        I'm coming in 2 min
                                    </button>
                                    <button
                                        onClick={() => handlePing("5 min")}
                                        className="w-full h-14 rounded-2xl bg-white border border-zinc-200 text-lg font-semibold text-zinc-700 active:scale-[0.98] transition-all hover:bg-zinc-50"
                                    >
                                        I'm coming in 5 min
                                    </button>
                                </div>
                            ) : (
                                // Waiting State
                                <div className="flex flex-col gap-4">
                                    {pingState === "sending" ? (
                                        <div className="h-14 flex items-center justify-center gap-3 text-blue-600">
                                            <span className="animate-spin text-xl">⏳</span>
                                            <span className="font-semibold">Signaling driver...</span>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="p-4 rounded-xl bg-yellow-50 border border-yellow-100 text-yellow-800">
                                                <p className="font-medium text-center">
                                                    Waiting for driver acceptance...
                                                </p>
                                            </div>
                                            <button
                                                disabled
                                                className="w-full h-14 rounded-2xl bg-zinc-100 text-zinc-400 font-semibold cursor-not-allowed"
                                            >
                                                Signal Sent
                                            </button>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Driver Accepted Modal */}
            {showAcceptedModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl p-8 mx-4 max-w-sm w-full shadow-2xl animate-[scale-in_0.3s_ease-out]">
                        {/* Success Icon */}
                        <div className="flex justify-center mb-6">
                            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
                                <span className="text-5xl">✅</span>
                            </div>
                        </div>

                        {/* Message */}
                        <h2 className="text-2xl font-bold text-center text-zinc-900 mb-2">
                            Driver Accepted!
                        </h2>
                        <p className="text-center text-zinc-600 mb-6">
                            Driver #{acceptedDriverId} has accepted your request and is waiting for you.
                        </p>

                        {/* Driver Info Card */}
                        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-lg">
                                    D{acceptedDriverId}
                                </div>
                                <div className="flex-1">
                                    <p className="font-semibold text-zinc-900">Your Driver</p>
                                    <p className="text-sm text-zinc-500">On the way to pickup</p>
                                </div>
                                <div className="text-2xl">🛺</div>
                            </div>
                        </div>

                        {/* Action Button */}
                        <button
                            onClick={() => setShowAcceptedModal(false)}
                            className="w-full h-14 rounded-2xl bg-green-600 text-white font-bold text-lg hover:bg-green-700 active:scale-[0.98] transition-all shadow-lg"
                        >
                            Got it!
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
