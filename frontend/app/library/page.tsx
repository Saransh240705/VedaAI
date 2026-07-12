"use client";

import React, { useState, useEffect } from "react";
import {
  Folder,
  Search,
  FileText,
  Download,
  Trash2,
  Loader2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { BACKEND_URL } from "../config";

interface SavedItem {
  id: string;
  title: string;
  type: string;
  subject: string;
  questionsCount: number;
  totalMarks: number;
  savedDate: string;
  size: string;
  link?: string;
}

export default function MyLibraryPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("All Files");
  const tabs = [
    "All Files",
    "Saved Papers",
    "Curriculum Material",
    "Grading Templates",
  ];

  const [savedItems, setSavedItems] = useState<SavedItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLibrary = async () => {
    try {
      const token = localStorage.getItem("PrepStackai_auth_token") || "";
      const userEmail = localStorage.getItem("PrepStackai_user_email") || "";

      const resAssignments = await fetch(`${BACKEND_URL}/api/assignments`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "x-user-email": userEmail,
        },
      });

      const resTemplates = await fetch(`${BACKEND_URL}/api/templates`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "x-user-email": userEmail,
        },
      });

      const items: SavedItem[] = [];

      if (resAssignments.ok) {
        const data = await resAssignments.json();
        data.forEach((a: any) => {
          // Add generated paper as a "Saved Paper" item
          items.push({
            id: a._id,
            title: `Quiz on ${a.topic}`,
            type: "Saved Papers",
            subject: a.subject,
            questionsCount: a.numQuestions,
            totalMarks: a.totalMarks,
            savedDate: new Date(a.createdAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            }),
            size: `${(a.numQuestions * 1.5 + 4).toFixed(1)} KB`,
            link: `/assignment/${a._id}`,
          });

          // If the assignment has a uploaded file, add it as a "Curriculum Material" item
          if (a.fileUrl) {
            items.push({
              id: `${a._id}_file`,
              title: `${a.subject} Reference Material`,
              type: "Curriculum Material",
              subject: `${a.topic} Syllabus Outline`,
              questionsCount: 0,
              totalMarks: 0,
              savedDate: new Date(a.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              }),
              size: "4.2 MB",
              link: a.fileUrl,
            });
          }
        });
      }

      if (resTemplates.ok) {
        let templates = await resTemplates.json();

        templates.forEach((t: any) => {
          items.push({
            id: t._id || t.id,
            title: t.title,
            type: "Grading Templates",
            subject: t.subject,
            questionsCount: t.questionsCount,
            totalMarks: t.totalMarks,
            savedDate: new Date(t.createdAt || Date.now()).toLocaleDateString(
              "en-US",
              { month: "short", day: "numeric", year: "numeric" },
            ),
            size: t.size,
          });
        });
      }

      setSavedItems(items);
    } catch (err) {
      console.error("Failed to fetch library assignments:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLibrary();
  }, []);

  const handleDelete = async (id: string, type: string) => {
    if (
      !confirm(
        `Are you sure you want to delete this ${type === "Saved Papers" ? "assignment paper" : type === "Grading Templates" ? "grading template" : "material"}?`,
      )
    )
      return;

    const token = localStorage.getItem("PrepStackai_auth_token") || "";

    if (type === "Saved Papers") {
      try {
        const res = await fetch(`${BACKEND_URL}/api/assignments/${id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (res.ok) {
          setSavedItems((prev) => prev.filter((item) => item.id !== id));
        } else {
          alert("Failed to delete assignment.");
        }
      } catch (err) {
        console.error("Failed deleting assignment:", err);
      }
    } else if (type === "Grading Templates") {
      try {
        const res = await fetch(`${BACKEND_URL}/api/templates/${id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (res.ok) {
          setSavedItems((prev) => prev.filter((item) => item.id !== id));
        } else {
          alert("Failed to delete template from database.");
        }
      } catch (err) {
        console.error("Failed deleting grading template:", err);
      }
    } else {
      setSavedItems((prev) => prev.filter((item) => item.id !== id));
    }
  };

  const handleItemClick = (item: SavedItem) => {
    if (item.type === "Saved Papers") {
      router.push(`/assignment/${item.id}`);
    } else if (item.link) {
      window.open(item.link, "_blank");
    }
  };

  const filteredItems = savedItems.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.subject.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === "All Files" || item.type === activeTab;
    return matchesSearch && matchesTab;
  });

  if (loading) {
    return (
      <div className="lg:ml-84 lg:w-[70rem] w-full px-4 lg:px-0 py-24 flex flex-col items-center justify-center min-h-[50vh] font-bricolage text-black">
        <Loader2 className="w-10 h-10 animate-spin text-[#FF7950] mb-4" />
        <p className="font-semibold text-zinc-500 animate-pulse">
          Loading dynamic library items...
        </p>
      </div>
    );
  }

  return (
    <div className="lg:ml-84 lg:w-[70rem] w-full px-4 lg:px-0 py-4 lg:py-6 font-bricolage text-black min-h-[85vh] pb-24 relative flex flex-col gap-5 lg:gap-6">
      {/* Page Title & Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white shadow-md animate-pulse"></span>
            <h2 className="text-2xl font-black text-black tracking-tight">
              My Assessment Library
            </h2>
          </div>
          <p className="text-[#5E5E5ECC] text-sm pl-6.5">
            Store references, template rubrics, and generated question sheets in
            one safe place.
          </p>
        </div>
      </div>

      {/* Search & Layout Actions */}
      <div className="flex flex-col sm:flex-row items-center gap-4 mt-2 bg-white p-4 rounded-3xl border border-zinc-200/50 shadow-[0_4px_30px_rgba(0,0,0,0.01)] w-full">
        {/* Interactive Search Field */}
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-zinc-400" />
          <input
            type="text"
            placeholder="Search saved sheets, reference texts, subjects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#F5F5F5] outline-none text-zinc-800 font-bold px-11 py-3 rounded-2xl border border-transparent focus:border-zinc-300 transition-all text-sm shadow-inner"
          />
        </div>
      </div>

      {/* Tabs list */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-zinc-100">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-full text-xs font-extrabold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
              activeTab === tab
                ? "bg-black text-white shadow-sm"
                : "bg-zinc-50 border border-zinc-200/60 text-zinc-500 hover:bg-zinc-100"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Files List Panel */}
      <div className="flex flex-col gap-4 mt-2">
        {filteredItems.length > 0 ? (
          filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-3xl p-5 border border-zinc-200/50 shadow-[0_4px_30px_rgba(0,0,0,0.01)] hover:shadow-[0_8px_40px_rgba(0,0,0,0.03)] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              {/* File Icon & Info block */}
              <div
                onClick={() => handleItemClick(item)}
                className="flex items-start gap-4 min-w-0 flex-1 cursor-pointer"
              >
                <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-100 text-zinc-700 shadow-sm shrink-0">
                  <FileText className="w-6 h-6 stroke-[1.8]" />
                </div>

                <div className="flex flex-col gap-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-black uppercase tracking-wider text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">
                      {item.type}
                    </span>
                    <span className="text-zinc-300 text-xs font-semibold">
                      •
                    </span>
                    <span className="text-zinc-400 text-[10px] font-bold">
                      {item.savedDate}
                    </span>
                  </div>
                  <h3 className="text-base font-extrabold text-zinc-950 truncate mt-1">
                    {item.title}
                  </h3>
                  <p className="text-zinc-500 text-xs font-semibold">
                    {item.subject}{" "}
                    {item.questionsCount > 0 &&
                      `• ${item.questionsCount} Qs • ${item.totalMarks} Marks`}
                  </p>
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
                <span className="text-zinc-400 text-xs font-semibold mr-1">
                  {item.size}
                </span>
                {item.link && (
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    download
                    className="p-2.5 bg-zinc-50 border border-zinc-200 text-zinc-700 hover:text-zinc-900 rounded-full hover:scale-105 active:scale-95 transition-all shadow-sm cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                )}
                <button
                  onClick={() => handleDelete(item.id, item.type)}
                  className="p-2.5 bg-rose-50/50 border border-rose-100 text-rose-500 hover:text-rose-600 rounded-full hover:scale-105 active:scale-95 transition-all shadow-sm cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-3xl p-12 border border-zinc-200/50 shadow-sm text-center flex flex-col items-center gap-3">
            <Folder className="w-12 h-12 text-zinc-300 stroke-[1.5]" />
            <h3 className="text-base font-black text-black uppercase tracking-tight">
              No Items Found
            </h3>
            <p className="text-zinc-400 text-xs max-w-[280px] font-semibold">
              No files matched your search queries or category filters.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
