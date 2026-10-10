"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  Bot,
  Send,
  X,
  Minimize2,
  Maximize2,
  RefreshCw,
  User,
  Copy,
  Check,
  ChevronRight,
  ArrowRight,
  Briefcase,
  Award,
  Zap,
  CheckCircle2,
  MessageSquare,
  Flame,
  FileText,
  HelpCircle,
  ExternalLink,
  Key,
  ShieldCheck,
  Info,
} from "lucide-react";

interface ActionRecommendation {
  title: string;
  action: "VIEW_DRIVES" | "START_MOCK_INTERVIEW" | "UPLOAD_RESUME" | "EDIT_PROFILE" | "VIEW_APPLICATIONS" | "VIEW_READINESS" | "ADD_PROJECT" | string;
}

interface Message {
  id: string;
  sender: "user" | "bot";
  text: string;
  timestamp: string;
  suggestedPrompts?: string[];
  actionRecommendations?: ActionRecommendation[];
  readinessImpact?: string;
  modelUsed?: string;
}

interface StudentProfile {
  id?: number;
  full_name?: string;
  cgpa?: number;
  branch?: string;
  readiness_score?: number;
  readiness_level?: string;
  skills?: string[];
}

interface StudentAIChatBotProps {
  studentProfile?: StudentProfile;
  onTriggerAction?: (action: string) => void;
}

const DEFAULT_PROMPTS = [
  "Which campus drives am I eligible for?",
  "Explain Deadlock in OS (4 conditions)",
  "What is ACID properties in DBMS?",
  "How to prepare for Google Cloud SRE round?",
  "How to answer 'Tell me about yourself'?",
  "What are my skill gaps for SRE / Dev roles?",
];

export const StudentAIChatBot: React.FC<StudentAIChatBotProps> = ({
  studentProfile,
  onTriggerAction,
}) => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [hasUnread, setHasUnread] = useState(false);
  
  // API Key management (Gemini LLM)
  const [geminiApiKey, setGeminiApiKey] = useState("");
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [tempKeyInput, setTempKeyInput] = useState("");
  const [keySavedToast, setKeySavedToast] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Load saved API key from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedKey = localStorage.getItem("camptocorp_gemini_key") || "";
      setGeminiApiKey(savedKey);
      setTempKeyInput(savedKey);
    }
  }, []);

  // Initial welcome message
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome-1",
      sender: "bot",
      text: `Hello ${studentProfile?.full_name ? `**${studentProfile.full_name}**` : "there"}! 👋\n\nI am your **CampToCorp AI Placement & Technical Mentor**.\n\nAsk me **ANY doubt or question**! I can help you with:\n- 💡 **Technical Concepts & Doubts:** OS (Deadlock, Paging), DBMS (ACID, Normalization), Networks (TCP/UDP, DNS), OOP, & System Design.\n- 💻 **DSA & Coding Strategies:** Dynamic Programming, Trees, Graphs, Two Pointers, Time/Space complexities.\n- 🏢 **Company-Specific Blueprints:** Google, AWS, Microsoft, Goldman Sachs, Cisco rounds & interview questions.\n- 🎯 **Your Placement Records:** Live eligible drives matching your CGPA (**${studentProfile?.cgpa?.toFixed(2) || "8.8"}**), branch cutoffs, & readiness score.\n- 🎙️ **HR & Interview Prep:** 'Tell me about yourself', STAR behavioral questions, resume ATS optimization.\n\n*Type any doubt below in English or Hinglish!*`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      suggestedPrompts: DEFAULT_PROMPTS,
      actionRecommendations: [
        { title: "Check Eligible Drives", action: "VIEW_DRIVES" },
        { title: "Review Readiness Score", action: "VIEW_READINESS" },
      ],
      modelUsed: "camptocorp-ai",
    },
  ]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, isLoading]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setHasUnread(false);
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  const handleSaveApiKey = () => {
    const trimmed = tempKeyInput.trim();
    setGeminiApiKey(trimmed);
    if (typeof window !== "undefined") {
      if (trimmed) {
        localStorage.setItem("camptocorp_gemini_key", trimmed);
      } else {
        localStorage.removeItem("camptocorp_gemini_key");
      }
    }
    setShowKeyModal(false);
    setKeySavedToast(true);
    setTimeout(() => setKeySavedToast(false), 3000);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isLoading) return;

    const userMsgId = `user-${Date.now()}`;
    const userTimestamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    const newMessages: Message[] = [
      ...messages,
      {
        id: userMsgId,
        sender: "user",
        text,
        timestamp: userTimestamp,
      },
    ];

    setMessages(newMessages);
    setInputMessage("");
    setIsLoading(true);

    try {
      const studentId = studentProfile?.id || (typeof window !== "undefined" ? parseInt(localStorage.getItem("camptocorp_student_id") || "1") : 1);
      const activeKey = geminiApiKey || (typeof window !== "undefined" ? localStorage.getItem("camptocorp_gemini_key") || "" : "");

      // 1. Try sending message to local FastAPI backend
      let backendSuccess = false;
      try {
        const res = await fetch("http://127.0.0.1:8000/api/v1/chat/message", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            student_id: studentId,
            message: text,
            api_key: activeKey,
            history: newMessages.slice(-6).map((m) => ({
              sender: m.sender,
              content: m.text,
            })),
          }),
        });

        if (res.ok) {
          const data = await res.json();
          const botMessage: Message = {
            id: `bot-${Date.now()}`,
            sender: "bot",
            text: data.reply,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            suggestedPrompts: data.suggested_prompts && data.suggested_prompts.length > 0 ? data.suggested_prompts : DEFAULT_PROMPTS,
            actionRecommendations: data.action_recommendations || [],
            readinessImpact: data.readiness_impact,
            modelUsed: data.model_used || (activeKey ? "gemini-llm" : "camptocorp-ai"),
          };
          setMessages((prev) => [...prev, botMessage]);
          backendSuccess = true;
        }
      } catch (backendErr) {
        console.warn("Backend server connection failed:", backendErr);
      }

      // 2. If backend failed but user provided a Gemini API Key, call Gemini API directly from browser
      if (!backendSuccess && activeKey) {
        const modelsToTry = ["gemini-3.5-flash", "gemini-3.1-flash-lite", "gemma-4-26b-a4b-it", "gemini-2.0-flash", "gemini-1.5-flash"];
        let directReply: string | null = null;
        let usedModel = "gemini-3.5-flash";

        for (const model of modelsToTry) {
          try {
            const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${activeKey.trim()}`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                systemInstruction: {
                  parts: [{
                    text: `You are the CampToCorp AI Placement & Technical Mentor. Answer any technical, coding, DBMS, OS, networking, placement, or career doubt asked by the student clearly and accurately in GitHub markdown format.`
                  }]
                },
                contents: [
                  ...newMessages.slice(-4).map((m) => ({
                    role: m.sender === "user" ? "user" : "model",
                    parts: [{ text: m.text }]
                  })),
                ],
                generationConfig: {
                  temperature: 0.7,
                  maxOutputTokens: 1000
                }
              })
            });

            if (geminiRes.ok) {
              const geminiData = await geminiRes.json();
              const replyText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;
              if (replyText) {
                directReply = replyText.trim();
                usedModel = model;
                break;
              }
            } else {
              const errBody = await geminiRes.text();
              console.warn(`Direct browser Gemini ${model} failed (${geminiRes.status}):`, errBody);
            }
          } catch (gErr) {
            console.warn(`Direct browser call error for ${model}:`, gErr);
          }
        }

        if (directReply) {
          const directBotMsg: Message = {
            id: `bot-direct-${Date.now()}`,
            sender: "bot",
            text: directReply,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            suggestedPrompts: [
              "Which campus drives am I eligible for?",
              "Explain Deadlock 4 conditions in OS",
              "How to answer 'Tell me about yourself'?"
            ],
            actionRecommendations: [
              { title: "View Eligible Drives", action: "VIEW_DRIVES" },
              { title: "AI Mock Interview", action: "START_MOCK_INTERVIEW" }
            ],
            modelUsed: usedModel,
          };
          setMessages((prev) => [...prev, directBotMsg]);
          backendSuccess = true;
        }
      }

      // 3. Fallback notice if neither backend nor direct Gemini responded
      if (!backendSuccess) {
        const errorNotice: Message = {
          id: `bot-err-${Date.now()}`,
          sender: "bot",
          text: activeKey
            ? `⚠️ **Backend Server Offline & Gemini API Error**\n\n- Unable to connect to backend at \`http://127.0.0.1:8000\`.\n- Direct Gemini API call returned an error. Please verify your Gemini API key by clicking the 🔑 icon above, or start your backend server.\n\n*Command to start backend:* \`uvicorn app.main:app --reload\``
            : `⚠️ **Backend Server Offline**\n\nThe local backend server (\`http://127.0.0.1:8000\`) is currently not running.\n\n👉 **To get real-time live answers:**\n1. **Start the backend server:** Run \`uvicorn app.main:app --reload\` in your \`backend/\` folder.\n2. **OR Enter a Gemini API Key:** Click the **🔑 Key** icon in top-right of this chat to connect a free Google Gemini API Key for direct live browser responses!`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          suggestedPrompts: DEFAULT_PROMPTS,
          actionRecommendations: [
            { title: "Check Eligible Drives", action: "VIEW_DRIVES" },
          ],
          modelUsed: "notice",
        };
        setMessages((prev) => [...prev, errorNotice]);
      }

      if (!isOpen) {
        setHasUnread(true);
      }
    } catch (err) {
      console.error("Chat message error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleCopy = (text: string, id: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        sender: "bot",
        text: `Chat reset. Ask me **ANY doubt or question** regarding coding, computer science concepts (OS, DBMS, CN), company hiring rounds, or your placement eligibility!`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        suggestedPrompts: DEFAULT_PROMPTS,
        actionRecommendations: [
          { title: "Check Eligible Drives", action: "VIEW_DRIVES" },
          { title: "Review Readiness Score", action: "VIEW_READINESS" },
        ],
        modelUsed: geminiApiKey ? "gemini-llm" : "camptocorp-ai",
      },
    ]);
  };

  const executeAction = (actionKey: string) => {
    if (onTriggerAction) {
      onTriggerAction(actionKey);
    }

    if (actionKey === "START_MOCK_INTERVIEW") {
      router.push("/student/mock-interview");
      setIsOpen(false);
    } else if (actionKey === "VIEW_DRIVES") {
      const el = document.getElementById("student-drives-section");
      if (el) el.scrollIntoView({ behavior: "smooth" });
      else router.push("/dashboard/student");
    } else if (actionKey === "VIEW_READINESS") {
      const el = document.getElementById("readiness-overview-section");
      if (el) el.scrollIntoView({ behavior: "smooth" });
    } else if (actionKey === "UPLOAD_RESUME") {
      const el = document.getElementById("resume-section");
      if (el) el.scrollIntoView({ behavior: "smooth" });
    } else if (actionKey === "EDIT_PROFILE") {
      const el = document.getElementById("academic-profile-section");
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Helper to render markdown formatting, tables, code blocks, bold text, etc.
  const renderFormattedText = (raw: string) => {
    // Check if contains code blocks
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = codeBlockRegex.exec(raw)) !== null) {
      if (match.index > lastIndex) {
        parts.push({ type: "text", content: raw.slice(lastIndex, match.index) });
      }
      parts.push({ type: "code", lang: match[1] || "", content: match[2] });
      lastIndex = match.index + match[0].length;
    }
    if (lastIndex < raw.length) {
      parts.push({ type: "text", content: raw.slice(lastIndex) });
    }

    return (
      <div className="space-y-2 text-xs leading-relaxed text-slate-800">
        {parts.map((p, pIdx) => {
          if (p.type === "code") {
            return (
              <div key={pIdx} className="my-2 rounded-xl bg-slate-900 text-slate-100 p-3 overflow-x-auto border border-slate-800 font-mono text-[11px] shadow-sm">
                <div className="flex items-center justify-between pb-1 mb-1 border-b border-slate-800 text-[10px] text-slate-400">
                  <span>{p.lang || "code"}</span>
                  <button
                    type="button"
                    onClick={() => handleCopy(p.content, `code-${pIdx}`)}
                    className="hover:text-white transition-colors"
                  >
                    {copiedId === `code-${pIdx}` ? "Copied!" : "Copy"}
                  </button>
                </div>
                <pre>{p.content}</pre>
              </div>
            );
          }

          // Parse text lines
          const lines = p.content.split("\n");
          return (
            <div key={pIdx} className="space-y-1.5">
              {lines.map((line, idx) => {
                const trimmed = line.trim();
                if (trimmed.startsWith("### ")) {
                  return (
                    <h4 key={idx} className="font-bold text-sm text-campus-primary pt-1.5 pb-0.5 border-b border-slate-100 flex items-center gap-1.5">
                      {trimmed.replace("### ", "")}
                    </h4>
                  );
                }
                if (trimmed.startsWith("#### ")) {
                  return (
                    <h5 key={idx} className="font-semibold text-xs text-slate-900 pt-1 text-campus-primary">
                      {trimmed.replace("#### ", "")}
                    </h5>
                  );
                }
                if (trimmed.startsWith("> ")) {
                  return (
                    <blockquote key={idx} className="p-2.5 rounded-xl bg-blue-50/80 border-l-4 border-campus-primary text-blue-950 font-medium italic my-1.5">
                      {trimmed.replace("> ", "")}
                    </blockquote>
                  );
                }
                if (trimmed.startsWith("- [ ]") || trimmed.startsWith("- [x]")) {
                  const isChecked = trimmed.startsWith("- [x]");
                  const textContent = trimmed.replace(/- \[[ x]\] /, "");
                  return (
                    <div key={idx} className="flex items-start gap-2 py-0.5">
                      <input type="checkbox" checked={isChecked} readOnly className="mt-0.5 rounded text-campus-primary" />
                      <span className="text-xs text-slate-700">{formatInline(textContent)}</span>
                    </div>
                  );
                }
                if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
                  return (
                    <div key={idx} className="flex items-start gap-1.5 pl-1 py-0.5">
                      <span className="text-campus-accent font-bold mt-[-1px]">&bull;</span>
                      <span className="text-slate-700">{formatInline(trimmed.substring(2))}</span>
                    </div>
                  );
                }
                if (/^\d+\.\s/.test(trimmed)) {
                  const num = trimmed.match(/^(\d+)\.\s/)?.[1] || "1";
                  const rest = trimmed.replace(/^\d+\.\s/, "");
                  return (
                    <div key={idx} className="flex items-start gap-2 pl-1 py-0.5">
                      <span className="text-campus-primary font-bold text-[11px] min-w-[14px]">{num}.</span>
                      <span className="text-slate-700">{formatInline(rest)}</span>
                    </div>
                  );
                }
                if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
                  // Render table line lightly
                  return (
                    <div key={idx} className="font-mono text-[10px] bg-slate-50 p-1 rounded overflow-x-auto text-slate-700">
                      {trimmed}
                    </div>
                  );
                }
                if (trimmed === "") {
                  return <div key={idx} className="h-0.5" />;
                }
                return (
                  <p key={idx} className="text-slate-700 leading-relaxed">
                    {formatInline(trimmed)}
                  </p>
                );
              })}
            </div>
          );
        })}
      </div>
    );
  };

  const formatInline = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={i} className="font-semibold text-slate-900">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith("`") && part.endsWith("`")) {
        return (
          <code key={i} className="px-1.5 py-0.5 rounded bg-slate-100 text-campus-primary font-mono text-[11px] font-semibold border border-slate-200">
            {part.slice(1, -1)}
          </code>
        );
      }
      return part;
    });
  };

  return (
    <>
      {/* FLOATING ACTION LAUNCHER BUTTON */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 group">
          {/* Helper Tooltip on hover */}
          <div className="hidden md:flex items-center gap-2 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-xl shadow-lg border border-campus-border text-xs text-slate-700 animate-fade-in group-hover:scale-105 transition-transform duration-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold text-campus-text-primary">Ask Any Placement Doubt</span>
            <span className="text-[10px] text-campus-accent font-bold bg-blue-50 px-1.5 py-0.5 rounded">
              {geminiApiKey ? "Gemini Live" : "AI Ready"}
            </span>
          </div>

          <button
            onClick={() => setIsOpen(true)}
            aria-label="Open AI Placement ChatBot"
            className="relative flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 text-white shadow-xl shadow-indigo-500/30 hover:shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300 ring-4 ring-indigo-200/50"
          >
            <Sparkles className="w-6 h-6 animate-pulse" />
            {hasUnread && (
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-rose-500 border-2 border-white rounded-full animate-bounce" />
            )}
            <span className="sr-only">CampToCorp Placement AI</span>
          </button>
        </div>
      )}

      {/* EXPANDED / DOCKED CHAT WINDOW */}
      {isOpen && (
        <div
          className={`fixed z-50 transition-all duration-300 flex flex-col bg-white border border-slate-200/90 shadow-2xl rounded-3xl overflow-hidden backdrop-blur-xl ${
            isExpanded
              ? "inset-4 md:inset-10 w-auto h-auto max-w-4xl mx-auto"
              : "bottom-5 right-5 w-[92vw] sm:w-[460px] h-[660px] max-h-[88vh]"
          }`}
        >
          {/* HEADER */}
          <div className="bg-gradient-to-r from-slate-950 via-indigo-950 to-purple-950 text-white px-5 py-3.5 flex items-center justify-between shadow-md border-b border-indigo-500/20">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 text-white shadow-inner">
                  <Bot className="w-5 h-5 text-indigo-300" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-slate-900" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-black text-sm tracking-tight text-white">CampToCorp AI Mentor</h3>
                  <span className={`text-[10px] font-bold px-2 py-0.2 rounded-full border ${
                    geminiApiKey
                      ? "bg-purple-500/20 text-purple-200 border-purple-300/30"
                      : "bg-emerald-500/20 text-emerald-200 border-emerald-400/30"
                  }`}>
                    {geminiApiKey ? "Gemini 2.0 / 1.5" : "Placement Engine"}
                  </span>
                </div>
                <div className="text-[11px] text-blue-100/80 truncate max-w-[210px] sm:max-w-[260px]">
                  {studentProfile?.full_name ? `${studentProfile.full_name} • CGPA: ${studentProfile.cgpa?.toFixed(2) || "8.8"}` : "AI Placement & Career Advisor"}
                </div>
              </div>
            </div>

            {/* Window Controls & Key Config */}
            <div className="flex items-center gap-1 text-white/80">
              <button
                type="button"
                onClick={() => setShowKeyModal(true)}
                title="Configure Gemini API Key (Optional)"
                className="p-1.5 rounded-lg hover:bg-white/15 hover:text-white transition-colors relative"
              >
                <Key className={`w-3.5 h-3.5 ${geminiApiKey ? "text-amber-300" : "text-white/70"}`} />
              </button>
              <button
                type="button"
                onClick={handleResetChat}
                title="Restart Conversation"
                className="p-1.5 rounded-lg hover:bg-white/15 hover:text-white transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                title={isExpanded ? "Collapse" : "Expand"}
                className="p-1.5 rounded-lg hover:bg-white/15 hover:text-white transition-colors"
              >
                {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                title="Close Chat"
                className="p-1.5 rounded-lg hover:bg-rose-500/80 hover:text-white transition-colors ml-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* KEY SAVED TOAST ALERT */}
          {keySavedToast && (
            <div className="bg-emerald-500 text-white text-[11px] font-semibold px-4 py-1.5 text-center animate-fade-in flex items-center justify-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{geminiApiKey ? "Gemini AI Key linked successfully! Unrestricted reasoning active." : "Key cleared; running with high-fidelity local engine."}</span>
            </div>
          )}

          {/* CONTEXT STRIP: Verified Student Academic Profile */}
          <div className="bg-slate-50 border-b border-campus-border px-4 py-2 flex items-center justify-between text-[11px] text-slate-600">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 font-semibold text-slate-700">
                <Award className="w-3 h-3 text-campus-accent" />
                Readiness:
              </span>
              <span className="px-2 py-0.5 rounded-full font-bold bg-blue-100/70 text-campus-primary">
                {studentProfile?.readiness_score ?? 88}/100 ({studentProfile?.readiness_level?.replace("_", " ") ?? "READY"})
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowKeyModal(true)}
                className="text-campus-accent hover:text-campus-primary font-medium flex items-center gap-1 hover:underline cursor-pointer"
              >
                <Key className="w-2.5 h-2.5" />
                <span>{geminiApiKey ? "Key Linked" : "Add Free Key"}</span>
              </button>
            </div>
          </div>

          {/* API KEY CONFIG MODAL DIALOG */}
          {showKeyModal && (
            <div className="p-4 bg-slate-900 text-white border-b border-slate-800 text-xs space-y-3 animate-fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-sm text-blue-200">
                  <Key className="w-4 h-4 text-amber-400" />
                  <span>Connect Free Google Gemini API Key</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowKeyModal(false)}
                  className="text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Want the chatbot to answer <strong>ANY custom coding or general doubt</strong> without limits?
                Paste a free Gemini API key below. (No credit card required).
              </p>
              <div className="space-y-1.5">
                <input
                  type="password"
                  value={tempKeyInput}
                  onChange={(e) => setTempKeyInput(e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs font-mono focus:outline-hidden focus:border-blue-400"
                />
                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-300 hover:underline flex items-center gap-1"
                  >
                    <span>Get free key from Google AI Studio</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                  {geminiApiKey && (
                    <button
                      type="button"
                      onClick={() => {
                        setTempKeyInput("");
                        setGeminiApiKey("");
                        localStorage.removeItem("camptocorp_gemini_key");
                        setShowKeyModal(false);
                        setKeySavedToast(true);
                        setTimeout(() => setKeySavedToast(false), 3000);
                      }}
                      className="text-rose-400 hover:underline"
                    >
                      Remove Key
                    </button>
                  )}
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowKeyModal(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveApiKey}
                  className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-xs"
                >
                  Save & Activate
                </button>
              </div>
            </div>
          )}

          {/* MESSAGE FEED */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-slate-50/50 to-white">
            {messages.map((m) => {
              const isBot = m.sender === "bot";
              return (
                <div
                  key={m.id}
                  className={`flex flex-col ${isBot ? "items-start" : "items-end"} animate-fade-in`}
                >
                  <div className={`flex items-start gap-2.5 max-w-[92%] sm:max-w-[88%] ${isBot ? "" : "flex-row-reverse"}`}>
                    {/* Avatar */}
                    <div
                      className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold ${
                        isBot
                          ? "bg-campus-primary text-white shadow-xs"
                          : "bg-slate-800 text-white shadow-xs"
                      }`}
                    >
                      {isBot ? <Sparkles className="w-3.5 h-3.5 text-blue-200" /> : <User className="w-3.5 h-3.5" />}
                    </div>

                    {/* Bubble Content */}
                    <div
                      className={`relative rounded-2xl px-4 py-3 text-xs shadow-xs border ${
                        isBot
                          ? "bg-white border-campus-border text-slate-900 rounded-tl-sm"
                          : "bg-campus-primary border-campus-primary text-white rounded-tr-sm"
                      }`}
                    >
                      {isBot ? (
                        <div>{renderFormattedText(m.text)}</div>
                      ) : (
                        <p className="whitespace-pre-wrap leading-relaxed">{m.text}</p>
                      )}

                      {/* Bot Model Badge */}
                      {isBot && m.modelUsed && (
                        <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                          <span className="flex items-center gap-1 font-medium text-slate-500">
                            <Sparkles className="w-2.5 h-2.5 text-campus-accent" />
                            {m.modelUsed === "gemini-llm" ? "Generative Gemini AI" : "CampToCorp Placement & CS Intelligence"}
                          </span>
                        </div>
                      )}

                      {/* Action Recommendation Buttons */}
                      {isBot && m.actionRecommendations && m.actionRecommendations.length > 0 && (
                        <div className="mt-2.5 pt-2 border-t border-slate-100 flex flex-wrap gap-1.5">
                          {m.actionRecommendations.map((act, i) => (
                            <button
                              key={i}
                              type="button"
                              onClick={() => executeAction(act.action)}
                              className="px-2.5 py-1 rounded-lg bg-campus-bg hover:bg-blue-50 text-campus-primary font-semibold text-[11px] border border-campus-border hover:border-campus-accent transition-all flex items-center gap-1 shadow-xs active:scale-95 cursor-pointer"
                            >
                              <span>{act.title}</span>
                              <ChevronRight className="w-3 h-3 text-campus-accent" />
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Footer: Timestamp & Copy */}
                      <div
                        className={`mt-1.5 flex items-center justify-between text-[10px] ${
                          isBot ? "text-slate-400" : "text-blue-100/70"
                        }`}
                      >
                        <span>{m.timestamp}</span>
                        {isBot && (
                          <button
                            type="button"
                            onClick={() => handleCopy(m.text, m.id)}
                            className="hover:text-slate-700 transition-colors p-1"
                            title="Copy response"
                          >
                            {copiedId === m.id ? (
                              <Check className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Dynamic Suggested Follow-up Prompts */}
                  {isBot && m.suggestedPrompts && m.suggestedPrompts.length > 0 && m.id === messages[messages.length - 1]?.id && !isLoading && (
                    <div className="mt-2.5 ml-9 flex flex-wrap gap-1.5 max-w-[90%]">
                      {m.suggestedPrompts.map((p, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSendMessage(p)}
                          className="text-[11px] font-medium bg-white hover:bg-blue-50 text-campus-primary border border-campus-border hover:border-campus-accent/50 rounded-full px-3 py-1 shadow-xs transition-all hover:scale-[1.02] active:scale-95 text-left flex items-center gap-1 cursor-pointer"
                        >
                          <span>{p}</span>
                          <ArrowRight className="w-2.5 h-2.5 text-campus-accent shrink-0" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {/* TYPING / THINKING INDICATOR */}
            {isLoading && (
              <div className="flex items-start gap-2.5 animate-fade-in">
                <div className="w-7 h-7 rounded-xl bg-campus-primary text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Bot className="w-3.5 h-3.5" />
                </div>
                <div className="bg-white border border-campus-border rounded-2xl rounded-tl-sm px-4 py-3 shadow-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-medium text-slate-600">Resolving doubt & analyzing technical concepts</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-campus-primary animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-campus-primary animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-campus-primary animate-bounce" />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* INPUT FORM */}
          <div className="p-3 bg-white border-t border-campus-border">
            <div className="relative flex items-center bg-slate-50 rounded-xl border border-campus-border focus-within:border-campus-primary focus-within:ring-2 focus-within:ring-campus-primary/10 transition-all">
              <textarea
                ref={inputRef}
                rows={1}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask any doubt (e.g. Deadlock in OS, ACID in DBMS, LeetCode logic, or Google rounds)..."
                className="w-full bg-transparent px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden resize-none max-h-24 overflow-y-auto"
              />
              <button
                type="button"
                onClick={() => handleSendMessage()}
                disabled={!inputMessage.trim() || isLoading}
                className="mr-2 p-2 rounded-lg bg-campus-primary text-white hover:bg-campus-primary-hover disabled:opacity-30 disabled:hover:bg-campus-primary transition-all shadow-xs shrink-0 cursor-pointer"
                title="Send message (Enter)"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="flex items-center justify-between px-1 pt-1.5 text-[10px] text-slate-400">
              <span>Press <kbd className="px-1 py-0.2 bg-slate-100 border border-slate-200 rounded font-mono text-[9px]">Enter</kbd> to send</span>
              <button
                type="button"
                onClick={() => setShowKeyModal(true)}
                className="flex items-center gap-1 text-campus-accent hover:text-campus-primary font-medium transition-colors"
              >
                <Key className="w-2.5 h-2.5" />
                <span>{geminiApiKey ? "Gemini Key Active" : "Connect Free Gemini AI"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default StudentAIChatBot;
