"use client";

import React, { useState, useEffect } from "react";
import {
  User,
  School,
  MapPin,
  UploadCloud,
  Save,
  Sparkles,
  CheckCircle2,
  Loader2,
  ArrowLeft,
  LogOut,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { BACKEND_URL } from "../config";

export default function ProfilePage() {
  const router = useRouter();

  const handleLogout = () => {
    if (!confirm("Are you sure you want to log out of PrepStackAI?")) return;
    localStorage.removeItem("PrepStackai_auth_token");
    window.dispatchEvent(new Event("PrepStackai_auth_sync"));
    router.replace("/login");
  };

  // Profile Form States
  const [userName, setUserName] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [schoolAddress, setSchoolAddress] = useState("");
  const [avatar, setAvatar] = useState("/Avatar.jpg");

  // Status flags
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);

  // Default Avatar Options
  const presetAvatars = [
    "/Avatar.jpg",
    "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80", // Female teacher
    "https://images.unsplash.com/photo-1544717305-2782549b5136?w=120&auto=format&fit=crop&q=80", // Male teacher 2
    "https://images.unsplash.com/photo-1580894732444-8fecef2271ff?w=120&auto=format&fit=crop&q=80", // Female teacher 2
  ];

  // Fetch current values from localStorage on mount
  useEffect(() => {
    const fetchMe = async () => {
      try {
        const token = localStorage.getItem("PrepStackai_auth_token") || "";
        const userEmail = localStorage.getItem("PrepStackai_user_email") || "";

        const res = await fetch(`${BACKEND_URL}/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            if (data.user.fullName) setUserName(data.user.fullName);
            if (data.user.schoolName) setSchoolName(data.user.schoolName);
            if (data.user.schoolAddress)
              setSchoolAddress(data.user.schoolAddress);
            if (data.user.avatar) setAvatar(data.user.avatar);

            const profile = {
              userName: data.user.fullName,
              schoolName: data.user.schoolName,
              schoolAddress: data.user.schoolAddress,
              avatar: data.user.avatar,
            };
            localStorage.setItem(
              `PrepStackai_profile_${userEmail}`,
              JSON.stringify(profile),
            );
            return;
          }
        }
      } catch (err) {
        console.error(
          "Failed to load profile from backend, falling back:",
          err,
        );
      }

      try {
        const userEmail = localStorage.getItem("PrepStackai_user_email") || "";
        const stored = localStorage.getItem(`PrepStackai_profile_${userEmail}`);
        if (stored) {
          const profile = JSON.parse(stored);
          if (profile.userName) setUserName(profile.userName);
          if (profile.schoolName) setSchoolName(profile.schoolName);
          if (profile.schoolAddress) setSchoolAddress(profile.schoolAddress);
          if (profile.avatar) setAvatar(profile.avatar);
        }
      } catch (err) {
        console.error("Failed to load profile details on mount:", err);
      }
    };

    fetchMe();
  }, []);

  // Handle uploading custom Avatar to Cloudinary
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    setIsUploading(true);
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("file", file);

    try {
      const token = localStorage.getItem("PrepStackai_auth_token") || "";
      const response = await fetch(`${BACKEND_URL}/api/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      if (!response.ok) throw new Error("Upload failed");
      const data = await response.json();
      setAvatar(data.url);
    } catch (err: any) {
      console.error("Avatar upload error:", err);
      alert("Failed to upload custom avatar image to Cloudinary.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    const token = localStorage.getItem("PrepStackai_auth_token") || "";
    const userEmail = localStorage.getItem("PrepStackai_user_email") || "";
    const profile = {
      userName,
      schoolName,
      schoolAddress,
      avatar,
    };

    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          fullName: userName,
          schoolName,
          schoolAddress,
          avatar,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save profile on server");
      }

      localStorage.setItem(
        `PrepStackai_profile_${userEmail}`,
        JSON.stringify(profile),
      );

      // Dispatch sync event to instantly update SideBar and NavBar
      window.dispatchEvent(new Event("PrepStackai_auth_sync"));

      setShowSuccessNotification(true);
      setTimeout(() => setShowSuccessNotification(false), 3000);
    } catch (err) {
      console.error("Failed to save profile:", err);
      // Fallback
      localStorage.setItem(
        `PrepStackai_profile_${userEmail}`,
        JSON.stringify(profile),
      );
      window.dispatchEvent(new Event("PrepStackai_auth_sync"));
      setShowSuccessNotification(true);
      setTimeout(() => setShowSuccessNotification(false), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="lg:ml-84 lg:w-[70rem] w-full px-4 lg:px-0 py-4 lg:py-6 font-bricolage text-black min-h-[80vh] flex flex-col gap-5 lg:gap-6 pb-24 relative">
      {/* 📱 Mobile Page Title & Back Arrow */}
      <div className="flex lg:hidden items-center gap-4 mt-2 px-1">
        <button
          onClick={() => router.back()}
          className="bg-[#EAEAEA] hover:bg-zinc-200 text-zinc-800 p-2.5 rounded-full cursor-pointer transition-colors shadow-sm flex items-center justify-center h-10 w-10 active:scale-95"
        >
          <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
        </button>
        <h2 className="text-xl font-bold tracking-tight text-zinc-800">
          Teacher Profile
        </h2>
      </div>

      {/* Page Header (Desktop only) */}
      <div className="hidden lg:flex flex-col gap-1">
        <div className="flex items-center gap-3">
          <span className="w-3.5 h-3.5 rounded-full bg-orange-500 border-2 border-white shadow-md animate-pulse"></span>
          <h2 className="text-2xl font-black text-black tracking-tight">
            Teacher Profile Settings
          </h2>
        </div>
        <p className="text-[#5E5E5ECC] text-sm pl-6.5">
          Configure your professional identity, school details, and printable
          test headers.
        </p>
      </div>

      {/* Main Settings Card */}
      <div className="bg-white rounded-3xl p-5 lg:p-8 border border-zinc-200/50 shadow-[0_4px_40px_rgba(0,0,0,0.02)] flex flex-col md:flex-row gap-8 relative overflow-hidden">
        {/* Left Side: Avatar selector box */}
        <div className="flex flex-col items-center gap-6 w-full md:w-1/3 border-b md:border-b-0 md:border-r border-zinc-100 pb-6 md:pb-0 md:pr-8">
          <div className="relative group w-32 h-32 rounded-full overflow-hidden border-4 border-zinc-100 shadow-md">
            <Image
              src={avatar}
              alt="Profile Avatar"
              fill
              className="object-cover"
              priority
            />
            {isUploading && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2 items-center w-full">
            <input
              id="avatar-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarUpload}
            />
            <button
              onClick={() => document.getElementById("avatar-upload")?.click()}
              disabled={isUploading}
              className="flex items-center justify-center gap-2 bg-zinc-900 hover:bg-black text-white text-xs font-bold px-4 py-2.5 rounded-full cursor-pointer transition-all active:scale-[0.98] disabled:bg-zinc-300"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              Upload Custom Photo
            </button>
            <p className="text-[10px] text-zinc-400 italic">
              PNG or JPEG up to 5MB
            </p>
          </div>

          {/* Quick presets selection grid */}
          <div className="w-full">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 text-center mb-3">
              Or choose preset:
            </h4>
            <div className="flex justify-center flex-wrap gap-3.5">
              {presetAvatars.map((url, idx) => (
                <button
                  key={idx}
                  onClick={() => setAvatar(url)}
                  className={`relative w-11 h-11 rounded-full overflow-hidden border-2 cursor-pointer transition-all hover:scale-105 active:scale-95 ${avatar === url ? "border-orange-500 shadow-sm" : "border-zinc-200"}`}
                >
                  <Image
                    src={url}
                    alt={`Preset Avatar ${idx}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Log Out Button for Mobile/Responsive ease */}
          <div className="w-full mt-6 pt-6 border-t border-zinc-100 flex justify-center">
            <button
              onClick={handleLogout}
              className="flex items-center justify-center gap-2 w-full max-w-[200px] border border-rose-200 hover:bg-rose-50 text-rose-600 hover:text-rose-700 text-xs font-bold px-4 py-2.5 rounded-full cursor-pointer transition-all active:scale-[0.98]"
            >
              <LogOut className="w-3.5 h-3.5" />
              Log Out of PrepStackAI
            </button>
          </div>
        </div>

        {/* Right Side: Form inputs */}
        <div className="flex-1 flex flex-col gap-6 justify-between">
          <div className="flex flex-col gap-5">
            {/* Success alert message overlay */}
            {showSuccessNotification && (
              <div className="bg-emerald-50 text-emerald-700 border border-emerald-200/50 rounded-2xl p-4 flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-200">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                <div className="text-sm font-semibold">
                  Profile updated successfully! Live sidebar and headers have
                  synced.
                </div>
              </div>
            )}

            <div className="flex flex-col gap-1 border-b border-zinc-100 pb-3">
              <h3 className="text-lg font-bold text-zinc-900">
                Personal Information
              </h3>
              <p className="text-xs text-zinc-400">
                These details are shown in the headers of created papers.
              </p>
            </div>

            {/* Name Input */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-zinc-700 flex items-center gap-1.5">
                <User className="w-4 h-4 text-zinc-400" />
                Teacher / Instructor Name
              </label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="e.g. John Doe"
                className="w-full bg-zinc-50 focus:bg-white outline-none border border-zinc-200 focus:border-zinc-300 transition-all px-4 py-3.5 rounded-xl font-semibold text-sm text-zinc-800"
              />
            </div>

            {/* School Name Input */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-zinc-700 flex items-center gap-1.5">
                <School className="w-4 h-4 text-zinc-400" />
                School / Institution Name
              </label>
              <input
                type="text"
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                placeholder="e.g. Delhi Public School"
                className="w-full bg-zinc-50 focus:bg-white outline-none border border-zinc-200 focus:border-zinc-300 transition-all px-4 py-3.5 rounded-xl font-semibold text-sm text-zinc-800"
              />
            </div>

            {/* Address Input */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-zinc-700 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-zinc-400" />
                Institution Location / Address
              </label>
              <input
                type="text"
                value={schoolAddress}
                onChange={(e) => setSchoolAddress(e.target.value)}
                placeholder="e.g. Bokaro Steel City"
                className="w-full bg-zinc-50 focus:bg-white outline-none border border-zinc-200 focus:border-zinc-300 transition-all px-4 py-3.5 rounded-xl font-semibold text-sm text-zinc-800"
              />
            </div>
          </div>

          {/* Action Row */}
          <div className="flex flex-col sm:flex-row justify-end gap-3 mt-4 border-t border-zinc-100 pt-5">
            <button
              onClick={() => router.push("/assignment")}
              className="bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold text-sm px-6 py-3.5 rounded-full transition-colors cursor-pointer active:scale-95 text-center order-2 sm:order-1"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center justify-center gap-2 bg-zinc-900 hover:bg-black text-white font-bold text-sm px-7 py-3.5 rounded-full transition-all active:scale-[0.98] shadow-md hover:shadow-lg cursor-pointer disabled:bg-zinc-400 order-1 sm:order-2"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving Changes...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
