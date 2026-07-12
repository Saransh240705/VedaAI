"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  Plus,
  BookOpen,
  Clock,
  ArrowRight,
  GraduationCap,
  Loader2,
  Trash2,
} from "lucide-react";
import Image from "next/image";
import { BACKEND_URL } from "../config";

interface Group {
  _id?: string;
  id?: string;
  name: string;
  subject: string;
  grade: string;
  studentsCount: number;
  activeAssignments: number;
  averageScore: string;
  color: string;
}

export default function MyGroupsPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupSubject, setNewGroupSubject] = useState("");
  const [newGroupGrade, setNewGroupGrade] = useState("Class V");

  // Fetch groups on mount
  const fetchGroups = async () => {
    try {
      const token = localStorage.getItem("PrepStackai_auth_token") || "";
      const userEmail = localStorage.getItem("PrepStackai_user_email") || "";

      const res = await fetch(`${BACKEND_URL}/api/groups`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "x-user-email": userEmail,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setGroups(data);
      }
    } catch (err) {
      console.error("Failed to fetch groups:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim() || !newGroupSubject.trim()) return;

    setIsSaving(true);

    const colors = [
      "from-[#FF7950] to-[#FF5C35]",
      "from-indigo-500 to-purple-600",
      "from-emerald-400 to-teal-600",
      "from-amber-400 to-orange-500",
      "from-pink-500 to-rose-600",
    ];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    const token = localStorage.getItem("PrepStackai_auth_token") || "";
    const userEmail = localStorage.getItem("PrepStackai_user_email") || "";

    const newGroupPayload = {
      name: newGroupName,
      subject: newGroupSubject,
      grade: newGroupGrade,
      studentsCount: Math.floor(Math.random() * 20) + 20,
      activeAssignments: 0,
      averageScore: "N/A",
      color: randomColor,
    };

    try {
      const res = await fetch(`${BACKEND_URL}/api/groups`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "x-user-email": userEmail,
        },
        body: JSON.stringify(newGroupPayload),
      });
      if (res.ok) {
        const savedGroup = await res.json();
        setGroups((prev) => [savedGroup, ...prev]);
        setIsModalOpen(false);
        setNewGroupName("");
        setNewGroupSubject("");
      } else {
        alert("Failed to create group on server.");
      }
    } catch (err) {
      console.error("Error creating group:", err);
      alert("An error occurred while creating the group.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteGroup = async (groupId: string) => {
    if (!confirm("Are you sure you want to delete this student group?")) return;

    try {
      const token = localStorage.getItem("PrepStackai_auth_token") || "";
      const res = await fetch(`${BACKEND_URL}/api/groups/${groupId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        setGroups((prev) => prev.filter((g) => g._id !== groupId));
      } else {
        alert("Failed to delete group from database.");
      }
    } catch (err) {
      console.error("Error deleting group:", err);
      alert("An error occurred while deleting the group.");
    }
  };

  if (loading) {
    return (
      <div className="lg:ml-84 lg:w-[70rem] w-full px-4 lg:px-0 py-24 flex flex-col items-center justify-center min-h-[50vh] font-bricolage text-black">
        <Loader2 className="w-10 h-10 animate-spin text-[#FF7950] mb-4" />
        <p className="font-semibold text-zinc-500 animate-pulse">
          Loading classes and groups...
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
            <span className="w-3.5 h-3.5 rounded-full bg-indigo-500 border-2 border-white shadow-md animate-pulse"></span>
            <h2 className="text-2xl font-black text-black tracking-tight">
              My Student Groups
            </h2>
          </div>
          <p className="text-[#5E5E5ECC] text-sm pl-6.5">
            Organize classes, track test metrics, and assign question papers.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 bg-black hover:bg-zinc-900 text-white font-extrabold text-xs px-6 py-3 rounded-full cursor-pointer transition-all active:scale-[0.98] shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          Create New Group
        </button>
      </div>

      {/* Stats Cards Section */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-zinc-200/50 shadow-sm flex items-center gap-4">
          <div className="p-3.5 rounded-xl bg-orange-50 text-[#FF7950] border border-orange-100">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
              Total Students
            </h3>
            <p className="text-2xl font-black text-zinc-900 mt-0.5">
              {groups.reduce((acc, g) => acc + g.studentsCount, 0)}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-zinc-200/50 shadow-sm flex items-center gap-4">
          <div className="p-3.5 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
              Active Batches
            </h3>
            <p className="text-2xl font-black text-zinc-900 mt-0.5">
              {groups.length}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-zinc-200/50 shadow-sm flex items-center gap-4">
          <div className="p-3.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
              Active Papers
            </h3>
            <p className="text-2xl font-black text-zinc-900 mt-0.5">
              {groups.reduce((acc, g) => acc + g.activeAssignments, 0)}
            </p>
          </div>
        </div>
      </div>

      {/* Main Groups Grid */}
      {groups.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-3xl border border-zinc-100">
          <Users className="w-12 h-12 text-zinc-300 mb-3" />
          <p className="font-semibold text-zinc-500 text-base">
            No groups available. Create one to get started!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-2">
          {groups.map((group) => {
            const groupId = group._id || group.id || "";
            return (
              <div
                key={groupId}
                className="bg-white rounded-3xl overflow-hidden border border-zinc-200/60 shadow-[0_4px_30px_rgba(0,0,0,0.01)] hover:shadow-[0_8px_40px_rgba(0,0,0,0.03)] hover:scale-[1.01] transition-all flex flex-col justify-between"
              >
                {/* Colored Header Banner */}
                <div
                  className={`bg-gradient-to-r ${group.color} p-5 text-white flex flex-col gap-1`}
                >
                  <span className="text-[10px] font-black uppercase tracking-widest bg-white/20 w-fit px-2 py-0.5 rounded-full border border-white/10">
                    {group.grade}
                  </span>
                  <h3 className="text-lg font-black tracking-tight mt-1 truncate">
                    {group.name}
                  </h3>
                  <p className="text-white/80 text-xs font-medium truncate">
                    {group.subject}
                  </p>
                </div>

                {/* Metrics Panel */}
                <div className="p-5 flex flex-col gap-4">
                  <div className="grid grid-cols-3 gap-2 border-b border-zinc-100 pb-4 text-center">
                    <div className="flex flex-col">
                      <span className="text-[9px] font-bold text-zinc-400 uppercase">
                        Students
                      </span>
                      <span className="font-extrabold text-sm text-zinc-800 mt-0.5">
                        {group.studentsCount}
                      </span>
                    </div>
                    <div className="flex flex-col border-x border-zinc-100">
                      <span className="text-[9px] font-bold text-zinc-400 uppercase">
                        Active Tests
                      </span>
                      <span className="font-extrabold text-sm text-zinc-800 mt-0.5">
                        {group.activeAssignments}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[9px] font-bold text-zinc-400 uppercase">
                        Avg Score
                      </span>
                      <span className="font-extrabold text-sm text-emerald-600 mt-0.5">
                        {group.averageScore}
                      </span>
                    </div>
                  </div>

                  {/* Action buttons inside group */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDeleteGroup(groupId)}
                      className="flex-1 text-center py-2.5 bg-zinc-50 border border-zinc-200 hover:bg-rose-50 hover:border-rose-200 hover:text-rose-600 text-zinc-800 font-extrabold text-xs rounded-full transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-zinc-400 hover:text-rose-500" />
                      Delete Class
                    </button>
                    <button className="flex-1 text-center py-2.5 bg-black hover:bg-zinc-900 text-white font-extrabold text-xs rounded-full transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-1">
                      <span>Send Paper</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 🔮 Interactive Create Group Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 lg:p-8 w-full max-w-[440px] border border-zinc-200/50 shadow-2xl flex flex-col gap-5 relative animate-in slide-in-from-bottom-4 duration-300">
            <div>
              <h3 className="text-lg lg:text-xl font-black text-black uppercase tracking-tight">
                Create Batch Group
              </h3>
              <p className="text-[#5E5E5ECC] text-xs mt-0.5">
                Setup a new class to distribute exams instantly.
              </p>
            </div>

            <form onSubmit={handleCreateGroup} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-zinc-700 uppercase">
                  Group Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Class IX Chemistry"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  className="w-full bg-[#F5F5F5] outline-none text-zinc-800 font-bold px-4 py-3 rounded-xl border border-transparent focus:border-zinc-300 transition-all text-sm shadow-inner"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-zinc-700 uppercase">
                  Subject Details
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Inorganic Chemistry & Periodic Table"
                  value={newGroupSubject}
                  onChange={(e) => setNewGroupSubject(e.target.value)}
                  className="w-full bg-[#F5F5F5] outline-none text-zinc-800 font-bold px-4 py-3 rounded-xl border border-transparent focus:border-zinc-300 transition-all text-sm shadow-inner"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-zinc-700 uppercase">
                  Grade / Standard
                </label>
                <select
                  value={newGroupGrade}
                  onChange={(e) => setNewGroupGrade(e.target.value)}
                  className="w-full bg-[#F5F5F5] font-bold text-sm text-zinc-800 px-4 py-3 rounded-xl border border-transparent outline-none appearance-none cursor-pointer"
                >
                  <option value="Class VI">Class VI</option>
                  <option value="Class VII">Class VII</option>
                  <option value="Class VIII">Class VIII</option>
                  <option value="Grade 9">Grade 9</option>
                  <option value="Grade 10">Grade 10</option>
                  <option value="Class XI">Class XI</option>
                  <option value="Class XII">Class XII</option>
                </select>
              </div>

              <div className="flex gap-3 mt-4 pt-4 border-t border-zinc-100">
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold text-xs py-3.5 rounded-full transition-colors cursor-pointer active:scale-95 text-center disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 bg-black hover:bg-zinc-900 text-white font-bold text-xs py-3.5 rounded-full transition-all active:scale-[0.98] shadow-md text-center cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save Group</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
