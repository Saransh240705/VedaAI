"use client";

import React, { useState, useEffect } from "react";
import { BACKEND_URL } from "../config";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  User,
  School,
  MapPin,
  GraduationCap,
  BookOpen,
  ArrowRight,
  ArrowLeft,
  Check,
  Sparkles,
  Loader2,
  CheckCircle2,
} from "lucide-react";

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isFinishing, setIsFinishing] = useState(false);

  // Profile data state
  const [userName, setUserName] = useState("Prof. John Doe");
  const [avatar, setAvatar] = useState("/Avatar.jpg");
  const [schoolName, setSchoolName] = useState("");
  const [schoolAddress, setSchoolAddress] = useState("");
  const [roleTitle, setRoleTitle] = useState("Senior Educator");
  const [gradeFocus, setGradeFocus] = useState<string[]>([]);
  const [subjectFocus, setSubjectFocus] = useState<string[]>([]);

  // Pre-load registration name if available
  useEffect(() => {
    try {
      const userEmail = localStorage.getItem("PrepStackai_user_email") || "";
      const stored = localStorage.getItem(`PrepStackai_profile_${userEmail}`);
      if (stored) {
        const profile = JSON.parse(stored);
        if (profile.userName) setUserName(profile.userName);
      }
    } catch (err) {
      console.error("Error reading initial signup profile:", err);
    }
  }, []);

  const avatarPresets = [
    "/Avatar.jpg",
    "https://images.unsplash.com/photo-1544717305-2782549b5136?w=150&auto=format&fit=crop&q=60", // Educator Female 1
    "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=60", // Educator Female 2
    "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=60", // Educator Male 1
    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=60", // Educator Male 2
  ];

  const gradeOptions = [
    "Elementary (1-5)",
    "Middle School (6-8)",
    "High School (9-10)",
    "Senior Secondary (11-12)",
    "Undergraduate",
  ];
  const subjectOptions = [
    "Mathematics",
    "Physics",
    "Chemistry",
    "Biology",
    "English Literature",
    "Social Sciences",
    "Technology (SNT)",
  ];

  const handleToggleGrade = (grade: string) => {
    setGradeFocus((prev) =>
      prev.includes(grade)
        ? prev.filter((item) => item !== grade)
        : [...prev, grade],
    );
  };

  const handleToggleSubject = (subject: string) => {
    setSubjectFocus((prev) =>
      prev.includes(subject)
        ? prev.filter((item) => item !== subject)
        : [...prev, subject],
    );
  };

  const handleNextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      handleCompleteOnboarding();
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleCompleteOnboarding = async () => {
    setIsFinishing(true);

    const token = localStorage.getItem("PrepStackai_auth_token") || "";
    const userEmail = localStorage.getItem("PrepStackai_user_email") || "";

    const updatedProfile = {
      userName,
      schoolName: schoolName || "Navyug Convent School",
      schoolAddress: schoolAddress || "New Delhi",
      avatar,
      roleTitle,
      gradeFocus,
      subjectFocus,
    };

    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/onboard`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          schoolName: schoolName || "Navyug Convent School",
          schoolAddress: schoolAddress || "New Delhi",
          role: roleTitle,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save onboarding details.");
      }

      // Synchronize local storage for instant sync backward compatibility
      localStorage.setItem(
        `PrepStackai_profile_${userEmail}`,
        JSON.stringify(updatedProfile),
      );
      localStorage.setItem(`PrepStackai_onboarded_${userEmail}`, "true");

      // Dispatch sync event to instantly update SideBar and NavBar
      window.dispatchEvent(new Event("PrepStackai_auth_sync"));

      router.push("/assignment");
    } catch (err) {
      console.error("Onboarding error:", err);
      // Fallback gracefully to localStorage
      localStorage.setItem(
        `PrepStackai_profile_${userEmail}`,
        JSON.stringify(updatedProfile),
      );
      localStorage.setItem(`PrepStackai_onboarded_${userEmail}`, "true");
      window.dispatchEvent(new Event("PrepStackai_auth_sync"));
      router.push("/assignment");
    } finally {
      setIsFinishing(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#fafafa] font-bricolage text-black relative p-4 md:p-6 overflow-hidden">
      {/* Dynamic Background Glows */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] rounded-full bg-zinc-100/50 blur-3xl -z-10"></div>
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[400px] h-[400px] rounded-full bg-orange-50/20 blur-3xl -z-10"></div>

      {/* Main Card Container */}
      <div className="w-full max-w-[550px] bg-white rounded-3xl p-8 md:p-10 border border-zinc-200/60 shadow-[0_12px_45px_rgba(0,0,0,0.03)] flex flex-col gap-8 relative">
        {/* Stepper progress indicator */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between text-xs font-bold text-zinc-400 uppercase tracking-widest pl-1">
            <span>Setup Educator Profile</span>
            <span className="text-black">Step {currentStep} of 3</span>
          </div>

          <div className="flex gap-2 h-1.5 w-full bg-zinc-100 rounded-full overflow-hidden">
            <div
              className={`h-full bg-black rounded-full transition-all duration-500`}
              style={{ width: `${(currentStep / 3) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Stepper Header Titles */}
        <div className="text-center md:text-left">
          {currentStep === 1 && (
            <>
              <h2 className="text-2xl font-black text-zinc-950 uppercase tracking-tight">
                Personalize Your Profile
              </h2>
              <p className="text-zinc-500 text-sm mt-1">
                Set your teacher credentials and pick a beautiful educator
                avatar.
              </p>
            </>
          )}
          {currentStep === 2 && (
            <>
              <h2 className="text-2xl font-black text-zinc-950 uppercase tracking-tight">
                Branding & School Setup
              </h2>
              <p className="text-zinc-500 text-sm mt-1">
                Provide your school details to brand generated A4 sheets
                dynamically.
              </p>
            </>
          )}
          {currentStep === 3 && (
            <>
              <h2 className="text-2xl font-black text-zinc-950 uppercase tracking-tight">
                Academic Specialization
              </h2>
              <p className="text-zinc-500 text-sm mt-1">
                Select your teaching focus so Gemini can calibrate questions
                appropriately.
              </p>
            </>
          )}
        </div>

        {/* STEP PANELS CONTAINER */}
        <div className="min-h-[260px] flex flex-col justify-center">
          {/* STEP 1: Personal Details & Avatars Presets */}
          {currentStep === 1 && (
            <div className="flex flex-col gap-5 animate-in fade-in duration-300">
              {/* Full Name field */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-zinc-700 pl-1 uppercase tracking-wide">
                  Educator Name
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-zinc-400" />
                  <input
                    type="text"
                    required
                    placeholder="Prof. John Doe"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200/80 rounded-2xl pl-11 pr-4 py-3.5 text-sm outline-none font-semibold text-zinc-800 focus:bg-white focus:border-zinc-950 focus:shadow-[0_0_0_3px_rgba(0,0,0,0.02)] transition-all"
                  />
                </div>
              </div>

              {/* Title / Role selection */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-zinc-700 pl-1 uppercase tracking-wide">
                  Role / Position
                </label>
                <div className="relative">
                  <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-zinc-400" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Senior Science Teacher"
                    value={roleTitle}
                    onChange={(e) => setRoleTitle(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200/80 rounded-2xl pl-11 pr-4 py-3.5 text-sm outline-none font-semibold text-zinc-800 focus:bg-white focus:border-zinc-950 focus:shadow-[0_0_0_3px_rgba(0,0,0,0.02)] transition-all"
                  />
                </div>
              </div>

              {/* Avatar Selector Presets Grid */}
              <div className="flex flex-col gap-2 mt-1">
                <label className="text-xs font-bold text-zinc-700 pl-1 uppercase tracking-wide">
                  Select Profile Avatar
                </label>
                <div className="flex items-center gap-3.5 py-1">
                  {avatarPresets.map((preset, idx) => {
                    const isSelected = avatar === preset;
                    return (
                      <button
                        key={idx}
                        onClick={() => setAvatar(preset)}
                        className={`relative w-14 h-14 rounded-full overflow-hidden border-2 cursor-pointer transition-all ${
                          isSelected
                            ? "border-black scale-108 shadow-md"
                            : "border-zinc-200/60 opacity-60 hover:opacity-90"
                        }`}
                      >
                        <Image
                          src={preset}
                          alt={`Preset ${idx + 1}`}
                          fill
                          className="object-cover"
                        />
                        {isSelected && (
                          <div className="absolute inset-0 bg-black/20 flex items-center justify-center text-white">
                            <Check className="w-4 h-4 stroke-[3]" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: School Branding Input Fields */}
          {currentStep === 2 && (
            <div className="flex flex-col gap-5 animate-in fade-in duration-300">
              {/* School Name Field */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-zinc-700 pl-1 uppercase tracking-wide">
                  School / Institution Name
                </label>
                <div className="relative">
                  <School className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-zinc-400" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Navyug Convent School"
                    value={schoolName}
                    onChange={(e) => setSchoolName(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200/80 rounded-2xl pl-11 pr-4 py-3.5 text-sm outline-none font-semibold text-zinc-800 focus:bg-white focus:border-zinc-950 focus:shadow-[0_0_0_3px_rgba(0,0,0,0.02)] transition-all"
                  />
                </div>
              </div>

              {/* School Address Field */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-zinc-700 pl-1 uppercase tracking-wide">
                  School Location / Address
                </label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-zinc-400" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. New Delhi"
                    value={schoolAddress}
                    onChange={(e) => setSchoolAddress(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200/80 rounded-2xl pl-11 pr-4 py-3.5 text-sm outline-none font-semibold text-zinc-800 focus:bg-white focus:border-zinc-950 focus:shadow-[0_0_0_3px_rgba(0,0,0,0.02)] transition-all"
                  />
                </div>
              </div>

              <div className="text-xs text-zinc-400 italic bg-zinc-50 p-4 border border-zinc-100 rounded-2xl leading-normal mt-2 pl-4 border-l-4 border-l-zinc-700">
                ⚠️ **Branding Impact**: These fields directly customize the
                centered letterhead in your generated question sheets (e.g.
                "NAVYUG CONVENT SCHOOL, NEW DELHI" printed on top of the
                assignment).
              </div>
            </div>
          )}

          {/* STEP 3: Badge selectors for academic target criteria */}
          {currentStep === 3 && (
            <div className="flex flex-col gap-5 animate-in fade-in duration-300">
              {/* Grade ranges selection */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-zinc-700 pl-1 uppercase tracking-wide flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4 text-zinc-400" />
                  <span>Target Class / Grades</span>
                </label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {gradeOptions.map((grade) => {
                    const isSelected = gradeFocus.includes(grade);
                    return (
                      <button
                        key={grade}
                        type="button"
                        onClick={() => handleToggleGrade(grade)}
                        className={`text-xs font-bold px-3.5 py-2 rounded-full border transition-all cursor-pointer ${
                          isSelected
                            ? "bg-black border-black text-white"
                            : "bg-white border-zinc-200 text-zinc-600 hover:border-zinc-400"
                        }`}
                      >
                        {grade}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Subject Areas Toggle Badges */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-zinc-700 pl-1 uppercase tracking-wide flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-zinc-400" />
                  <span>Primary Teaching Subjects</span>
                </label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {subjectOptions.map((subject) => {
                    const isSelected = subjectFocus.includes(subject);
                    return (
                      <button
                        key={subject}
                        type="button"
                        onClick={() => handleToggleSubject(subject)}
                        className={`text-xs font-bold px-3.5 py-2 rounded-full border transition-all cursor-pointer ${
                          isSelected
                            ? "bg-black border-black text-white"
                            : "bg-white border-zinc-200 text-zinc-600 hover:border-zinc-400"
                        }`}
                      >
                        {subject}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* BOTTOM ACTION NAVIGATION CONTROL ROW */}
        <div className="flex items-center justify-between border-t border-zinc-100 pt-6 mt-2">
          {/* Back button */}
          <button
            onClick={handlePrevStep}
            disabled={currentStep === 1 || isFinishing}
            className={`flex items-center gap-2 font-bold px-5 py-3 rounded-full text-sm border border-zinc-200 hover:bg-zinc-50 active:scale-95 transition-all cursor-pointer ${
              currentStep === 1 ? "opacity-0 pointer-events-none" : ""
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          {/* Next / Complete button */}
          <button
            onClick={handleNextStep}
            disabled={isFinishing || (currentStep === 1 && !userName)}
            className="flex items-center gap-2 bg-black hover:bg-zinc-900 text-white font-bold px-7 py-3 rounded-full text-sm shadow-md active:scale-95 transition-all cursor-pointer disabled:opacity-50"
          >
            {isFinishing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving Setup...</span>
              </>
            ) : currentStep === 3 ? (
              <>
                <span>Complete Setup</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-400 fill-emerald-950/20" />
              </>
            ) : (
              <>
                <span>Next Step</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
