"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Plus,
  Search,
  MoreVertical,
  Calendar,
  BookOpen,
  Trash2,
  Eye,
  Filter,
  Loader2,
  Sparkles,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { BACKEND_URL } from "../config";

interface Assignment {
  _id: string;
  subject: string;
  topic: string;
  dueDate: string;
  questionTypes: string[];
  numQuestions: number;
  totalMarks: number;
  instructions?: string;
  status: "pending" | "processing" | "completed" | "failed";
  createdAt: string;
}

export default function AssignmentsPage() {
  const router = useRouter();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // Fetch all assignments
  const fetchAssignments = async () => {
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
        setAssignments(data);
      }
    } catch (err) {
      console.error("Failed to fetch assignments:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  // Handle clicking outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpenDropdownId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Delete an assignment
  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    if (!confirm("Are you sure you want to delete this assignment?")) return;

    try {
      const token = localStorage.getItem("PrepStackai_auth_token") || "";
      const res = await fetch(`${BACKEND_URL}/api/assignments/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        setAssignments((prev) => prev.filter((item) => item._id !== id));
        setOpenDropdownId(null);
      } else {
        alert("Failed to delete assignment.");
      }
    } catch (err) {
      console.error("Error deleting assignment:", err);
      alert("An error occurred while deleting the assignment.");
    }
  };

  // Get unique subjects for filter dropdown
  const uniqueSubjects = Array.from(new Set(assignments.map((a) => a.subject)));

  // Filtered list
  const filteredAssignments = assignments.filter((a) => {
    const matchesSearch =
      a.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.subject.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSubject =
      subjectFilter === "all" || a.subject === subjectFilter;

    return matchesSearch && matchesSubject;
  });

  if (loading) {
    return (
      <div className="lg:ml-84 lg:w-[70rem] w-full px-4 lg:px-0 py-24 flex flex-col items-center justify-center min-h-[50vh] font-bricolage text-black">
        <Loader2 className="w-10 h-10 animate-spin text-orange-500 mb-4" />
        <p className="font-semibold text-zinc-500 animate-pulse">
          Loading assignments...
        </p>
      </div>
    );
  }

  // ⚪ Case A: No assignments in database at all
  if (assignments.length === 0) {
    return (
      <div className="lg:ml-84 lg:w-[70rem] w-full px-4 lg:px-0 flex flex-col items-center justify-center min-h-[75vh] py-12 pb-24 relative">
        <div className="flex flex-col items-center text-center max-w-[500px]">
          {/* Main Illustration */}
          <div className="relative mb-6 flex items-center justify-center w-[300px] h-[300px]">
            {/* Custom Soft Backdrop Circle */}
            <div className="absolute rounded-full bg-[#f2f2f2] w-[240px] h-[240px] -z-10 shadow-sm"></div>

            <Image
              src="/NoAssignments.png"
              alt="No Assignments"
              width={260}
              height={260}
              priority
              className="object-contain relative z-10"
              style={{ height: "auto" }}
            />
          </div>

          {/* Title */}
          <h2 className="font-bricolage text-2xl md:text-3xl font-extrabold text-black tracking-tight mb-3">
            No assignments yet
          </h2>

          {/* Description Paragraph */}
          <p className="font-bricolage text-[#5E5E5ECC] text-sm leading-relaxed mb-8 px-6">
            Create your first assignment to start collecting and grading student
            submissions. You can set up rubrics, define marking criteria, and
            let AI assist with grading.
          </p>

          <Link href="/create-assignment">
            <button className="flex items-center gap-2 bg-[#121212] hover:bg-black text-white font-bricolage font-bold px-7 py-3.5 rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.08)] active:scale-[0.98] transition-all duration-200 cursor-pointer">
              <Plus className="w-5 h-5 stroke-[2.5]" />
              Create Your First Assignment
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="lg:ml-84 lg:w-[70rem] w-full px-4 lg:px-0 py-4 lg:py-6 font-bricolage text-black min-h-[80vh] flex flex-col gap-5 lg:gap-6 pb-24 relative">
      {/* 📱 Mobile Page Title & Back Arrow (Mockup 1) */}
      <div className="flex lg:hidden items-center gap-4 mt-2 px-1">
        <button
          onClick={() => router.back()}
          className="bg-[#EAEAEA] hover:bg-zinc-200 text-zinc-800 p-2.5 rounded-full cursor-pointer transition-colors shadow-sm flex items-center justify-center h-10 w-10 active:scale-95"
        >
          <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
        </button>
        <h2 className="text-xl font-bold tracking-tight text-zinc-800">
          Assignments
        </h2>
      </div>

      {/* 🟢 Desktop Top Title Banner Card (Hidden on Mobile) */}
      <div className="hidden lg:flex flex-col gap-1 bg-[#FFFFFF] rounded-2xl p-6 border border-zinc-100/50 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 w-2 h-full bg-[#3CC878]"></div>
        <div className="flex items-center gap-2.5">
          <div className="w-3.5 h-3.5 rounded-full bg-[#3CC878] animate-pulse"></div>
          <h2 className="text-2xl font-black text-zinc-900 tracking-tight">
            Assignments
          </h2>
        </div>
        <p className="text-zinc-500 text-sm pl-6 mt-1">
          Manage and create assignments for your classes.
        </p>
      </div>

      {/* 🔍 Search & Filter Bar (Mockup 1) */}
      <div className="flex items-center justify-between gap-3 bg-white p-3 lg:p-4 rounded-2xl border border-zinc-200/50 shadow-sm w-full">
        {/* Filter Trigger button */}
        <div className="flex items-center gap-2 bg-white border border-zinc-200 px-4 py-2.5 rounded-full text-zinc-500 text-xs lg:text-sm font-bold hover:bg-zinc-50 cursor-pointer">
          <Filter className="w-4 h-4 text-zinc-400" />
          <select
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            className="bg-transparent border-none outline-none font-bold text-zinc-800 cursor-pointer text-xs lg:text-sm pr-1"
          >
            <option value="all">Filter</option>
            {uniqueSubjects.map((sub) => (
              <option key={sub} value={sub}>
                {sub}
              </option>
            ))}
          </select>
        </div>

        {/* Search Input */}
        <div className="relative flex-1 max-w-[280px] lg:max-w-[350px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search Name"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-zinc-200 rounded-full pl-11 pr-5 py-2.5 text-xs lg:text-sm outline-none font-bold text-zinc-800 placeholder-zinc-400 focus:border-zinc-300 transition-all shadow-sm"
          />
        </div>
      </div>

      {/* 📋 Card Grid */}
      {filteredAssignments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-3xl border border-zinc-100">
          <AlertCircle className="w-12 h-12 text-zinc-300 mb-3" />
          <p className="font-semibold text-zinc-500 text-base">
            No assignments match your filter criteria.
          </p>
          <button
            onClick={() => {
              setSearchQuery("");
              setSubjectFilter("all");
            }}
            className="mt-3 text-sm text-orange-500 hover:text-orange-600 font-bold underline cursor-pointer"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
          {filteredAssignments.map((a) => {
            const isDropdownOpen = openDropdownId === a._id;

            // Format dates
            const assignedDate = new Date(a.createdAt).toLocaleDateString(
              "en-GB",
              {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              },
            );
            const dueDate = new Date(a.dueDate).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            });

            return (
              <div
                key={a._id}
                onClick={() => router.push(`/assignment/${a._id}`)}
                className="group relative bg-[#FFFFFF] rounded-3xl p-5 lg:p-6 border border-zinc-200 shadow-[0_4px_20px_rgba(0,0,0,0.01)] hover:shadow-[0_12px_35px_rgba(0,0,0,0.04)] hover:border-zinc-300 transition-all duration-300 flex flex-col justify-between min-h-[140px] lg:min-h-[180px] cursor-pointer"
              >
                {/* Top Row: Title, Muted subject pill, 3-dots */}
                <div className="flex justify-between items-start gap-4">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="bg-zinc-100 text-zinc-600 text-[9px] lg:text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 lg:py-1 rounded-full">
                        {a.subject}
                      </span>

                      {/* Status Badges */}
                      {a.status === "processing" && (
                        <span className="bg-amber-50 text-amber-600 border border-amber-200/50 text-[8px] lg:text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
                          <Loader2 className="w-3 h-3 animate-spin" />
                          Generating
                        </span>
                      )}
                      {a.status === "failed" && (
                        <span className="bg-rose-50 text-rose-600 border border-rose-200/50 text-[8px] lg:text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                          <XCircle className="w-3 h-3" />
                          Failed
                        </span>
                      )}
                      {a.status === "completed" && (
                        <span className="bg-emerald-50 text-emerald-600 border border-emerald-200/50 text-[8px] lg:text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          Ready
                        </span>
                      )}
                    </div>

                    <h3 className="text-base lg:text-xl font-bold tracking-tight text-zinc-950 group-hover:text-black mt-2 leading-tight">
                      Quiz on {a.topic}
                    </h3>
                  </div>

                  {/* 3-dots Dropdown */}
                  <div
                    className="relative"
                    ref={isDropdownOpen ? dropdownRef : null}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        setOpenDropdownId(isDropdownOpen ? null : a._id);
                      }}
                      className="p-1.5 hover:bg-zinc-50 rounded-full transition-colors cursor-pointer text-zinc-500 hover:text-zinc-800 active:scale-95"
                    >
                      <MoreVertical className="w-5 h-5" />
                    </button>

                    {isDropdownOpen && (
                      <div className="absolute right-0 mt-1 w-44 bg-white rounded-2xl shadow-xl border border-zinc-100 py-2.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                        <Link href={`/assignment/${a._id}`}>
                          <div className="flex items-center gap-2.5 px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50 font-bold transition-all">
                            <Eye className="w-4 h-4 text-zinc-400" />
                            View Assignment
                          </div>
                        </Link>
                        <hr className="my-1.5 border-zinc-100" />
                        <button
                          onClick={(e) => handleDelete(a._id, e)}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 font-bold transition-all text-left"
                        >
                          <Trash2 className="w-4 h-4 text-rose-400" />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer details: Assigned / Due info */}
                {/* Desktop view */}
                <div className="hidden lg:flex flex-wrap items-center justify-between gap-3 border-t border-zinc-100 pt-4 mt-6 text-xs text-zinc-500 font-semibold">
                  <div className="flex items-center gap-1.5">
                    <span className="text-zinc-400">Assigned on:</span>
                    <span className="text-zinc-800 font-bold">
                      {assignedDate}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 bg-zinc-50 px-2.5 py-1 rounded-full border border-zinc-100">
                    <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                    <span className="text-zinc-400">Due:</span>
                    <span className="text-zinc-800 font-bold">{dueDate}</span>
                  </div>
                </div>

                {/* Mobile view (Mockup 1) */}
                <div className="flex lg:hidden items-center text-[11px] text-zinc-500 font-bold mt-4 tracking-tight border-t border-zinc-100/50 pt-3">
                  <span>
                    Assigned on :{" "}
                    <span className="text-zinc-400 font-bold">
                      {assignedDate}
                    </span>
                  </span>
                  <span className="ml-5">
                    Due :{" "}
                    <span className="text-zinc-400 font-bold">{dueDate}</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Floating Create Assignment Button (Mobile only, hidden on desktop since sidebar CTA is present) */}
      <div className="fixed right-6 bottom-24 z-40 lg:hidden print:hidden">
        <Link href="/create-assignment">
          <button className="flex items-center justify-center bg-[#121212] hover:bg-black hover:scale-105 active:scale-[0.98] text-white font-bricolage font-bold p-4 rounded-full shadow-[0_10px_30px_rgba(0,0,0,0.15)] transition-all duration-300 cursor-pointer h-14 w-14">
            <Plus className="w-6 h-6 stroke-[2.5]" />
          </button>
        </Link>
      </div>
    </div>
  );
}
