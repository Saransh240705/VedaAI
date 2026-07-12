"use client";

import React, { useState } from "react";
import { BACKEND_URL } from "../config";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Mail,
  Lock,
  User,
  ArrowRight,
  Sparkles,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Basic Validation
    if (!email || !password) {
      setError("Please fill in all required credentials.");
      return;
    }

    if (activeTab === "signup" && !fullName) {
      setError("Please provide your full name to sign up.");
      return;
    }

    if (activeTab === "signup" && !agreeTerms) {
      setError("You must agree to the terms and conditions.");
      return;
    }

    try {
      const endpoint = activeTab === "login" ? "login" : "signup";
      const payload =
        activeTab === "login"
          ? { email, password }
          : { email, password, fullName };

      const response = await fetch(`${BACKEND_URL}/api/auth/${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.error || "Authentication failed. Please check your credentials.",
        );
        setIsLoading(false);
        return;
      }

      // Successful Auth
      localStorage.setItem("PrepStackai_auth_token", data.token);
      localStorage.setItem("PrepStackai_user_email", data.user.email);
      localStorage.setItem("PrepStackai_user_name", data.user.fullName);

      // Save profile info to local storage for instant sync backward compatibility
      const profileInfo = {
        userName: data.user.fullName,
        schoolName: data.user.schoolName,
        schoolAddress: data.user.schoolAddress,
        avatar: data.user.avatar || "/Avatar.jpg",
        roleTitle: data.user.role || "",
      };
      localStorage.setItem(
        `PrepStackai_profile_${data.user.email}`,
        JSON.stringify(profileInfo),
      );
      localStorage.setItem(
        `PrepStackai_onboarded_${data.user.email}`,
        data.user.onboarded ? "true" : "false",
      );

      window.dispatchEvent(new Event("PrepStackai_auth_sync"));

      if (data.user.onboarded) {
        router.push("/assignment");
      } else {
        router.push("/onboarding");
      }
    } catch (err) {
      console.error("Auth submit error:", err);
      setError(
        "Unable to connect to PrepStackAI server. Please ensure the backend is running.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col font-bricolage text-black bg-[#fafafa] overflow-x-hidden">
      {/* 🔮 Top Section: Full-bleed Showcase featuring Banner.png */}
      <div className="hidden sm:block relative w-full h-[200px] sm:h-[260px] md:h-[320px] bg-[#0a0a0c] overflow-hidden shrink-0">
        <Image
          src="/Banner.jpeg"
          alt="PrepStackAI Banner"
          fill
          priority
          className="object-cover object-center opacity-95 "
        />
      </div>

      {/* 💼 Bottom Section: Curved Portal Form Panel (Original Light Mode Colors) */}
      <div className="relative flex-1 w-full bg-[#fafafa] sm:rounded-t-[3.5rem] rounded-none border-t border-zinc-200/50 sm:shadow-[0_-12px_40px_rgba(0,0,0,0.03)] shadow-none px-6 py-12 md:py-14 flex flex-col items-center z-20">
        <div className="w-full max-w-[420px] flex flex-col gap-6">
          {/* Header Pill & Title */}
          <div className="text-center flex flex-col gap-2 items-center">
            {/* Mobile-only Logo */}
            <div className="flex sm:hidden items-center gap-2 mb-18">
              <Image
                src="/Logo.png"
                alt="Logo"
                width={32}
                height={32}
                style={{ width: "32px", height: "auto" }}
              />
              <span className="font-extrabold text-2xl tracking-tight text-zinc-950">
                PrepStackAI
              </span>
            </div>

            <h1 className="text-3xl font-black tracking-tight text-zinc-950 uppercase mt-1">
              {activeTab === "login" ? "Welcome Back" : "Start For Free"}
            </h1>
            <p className="text-zinc-500 text-xs">
              {activeTab === "login"
                ? "Enter your credentials to manage your curriculum."
                : "Create a teacher profile and start drafting sheets."}
            </p>
          </div>

          {/* Premium Light Tab Switcher */}
          <div className="grid grid-cols-2 p-1 bg-zinc-100 rounded-full border border-zinc-200/50 shadow-inner">
            <button
              onClick={() => {
                setActiveTab("login");
                setError(null);
              }}
              className={`py-2 px-4 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                activeTab === "login"
                  ? "bg-black text-white shadow-md scale-102"
                  : "text-zinc-500 hover:text-zinc-800"
              }`}
            >
              Log In
            </button>
            <button
              onClick={() => {
                setActiveTab("signup");
                setError(null);
              }}
              className={`py-2 px-4 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                activeTab === "signup"
                  ? "bg-black text-white shadow-md scale-102"
                  : "text-zinc-500 hover:text-zinc-800"
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Alert messages */}
          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-2xl flex items-start gap-2 animate-in fade-in slide-in-from-top-1">
              <AlertCircle className="w-4.5 h-4.5 text-rose-500 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Interactive Form Card */}
          <form onSubmit={handleAuthSubmit} className="flex flex-col gap-4">
            {/* Full Name input (Signup only) */}
            {activeTab === "signup" && (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-zinc-700 pl-1 uppercase tracking-wide">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-zinc-400" />
                  <input
                    type="text"
                    required
                    placeholder="Prof. John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200/80 rounded-2xl pl-11 pr-4 py-3.5 text-sm outline-none font-semibold text-zinc-800 focus:bg-white focus:border-zinc-950 focus:shadow-[0_0_0_3px_rgba(0,0,0,0.02)] transition-all"
                  />
                </div>
              </div>
            )}

            {/* Email Input */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-zinc-700 pl-1 uppercase tracking-wide">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-zinc-400" />
                <input
                  type="email"
                  required
                  placeholder="teacher@school.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200/80 rounded-2xl pl-11 pr-4 py-3.5 text-sm outline-none font-semibold text-zinc-800 focus:bg-white focus:border-zinc-950 focus:shadow-[0_0_0_3px_rgba(0,0,0,0.02)] transition-all"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center px-1">
                <label className="text-xs font-bold text-zinc-700 uppercase tracking-wide">
                  Password
                </label>
                {activeTab === "login" && (
                  <span className="text-[11px] text-zinc-400 font-bold hover:underline cursor-pointer">
                    Forgot Password?
                  </span>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-zinc-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200/80 rounded-2xl pl-11 pr-11 py-3.5 text-sm outline-none font-semibold text-zinc-800 focus:bg-white focus:border-zinc-950 focus:shadow-[0_0_0_3px_rgba(0,0,0,0.02)] transition-all"
                />

                {/* Toggle Password */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 transition-colors cursor-pointer"
                >
                  {showPassword ? (
                    <EyeOff className="w-4.5 h-4.5" />
                  ) : (
                    <Eye className="w-4.5 h-4.5" />
                  )}
                </button>
              </div>
            </div>

            {/* Terms and conditions checkbox (Signup only) */}
            {activeTab === "signup" && (
              <div className="flex items-start gap-2.5 mt-2 px-1">
                <input
                  type="checkbox"
                  id="agree-checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="mt-1 accent-black h-4 w-4 rounded border-zinc-300"
                />
                <label
                  htmlFor="agree-checkbox"
                  className="text-xs text-zinc-500 font-semibold select-none cursor-pointer leading-normal"
                >
                  I agree to PrepStackAI’s{" "}
                  <span className="text-black font-extrabold hover:underline">
                    Terms of Service
                  </span>{" "}
                  and{" "}
                  <span className="text-black font-extrabold hover:underline">
                    Privacy Policy
                  </span>
                  .
                </label>
              </div>
            )}

            {/* Submit Action Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-4 bg-black hover:bg-zinc-900 disabled:bg-zinc-800 text-white font-bold py-4 px-6 rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="w-4.5 h-4.5 animate-spin" />
              ) : (
                <>
                  <span>
                    {activeTab === "login"
                      ? "Access Dashboard"
                      : "Register Educator Account"}
                  </span>
                  <ArrowRight className="w-4.5 h-4.5" />
                </>
              )}
            </button>
          </form>

          {/* Bottom Switch text for tiny screens */}
          <div className="text-center text-xs text-zinc-400 font-bold mt-2">
            {activeTab === "login" ? (
              <span>
                New to PrepStackAI?{" "}
                <button
                  onClick={() => {
                    setActiveTab("signup");
                    setError(null);
                  }}
                  className="text-black font-extrabold hover:underline cursor-pointer bg-transparent border-none"
                >
                  Create an account
                </button>
              </span>
            ) : (
              <span>
                Already registered?{" "}
                <button
                  onClick={() => {
                    setActiveTab("login");
                    setError(null);
                  }}
                  className="text-black font-extrabold hover:underline cursor-pointer bg-transparent border-none"
                >
                  Log In instead
                </button>
              </span>
            )}
          </div>

          {/* Brand verification statement */}
          <div className="flex items-center justify-center gap-1.5 opacity-40 text-[10px] font-bold tracking-widest text-zinc-400 mt-6 uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Safe • Secure • Educator-First</span>
          </div>
        </div>
      </div>
    </div>
  );
}
