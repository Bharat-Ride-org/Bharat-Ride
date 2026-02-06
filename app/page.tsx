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

  // Updated: Step 1 - Mode Selection & Auth Check
  const handleModeSelect = (role: "passenger" | "driver") => {
    // 1. Save Role
    localStorage.setItem("role", role);

    // 2. Check Auth
    const isAuth = localStorage.getItem("is_auth");

    if (isAuth === "true") {
      // Returning user -> Skip OTP
      router.push(`/${role}`);
    } else {
      // First-time user -> OTP
      router.push("/auth/otp");
    }
  };

  if (showSplash) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#FFC107] transition-opacity duration-700">
        {/* Splash Content... same as before */}
        <div className="relative h-40 w-40 animate-[zoomIn_0.8s_ease-out]">
          <span className="text-8xl">🛺</span>
        </div>
        <h1 className="mt-6 animate-[fadeIn_1s_ease-out_0.5s_both] text-4xl font-extrabold tracking-tight text-zinc-900">
          Bharat Ride
        </h1>
        <p className="mt-2 animate-[fadeIn_1s_ease-out_1s_both] text-lg font-medium text-zinc-800/80">
          Chalo, India.
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col items-center justify-center bg-zinc-50 p-6 font-sans">
      <div className="w-full max-w-md space-y-8">

        <div className="text-center">
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900">Choose Mode</h1>
          <p className="mt-2 text-zinc-500">How would you like to use Bharat Ride?</p>
        </div>

        <div className="space-y-4">
          {/* Passenger Card */}
          <button
            onClick={() => handleModeSelect("passenger")}
            className="group relative flex w-full items-center justify-between overflow-hidden rounded-3xl bg-white p-6 text-left shadow-[0_8px_30px_rgba(0,0,0,0.04)] ring-1 ring-zinc-100 transition-all hover:scale-[1.02] hover:shadow-xl active:scale-95"
          >
            <div className="z-10">
              <h3 className="text-xl font-bold text-zinc-900">Passenger</h3>
              <p className="text-sm font-medium text-zinc-400 group-hover:text-zinc-600">Request a ride</p>
            </div>
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-50 text-3xl group-hover:bg-yellow-100 transition-colors">
              👋
            </div>
          </button>

          {/* Driver Card */}
          <button
            onClick={() => handleModeSelect("driver")}
            className="group relative flex w-full items-center justify-between overflow-hidden rounded-3xl bg-white p-6 text-left shadow-[0_8px_30px_rgba(0,0,0,0.04)] ring-1 ring-zinc-100 transition-all hover:scale-[1.02] hover:shadow-xl active:scale-95"
          >
            <div className="z-10">
              <h3 className="text-xl font-bold text-zinc-900">Driver</h3>
              <p className="text-sm font-medium text-zinc-400 group-hover:text-zinc-600">Accept rides</p>
            </div>
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-50 text-3xl group-hover:bg-green-100 transition-colors">
              🛺
            </div>
          </button>
        </div>

        <p className="text-center text-xs text-zinc-400">
          By continuing, you agree to our Terms & Privacy Policy
        </p>

      </div>
    </div>
  );
}
