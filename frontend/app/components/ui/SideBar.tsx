"use client";

import {
  Book,
  ChartPie,
  FileText,
  LayoutGrid,
  Settings,
  LogOut,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { BACKEND_URL } from "../../config";

const SideBar = () => {
  const pathname = usePathname();
  const [assignmentCount, setAssignmentCount] = useState(0);

  // Profile states
  const [schoolName, setSchoolName] = useState("");
  const [schoolAddress, setSchoolAddress] = useState("");
  const [avatar, setAvatar] = useState("/Avatar.jpg");

  // Fetch count and profile settings
  useEffect(() => {
    const fetchCount = async () => {
      try {
        const token = localStorage.getItem("PrepStackai_auth_token") || "";
        const userEmail = localStorage.getItem("PrepStackai_user_email") || "";
        const res = await fetch(`${BACKEND_URL}/api/assignments`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "x-user-email": userEmail,
          },
        });
        if (res.ok) {
          const data = await res.json();
          setAssignmentCount(data.length);
        }
      } catch (err) {
        console.error("Error fetching assignment count for sidebar:", err);
      }
    };

    const fetchProfile = () => {
      try {
        const userEmail = localStorage.getItem("PrepStackai_user_email") || "";
        const stored = localStorage.getItem(`PrepStackai_profile_${userEmail}`);
        if (stored) {
          const profile = JSON.parse(stored);
          if (profile.schoolName) setSchoolName(profile.schoolName);
          if (profile.schoolAddress) setSchoolAddress(profile.schoolAddress);
          if (profile.avatar) setAvatar(profile.avatar);
        }
      } catch (err) {
        console.error("Error reading profile in sidebar:", err);
      }
    };

    fetchCount();
    fetchProfile();

    // Check frequently to update reactively
    const interval = setInterval(() => {
      fetchCount();
      fetchProfile();
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    if (!confirm("Are you sure you want to log out of PrepStackAI?")) return;

    // Clear user tokens
    localStorage.removeItem("PrepStackai_auth_token");

    // Trigger the session listener to immediately redirect
    window.dispatchEvent(new Event("PrepStackai_auth_sync"));
  };

  return (
    <div className="hidden lg:flex bg-[#FFFFFF] w-[300px] h-[95vh] p-4 fixed ml-4 mr-4 mt-4 rounded-2xl shadow-[2px_4px_80px_rgba(0,0,0,0.15)] print:hidden flex-col justify-between">
      <div>
        {/* Logo and Brand Title */}
        <Link href="/">
          <div className="flex gap-1.5 items-center cursor-pointer">
            <Image
              src="/icon.jpeg"
              alt="Logo"
              width={40}
              height={40}
              style={{ width: "40px", height: "auto" }}
            />
            <h1 className="font-bricolage text-black text-3xl font-black tracking-tight">
              PrepStackAI
            </h1>
          </div>
        </Link>

        {/* Create Assignment CTA */}
        <div className="flex justify-center mt-12">
          <Link href="/create-assignment">
            <button className="group relative p-[2px] rounded-full bg-gradient-to-b from-[#FF7950] to-[#C0350A] shadow-[0_6px_22px_rgba(255,121,80,0.25)] hover:shadow-[0_8px_28px_rgba(255,121,80,0.4)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer">
              <span className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-[#232323] text-white font-bricolage text-base font-bold w-[230px] transition-colors duration-300 group-hover:bg-[#1b1b1b]">
                <svg
                  className="w-5 h-5 text-white animate-pulse"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M8 6c0 3.3-2.7 6-6 6 3.3 0 6 2.7 6 6 0-3.3 2.7-6 6-6-3.3 0-6-2.7-6-6z" />
                  <path d="M18 3c0 2.2-1.8 4-4 4 2.2 0 4 1.8 4 4 0-2.2 1.8-4 4-4-2.2 0-4-1.8-4-4z" />
                </svg>
                Create Assignment
              </span>
            </button>
          </Link>
        </div>

        {/* Sidebar Navigation Menu Items */}
        <div className="flex justify-center mt-12">
          <ul className="flex flex-col gap-2 font-bricolage w-60">
            <li>
              <Link href={"/my-groups"}>
                <div
                  className={`flex items-center w-full p-2.5 pl-3.5 rounded-xl gap-3 transition-all ${pathname === "/my-groups" ? "bg-[#F0F0F0] text-black font-black" : "text-[#5E5E5ECC] hover:bg-[#F5F5F5] hover:text-zinc-800"}`}
                >
                  <Image
                    src="/MyGroups.png"
                    alt="Groups"
                    width={18}
                    height={18}
                    style={{ width: "18px", height: "auto" }}
                  />
                  <h3 className="text-sm font-bold">My Groups</h3>
                </div>
              </Link>
            </li>

            <li>
              <Link href={"/assignment"}>
                <div
                  className={`flex items-center w-full p-2.5 pl-3.5 rounded-xl gap-3 transition-all ${pathname.startsWith("/assignment") ? "bg-[#F0F0F0] text-black font-black" : "text-[#5E5E5ECC] hover:bg-[#F5F5F5] hover:text-zinc-800"}`}
                >
                  <FileText className="size-4.5" />
                  <h3 className="text-sm font-bold">Assignment</h3>
                  {assignmentCount > 0 && (
                    <span className="bg-[#FF5C35] text-white text-[10px] font-black px-2.5 py-0.5 rounded-full ml-auto">
                      {assignmentCount}
                    </span>
                  )}
                </div>
              </Link>
            </li>

            <li>
              <Link href={"/toolkit"}>
                <div
                  className={`flex items-center w-full p-2.5 pl-3.5 rounded-xl gap-3 transition-all ${pathname === "/toolkit" ? "bg-[#F0F0F0] text-black font-black" : "text-[#5E5E5ECC] hover:bg-[#F5F5F5] hover:text-zinc-800"}`}
                >
                  <Book className="size-4.5" />
                  <h3 className="text-sm font-bold">AI Teacher’s Toolkit</h3>
                </div>
              </Link>
            </li>

            <li>
              <Link href={"/library"}>
                <div
                  className={`flex items-center w-full p-2.5 pl-3.5 rounded-xl gap-3 transition-all ${pathname === "/library" ? "bg-[#F0F0F0] text-black font-black" : "text-[#5E5E5ECC] hover:bg-[#F5F5F5] hover:text-zinc-800"}`}
                >
                  <ChartPie className="size-4.5" />
                  <h3 className="text-sm font-bold">My Library</h3>
                </div>
              </Link>
            </li>
          </ul>
        </div>
      </div>

      {/* Sidebar Footer Details & School Profile Card */}
      <div className="flex flex-col gap-2.5">
        <div className="flex flex-col gap-1 items-center">
          <Link href="/profile" className="w-full flex justify-center">
            <div
              className={`flex items-center w-60 p-2.5 pl-3.5 hover:bg-[#F5F5F5] hover:text-zinc-800 rounded-xl gap-3 transition-all cursor-pointer ${pathname === "/profile" ? "bg-[#F0F0F0] text-black font-black" : "text-[#5E5E5ECC]"}`}
            >
              <Settings className="size-4.5" />
              <h3 className="font-bricolage text-sm font-bold">Settings</h3>
            </div>
          </Link>

          <button
            onClick={handleLogout}
            className="flex items-center w-60 p-2.5 pl-3.5 hover:bg-rose-50 hover:text-rose-600 rounded-xl gap-3 text-rose-500 hover:scale-[1.01] transition-all cursor-pointer border border-transparent font-bricolage font-bold"
          >
            <LogOut className="size-4.5" />
            <h3 className="text-sm font-bold">Log Out</h3>
          </button>
        </div>

        <div className="flex justify-center font-bricolage">
          <Link href="/profile" className="w-full flex justify-center">
            <div className="flex text-[#5E5E5ECC] items-center w-60 p-3 bg-[#F0F0F0] rounded-xl gap-3 border border-zinc-200/20 hover:bg-[#EAEAEA] active:scale-[0.98] transition-all cursor-pointer shadow-sm">
              <Image
                src={avatar}
                alt="Avatar"
                width={40}
                height={40}
                className="rounded-full border border-white shadow-sm object-cover h-10 w-10"
              />
              <div className="flex flex-col min-w-0">
                <h3 className="text-black font-extrabold text-[13px] truncate">
                  {schoolName}
                </h3>
                <p className="text-[#5E5E5ECC] text-[11px] font-bold truncate">
                  {schoolAddress}
                </p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SideBar;
