"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("PrepStackai_auth_token");
    const onboarded = localStorage.getItem("PrepStackai_onboarded") === "true";
    if (!token) {
      router.replace("/login");
    } else if (!onboarded) {
      router.replace("/onboarding");
    } else {
      router.replace("/assignment");
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center font-bricolage bg-[#fafafa]">
      <p className="text-zinc-400 font-semibold animate-pulse">
        Loading PrepStack AI Dashboard...
      </p>
    </div>
  );
}
