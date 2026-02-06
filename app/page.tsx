"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ModeSelection() {
  const router = useRouter();
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  const selectMode = (mode: "passenger" | "driver") => {
    if (mode === "passenger") {
      router.push("/passenger");
    } else {
      router.push("/driver");
    }
  };

  return (
    <main className="relative flex min-h-screen flex-col justify-center px-4 bg-[#F9FAFB] font-sans">

      {/* 0. Splash Screen Overlay */}
      <div
        className={`absolute inset-0 z-50 flex flex-col items-center justify-center bg-white transition-opacity duration-700 ${showSplash ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          }`}
      >
        <div className="flex flex-col items-center animate-in zoom-in-50 duration-700 fade-in">
          <span className="text-7xl mb-4 drop-shadow-sm">🛺</span>
          <h1 className="text-4xl font-bold tracking-tight text-[#111827] drop-shadow-sm">
            Bharat Ride
          </h1>
          <p className="mt-2 text-lg text-[#4B5563] font-medium">
            Apna Rickshaw, Apni Ride
          </p>
        </div>
      </div>

      {/* 1. App Identity (Top 25%) */}
      <div className="flex flex-col items-center justify-center py-10">
        <span className="text-6xl mb-3">🛺</span>
        <h1 className="text-xl font-semibold tracking-tight text-[#111827]">
          Bharat Ride
        </h1>
        <p className="text-[#4B5563] text-sm">
          Nearby Finder
        </p>
        <p className="text-xs text-[#6B7280] mt-1">
          Reduce waiting time
        </p>
      </div>

      {/* 2. Mode Cards (Main Focus) */}
      <div className="flex flex-col gap-4 w-full max-w-sm mx-auto">

        {/* Passenger Card */}
        <button
          onClick={() => selectMode("passenger")}
          className="group relative flex h-32 w-full flex-col items-center justify-center rounded-2xl border border-blue-100 bg-white shadow-sm transition-all active:scale-95 text-blue-700"
        >
          <div className="flex flex-col items-center gap-2">
            <span className="text-3xl text-blue-600">👤</span>
            <span className="text-xl font-semibold">I AM A PASSENGER</span>
            <span className="text-sm opacity-90 text-[#4B5563]">Find nearby rickshaws</span>
          </div>
        </button>

        {/* Driver Card */}
        <button
          onClick={() => selectMode("driver")}
          className="group relative flex h-32 w-full flex-col items-center justify-center rounded-2xl border border-green-100 bg-white shadow-sm transition-all active:scale-95 text-green-700"
        >
          <div className="flex flex-col items-center gap-2">
            <span className="text-3xl text-green-600">🛺</span>
            <span className="text-xl font-semibold">I AM A DRIVER</span>
            <span className="text-sm opacity-90 text-[#4B5563]">Get nearby passengers</span>
          </div>
        </button>

      </div>

      {/* Footer / Helper */}
      <div className="mt-12 text-center">
        <p className="text-xs text-[#9CA3AF]">
          We’ll remember this for next time
        </p>
      </div>

    </main>
  );
}
