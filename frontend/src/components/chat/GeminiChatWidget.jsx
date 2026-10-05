import { useState, useEffect, useRef } from "react";
import {
  Sparkles,
  X,
  Send,
  RotateCcw,
  Globe,
  Zap,
  Brain,
  Dumbbell,
  ExternalLink,
  ChevronDown,
  Bot,
  User as UserIcon,
  Search
} from "lucide-react";
import { geminiApi } from "../../api/geminiApi";
const SUGGESTED_PROMPTS = [
  { text: "Form cues for Barbell Back Squat", taskType: "fast", search: false },
  { text: "Latest research on optimal creatine monohydrate timing", taskType: "general", search: true },
  { text: "Design a 4-day Upper/Lower hypertrophy split with progression", taskType: "complex", search: false },
  { text: "Where is the FitSync Flagship gym located and what are the facilities?", taskType: "fast", search: false },
  { text: "Calculate daily protein and caloric targets for an 80kg lifter", taskType: "general", search: false }
];
const GeminiChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState(() => {
    return [
      {
        role: "model",
        content: `\u{1F44B} Hi! I'm your **FitSync AI Coach**.

I can help you design periodized workout routines, break down exercise biomechanics, optimize your sports nutrition, or verify the latest fitness research using live **Google Search Grounding**.

How can I help your training today?`,
        modelUsed: "gemini-3.8-flash",
        timestamp: (/* @__PURE__ */ new Date()).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      }
    ];
  });
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [taskType, setTaskType] = useState("general");
  const [enableSearchGrounding, setEnableSearchGrounding] = useState(false);
  const [selectedRole, setSelectedRole] = useState("general");
  const [roles, setRoles] = useState([
    {
      id: "general",
      name: "FitSync Elite Coach",
      modelDefault: "gemini-3.8-flash",
      description: "Comprehensive fitness, exercise execution, progressive overload & periodization",
      systemInstruction: ""
    },
    {
      id: "nutrition",
      name: "Sports Nutritionist & Dietitian",
      modelDefault: "gemini-3.8-flash",
      description: "Caloric calculations, macronutrient breakdowns, meal timing & supplementation",
      systemInstruction: ""
    },
    {
      id: "recovery",
      name: "Recovery & Physical Rehab Specialist",
      modelDefault: "gemini-3.8-flash",
      description: "Mobility protocols, active recovery, sleep optimization & injury prevention",
      systemInstruction: ""
    }
  ]);
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  useEffect(() => {
    let retries = 2;
    const loadRoles = async () => {
      try {
        const res = await geminiApi.getCoachRoles();
        if (res.roles && res.roles.length > 0) {
          setRoles(res.roles);
        }
      } catch (err) {
        if (retries > 0) {
          retries--;
          setTimeout(loadRoles, 1500);
        }
      }
    };
    loadRoles();
  }, []);
  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, isMinimized]);
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, isMinimized]);
  const handleSend = async (textToSend, overrideTask, overrideSearch) => {
    const prompt = (textToSend || input).trim();
    if (!prompt || isLoading) return;
    const currentTask = overrideTask || taskType;
    const currentSearch = overrideSearch !== void 0 ? overrideSearch : enableSearchGrounding;
    const userMessage = {
      role: "user",
      content: prompt,
      timestamp: (/* @__PURE__ */ new Date()).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);
    try {
      const apiHistory = newMessages.map((m) => ({
        role: m.role,
        content: m.content
      }));
      const res = await geminiApi.sendMessage({
        messages: apiHistory,
        role: selectedRole,
        taskType: currentTask,
        enableSearchGrounding: currentSearch
      });
      const modelMessage = {
        role: "model",
        content: res.content,
        modelUsed: res.modelUsed,
        groundingSources: res.groundingSources,
        webSearchQueries: res.webSearchQueries,
        timestamp: (/* @__PURE__ */ new Date()).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };
      setMessages((prev) => [...prev, modelMessage]);
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Error communicating with AI Coach. Please try again.";
      setMessages((prev) => [
        ...prev,
        {
          role: "model",
          content: `\u26A0\uFE0F **Service Notice:** ${errorMsg}`,
          modelUsed: "system",
          timestamp: (/* @__PURE__ */ new Date()).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };
  const handleClearHistory = () => {
    setMessages([
      {
        role: "model",
        content: `Conversation reset. Choose a role or ask anything to get started!`,
        modelUsed: "gemini-3.5-flash",
        timestamp: (/* @__PURE__ */ new Date()).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      }
    ]);
  };
  const activeRoleName = roles.find((r) => r.id === selectedRole)?.name || "FitSync Elite Coach";
  const renderFormattedContent = (content) => {
    return content.split("\n\n").map((paragraph, pIdx) => {
      if (paragraph.startsWith("* ") || paragraph.startsWith("- ")) {
        const items = paragraph.split("\n");
        return <ul key={pIdx} className="list-disc list-inside space-y-1 my-1.5 pl-1">
            {items.map((item, iIdx) => {
          const cleaned = item.replace(/^[\*\-]\s+/, "");
          return <li key={iIdx} className="text-xs leading-relaxed">
                  <span dangerouslySetInnerHTML={{ __html: formatInline(cleaned) }} />
                </li>;
        })}
          </ul>;
      }
      if (/^\d+\.\s/.test(paragraph)) {
        const items = paragraph.split("\n");
        return <ol key={pIdx} className="list-decimal list-inside space-y-1 my-1.5 pl-1">
            {items.map((item, iIdx) => {
          const cleaned = item.replace(/^\d+\.\s+/, "");
          return <li key={iIdx} className="text-xs leading-relaxed">
                  <span dangerouslySetInnerHTML={{ __html: formatInline(cleaned) }} />
                </li>;
        })}
          </ol>;
      }
      return <p
        key={pIdx}
        className="text-xs leading-relaxed my-1"
        dangerouslySetInnerHTML={{ __html: formatInline(paragraph) }}
      />;
    });
  };
  const formatInline = (text) => {
    return text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>").replace(/\*(.*?)\*/g, "<em>$1</em>").replace(/`([^`]+)`/g, '<code class="px-1 py-0.5 bg-slate-100 font-mono text-[11px] rounded text-emerald-800">$1</code>');
  };
  return <>
      {
    /* Floating Launcher Button - Styled as Landing Page Pill */
  }
      {!isOpen && <button
    onClick={() => {
      setIsOpen(true);
      setIsMinimized(false);
    }}
    className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-[11px] uppercase tracking-wider rounded-full shadow-xl shadow-purple-600/35 hover:shadow-purple-600/50 border border-purple-400/30 transition-all duration-200 cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
    title="Open FitSync AI Coach"
  >
          <div className="relative">
            <Sparkles className="w-4 h-4 text-lime-300 animate-spin" style={{ animationDuration: "8s" }} />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-lime-400 rounded-full" />
          </div>
          <span>AI Fitness Coach</span>
        </button>}

      {
    /* Floating Chat Drawer Window */
  }
      {isOpen && <div
    className={`fixed bottom-5 right-5 z-50 w-96 sm:w-[420px] bg-white dark:bg-[#0b0d15] border border-[#E8E5EE] dark:border-slate-800 rounded-3xl shadow-2xl flex flex-col transition-all duration-200 overflow-hidden theme-transition ${isMinimized ? "h-14" : "h-[580px] max-h-[85vh]"}`}
  >
          {
    /* Header */
  }
          <div className="px-4 py-3 bg-[#0a0c14] text-white flex items-center justify-between shrink-0 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
                <Sparkles className="w-4 h-4 text-lime-400" />
              </div>
              <div className="text-left">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-black text-white tracking-tight">FitSync AI Coach</span>
                  <span className="px-2 py-0.5 text-[9px] font-extrabold rounded-full uppercase tracking-wider bg-purple-950 text-purple-300 border border-purple-700/60">
                    Gemini 3
                  </span>
                </div>
                <button
    type="button"
    onClick={() => setShowRoleMenu(!showRoleMenu)}
    className="text-[10px] text-slate-400 hover:text-purple-300 flex items-center gap-1 transition-colors cursor-pointer"
  >
                  <span>{activeRoleName}</span>
                  <ChevronDown className="w-3 h-3" />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-1 text-slate-400">
              <button
    onClick={handleClearHistory}
    title="Reset conversation"
    className="p-1.5 hover:text-white hover:bg-slate-800 rounded-md transition-colors cursor-pointer"
  >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
    onClick={() => setIsMinimized(!isMinimized)}
    title={isMinimized ? "Expand" : "Minimize"}
    className="p-1.5 hover:text-white hover:bg-slate-800 rounded-md transition-colors cursor-pointer"
  >
                <ChevronDown className={`w-3.5 h-3.5 transform transition-transform ${isMinimized ? "rotate-180" : ""}`} />
              </button>
              <button
    onClick={() => setIsOpen(false)}
    title="Close"
    className="p-1.5 hover:text-white hover:bg-slate-800 rounded-md transition-colors cursor-pointer"
  >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {!isMinimized && <>
              {
    /* Role Selection Dropdown Menu */
  }
              {showRoleMenu && <div className="p-2 bg-slate-800 border-b border-slate-700 text-xs space-y-1 z-20">
                  <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold px-2 py-0.5">
                    Select Specialized Persona:
                  </p>
                  {roles.map((r) => <button
    key={r.id}
    onClick={() => {
      setSelectedRole(r.id);
      setShowRoleMenu(false);
    }}
    className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs transition-colors flex items-center justify-between cursor-pointer ${selectedRole === r.id ? "bg-purple-600 text-white font-bold" : "text-slate-200 hover:bg-slate-800"}`}
  >
                      <div>
                        <div className="font-semibold">{r.name}</div>
                        <div className="text-[10px] opacity-80">{r.description}</div>
                      </div>
                      <span className="text-[9px] font-mono opacity-60 ml-2">{r.modelDefault}</span>
                    </button>)}
                </div>}

              {
    /* Control Toolbar: Task Speed / Complexity & Google Search Grounding Toggle */
  }
              <div className="px-3 py-2 bg-slate-50 border-b border-slate-200/80 flex items-center justify-between text-xs gap-2 shrink-0">
                {
    /* Task Type Switcher */
  }
                <div className="inline-flex p-0.5 bg-slate-200/70 rounded-lg text-[10px] font-semibold text-slate-600">
                  <button
    onClick={() => {
      setTaskType("fast");
      setEnableSearchGrounding(false);
    }}
    className={`px-2 py-1 rounded-md transition-colors flex items-center gap-1 cursor-pointer ${taskType === "fast" && !enableSearchGrounding ? "bg-white text-slate-900 shadow-xs" : "hover:text-slate-900"}`}
    title="Fast Model (gemini-3.1-flash-lite)"
  >
                    <Zap className="w-3 h-3 text-amber-500" />
                    <span>Fast</span>
                  </button>
                  <button
    onClick={() => setTaskType("general")}
    className={`px-2 py-1 rounded-md transition-colors flex items-center gap-1 cursor-pointer ${taskType === "general" ? "bg-white text-slate-900 shadow-xs" : "hover:text-slate-900"}`}
    title="General Model (gemini-3.5-flash)"
  >
                    <Dumbbell className="w-3 h-3 text-purple-600" />
                    <span>General</span>
                  </button>
                  <button
    onClick={() => {
      setTaskType("complex");
      setEnableSearchGrounding(false);
    }}
    className={`px-2 py-1 rounded-md transition-colors flex items-center gap-1 cursor-pointer ${taskType === "complex" && !enableSearchGrounding ? "bg-white text-slate-900 shadow-xs" : "hover:text-slate-900"}`}
    title="Complex Reasoning Model (gemini-3.1-pro-preview)"
  >
                    <Brain className="w-3 h-3 text-indigo-600" />
                    <span>Complex</span>
                  </button>
                </div>

                {
    /* Search Grounding Toggle Button */
  }
                <button
    type="button"
    onClick={() => {
      const next = !enableSearchGrounding;
      setEnableSearchGrounding(next);
      if (next) setTaskType("general");
    }}
    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border ${enableSearchGrounding ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-white text-slate-600 border-slate-200 hover:text-slate-900"}`}
    title="Search Grounding using gemini-3.5-flash with googleSearch tool"
  >
                  <Globe className={`w-3 h-3 ${enableSearchGrounding ? "text-blue-600 animate-spin" : "text-slate-400"}`} style={{ animationDuration: "10s" }} />
                  <span>Google Search</span>
                  <span
    className={`w-1.5 h-1.5 rounded-full ${enableSearchGrounding ? "bg-blue-600" : "bg-slate-300"}`}
  />
                </button>
              </div>

              {
    /* Scrollable Message Thread */
  }
              <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/50">
                {messages.map((msg, index) => {
    const isUser = msg.role === "user";
    return <div
      key={index}
      className={`flex gap-2.5 ${isUser ? "flex-row-reverse" : "flex-row"}`}
    >
                      {
      /* Avatar */
    }
                      <div
      className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs ${isUser ? "bg-slate-900 text-white" : "bg-purple-600 text-white"}`}
    >
                        {isUser ? <UserIcon className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                      </div>

                      {
      /* Bubble */
    }
                      <div
      className={`max-w-[82%] rounded-2xl p-3 shadow-xs ${isUser ? "bg-slate-900 text-white rounded-tr-none" : "bg-white border border-slate-200 text-slate-800 rounded-tl-none"}`}
    >
                        {
      /* Message Content */
    }
                        <div className="space-y-1">{renderFormattedContent(msg.content)}</div>

                        {
      /* Search Grounding Queries if any */
    }
                        {msg.webSearchQueries && msg.webSearchQueries.length > 0 && <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center gap-1.5 text-[10px] text-blue-700">
                            <Search className="w-3 h-3 shrink-0" />
                            <span className="font-semibold">Searched:</span>
                            <span className="truncate italic">
                              "{msg.webSearchQueries.join(", ")}"
                            </span>
                          </div>}

                        {
      /* Search Grounding Sources / Citations */
    }
                        {msg.groundingSources && msg.groundingSources.length > 0 && <div className="mt-2.5 pt-2 border-t border-slate-100 space-y-1">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                              Web Sources:
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {msg.groundingSources.map((source, sIdx) => <a
      key={sIdx}
      href={source.url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded text-[10px] text-blue-700 transition-colors font-medium max-w-[200px] truncate"
      title={source.url}
    >
                                  <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                                  <span className="truncate">{source.title}</span>
                                </a>)}
                            </div>
                          </div>}

                        {
      /* Metadata Footer */
    }
                        <div
      className={`mt-1.5 flex items-center gap-1.5 text-[9px] ${isUser ? "text-slate-400 justify-end" : "text-slate-400 justify-between"}`}
    >
                          {!isUser && msg.modelUsed && <span className="font-mono text-[9px] px-1 py-0.2 bg-slate-100 rounded text-slate-500">
                              {msg.modelUsed}
                            </span>}
                          <span>{msg.timestamp}</span>
                        </div>
                      </div>
                    </div>;
  })}

                {
    /* Loading indicator */
  }
                {isLoading && <div className="flex gap-2.5 items-start">
                    <div className="w-7 h-7 rounded-full bg-purple-600 text-white flex items-center justify-center shrink-0">
                      <Bot className="w-3.5 h-3.5" />
                    </div>
                    <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-none p-3 shadow-xs">
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                          <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                          <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                        </div>
                        <span className="text-[11px] font-medium">
                          {enableSearchGrounding ? "Grounding with Google Search..." : taskType === "complex" ? "Analyzing with Gemini Pro..." : "Formulating coaching advice..."}
                        </span>
                      </div>
                    </div>
                  </div>}

                <div ref={messagesEndRef} />
              </div>

              {
    /* Suggested Quick Prompts (if chat is fresh or user wants ideas) */
  }
              {messages.length <= 3 && !isLoading && <div className="px-3 py-2 bg-white border-t border-slate-100 flex gap-1.5 overflow-x-auto shrink-0 scrollbar-none">
                  {SUGGESTED_PROMPTS.map((p, idx) => <button
    key={idx}
    type="button"
    onClick={() => handleSend(p.text, p.taskType, p.search)}
    className="px-2.5 py-1 text-[10px] font-medium bg-slate-50 hover:bg-purple-50 text-slate-700 hover:text-purple-800 border border-slate-200 hover:border-purple-200 rounded-full whitespace-nowrap transition-colors cursor-pointer"
  >
                      {p.search && "\u{1F310} "}
                      {p.text}
                    </button>)}
                </div>}

              {
    /* Input Form */
  }
              <div className="p-3 bg-white border-t border-slate-200/90 shrink-0">
                <form
    onSubmit={(e) => {
      e.preventDefault();
      handleSend();
    }}
    className="flex items-center gap-2"
  >
                  <input
    ref={inputRef}
    type="text"
    value={input}
    onChange={(e) => setInput(e.target.value)}
    placeholder={enableSearchGrounding ? "Ask anything with live Google Search..." : "Ask your workout or nutrition question..."}
    disabled={isLoading}
    className="flex-1 px-3 py-2 text-xs border border-[#E8E5EE] dark:border-slate-800 rounded-xl focus:outline-hidden focus:border-purple-600 bg-slate-50/70 dark:bg-slate-900 focus:bg-white dark:focus:bg-[#0b0d15] text-[#15131D] dark:text-white transition-colors"
  />
                  <button
    type="submit"
    disabled={isLoading || !input.trim()}
    className="p-2.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white rounded-xl shadow-xs transition-colors cursor-pointer shrink-0"
    title="Send message"
  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>

                <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-400 px-1">
                  <span>
                    Model: <strong className="font-mono text-slate-600">
                      {enableSearchGrounding ? "gemini-3.5-flash (Search)" : taskType === "complex" ? "gemini-3.1-pro-preview" : taskType === "fast" ? "gemini-3.1-flash-lite" : "gemini-3.5-flash"}
                    </strong>
                  </span>
                  <span>FitSync Flagship AI</span>
                </div>
              </div>
            </>}
        </div>}
    </>;
};
export {
  GeminiChatWidget
};
