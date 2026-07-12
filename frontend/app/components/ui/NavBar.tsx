"use client";

import { ArrowLeft, Bell, ChevronDown, LayoutGrid } from "lucide-react";
import Image from "next/image";
import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

const NavBar = () => {
  const router = useRouter();
  const pathname = usePathname();

  // Dynamic Profile States
  const [userName, setUserName] = useState("John Doe");
  const [avatar, setAvatar] = useState("/Avatar.jpg");

  // Notifications States
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const fetchNotifications = () => {
    try {
      const userEmail = localStorage.getItem("PrepStackai_user_email") || "";
      const stored = localStorage.getItem(
        `PrepStackai_notifications_${userEmail}`,
      );
      if (stored) {
        setNotifications(JSON.parse(stored));
      } else {
        const welcomeNote = [
          {
            id: "welcome",
            title: "Welcome to PrepStack AI!",
            description: "Start creating custom class assessments instantly.",
            link: "/create-assignment",
            timestamp: "Just now",
            unread: true,
          },
        ];
        localStorage.setItem(
          `PrepStackai_notifications_${userEmail}`,
          JSON.stringify(welcomeNote),
        );
        setNotifications(welcomeNote);
      }
    } catch (err) {
      console.error("Error reading notifications:", err);
    }
  };

  useEffect(() => {
    const fetchProfile = () => {
      try {
        const userEmail = localStorage.getItem("PrepStackai_user_email") || "";
        const stored = localStorage.getItem(`PrepStackai_profile_${userEmail}`);
        if (stored) {
          const profile = JSON.parse(stored);
          if (profile.userName) setUserName(profile.userName);
          if (profile.avatar) setAvatar(profile.avatar);
        }
      } catch (err) {
        console.error("Error reading profile in navbar:", err);
      }
    };

    fetchProfile();
    fetchNotifications();

    // Periodically update profile reactive details
    const interval = setInterval(fetchProfile, 2000);

    const handleSync = () => {
      fetchNotifications();
    };

    window.addEventListener("PrepStackai_notification_sync", handleSync);
    window.addEventListener("storage", handleSync);

    return () => {
      clearInterval(interval);
      window.removeEventListener("PrepStackai_notification_sync", handleSync);
      window.removeEventListener("storage", handleSync);
    };
  }, []);

  const unreadCount = notifications.filter((n) => n.unread).length;

  const handleBellClick = () => {
    setShowDropdown(!showDropdown);
  };

  const handleNotificationClick = (id: string, link: string) => {
    const userEmail = localStorage.getItem("PrepStackai_user_email") || "";
    const updated = notifications.map((n) =>
      n.id === id ? { ...n, unread: false } : n,
    );
    localStorage.setItem(
      `PrepStackai_notifications_${userEmail}`,
      JSON.stringify(updated),
    );
    setNotifications(updated);
    setShowDropdown(false);
    router.push(link);
  };

  const handleClearAll = () => {
    const userEmail = localStorage.getItem("PrepStackai_user_email") || "";
    const updated = notifications.map((n) => ({ ...n, unread: false }));
    localStorage.setItem(
      `PrepStackai_notifications_${userEmail}`,
      JSON.stringify(updated),
    );
    setNotifications(updated);
  };

  // Dynamic breadcrumb text
  let breadcrumb = "Assignment";
  if (pathname === "/create-assignment") {
    breadcrumb = "Create Assignment";
  } else if (pathname.startsWith("/assignment/")) {
    breadcrumb = "Assignment Output";
  } else if (pathname === "/assignment") {
    breadcrumb = "Assignments List";
  } else if (pathname === "/profile") {
    breadcrumb = "Teacher Profile";
  }

  const handleBack = () => {
    if (pathname !== "/assignment" && pathname.startsWith("/assignment")) {
      router.push("/assignment");
    } else if (pathname === "/create-assignment" || pathname === "/profile") {
      router.push("/assignment");
    } else {
      router.back();
    }
  };

  return (
    <div className="text-black flex justify-between items-center lg:w-[70rem] w-full max-w-full bg-[#FFFFFF] lg:bg-[#fafafa] mt-2 lg:mt-5 rounded-2xl lg:ml-84 p-3 lg:p-2 print:hidden border border-zinc-200/20 shadow-sm font-bricolage">
      <div className="flex items-center">
        {/* Back button with click handler (Desktop only) */}
        <button
          onClick={handleBack}
          className="hidden lg:flex bg-[#FFFFFF] w-fit p-2 ml-2 rounded-full cursor-pointer hover:bg-zinc-50 active:scale-95 transition-all shadow-sm items-center justify-center text-zinc-700"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        {/* Dynamic Breadcrumb (Desktop only) */}
        <div className="hidden lg:flex ml-4 text-[#5E5E5ECC] gap-2 items-center">
          <LayoutGrid className="w-4 h-4 text-zinc-400" />
          <h3 className="text-sm font-bold text-zinc-500">{breadcrumb}</h3>
        </div>

        {/* Brand Logo (Mobile only) */}
        <div className="flex lg:hidden items-center gap-2 pl-2">
          <Image
            src="/icon.jpeg"
            alt="Logo"
            width={32}
            height={32}
            style={{ width: "32px", height: "auto" }}
            className="object-contain"
          />
          <span className="text-xl font-black text-black tracking-tight">
            PrepStackAI
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Notification Bell Wrapper with Dropdown */}
        <div className="relative">
          <div
            onClick={handleBellClick}
            className="bg-[#f5f5f5] p-2 rounded-full flex justify-center items-center cursor-pointer hover:bg-zinc-200/50 transition-colors"
          >
            <Bell className="w-5 h-5 text-zinc-700" />
            {unreadCount > 0 && (
              <span className="absolute top-0.5 right-0.5 w-2.5 h-2.5 rounded-full bg-[#FF5A1F] border border-white flex items-center justify-center text-[7px] text-white font-bold animate-pulse">
                {unreadCount}
              </span>
            )}
          </div>

          {/* Floating Notifications Dropdown Panel */}
          {showDropdown && (
            <div className="absolute right-0 top-11 w-80 bg-white rounded-3xl border border-zinc-200/80 shadow-2xl p-4 flex flex-col gap-3 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex justify-between items-center border-b border-zinc-100 pb-2">
                <h3 className="text-xs font-black text-zinc-950 uppercase tracking-tight">
                  Notifications
                </h3>
                {unreadCount > 0 && (
                  <button
                    onClick={handleClearAll}
                    className="text-[9px] text-zinc-400 hover:text-zinc-600 font-bold uppercase hover:underline cursor-pointer"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="flex flex-col gap-2 max-h-60 overflow-y-auto scrollbar-none">
                {notifications.length > 0 ? (
                  notifications.map((note) => (
                    <div
                      key={note.id}
                      onClick={() =>
                        handleNotificationClick(note.id, note.link)
                      }
                      className={`p-3 rounded-2xl border transition-all cursor-pointer flex flex-col gap-0.5 text-left ${note.unread ? "bg-orange-50/20 border-orange-100/50 hover:bg-orange-50/40" : "bg-white border-zinc-100 hover:bg-zinc-50"}`}
                    >
                      <div className="flex justify-between items-start gap-1">
                        <h4 className="text-xs font-black text-zinc-900 truncate flex-1">
                          {note.title}
                        </h4>
                        {note.unread && (
                          <span className="w-1.5 h-1.5 rounded-full bg-[#FF5A1F] shrink-0 mt-1"></span>
                        )}
                      </div>
                      <p className="text-[10px] text-zinc-500 font-semibold leading-normal">
                        {note.description}
                      </p>
                      <span className="text-[8px] text-zinc-400 mt-1 font-bold">
                        {note.timestamp}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-zinc-400 text-xs font-semibold">
                    No notifications yet.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile Navigator */}
        <Link href="/profile" className="flex items-center">
          {/* Desktop User Info Pill */}
          <div className="hidden lg:flex bg-[#FFFFFF] rounded-full p-2 gap-2 shadow-sm border border-zinc-200/10 hover:bg-zinc-50 transition-colors cursor-pointer">
            <Image
              src={avatar}
              alt="avatar"
              width={40}
              height={40}
              className="rounded-full object-cover h-10 w-10 border border-zinc-100"
            />
            <h3 className="font-bricolage flex items-center font-bold text-[13px] text-zinc-800">
              {userName}
              <ChevronDown className="w-3.5 h-3.5 ml-1 text-zinc-500" />
            </h3>
          </div>

          {/* Mobile User Avatar */}
          <div className="flex lg:hidden rounded-full overflow-hidden border border-zinc-200/40 shadow-sm cursor-pointer">
            <Image
              src={avatar}
              alt="avatar"
              width={36}
              height={36}
              className="rounded-full object-cover h-9 w-9"
            />
          </div>
        </Link>
      </div>
    </div>
  );
};

export default NavBar;
