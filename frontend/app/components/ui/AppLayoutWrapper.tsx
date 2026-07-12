"use client";

import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import SideBar from "./SideBar";
import NavBar from "./NavBar";
import BottomNavBar from "./BottomNavBar";
import { Loader2 } from "lucide-react";

export default function AppLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isOnboarded, setIsOnboarded] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("PrepStackai_auth_token");
      const userEmail = localStorage.getItem("PrepStackai_user_email") || "";
      const onboarded =
        localStorage.getItem(`PrepStackai_onboarded_${userEmail}`) === "true";

      const loggedIn = !!token;
      setIsAuthenticated(loggedIn);
      setIsOnboarded(onboarded);

      // Routing logic
      if (!loggedIn) {
        if (pathname !== "/login") {
          router.replace("/login");
        } else {
          setLoading(false);
        }
      } else {
        if (!onboarded) {
          if (pathname !== "/onboarding") {
            router.replace("/onboarding");
          } else {
            setLoading(false);
          }
        } else {
          if (pathname === "/login" || pathname === "/onboarding") {
            router.replace("/assignment");
          } else {
            setLoading(false);
          }
        }
      }
    };

    checkAuth();

    // Set up a tiny listener to react to changes from profile storage changes or state events
    const handleStorageChange = () => {
      checkAuth();
    };

    window.addEventListener("storage", handleStorageChange);

    // Custom event to listen for local authentication updates immediately in the same tab
    window.addEventListener("PrepStackai_auth_sync", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("PrepStackai_auth_sync", handleStorageChange);
    };
  }, [pathname, router]);

  // Exclude standard layout (Sidebar & Navbar) for login and onboarding
  const isAuthPage = pathname === "/login" || pathname === "/onboarding";

  if (loading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#fafafa] font-bricolage text-black">
        <Loader2 className="w-10.5 h-10.5 animate-spin text-zinc-800 mb-4" />
        <p className="font-semibold text-zinc-500 animate-pulse">
          Synchronizing Session...
        </p>
      </div>
    );
  }

  if (isAuthPage) {
    return <main className="w-full min-h-screen">{children}</main>;
  }

  return (
    <>
      <SideBar />
      <NavBar />
      {children}
      <BottomNavBar />
    </>
  );
}
