"use client";

import {
  Plus,
  ArrowLeft,
  UploadCloud,
  Calendar,
  X,
  Minus,
  ArrowRight,
  ChevronDown,
} from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { BACKEND_URL } from "../config";

interface QuestionRow {
  id: string;
  type: string;
  count: number;
  marks: number;
}

const page = () => {
  const router = useRouter();

  // Form input states
  const [subject, setSubject] = useState("");
  const [topic, setTopic] = useState("");
  const [className, setClassName] = useState("Class V");
  const [timeAllotted, setTimeAllotted] = useState("45 minutes");
  const [fileUrl, setFileUrl] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [dueDate, setDueDate] = useState("");
  const [additionalInfo, setAdditionalInfo] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dynamic Question Types Rows
  const [questionRows, setQuestionRows] = useState<QuestionRow[]>([
    { id: "1", type: "mcq", count: 4, marks: 4 },
    { id: "2", type: "short", count: 4, marks: 4 },
  ]);

  const questionTypeOptions = [
    { value: "mcq", label: "Multiple Choice Questions" },
    { value: "short", label: "Short Questions" },
    { value: "long", label: "Long Questions" },
    { value: "diagram", label: "Diagram/Graph-Based Questions" },
    { value: "numerical", label: "Numerical Problems" },
  ];

  // Helper: Increment/Decrement Count
  const updateRowQuantity = (
    id: string,
    field: "count" | "marks",
    type: "inc" | "dec",
  ) => {
    setQuestionRows((prev) =>
      prev.map((row) => {
        if (row.id !== id) return row;
        const currentVal = row[field];
        const newVal =
          type === "inc" ? currentVal + 1 : Math.max(1, currentVal - 1);
        return { ...row, [field]: newVal };
      }),
    );
  };

  // Helper: Remove dynamic row
  const removeRow = (id: string) => {
    setQuestionRows((prev) => prev.filter((row) => row.id !== id));
  };

  // Helper: Add dynamic row
  const addQuestionRow = () => {
    const nextId = Date.now().toString();
    setQuestionRows((prev) => [
      ...prev,
      { id: nextId, type: "long", count: 5, marks: 5 },
    ]);
  };

  // Live calculations
  const totalQuestions = questionRows.reduce((sum, row) => sum + row.count, 0);
  const totalMarks = questionRows.reduce(
    (sum, row) => sum + row.count * row.marks,
    0,
  );

  // File upload handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Upload failed");
      }
      setFileUrl(data.url);
    } catch (err: any) {
      console.error("Upload error:", err);
      alert(`Upload failed: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  // Form submission handler
  const handleSubmit = async () => {
    if (!subject.trim()) return alert("Please enter a subject.");
    if (!topic.trim()) return alert("Please enter an assignment topic.");
    if (!dueDate) return alert("Please select a due date.");
    if (questionRows.length === 0)
      return alert("Please add at least one question type row.");

    setIsSubmitting(true);

    try {
      // Map frontend custom types to supported backend types (mcq, short, long)
      const mappedTypes = questionRows.map((row) => {
        if (row.type === "mcq") return "mcq";
        if (row.type === "short") return "short";
        return "long"; // map diagrams, numericals, etc. to long
      });

      const finalQuestionTypes = Array.from(new Set(mappedTypes));

      const userEmail =
        typeof window !== "undefined"
          ? localStorage.getItem("PrepStackai_user_email") || ""
          : "";

      const token = localStorage.getItem("PrepStackai_auth_token") || "";
      const response = await fetch(`${BACKEND_URL}/api/assignments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          subject,
          topic,
          dueDate,
          questionTypes: finalQuestionTypes,
          numQuestions: totalQuestions,
          totalMarks,
          instructions: additionalInfo,
          fileUrl,
          className,
          timeAllotted,
          createdBy: userEmail,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create assignment");
      }

      const data = await response.json();

      // Save notification to client localStorage
      try {
        const stored = localStorage.getItem(
          `PrepStackai_notifications_${userEmail}`,
        );
        const currentNotifications = stored ? JSON.parse(stored) : [];
        const newNotification = {
          id: Date.now().toString(),
          title: "New Assignment Drafted!",
          description: `${subject} - ${topic} (${className})`,
          link: `/assignment/${data.assignmentId}`,
          timestamp: "Just now",
          unread: true,
        };
        const updated = [newNotification, ...currentNotifications];
        localStorage.setItem(
          `PrepStackai_notifications_${userEmail}`,
          JSON.stringify(updated),
        );
        window.dispatchEvent(new Event("PrepStackai_notification_sync"));
      } catch (err) {
        console.error("Failed to save assignment notification:", err);
      }

      router.push(`/assignment/${data.assignmentId}`);
    } catch (err: any) {
      console.error(err);
      alert(err.message || "An error occurred while creating the assignment.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="lg:ml-84 lg:w-[70rem] w-full px-4 lg:px-0 py-4 lg:py-6 font-bricolage text-black min-h-[85vh] pb-24 relative flex flex-col gap-5 lg:gap-6">
      {/* 📱 Mobile Page Title & Back Arrow (Mockup 2) */}
      <div className="flex lg:hidden items-center gap-4 mt-2 px-1">
        <button
          onClick={() => router.back()}
          className="bg-[#EAEAEA] hover:bg-zinc-200 text-zinc-800 p-2.5 rounded-full cursor-pointer transition-colors shadow-sm flex items-center justify-center h-10 w-10 active:scale-95"
        >
          <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
        </button>
        <h2 className="text-xl font-bold tracking-tight text-zinc-800">
          Create Assignment
        </h2>
      </div>

      {/* 🟢 Desktop Top Title Banner Card (Hidden on Mobile) */}
      <div className="hidden lg:flex flex-col gap-1">
        <div className="flex items-center gap-3">
          <span className="w-3.5 h-3.5 rounded-full bg-[#82C43C] border-2 border-white shadow-md animate-pulse"></span>
          <h2 className="text-2xl font-bold text-black tracking-tight">
            Create Assignment
          </h2>
        </div>
        <p className="text-[#5E5E5ECC] text-sm pl-6.5">
          Set up a new assignment for your students
        </p>
      </div>

      {/* Stepper horizontal line */}
      <div className="relative w-full h-[3px] bg-zinc-200/85 rounded-full mb-1">
        <div className="absolute left-0 top-0 h-full w-1/2 bg-zinc-800 rounded-full transition-all duration-300"></div>
      </div>

      {/* Main Form details card (Mockup 2 Container) */}
      <div className="bg-white rounded-3xl p-5 lg:p-8 border border-zinc-200/60 shadow-[0_4px_40px_rgba(0,0,0,0.01)] flex flex-col gap-6 lg:gap-8">
        <div>
          <h3 className="text-lg lg:text-xl font-black text-black uppercase tracking-tight">
            Assignment Details
          </h3>
          <p className="text-[#5E5E5ECC] text-xs mt-0.5">
            Basic information about your assignment
          </p>
        </div>

        {/* Drag & Drop File Upload Box (Mockup 2) */}
        <div className="w-full">
          <div
            className={`relative border-2 border-dashed rounded-3xl p-6 lg:p-8 flex flex-col items-center justify-center transition-all duration-200 cursor-pointer ${
              fileUrl
                ? "border-emerald-500/50 bg-emerald-500/5"
                : "border-zinc-200 hover:border-zinc-300 bg-white"
            }`}
            onClick={() => document.getElementById("file-picker")?.click()}
          >
            <input
              id="file-picker"
              type="file"
              className="hidden"
              onChange={handleFileUpload}
              accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
            />

            {isUploading ? (
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-4 border-zinc-950 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-sm font-semibold text-zinc-500 animate-pulse">
                  Uploading file...
                </p>
              </div>
            ) : fileUrl ? (
              <div className="flex flex-col items-center gap-2">
                <span className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-black">
                  ✓
                </span>
                <p className="text-sm font-bold text-emerald-600">
                  Material Uploaded successfully!
                </p>
                <p className="text-[11px] text-zinc-400 truncate max-w-[300px]">
                  {fileUrl}
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <div className="bg-zinc-50 border border-zinc-100 p-3.5 rounded-full text-zinc-800 shadow-sm">
                  <UploadCloud className="w-6 h-6 stroke-[1.8]" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-black text-black leading-tight">
                    Choose a file or drag & drop it here
                  </p>
                  <p className="text-[10px] lg:text-xs text-[#5E5E5ECC] mt-1 font-bold">
                    JPEG, PNG, upto 10MB
                  </p>
                </div>
                <button
                  type="button"
                  className="bg-white border border-zinc-200 hover:bg-zinc-50 text-black font-extrabold text-xs px-6 py-2.5 rounded-full transition-all shadow-sm active:scale-95"
                >
                  Browse Files
                </button>
              </div>
            )}
          </div>
          <p className="text-[#5E5E5ECC] text-[11px] text-center mt-2.5 font-semibold">
            Upload images of your preferred document/image
          </p>
        </div>

        {/* 🆕 Subject and Topic Inputs (Responsive Stacked Grid) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-xs lg:text-sm font-black text-black uppercase tracking-wide">
              Subject
            </label>
            <input
              type="text"
              placeholder="e.g. Science, English..."
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full bg-[#F5F5F5] hover:bg-[#EFEFEF] focus:bg-[#EAEAEA] outline-none text-zinc-800 font-bold px-4 py-3 rounded-xl border border-transparent focus:border-zinc-300 transition-all text-xs lg:text-sm shadow-inner"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs lg:text-sm font-black text-black uppercase tracking-wide">
              Topic
            </label>
            <input
              type="text"
              placeholder="e.g. Electroplating, NCERT..."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full bg-[#F5F5F5] hover:bg-[#EFEFEF] focus:bg-[#EAEAEA] outline-none text-zinc-800 font-bold px-4 py-3 rounded-xl border border-transparent focus:border-zinc-300 transition-all text-xs lg:text-sm shadow-inner"
            />
          </div>
        </div>

        {/* 🆕 Class & Time Inputs (Responsive Stacked Grid) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-xs lg:text-sm font-black text-black uppercase tracking-wide">
              Class / Grade
            </label>
            <input
              type="text"
              placeholder="e.g. Class VIII, Grade 10..."
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              className="w-full bg-[#F5F5F5] hover:bg-[#EFEFEF] focus:bg-[#EAEAEA] outline-none text-zinc-800 font-bold px-4 py-3 rounded-xl border border-transparent focus:border-zinc-300 transition-all text-xs lg:text-sm shadow-inner"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs lg:text-sm font-black text-black uppercase tracking-wide">
              Time Allotted
            </label>
            <input
              type="text"
              placeholder="e.g. 45 minutes, 3 Hours..."
              value={timeAllotted}
              onChange={(e) => setTimeAllotted(e.target.value)}
              className="w-full bg-[#F5F5F5] hover:bg-[#EFEFEF] focus:bg-[#EAEAEA] outline-none text-zinc-800 font-bold px-4 py-3 rounded-xl border border-transparent focus:border-zinc-300 transition-all text-xs lg:text-sm shadow-inner"
            />
          </div>
        </div>

        {/* Due Date Selector (Mockup 2) */}
        <div className="flex flex-col gap-2">
          <label className="text-xs lg:text-sm font-black text-black uppercase tracking-wide">
            Due Date
          </label>
          <div className="relative w-full">
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              placeholder="DD-MM-YYYY"
              className="w-full bg-[#F5F5F5] hover:bg-[#EFEFEF] focus:bg-[#EAEAEA] outline-none text-zinc-800 font-bold px-4 py-3.5 rounded-xl border border-transparent focus:border-zinc-300 transition-all text-xs lg:text-sm shadow-inner appearance-none"
            />
            <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-zinc-500 pointer-events-none" />
          </div>
        </div>

        {/* Dynamic Question Type Row Builders */}
        <div className="flex flex-col gap-3 lg:gap-4">
          <label className="text-xs lg:text-sm font-black text-black uppercase tracking-wide">
            Question Type
          </label>

          {/* Desktop view headers */}
          <div className="hidden lg:grid grid-cols-[1fr_auto_130px_130px] gap-4 px-2">
            <span className="text-sm font-bold text-zinc-500">Type</span>
            <span className="w-5"></span>
            <span className="text-sm font-bold text-zinc-500 text-center">
              No. of Questions
            </span>
            <span className="text-sm font-bold text-zinc-500 text-center">
              Marks
            </span>
          </div>

          {/* Dynamic Question Types List (Mockup 2 Layout for Mobile vs Table for Desktop) */}
          <div className="flex flex-col gap-4">
            {questionRows.map((row) => (
              <React.Fragment key={row.id}>
                {/* 💻 Desktop Table Row Layout */}
                <div className="hidden lg:grid grid-cols-[1fr_auto_130px_130px] items-center gap-4">
                  <div className="relative">
                    <select
                      value={row.type}
                      onChange={(e) => {
                        const val = e.target.value;
                        setQuestionRows((prev) =>
                          prev.map((r) =>
                            r.id === row.id ? { ...r, type: val } : r,
                          ),
                        );
                      }}
                      className="w-full bg-[#F5F5F5] font-bold text-sm text-zinc-800 px-4 py-3 rounded-xl border border-transparent outline-none appearance-none cursor-pointer pr-10"
                    >
                      {questionTypeOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
                  </div>

                  <button
                    onClick={() => removeRow(row.id)}
                    className="p-2 text-zinc-400 hover:text-rose-500 rounded-full hover:bg-rose-50 transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  {/* Quantity */}
                  <div className="flex items-center justify-between bg-[#F5F5F5] p-1.5 rounded-full w-[130px]">
                    <button
                      onClick={() => updateRowQuantity(row.id, "count", "dec")}
                      className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-zinc-500 hover:bg-zinc-100 cursor-pointer shadow-sm active:scale-95"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="font-bold text-black text-sm">
                      {row.count}
                    </span>
                    <button
                      onClick={() => updateRowQuantity(row.id, "count", "inc")}
                      className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-zinc-500 hover:bg-zinc-100 cursor-pointer shadow-sm active:scale-95"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Marks */}
                  <div className="flex items-center justify-between bg-[#F5F5F5] p-1.5 rounded-full w-[130px]">
                    <button
                      onClick={() => updateRowQuantity(row.id, "marks", "dec")}
                      className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-zinc-500 hover:bg-zinc-100 cursor-pointer shadow-sm active:scale-95"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="font-bold text-black text-sm">
                      {row.marks}
                    </span>
                    <button
                      onClick={() => updateRowQuantity(row.id, "marks", "inc")}
                      className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-zinc-500 hover:bg-zinc-100 cursor-pointer shadow-sm active:scale-95"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* 📱 Mobile Card Layout (Mockup 2) */}
                <div className="flex lg:hidden flex-col gap-4 border border-zinc-200/80 rounded-3xl p-4 bg-[#FAFADA]/20 shadow-sm relative">
                  {/* Selector Header */}
                  <div className="flex justify-between items-center gap-3">
                    <div className="relative flex-1">
                      <select
                        value={row.type}
                        onChange={(e) => {
                          const val = e.target.value;
                          setQuestionRows((prev) =>
                            prev.map((r) =>
                              r.id === row.id ? { ...r, type: val } : r,
                            ),
                          );
                        }}
                        className="w-full bg-white font-bold text-xs text-zinc-800 px-4 py-2.5 rounded-xl border border-zinc-200 outline-none appearance-none cursor-pointer pr-10 shadow-sm"
                      >
                        {questionTypeOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                    </div>

                    <button
                      onClick={() => removeRow(row.id)}
                      className="p-1.5 bg-zinc-50 border border-zinc-200 text-zinc-400 hover:text-rose-500 rounded-full transition-colors cursor-pointer shadow-sm"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Dual Counter Rows */}
                  <div className="grid grid-cols-2 gap-3">
                    {/* No. of Questions */}
                    <div className="flex flex-col gap-1 bg-[#F5F5F5] p-3 rounded-2xl items-center shadow-inner">
                      <span className="text-[9px] font-black text-zinc-400 uppercase tracking-wider">
                        No. of Questions
                      </span>
                      <div className="flex items-center justify-between bg-white px-2 py-1 rounded-full w-full max-w-[100px] border border-zinc-200/60 shadow-sm mt-1.5">
                        <button
                          onClick={() =>
                            updateRowQuantity(row.id, "count", "dec")
                          }
                          className="w-6 h-6 rounded-full bg-zinc-50 flex items-center justify-center text-zinc-500 hover:bg-zinc-100 cursor-pointer"
                        >
                          <Minus className="w-3.5 h-3.5 stroke-[2.5]" />
                        </button>
                        <span className="font-black text-black text-xs">
                          {row.count}
                        </span>
                        <button
                          onClick={() =>
                            updateRowQuantity(row.id, "count", "inc")
                          }
                          className="w-6 h-6 rounded-full bg-zinc-50 flex items-center justify-center text-zinc-500 hover:bg-zinc-100 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                        </button>
                      </div>
                    </div>

                    {/* Marks Counter */}
                    <div className="flex flex-col gap-1 bg-[#F5F5F5] p-3 rounded-2xl items-center shadow-inner">
                      <span className="text-[9px] font-black text-zinc-400 uppercase tracking-wider">
                        Marks
                      </span>
                      <div className="flex items-center justify-between bg-white px-2 py-1 rounded-full w-full max-w-[100px] border border-zinc-200/60 shadow-sm mt-1.5">
                        <button
                          onClick={() =>
                            updateRowQuantity(row.id, "marks", "dec")
                          }
                          className="w-6 h-6 rounded-full bg-zinc-50 flex items-center justify-center text-zinc-500 hover:bg-zinc-100 cursor-pointer"
                        >
                          <Minus className="w-3.5 h-3.5 stroke-[2.5]" />
                        </button>
                        <span className="font-black text-black text-xs">
                          {row.marks}
                        </span>
                        <button
                          onClick={() =>
                            updateRowQuantity(row.id, "marks", "inc")
                          }
                          className="w-6 h-6 rounded-full bg-zinc-50 flex items-center justify-center text-zinc-500 hover:bg-zinc-100 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </React.Fragment>
            ))}
          </div>

          {/* Add question type button (Mockup 2 CTA style) */}
          <button
            onClick={addQuestionRow}
            className="flex items-center gap-2 font-bold text-black text-xs lg:text-sm hover:underline w-fit mt-3 cursor-pointer"
          >
            <div className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center shadow-sm">
              <Plus className="w-4 h-4 stroke-[2.5]" />
            </div>
            <span>Add Question Type</span>
          </button>
        </div>

        {/* Calculations and additional settings */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 border-t border-zinc-100 pt-6 mt-2">
          {/* Calculations */}
          <div className="flex gap-6 text-[11px] lg:text-sm font-bold text-black">
            <div>
              Total Questions :{" "}
              <span className="text-zinc-500 font-extrabold">
                {totalQuestions}
              </span>
            </div>
            <div>
              Total Marks :{" "}
              <span className="text-zinc-500 font-extrabold">{totalMarks}</span>
            </div>
          </div>
        </div>

        {/* Additional instructions */}
        <div className="flex flex-col gap-2.5">
          <label className="text-xs lg:text-sm font-black text-black uppercase tracking-wide">
            Additional Information (For better output)
          </label>
          <textarea
            value={additionalInfo}
            onChange={(e) => setAdditionalInfo(e.target.value)}
            placeholder="e.g Generate a question paper for 3 hour exam duration..."
            rows={4}
            className="w-full bg-[#F5F5F5] hover:bg-[#EFEFEF] focus:bg-[#EAEAEA] outline-none text-zinc-800 font-bold px-4 py-3.5 rounded-2xl border border-transparent focus:border-zinc-300 transition-all text-xs lg:text-sm resize-none shadow-inner"
          />
        </div>

        {/* Stepper Buttons Inside Card (Mockup 2 Style) */}
        <div className="flex items-center justify-between mt-4 pt-6 border-t border-zinc-100 w-full">
          <Link href="/assignment">
            <button className="flex items-center gap-2 bg-white hover:bg-zinc-50 border border-zinc-200 text-black font-extrabold px-6 py-3 rounded-full transition-all cursor-pointer text-xs lg:text-sm shadow-sm active:scale-95">
              <ArrowLeft className="w-4 h-4 stroke-[2]" />
              <span>Previous</span>
            </button>
          </Link>

          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex items-center gap-2 bg-black hover:bg-zinc-900 text-white font-extrabold px-8 py-3 rounded-full transition-all cursor-pointer text-xs lg:text-sm shadow-md active:scale-95 disabled:bg-zinc-400"
          >
            <span>{isSubmitting ? "Generating..." : "Next"}</span>
            <ArrowRight className="w-4 h-4 stroke-[2]" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default page;
