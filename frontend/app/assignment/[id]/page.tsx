"use client";

import React, { useState, useEffect, use } from "react";
import {
  ArrowLeft,
  Download,
  Printer,
  Loader2,
  Sparkles,
  Clock,
  BookOpen,
  FileCheck,
  CheckCircle2,
  AlertCircle,
  Server,
  BrainCircuit,
  KeyRound,
  Layers,
  Search,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { BACKEND_URL } from "../../config";
import { io } from "socket.io-client";

interface Question {
  text: string;
  type: "mcq" | "short" | "long";
  difficulty: "easy" | "medium" | "hard";
  marks: number;
  section: string;
  answer?: string;
}

interface Section {
  title: string;
  instruction: string;
  questions: Question[];
}

interface PaperData {
  _id: string;
  assignmentId: string;
  title: string;
  sections: Section[];
  totalMarks: number;
  createdAt: string;
}

interface AssignmentData {
  _id: string;
  subject: string;
  topic: string;
  dueDate: string;
  totalMarks: number;
  numQuestions: number;
  status: "pending" | "processing" | "completed" | "failed";
  className?: string;
  timeAllotted?: string;
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function AssignmentOutputPage({ params }: PageProps) {
  // Unwrap Next.js 16 dynamics params using React.use()
  const { id } = use(params);

  const [assignment, setAssignment] = useState<AssignmentData | null>(null);
  const [paper, setPaper] = useState<PaperData | null>(null);
  const [status, setStatus] = useState<
    "pending" | "processing" | "completed" | "failed"
  >("pending");
  const [loading, setLoading] = useState(true);
  const [progressStep, setProgressStep] = useState(0);
  const [schoolName, setSchoolName] = useState("");

  const progressSteps = [
    "Submitting request to PrepStackAI generation queue...",
    "Retrieving context syllabus and attached documents...",
    "Formulating custom curriculum questions",
    "Generating detailed solutions for your Answer Key...",
    "Polishing section layout & metadata...",
  ];

  // Action state management
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfAnswerLoading, setPdfAnswerLoading] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);

  // Trigger Gemini paper re-generation via backend queue
  const handleRegenerate = async () => {
    if (isRegenerating) return;
    if (
      !confirm(
        "Are you sure you want to regenerate this question paper? This will formulate a fresh set of questions based on your original criteria.",
      )
    )
      return;

    setIsRegenerating(true);
    setStatus("pending");
    setProgressStep(0);

    try {
      const token = localStorage.getItem("PrepStackai_auth_token") || "";
      const res = await fetch(
        `${BACKEND_URL}/api/assignments/${id}/regenerate`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      if (!res.ok) throw new Error("Regeneration failed");
    } catch (err) {
      console.error("Regeneration failed:", err);
      alert("Failed to trigger re-generation. Reverting back.");
      setStatus("completed");
    } finally {
      setIsRegenerating(false);
    }
  };

  // High-fidelity A4 Printable PDF Generation (proper styling, no raw HTML window printing)
  const handleDownloadPDF = async () => {
    const element = document.getElementById("printable-paper-sheet");
    if (!element) return;

    setPdfLoading(true);

    try {
      // Dynamic lazy imports of heavy DOM manipulation libraries
      const { jsPDF } = await import("jspdf");
      const html2canvas = (await import("html2canvas-pro")).default;

      const canvas = await html2canvas(element, {
        scale: 2, // High resolution (super crisp text print)
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      // Add first page
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Wrap multi-page spans recursively
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(
        `PrepStackAI_Paper_${assignment?.topic || "Question_Paper"}.pdf`,
      );
    } catch (err: any) {
      console.error("Failed to generate PDF:", err);
      alert(
        `Failed to render PDF document: ${err?.message || err}. Falling back to browser print framework.`,
      );
      window.print();
    } finally {
      setPdfLoading(false);
    }
  };

  // High-fidelity A4 Printable Answer Key PDF Generation
  const handleDownloadAnswerKeyPDF = async () => {
    const element = document.getElementById("printable-answer-key-sheet");
    if (!element) return;

    setPdfAnswerLoading(true);

    try {
      const { jsPDF } = await import("jspdf");
      const html2canvas = (await import("html2canvas-pro")).default;

      const canvas = await html2canvas(element, {
        scale: 2, // High resolution
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      // Add first page
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Wrap multi-page spans recursively
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(
        `PrepStackAI_AnswerKey_${assignment?.topic || "Answer_Key"}.pdf`,
      );
    } catch (err: any) {
      console.error("Failed to generate Answer Key PDF:", err);
      alert(`Failed to render Answer Key PDF document: ${err?.message || err}`);
    } finally {
      setPdfAnswerLoading(false);
    }
  };

  // Highlight Difficulty visually with modern curating HSL color pills
  const getDifficultyBadge = (difficulty: string) => {
    const diff = (difficulty || "medium").toLowerCase();
    if (diff === "easy") {
      return (
        <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200/50 rounded-full px-2.5 py-0.5 mr-2.5 print:border-zinc-400">
          Easy
        </span>
      );
    } else if (diff === "medium") {
      return (
        <span className="text-[10px] font-black uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200/50 rounded-full px-2.5 py-0.5 mr-2.5 print:border-zinc-400">
          Medium
        </span>
      );
    } else {
      return (
        <span className="text-[10px] font-black uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200/50 rounded-full px-2.5 py-0.5 mr-2.5 print:border-zinc-400">
          Hard
        </span>
      );
    }
  };

  // Fetch Assignment and Paper on Mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Read dynamic school details from profile
        const userEmail = localStorage.getItem("PrepStackai_user_email") || "";
        const stored = localStorage.getItem(`PrepStackai_profile_${userEmail}`);
        if (stored) {
          const profile = JSON.parse(stored);
          if (profile.schoolName) {
            setSchoolName(
              profile.schoolName +
                (profile.schoolAddress ? `, ${profile.schoolAddress}` : ""),
            );
          }
        }

        const token = localStorage.getItem("PrepStackai_auth_token") || "";
        const resAssignment = await fetch(
          `${BACKEND_URL}/api/assignments/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
        if (!resAssignment.ok) throw new Error("Assignment not found");
        const assignmentData = await resAssignment.json();
        setAssignment(assignmentData);
        setStatus(assignmentData.status);

        if (assignmentData.status === "completed") {
          const resPaper = await fetch(`${BACKEND_URL}/api/papers/${id}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          if (resPaper.ok) {
            const paperData = await resPaper.json();
            setPaper(paperData);
          }
        }
      } catch (err) {
        console.error("Error loading data:", err);
        setStatus("failed");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // Real-time Socket.io generation completes
  useEffect(() => {
    if (status === "completed" || status === "failed") return;

    const socket = io(BACKEND_URL);

    socket.on("connect", () => {
      console.log("Connected to PrepStackAI WebSockets");
    });

    socket.on("generation:complete", async (data) => {
      if (data.assignmentId === id) {
        setStatus("completed");

        const userEmail = localStorage.getItem("PrepStackai_user_email") || "";

        // Save success notification to client localStorage
        try {
          const stored = localStorage.getItem(
            `PrepStackai_notifications_${userEmail}`,
          );
          const currentNotifications = stored ? JSON.parse(stored) : [];
          const newNotification = {
            id: Date.now().toString(),
            title: "Question Paper Ready! ✨",
            description: `PrepStackAI has successfully generated the question paper and answer key for "${assignment?.topic || "your assignment"}".`,
            link: `/assignment/${id}`,
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
          console.error("Failed to save complete notification:", err);
        }

        try {
          const token = localStorage.getItem("PrepStackai_auth_token") || "";
          const resPaper = await fetch(`${BACKEND_URL}/api/papers/${id}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          if (resPaper.ok) {
            const paperData = await resPaper.json();
            setPaper(paperData);
          }
        } catch (err) {
          console.error("Failed to load freshly generated paper:", err);
        }
      }
    });

    socket.on("generation:failed", (data) => {
      if (data.assignmentId === id) {
        setStatus("failed");
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [id, status]);

  // Polling fallback: periodically check assignment status in case Socket.IO misses the event
  useEffect(() => {
    if (status === "completed" || status === "failed") return;

    const poll = async () => {
      try {
        const token = localStorage.getItem("PrepStackai_auth_token") || "";
        const res = await fetch(`${BACKEND_URL}/api/assignments/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return;
        const data = await res.json();

        if (data.status === "completed") {
          setStatus("completed");
          // Fetch the generated paper
          try {
            const resPaper = await fetch(`${BACKEND_URL}/api/papers/${id}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            if (resPaper.ok) {
              const paperData = await resPaper.json();
              setPaper(paperData);
            }
          } catch (err) {
            console.error("Polling: Failed to fetch paper:", err);
          }
        } else if (data.status === "failed") {
          setStatus("failed");
        }
      } catch (err) {
        console.error("Polling: Failed to check assignment status:", err);
      }
    };

    const interval = setInterval(poll, 8000);
    return () => clearInterval(interval);
  }, [id, status]);

  // Simulated Stepper Progress ticks during loading
  useEffect(() => {
    if (status === "processing" || status === "pending") {
      const interval = setInterval(() => {
        setProgressStep((prev) => {
          if (prev < progressSteps.length - 1) return prev + 1;
          return prev;
        });
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [status]);

  if (loading) {
    return (
      <div className="lg:ml-84 lg:w-[70rem] w-full px-4 lg:px-0 py-12 flex flex-col items-center justify-center min-h-[60vh] font-bricolage text-black">
        <Loader2 className="w-10 h-10 animate-spin text-zinc-800 mb-4" />
        <p className="font-semibold text-zinc-500 animate-pulse">
          Initializing PrepStackAI...
        </p>
      </div>
    );
  }

  // 🚀 Loading State: Premium Waiting Dashboard
  if (status === "pending" || status === "processing") {
    // Array of premium step icons to render next to stepper lines
    const stepIcons = [
      <Server className="w-4 h-4" />,
      <Search className="w-4 h-4" />,
      <BrainCircuit className="w-4 h-4" />,
      <KeyRound className="w-4 h-4" />,
      <Layers className="w-4 h-4" />,
    ];

    return (
      <div className="lg:ml-84 lg:w-[70rem] w-full px-4 lg:px-0 py-12 flex flex-col items-center justify-center min-h-[80vh] font-bricolage text-black relative">
        {/* Ambient Radial Background Glows */}
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] rounded-full bg-zinc-100/50 blur-3xl -z-10"></div>

        {/* Dynamic Generative Loading Container */}
        <div className="relative w-full max-w-[550px] bg-white rounded-3xl p-10 border border-zinc-200/60 shadow-[0_12px_45px_rgba(0,0,0,0.03)] flex flex-col gap-8 text-center overflow-hidden">
          {/* Glowing Center Minimalist Visual (No spinning dashed rings, clean nested circles) */}
          <div className="flex justify-center mb-1">
            <div className="relative flex items-center justify-center w-24 h-24">
              {/* Clean, solid concentric rings */}
              <div className="absolute inset-0 rounded-full border border-zinc-100 bg-zinc-50/50"></div>
              <div className="absolute inset-3 rounded-full border border-zinc-200/60 bg-white shadow-sm"></div>

              {/* Core Icon (No blinking/pulsing animation) */}
              <div className="relative w-13 h-13 rounded-full bg-[#121212] flex items-center justify-center text-white shadow-md">
                <Sparkles className="w-5.5 h-5.5 text-amber-300 fill-amber-300/10" />
              </div>
            </div>
          </div>

          {/* Stepper Headers */}
          <div>
            <h2 className="text-2xl font-black tracking-tight text-zinc-950">
              Crafting Your Question Paper
            </h2>
            <p className="text-zinc-500 text-sm mt-1.5 leading-relaxed max-w-[400px] mx-auto">
              Our AI agent model is dynamically extracting files and generating
              syllabus questions for you.
            </p>
          </div>

          {/* Stepper Status stack, beautifully clean card-styled */}
          <div className="flex flex-col gap-3 text-left">
            {progressSteps.map((step, idx) => {
              const isCompleted = idx < progressStep;
              const isCurrent = idx === progressStep;

              return (
                <div
                  key={idx}
                  className={`flex items-center justify-between p-3.5 px-4 rounded-2xl border transition-all duration-300 ${
                    isCurrent
                      ? "bg-zinc-50 border-zinc-300 shadow-sm"
                      : isCompleted
                        ? "bg-white border-zinc-100/80"
                        : "bg-white border-zinc-100/50 opacity-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Dynamic step-specific lucide icons */}
                    <div
                      className={`p-2 rounded-xl flex items-center justify-center transition-all ${
                        isCompleted
                          ? "bg-emerald-50 text-emerald-600"
                          : isCurrent
                            ? "bg-zinc-900 text-white"
                            : "bg-zinc-50 text-zinc-400 border border-zinc-100"
                      }`}
                    >
                      {stepIcons[idx]}
                    </div>

                    <span
                      className={`text-sm font-semibold transition-colors duration-200 ${
                        isCurrent
                          ? "text-zinc-950 font-bold"
                          : isCompleted
                            ? "text-zinc-500 font-medium"
                            : "text-zinc-400"
                      }`}
                    >
                      {step}
                    </span>
                  </div>

                  {/* Right side indicator */}
                  <div>
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-50" />
                    ) : isCurrent ? (
                      <Loader2 className="w-4 h-4 text-zinc-900 animate-spin" />
                    ) : (
                      <div className="w-4.5 h-4.5 rounded-full border border-zinc-200 bg-white"></div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Stepper warning notes footer (No blinking/pinging animations) */}
          <div className="text-xs text-zinc-500 italic mt-1.5 flex items-center justify-center gap-2 bg-zinc-50 p-3.5 rounded-2xl border border-zinc-100/50">
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-400"></span>
            <span>
              This will take approximately 15-30 seconds. Do not refresh this
              page.
            </span>
          </div>
        </div>
      </div>
    );
  }

  // ❌ Error State: Generative failure block
  if (status === "failed" || !assignment) {
    return (
      <div className="lg:ml-84 lg:w-[70rem] w-full px-4 lg:px-0 py-12 flex flex-col items-center justify-center min-h-[60vh] font-bricolage text-black">
        <div className="w-full max-w-[480px] bg-white rounded-3xl p-8 border border-zinc-200/50 shadow-lg text-center flex flex-col gap-5">
          <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto">
            <AlertCircle className="w-10 h-10" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-zinc-900">
              Failed to Generate Paper
            </h2>
            <p className="text-sm text-zinc-500 mt-2">
              Gemini was unable to structuralize your paper with the current
              configuration constraints.
            </p>
          </div>
          <Link href="/create-assignment">
            <button className="w-full bg-black hover:bg-zinc-900 text-white font-bold py-3.5 rounded-full transition-colors cursor-pointer text-sm">
              Adjust Criteria & Try Again
            </button>
          </Link>
        </div>
      </div>
    );
  }

  // 🎉 Success State: Premium Printable Output Viewer
  return (
    <div className="lg:ml-84 lg:w-[70rem] w-full px-4 lg:px-0 py-4 min-h-[85vh] font-bricolage text-black pb-24 print:m-0 print:p-0 print:ml-0 print:w-full">
      <div className="flex flex-col gap-6">
        {/* Dark Charcoal Teacher Notification & Action Box */}
        <div className="print:hidden bg-[#232323] text-white rounded-3xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-zinc-800 shadow-[0_8px_30px_rgba(0,0,0,0.15)]">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400 fill-amber-400" />
              Certainly, Teacher! Here is your customized Question Paper:
            </h3>
            <p className="text-zinc-400 text-sm mt-1 leading-relaxed">
              Successfully generated for class{" "}
              <span className="font-bold text-white">{assignment.subject}</span>{" "}
              regarding topic{" "}
              <span className="font-bold text-white">{assignment.topic}</span>.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            {/* Regenerate Action Button */}
            <button
              onClick={handleRegenerate}
              disabled={isRegenerating}
              className="flex items-center gap-2 bg-[#333333] hover:bg-[#444444] disabled:bg-zinc-800 text-white font-bold px-6 py-3.5 rounded-full transition-all cursor-pointer text-sm border border-zinc-700 shadow-md active:scale-95 disabled:opacity-50"
            >
              {isRegenerating ? (
                <Loader2 className="w-4 h-4 animate-spin text-zinc-400" />
              ) : (
                <RefreshCw className="w-4 h-4 text-zinc-300" />
              )}
              Regenerate Paper
            </button>

            {/* Premium PDF Download Action Button */}
            <button
              onClick={handleDownloadPDF}
              disabled={pdfLoading}
              className="flex items-center gap-2 bg-white hover:bg-zinc-100 disabled:bg-zinc-100 text-black font-bold px-6 py-3.5 rounded-full transition-all cursor-pointer text-sm shadow-md active:scale-95 disabled:opacity-50"
            >
              {pdfLoading ? (
                <Loader2 className="w-4.5 h-4.5 animate-spin text-zinc-400" />
              ) : (
                <Download className="w-4.5 h-4.5" />
              )}
              {pdfLoading ? "Generating Paper..." : "Download Paper (PDF)"}
            </button>

            {/* Premium Answer Key Download Button */}
            <button
              onClick={handleDownloadAnswerKeyPDF}
              disabled={pdfAnswerLoading}
              className="flex items-center gap-2 bg-[#333333] hover:bg-[#444444] disabled:bg-zinc-800 text-white font-bold px-6 py-3.5 rounded-full transition-all cursor-pointer text-sm shadow-md active:scale-95 disabled:opacity-50 border border-zinc-700"
            >
              {pdfAnswerLoading ? (
                <Loader2 className="w-4.5 h-4.5 animate-spin text-zinc-400" />
              ) : (
                <FileCheck className="w-4.5 h-4.5 text-zinc-300" />
              )}
              {pdfAnswerLoading
                ? "Generating Key..."
                : "Download Answer Key (PDF)"}
            </button>
          </div>
        </div>

        {/* 📄 Elegant Printable A4 Paper Sheet Wrapper */}
        <div
          id="printable-paper-sheet"
          className="bg-white rounded-3xl p-12 border border-zinc-200/50 shadow-[0_4px_40px_rgba(0,0,0,0.02)] flex flex-col gap-6 w-full print:border-none print:shadow-none print:p-0 print:m-0"
        >
          {/* Centered Institutional Banner */}
          <div className="text-center flex flex-col gap-1.5 border-b-2 border-black pb-4">
            <h2 className="text-2xl font-black text-black uppercase tracking-wide">
              {schoolName}
            </h2>
            <div className="flex justify-center gap-6 text-sm font-bold text-zinc-700 uppercase">
              <span>Subject: {assignment.subject}</span>
              <span>•</span>
              <span>Class: {assignment.className || "Not specified"}</span>
            </div>
          </div>

          {/* Marks & Time Header row */}
          <div className="flex justify-between items-center text-sm font-bold border-b border-dashed border-zinc-300 pb-2">
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 print:hidden" />
              Time Allowed: {assignment.timeAllotted || "Not specified"}
            </span>
            <span className="flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 print:hidden" />
              Maximum Marks: {assignment.totalMarks}
            </span>
          </div>

          <p className="text-sm font-bold italic text-zinc-800">
            All questions are compulsory unless stated otherwise.
          </p>

          {/* Student Identifiers */}
          <div className="grid grid-cols-2 gap-y-3.5 gap-x-8 text-sm font-bold py-3.5 px-5 border border-zinc-200 rounded-2xl bg-zinc-50/50 print:bg-transparent print:rounded-none">
            <div>Name: ________________________</div>
            <div>Roll Number: _________________</div>
            <div className="col-span-2">
              Class: {assignment.className || "Not specified"} Section:
              __________
            </div>
          </div>

          {/* Sections Loader */}
          {paper?.sections.map((section, sIdx) => (
            <div key={sIdx} className="flex flex-col gap-4 mt-6">
              {/* Section Header */}
              <div className="text-center font-black text-base uppercase tracking-wider py-1.5 bg-zinc-100 rounded-xl print:bg-transparent print:border print:border-black">
                {section.title}
              </div>

              {/* Section Directives */}
              <div className="flex flex-col">
                <h4 className="font-bold text-black text-sm uppercase">
                  {section.title} Details
                </h4>
                <p className="text-zinc-500 text-xs italic mt-0.5">
                  {section.instruction}
                </p>
              </div>

              {/* Questions Stack */}
              <div className="flex flex-col gap-4 pl-1">
                {section.questions.map((question, qIdx) => (
                  <div
                    key={qIdx}
                    className="flex items-start gap-3.5 text-sm leading-relaxed"
                  >
                    <span className="font-bold">{qIdx + 1}.</span>
                    <div className="flex-1 flex justify-between gap-6">
                      <div className="flex-1">
                        {getDifficultyBadge(question.difficulty)}
                        <span className="text-zinc-900 font-semibold">
                          {question.text}
                        </span>
                      </div>
                      <span className="font-bold text-zinc-600 whitespace-nowrap">
                        [{question.marks} Marks]
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Divider */}
          <div className="text-center font-bold text-xs tracking-widest border-t border-zinc-100 pt-8 mt-6">
            --- END OF QUESTION PAPER ---
          </div>
        </div>

        {/* 🔑 AI Answer Key Section (Separate Printable Container with print:hidden so it never prints to students) */}
        {paper && (
          <div
            id="printable-answer-key-sheet"
            className="bg-white rounded-3xl p-12 border border-zinc-200/50 shadow-[0_4px_40px_rgba(0,0,0,0.02)] flex flex-col gap-6 w-full print:hidden"
          >
            {/* Centered Institutional Banner branded for Teacher reference */}
            <div className="text-center flex flex-col gap-1.5 border-b-2 border-black pb-4">
              <h2 className="text-2xl font-black text-black uppercase tracking-wide">
                {schoolName}
              </h2>
              <div className="flex justify-center gap-6 text-sm font-bold text-zinc-700 uppercase">
                <span>Subject: {assignment.subject}</span>
                <span>•</span>
                <span>Class: {assignment.className || "Not specified"}</span>
              </div>
              <h3 className="text-base font-black text-amber-600 uppercase tracking-widest mt-1">
                Official Answer Key & Marking Scheme
              </h3>
            </div>

            <div className="flex flex-col gap-6">
              {paper.sections.map((section, sIdx) => (
                <div key={sIdx} className="flex flex-col gap-3">
                  <h4 className="font-bold text-black text-xs uppercase tracking-wide bg-zinc-50 px-3 py-1.5 rounded border-l-4 border-zinc-800">
                    {section.title} Solutions
                  </h4>

                  <div className="flex flex-col gap-4">
                    {section.questions.map((question, qIdx) => (
                      <div
                        key={qIdx}
                        className="flex flex-col gap-1.5 text-sm leading-relaxed pl-1"
                      >
                        <div className="font-bold text-zinc-900 flex justify-between">
                          <span>Q{qIdx + 1}. Correct Answer Key:</span>
                          <span className="text-xs text-zinc-500 font-semibold">
                            [{question.marks} M]
                          </span>
                        </div>
                        <div className="text-zinc-600 pl-4 border-l-2 border-zinc-300 italic">
                          {question.answer ||
                            "Provide step-by-step curriculum verification guidelines."}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bottom Navigator controls */}
        <div className="flex items-center justify-between mt-4 print:hidden">
          <Link href="/create-assignment">
            <button className="flex items-center gap-2 bg-white hover:bg-zinc-50 border border-zinc-200 text-black font-bold px-6 py-3 rounded-full transition-colors cursor-pointer text-sm">
              <ArrowLeft className="w-4.5 h-4.5" />
              Create Another
            </button>
          </Link>

          <div className="flex gap-3">
            {/* Bottom Regenerate Button */}
            <button
              onClick={handleRegenerate}
              disabled={isRegenerating}
              className="flex items-center gap-2 bg-white hover:bg-zinc-50 border border-zinc-200 text-black font-bold px-6 py-3 rounded-full transition-all cursor-pointer text-sm active:scale-95 disabled:opacity-50"
            >
              {isRegenerating ? (
                <Loader2 className="w-4.5 h-4.5 animate-spin" />
              ) : (
                <RefreshCw className="w-4.5 h-4.5" />
              )}
              Regenerate Paper
            </button>

            {/* Bottom print button */}
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 bg-black hover:bg-zinc-900 text-white font-bold px-6 py-3 rounded-full transition-all cursor-pointer text-sm active:scale-95"
            >
              <Printer className="w-4.5 h-4.5" />
              Print Paper
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
