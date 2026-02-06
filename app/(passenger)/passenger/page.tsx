"use client";

import { useState } from "react";

// Types
type TripTime = "2 min" | "5 min";
type PingState = "none" | "sending" | "sent";

interface Rickshaw {
    id: string;
    x: number; // Percentage 0-100
    y: number; // Percentage 0-100
    rotation: number; // Degrees
}

// Mock Data: 6 rickshaws nearby
const MOCK_RICKSHAWS: Rickshaw[] = [
    { id: "1", x: 20, y: 30, rotation: 45 },
    { id: "2", x: 70, y: 20, rotation: -15 },
    { id: "3", x: 80, y: 60, rotation: -90 },
    { id: "4", x: 15, y: 75, rotation: 120 },
    { id: "5", x: 45, y: 85, rotation: 180 },
    { id: "6", x: 90, y: 40, rotation: -45 },
];

export default function PassengerHome() {
    const [selectedRickshawId, setSelectedRickshawId] = useState<string | null>(
        null
    );
    const [pingState, setPingState] = useState<PingState>("none");
    const [selectedTime, setSelectedTime] = useState<TripTime | null>(null);

    const handleRickshawTap = (id: string) => {
        if (pingState === "sent") return; // Prevent changing selection after ping
        setSelectedRickshawId(id);
    };

    const handleBackgroundTap = () => {
        if (pingState === "sent") return; // Prevent deselecting after ping
        setSelectedRickshawId(null);
    };

    const handlePing = (time: TripTime) => {
        setSelectedTime(time);
        setPingState("sending");

        // Simulate network request
        setTimeout(() => {
            setPingState("sent");
        }, 1500);
    };

    const selectedRickshaw = MOCK_RICKSHAWS.find(
        (r) => r.id === selectedRickshawId
    );

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

                {/* Rickshaw Markers */}
                {MOCK_RICKSHAWS.map((rickshaw) => {
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
                                    350m
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
                                {MOCK_RICKSHAWS.length} rickshaws nearby
                            </h2>
                            <p className="text-sm text-zinc-500 animate-pulse">
                                Select a vehicle on the map
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
                                            {pingState === "sent" ? "Driver Notified" : "Rickshaw #289"}
                                        </h3>
                                        <div className="flex items-center gap-2 text-sm text-zinc-500 mt-0.5">
                                            <span>📍 350m away</span>
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
        </div>
    );
}
