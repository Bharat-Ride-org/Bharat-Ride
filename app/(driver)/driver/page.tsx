"use client";

import { useState, useEffect } from "react";

type DriverStatus = "OFFLINE" | "ONLINE" | "PINGING" | "ACCEPTED";

export default function DriverHome() {
    const [status, setStatus] = useState<DriverStatus>("OFFLINE");
    const [pingTimer, setPingTimer] = useState<NodeJS.Timeout | null>(null);

    // Simulation Logic
    useEffect(() => {
        if (status === "ONLINE") {
            // Simulate incoming ping after 3-5 seconds
            const timer = setTimeout(() => {
                setStatus("PINGING");
            }, 4000);
            setPingTimer(timer);
        } else {
            if (pingTimer) {
                clearTimeout(pingTimer);
                setPingTimer(null);
            }
        }

        return () => {
            if (pingTimer) clearTimeout(pingTimer);
        };
    }, [status]); // eslint-disable-line react-hooks/exhaustive-deps

    const goOnline = () => setStatus("ONLINE");
    const goOffline = () => setStatus("OFFLINE");
    const acceptPing = () => setStatus("ACCEPTED");
    const ignorePing = () => setStatus("ONLINE"); // Go back to waiting
    const cancelRide = () => setStatus("ONLINE"); // Reset for demo

    return (
        <div className={`flex min-h-screen flex-col font-sans transition-colors duration-500 ${status === "OFFLINE" ? "bg-red-50" :
            status === "ONLINE" || status === "PINGING" ? "bg-green-50" :
                "bg-white"
            }`}>

            {/* Header Identity */}
            <div className="absolute top-0 left-0 right-0 p-4 flex justify-center">
                <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 backdrop-blur-sm border border-zinc-100 shadow-sm">
                    <span className="text-xl">🛺</span>
                    <span className="text-sm font-semibold text-zinc-800">DRIVER MODE</span>
                </div>
            </div>

            {/* 4️⃣ Main View: OFFLINE */}
            {status === "OFFLINE" && (
                <div className="flex h-screen flex-col items-center justify-center p-6 animate-in fade-in duration-500">

                    {/* Offline Card */}
                    <div className="w-full max-w-sm rounded-3xl bg-white p-8 shadow-[0_8px_30px_rgba(0,0,0,0.08)] border border-red-50 text-center">
                        <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-red-50 text-5xl text-red-500 grayscale opacity-80">
                            🛺
                        </div>

                        <h1 className="text-2xl font-bold text-zinc-900 mb-2">You are Offline</h1>
                        <p className="text-zinc-500 mb-8">
                            You are not visible to nearby passengers.
                        </p>

                        <button
                            onClick={goOnline}
                            className="h-14 w-full rounded-2xl bg-red-600 text-lg font-bold text-white shadow-lg shadow-red-200 transition-all active:scale-[0.98] hover:bg-red-700"
                        >
                            GO ONLINE
                        </button>
                    </div>

                    <div className="mt-6 flex items-center gap-2 text-sm text-zinc-400">
                        <div className="h-2 w-2 rounded-full bg-zinc-300"></div>
                        Location sharing paused
                    </div>
                </div>
            )}

            {/* 5️⃣ Main View: ONLINE (Idle) */}
            {(status === "ONLINE" || status === "PINGING") && (
                <div className="flex h-screen flex-col items-center justify-center p-6 animate-in fade-in duration-500 relative overflow-hidden">

                    {/* Sonar Pulse Animation (Background) */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                        <div className="h-64 w-64 rounded-full bg-green-500/10 animate-ping duration-2000"></div>
                    </div>

                    <div className="relative z-10 flex flex-col items-center w-full max-w-xs">
                        <div className="mb-8 flex h-32 w-32 items-center justify-center rounded-full bg-white shadow-[0_0_40px_rgba(34,197,94,0.2)] border-4 border-green-50">
                            <span className="text-6xl text-green-600">🛺</span>
                        </div>

                        <h1 className="text-2xl font-bold text-green-800">You are Online</h1>
                        <p className="mt-2 text-green-700 font-medium animate-pulse">
                            Searching for passengers...
                        </p>

                        <button
                            onClick={goOffline}
                            className="mt-12 px-8 py-3 rounded-full border border-green-200 bg-white text-green-700 font-semibold text-sm hover:bg-green-50 transition-colors shadow-sm"
                        >
                            GO OFFLINE
                        </button>
                    </div>
                </div>
            )}

            {/* 6️⃣ Modal: Incoming Ping */}
            {status === "PINGING" && (
                <div className="absolute inset-0 z-50 flex items-end justify-center sm:items-center bg-black/40 backdrop-blur-[2px] p-4">
                    <div className="w-full max-w-sm overflow-hidden rounded-3xl bg-white shadow-2xl animate-in slide-in-from-bottom-10 zoom-in-95 duration-300 ring-1 ring-black/5">

                        {/* Ping Header */}
                        <div className="bg-zinc-900 p-5 text-center relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-blue-500 via-purple-500 to-pink-500 animate-gradient"></div>
                            <h2 className="text-lg font-bold text-white tracking-wide flex items-center justify-center gap-2">
                                🚨 PASSENGER NEARBY
                            </h2>
                        </div>

                        {/* Ping Body */}
                        <div className="p-6 flex flex-col gap-6 items-center bg-white">
                            <div className="text-center">
                                <p className="text-5xl font-bold text-zinc-900 tracking-tight">350<span className="text-2xl text-zinc-400 ml-1">m</span></p>
                                <p className="text-zinc-500 mt-1 font-medium">Distance to pickup</p>
                            </div>

                            <div className="w-full h-px bg-zinc-100"></div>

                            <div className="flex justify-around w-full">
                                <div className="text-center">
                                    <p className="text-zinc-400 text-xs uppercase font-bold tracking-wider">ETA</p>
                                    <p className="text-xl font-bold text-blue-600">~5 min</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-zinc-400 text-xs uppercase font-bold tracking-wider">RATING</p>
                                    <p className="text-xl font-bold text-yellow-500">4.9 ⭐</p>
                                </div>
                            </div>
                        </div>

                        {/* Ping Actions */}
                        <div className="grid grid-cols-2 gap-3 p-4 bg-zinc-50 border-t border-zinc-100">
                            <button
                                onClick={ignorePing}
                                className="h-14 rounded-2xl border border-zinc-200 bg-white font-bold text-zinc-600 active:scale-95 hover:bg-zinc-50 transition-colors"
                            >
                                IGNORE
                            </button>
                            <button
                                onClick={acceptPing}
                                className="h-14 rounded-2xl bg-blue-600 font-bold text-white shadow-lg shadow-blue-500/20 active:scale-95 hover:bg-blue-700 transition-colors"
                            >
                                ACCEPT
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 7️⃣ Main View: Accepted / Waiting */}
            {status === "ACCEPTED" && (
                <div className="flex h-screen flex-col items-center justify-between p-6 bg-white animate-in zoom-in-95 duration-300">
                    <div className="flex flex-col items-center pt-20 w-full">
                        <div className="mb-8 rounded-full bg-blue-50 p-6 text-6xl shadow-sm text-blue-500 ring-4 ring-blue-50">
                            ⏳
                        </div>
                        <h1 className="text-center text-2xl font-bold text-zinc-900">
                            Coming in 5 min
                        </h1>
                        <p className="mt-2 text-zinc-500">
                            Passenger is waiting for you
                        </p>

                        <div className="mt-8 w-full max-w-xs bg-zinc-50 rounded-2xl p-4 flex gap-4 items-center border border-zinc-100">
                            <div className="h-12 w-12 rounded-full bg-zinc-200 flex items-center justify-center text-xl">👤</div>
                            <div>
                                <p className="font-bold text-zinc-900">Passenger #849</p>
                                <p className="text-xs text-zinc-500">Cash • 350m</p>
                            </div>
                        </div>
                    </div>

                    <div className="w-full max-w-sm pb-8">
                        <button
                            onClick={cancelRide}
                            className="h-14 w-full rounded-2xl border border-red-100 text-lg font-bold text-red-500 active:scale-[0.98] hover:bg-red-50 transition-colors"
                        >
                            Cancel Ride (Demo)
                        </button>
                    </div>
                </div>
            )}

        </div>
    );
}
