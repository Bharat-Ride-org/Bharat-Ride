"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { AuthService } from "@/services/auth";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { auth } from "@/lib/firebase";

// Declare window types for Recaptcha
declare global {
    interface Window {
        recaptchaVerifier: any;
        confirmationResult: any;
    }
}

export default function OTPPage() {
    const router = useRouter();
    const [step, setStep] = useState<"PHONE" | "OTP">("PHONE");
    const [phone, setPhone] = useState("");
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [loading, setLoading] = useState(false);
    const [role, setRole] = useState<string | null>(null);
    const [isMock, setIsMock] = useState(false); // Fallback for billing issues

    useEffect(() => {
        // Ensure role is selected before entering this page
        const storedRole = localStorage.getItem("role");
        if (!storedRole) {
            router.replace("/");
        } else {
            setRole(storedRole);
        }

        // Cleanup Recaptcha on unmount
        return () => {
            if (window.recaptchaVerifier) {
                try {
                    window.recaptchaVerifier.clear();
                } catch (e) {
                    console.warn("Recaptcha clear error", e);
                }
                window.recaptchaVerifier = null;
            }
        };
    }, [router]);

    const setupRecaptcha = () => {
        if (!window.recaptchaVerifier) {
            window.recaptchaVerifier = new RecaptchaVerifier(auth,
                "recaptcha-container",
                { size: "invisible" }
            );
        }
    };

    const handleSendOTP = async () => {
        if (phone.length === 10) {
            setLoading(true);

            // BYPASS FIREBASE - DEV MODE
            // Simulating API Call
            setTimeout(() => {
                alert("DEV MODE ENABLED: OTP is 123456");
                setIsMock(true);
                setStep("OTP");
                setLoading(false);
            }, 1000);

            /* 
            // FIREBASE LOGIC DISABLED FOR TESTING
            try {
                setupRecaptcha();
                const appVerifier = window.recaptchaVerifier;
                const confirmation = await signInWithPhoneNumber(
                    auth,
                    `+91${phone}`,
                    appVerifier
                );
                window.confirmationResult = confirmation;

                setStep("OTP");
            } catch (error: any) {
                // ...
            }
            */
        }
    };

    const handleVerifyOTP = async () => {
        const enteredOtp = otp.join("");
        if (enteredOtp.length === 6 && role) {
            setLoading(true);
            try {
                // 1. Firebase Verification (Skip if Mock)
                if (!isMock) {
                    const result = await window.confirmationResult.confirm(enteredOtp);
                    const firebaseUser = result.user;
                    console.log("Firebase Verified User:", firebaseUser);
                } else {
                    console.log("Simulating Verification for:", phone);
                }

                // 2. Call Backend Login (Trusting Firebase or Mock)
                const fullPhone = `+91${phone}`;
                const user = await AuthService.login(fullPhone, role);

                // 3. Store Data (Minimal per user preference, but essential for app flow)
                localStorage.setItem("user_id", user.id.toString());
                localStorage.setItem("phone", phone);
                localStorage.setItem("role", user.role);
                localStorage.setItem("is_auth", "true");

                // 4. Redirect
                if (role.toLowerCase() === "driver") {
                    router.replace("/driver");
                } else {
                    router.replace("/passenger");
                }
            } catch (error) {
                console.error("Login Error:", error);
                alert("Invalid OTP or Login Failed.");
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <div className="flex h-screen flex-col items-center justify-center bg-white p-6 font-sans text-zinc-900">
            {/* Recaptcha Container - Disabled for Dev Mode */}
            {/* <div id="recaptcha-container"></div> */}

            <div className="w-full max-w-md">

                {/* Header */}
                <div className="mb-8 text-center">
                    <h1 className="text-2xl font-bold tracking-tight">
                        {step === "PHONE" ? "Enter Mobile Number" : "Enter Verification Code"}
                    </h1>
                    <p className="mt-2 text-sm text-zinc-500">
                        {step === "PHONE"
                            ? "We use this only to connect passengers & drivers nearby"
                            : `Sent to +91 ${phone}`
                        }
                    </p>
                </div>

                <AnimatePresence mode="wait">
                    {step === "PHONE" ? (
                        <motion.div
                            key="phone"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="space-y-6"
                        >
                            <div className="relative flex items-center rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3">
                                <span className="mr-3 text-lg font-medium text-zinc-400">+91</span>
                                <input
                                    type="tel"
                                    maxLength={10}
                                    placeholder="98765 43210"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                                    className="w-full bg-transparent text-xl font-semibold outline-none placeholder:text-zinc-300"
                                />
                            </div>

                            <button
                                onClick={handleSendOTP}
                                disabled={phone.length < 10 || loading}
                                className={`w-full rounded-2xl py-4 text-base font-bold shadow-lg transition-all ${phone.length === 10 && !loading
                                    ? "bg-black text-white hover:scale-[1.02] active:scale-95"
                                    : "cursor-not-allowed bg-zinc-100 text-zinc-400"
                                    }`}
                            >
                                {loading ? "Sending..." : "Send OTP"}
                            </button>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="otp"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-6"
                        >
                            <div className="flex justify-between gap-2">
                                {otp.map((digit, idx) => (
                                    <input
                                        key={idx}
                                        id={`otp-${idx}`}
                                        type="tel"
                                        maxLength={1}
                                        value={digit}
                                        onChange={(e) => {
                                            const val = e.target.value.replace(/\D/g, "");
                                            const newOtp = [...otp];
                                            newOtp[idx] = val;
                                            setOtp(newOtp);
                                            if (val && idx < 5) document.getElementById(`otp-${idx + 1}`)?.focus();
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === "Backspace" && !otp[idx] && idx > 0) {
                                                document.getElementById(`otp-${idx - 1}`)?.focus();
                                            }
                                        }}
                                        className="h-14 w-12 rounded-xl border border-zinc-200 bg-zinc-50 text-center text-2xl font-bold outline-none ring-black focus:ring-2"
                                    />
                                ))}
                            </div>

                            <button
                                onClick={handleVerifyOTP}
                                disabled={otp.join("").length < 6 || loading}
                                className={`w-full rounded-2xl py-4 text-base font-bold shadow-lg transition-all ${otp.join("").length === 6 && !loading
                                    ? "bg-black text-white hover:scale-[1.02] active:scale-95"
                                    : "cursor-not-allowed bg-zinc-100 text-zinc-400"
                                    }`}
                            >
                                {loading ? "Verifying..." : "Verify"}
                            </button>

                            <button
                                onClick={() => setStep("PHONE")}
                                className="w-full text-sm font-medium text-zinc-500 hover:text-black"
                            >
                                Wrong number?
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

            </div>
        </div>
    );
}
