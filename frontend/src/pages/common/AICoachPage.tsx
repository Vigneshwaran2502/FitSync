import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Send,
  RotateCcw,
  Globe,
  Zap,
  Brain,
  Dumbbell,
  ExternalLink,
  Bot,
  User as UserIcon,
  Search,
  Apple,
  Activity,
  Copy,
  Check,
} from 'lucide-react';
import { geminiApi, ChatMessage, CoachRole } from '../../api/geminiApi';

export const AICoachPage: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'model',
      content: `👋 Welcome to the **FitSync AI Fitness Intelligence Suite**.\n\nI can analyze periodization models, generate tailored hypertrophy or strength splits, review recovery protocols, or pull recent sports science studies via live **Google Search Grounding**.\n\nSelect a specialist persona from the left panel, or start asking questions below!`,
      modelUsed: 'gemini-3.5-flash',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [taskType, setTaskType] = useState<'general' | 'complex' | 'fast'>('general');
  const [enableSearchGrounding, setEnableSearchGrounding] = useState(false);
  const [selectedRole, setSelectedRole] = useState('general');
  const [roles, setRoles] = useState<CoachRole[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    geminiApi.getCoachRoles()
      .then((res) => {
        if (res.roles) setRoles(res.roles);
      })
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (textToSend?: string, overrideTask?: 'general' | 'complex' | 'fast', overrideSearch?: boolean) => {
    const prompt = (textToSend || input).trim();
    if (!prompt || isLoading) return;

    const currentTask = overrideTask || taskType;
    const currentSearch = overrideSearch !== undefined ? overrideSearch : enableSearchGrounding;

    const userMessage: ChatMessage = {
      role: 'user',
      content: prompt,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const apiHistory = newMessages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await geminiApi.sendMessage({
        messages: apiHistory,
        role: selectedRole,
        taskType: currentTask,
        enableSearchGrounding: currentSearch,
      });

      const modelMessage: ChatMessage = {
        role: 'model',
        content: res.content,
        modelUsed: res.modelUsed,
        groundingSources: res.groundingSources,
        webSearchQueries: res.webSearchQueries,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, modelMessage]);
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Error communicating with Gemini model.';
      setMessages((prev) => [
        ...prev,
        {
          role: 'model',
          content: `⚠️ **Service Notice:** ${errorMsg}`,
          modelUsed: 'system',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const roleIcons: Record<string, React.ReactNode> = {
    general: <Dumbbell className="w-4 h-4 text-purple-600 dark:text-purple-400" />,
    nutrition: <Apple className="w-4 h-4 text-amber-500" />,
    recovery: <Activity className="w-4 h-4 text-lime-600 dark:text-lime-400" />,
    complex: <Brain className="w-4 h-4 text-indigo-500" />,
    fast: <Zap className="w-4 h-4 text-rose-500" />,
  };

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-black text-[#15131D] dark:text-white tracking-tight">FitSync AI Fitness Coach</h1>
            <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
              Gemini 3 Suite
            </span>
          </div>
          <p className="text-xs text-[#686476] dark:text-slate-400 mt-1">
            Multi-turn intelligent coaching with Google Search Grounding and task-specialized reasoning
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setMessages([
                {
                  role: 'model',
                  content: 'Conversation thread refreshed. What would you like to work on?',
                  modelUsed: 'gemini-3.5-flash',
                  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                },
              ]);
            }}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-[#15131D] dark:text-slate-200 bg-white dark:bg-slate-900 border border-[#E8E5EE] dark:border-slate-800 hover:border-purple-500/50 rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
            <span>New Chat</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Sidebar: Specialized Personas & Model Specs */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white dark:bg-[#0b0d15] border border-[#E8E5EE] dark:border-slate-800 rounded-3xl p-5 shadow-[0_10px_30px_rgba(30,20,60,0.04)] dark:shadow-none theme-transition">
            <h2 className="text-xs font-bold text-[#15131D] dark:text-white uppercase tracking-wider mb-3">
              Specialized Coach Personas
            </h2>
            <div className="space-y-2">
              {roles.map((r) => {
                const isSelected = selectedRole === r.id;
                return (
                  <button
                    key={r.id}
                    onClick={() => {
                      setSelectedRole(r.id);
                      if (r.id === 'complex') setTaskType('complex');
                      else if (r.id === 'fast') setTaskType('fast');
                      else setTaskType('general');
                    }}
                    className={`w-full text-left p-3.5 rounded-2xl border text-xs transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-purple-50 dark:bg-purple-950/60 border-purple-300 dark:border-purple-700 ring-1 ring-purple-400/50'
                        : 'bg-[#F8F7FA] dark:bg-slate-900/60 border-[#E8E5EE] dark:border-slate-800/80 hover:border-purple-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {roleIcons[r.id] || <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />}
                      <span className="font-bold text-[#15131D] dark:text-white">{r.name}</span>
                    </div>
                    <p className="text-[11px] text-[#686476] dark:text-slate-400 leading-relaxed mb-2">{r.description}</p>
                    <div className="flex items-center justify-between text-[10px] text-[#8E8A9C] dark:text-slate-500 font-mono">
                      <span>Model:</span>
                      <span className="font-bold text-[#15131D] dark:text-slate-300">{r.modelDefault}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Prompts Panel */}
          <div className="bg-white dark:bg-[#0b0d15] border border-[#E8E5EE] dark:border-slate-800 rounded-3xl p-5 shadow-[0_10px_30px_rgba(30,20,60,0.04)] dark:shadow-none theme-transition">
            <h2 className="text-xs font-bold text-[#15131D] dark:text-white uppercase tracking-wider mb-3">
              Suggested Topics
            </h2>
            <div className="space-y-2 text-xs">
              <button
                onClick={() =>
                  handleSend(
                    'What does the latest clinical sports research say about optimal protein intake per meal vs whole-day totals?',
                    'general',
                    true
                  )
                }
                className="w-full text-left p-2.5 rounded-xl bg-[#F8F7FA] dark:bg-slate-900/60 hover:bg-purple-50 dark:hover:bg-purple-950/40 text-[#686476] dark:text-slate-300 hover:text-purple-700 dark:hover:text-purple-300 text-[11px] transition-colors border border-[#E8E5EE] dark:border-slate-800 cursor-pointer"
              >
                🌐 Latest research on protein distribution
              </button>
              <button
                onClick={() =>
                  handleSend(
                    'Design a 6-week progressive overload block for barbell squats targeting 1RM strength with fatigue monitoring.',
                    'complex',
                    false
                  )
                }
                className="w-full text-left p-2.5 rounded-xl bg-[#F8F7FA] dark:bg-slate-900/60 hover:bg-purple-50 dark:hover:bg-purple-950/40 text-[#686476] dark:text-slate-300 hover:text-purple-700 dark:hover:text-purple-300 text-[11px] transition-colors border border-[#E8E5EE] dark:border-slate-800 cursor-pointer"
              >
                🔬 Periodized 6-week Squat Progression
              </button>
              <button
                onClick={() =>
                  handleSend('Quick 3-step checklist to avoid lower back rounding on Conventional Deadlifts.', 'fast', false)
                }
                className="w-full text-left p-2.5 rounded-xl bg-[#F8F7FA] dark:bg-slate-900/60 hover:bg-purple-50 dark:hover:bg-purple-950/40 text-[#686476] dark:text-slate-300 hover:text-purple-700 dark:hover:text-purple-300 text-[11px] transition-colors border border-[#E8E5EE] dark:border-slate-800 cursor-pointer"
              >
                ⚡ Rapid Deadlift form cues
              </button>
            </div>
          </div>
        </div>

        {/* Right Main Panel: Multi-Turn Conversation Thread */}
        <div className="lg:col-span-3 bg-white dark:bg-[#0b0d15] border border-[#E8E5EE] dark:border-slate-800 rounded-3xl shadow-[0_10px_30px_rgba(30,20,60,0.04)] dark:shadow-none flex flex-col h-[700px] overflow-hidden theme-transition">
          {/* Top Control Bar */}
          <div className="px-5 py-3.5 bg-[#F8F7FA] dark:bg-slate-950/80 border-b border-[#E8E5EE] dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0 theme-transition">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#15131D] dark:text-white">Task Complexity:</span>
              <div className="inline-flex p-1 bg-white dark:bg-slate-900 border border-[#E8E5EE] dark:border-slate-800 rounded-xl text-xs font-semibold">
                <button
                  onClick={() => {
                    setTaskType('fast');
                    setEnableSearchGrounding(false);
                  }}
                  className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                    taskType === 'fast' && !enableSearchGrounding
                      ? 'bg-purple-600 text-white shadow-2xs font-bold'
                      : 'text-[#686476] dark:text-slate-400 hover:text-[#15131D] dark:hover:text-white'
                  }`}
                  title="gemini-3.1-flash-lite for rapid answers"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Fast</span>
                </button>
                <button
                  onClick={() => setTaskType('general')}
                  className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                    taskType === 'general'
                      ? 'bg-purple-600 text-white shadow-2xs font-bold'
                      : 'text-[#686476] dark:text-slate-400 hover:text-[#15131D] dark:hover:text-white'
                  }`}
                  title="gemini-3.5-flash for general coaching"
                >
                  <Dumbbell className="w-3.5 h-3.5" />
                  <span>General</span>
                </button>
                <button
                  onClick={() => {
                    setTaskType('complex');
                    setEnableSearchGrounding(false);
                  }}
                  className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                    taskType === 'complex' && !enableSearchGrounding
                      ? 'bg-purple-600 text-white shadow-2xs font-bold'
                      : 'text-[#686476] dark:text-slate-400 hover:text-[#15131D] dark:hover:text-white'
                  }`}
                  title="gemini-3.1-pro-preview for deep biomechanics"
                >
                  <Brain className="w-3.5 h-3.5" />
                  <span>Complex</span>
                </button>
              </div>
            </div>

            {/* Google Search Grounding Switch */}
            <button
              type="button"
              onClick={() => {
                const next = !enableSearchGrounding;
                setEnableSearchGrounding(next);
                if (next) setTaskType('general'); // gemini-3.5-flash with googleSearch
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer border ${
                enableSearchGrounding
                  ? 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-700 shadow-2xs'
                  : 'bg-white dark:bg-slate-900 text-[#686476] dark:text-slate-400 border-[#E8E5EE] dark:border-slate-800 hover:text-[#15131D] dark:hover:text-white'
              }`}
            >
              <Globe
                className={`w-3.5 h-3.5 ${enableSearchGrounding ? 'text-purple-600 dark:text-purple-400 animate-spin' : 'text-[#8E8A9C]'}`}
                style={{ animationDuration: '10s' }}
              />
              <span>Google Search Grounding</span>
              <span
                className={`w-2 h-2 rounded-full ${
                  enableSearchGrounding ? 'bg-lime-500' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              />
            </button>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-[#FAFAF8] dark:bg-[#07080d]/60 theme-transition">
            {messages.map((msg, index) => {
              const isUser = msg.role === 'user';
              return (
                <div key={index} className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                  {/* Avatar */}
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs shadow-xs ${
                      isUser
                        ? 'bg-purple-600 text-white'
                        : 'bg-gradient-to-tr from-purple-600 via-violet-500 to-lime-400 text-white p-[1.5px]'
                    }`}
                  >
                    {isUser ? (
                      <UserIcon className="w-4 h-4" />
                    ) : (
                      <div className="w-full h-full bg-white dark:bg-[#0b0d14] rounded-[10px] flex items-center justify-center">
                        <Bot className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      </div>
                    )}
                  </div>

                  {/* Bubble Content */}
                  <div
                    className={`max-w-[78%] rounded-2xl p-4.5 shadow-2xs relative group leading-relaxed ${
                      isUser
                        ? 'bg-purple-600 text-white rounded-tr-none'
                        : 'bg-white dark:bg-[#0b0d15] border border-[#E8E5EE] dark:border-slate-800 text-[#15131D] dark:text-slate-100 rounded-tl-none'
                    }`}
                  >
                    {/* Copy Button */}
                    <button
                      onClick={() => handleCopy(msg.content, index)}
                      className={`absolute top-2.5 right-2.5 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer ${
                        isUser ? 'hover:bg-purple-700 text-purple-200' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-[#8E8A9C]'
                      }`}
                      title="Copy response"
                    >
                      {copiedIndex === index ? <Check className="w-3.5 h-3.5 text-lime-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>

                    {/* Text Rendering */}
                    <div className="text-xs leading-relaxed space-y-2 whitespace-pre-wrap">
                      {msg.content}
                    </div>

                    {/* Search Grounding Web Queries */}
                    {msg.webSearchQueries && msg.webSearchQueries.length > 0 && (
                      <div className="mt-3 pt-2.5 border-t border-[#E8E5EE] dark:border-slate-800 flex items-center gap-1.5 text-[11px] text-purple-600 dark:text-purple-400">
                        <Search className="w-3.5 h-3.5 shrink-0" />
                        <span className="font-bold">Search Query:</span>
                        <span className="truncate italic">"{msg.webSearchQueries.join(', ')}"</span>
                      </div>
                    )}

                    {/* Search Grounding Sources / Citations */}
                    {msg.groundingSources && msg.groundingSources.length > 0 && (
                      <div className="mt-3 pt-2.5 border-t border-[#E8E5EE] dark:border-slate-800 space-y-1.5">
                        <span className="text-[10px] font-bold text-[#8E8A9C] dark:text-slate-400 uppercase tracking-wider block">
                          Verified Web Sources:
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {msg.groundingSources.map((source, sIdx) => (
                            <a
                              key={sIdx}
                              href={source.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-purple-50 dark:bg-purple-950/50 hover:bg-purple-100 dark:hover:bg-purple-900/50 border border-purple-200 dark:border-purple-800/60 rounded-xl text-[11px] text-purple-700 dark:text-purple-300 transition-colors font-medium max-w-[260px] truncate"
                              title={source.url}
                            >
                              <ExternalLink className="w-3 h-3 shrink-0" />
                              <span className="truncate">{source.title}</span>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Metadata Footer */}
                    <div
                      className={`mt-2 flex items-center gap-2 text-[10px] ${
                        isUser ? 'text-purple-200 justify-end' : 'text-[#8E8A9C] dark:text-slate-400 justify-between'
                      }`}
                    >
                      {!isUser && msg.modelUsed && (
                        <span className="font-mono text-[9px] px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-md text-[#686476] dark:text-slate-300 font-bold">
                          {msg.modelUsed}
                        </span>
                      )}
                      <span>{msg.timestamp}</span>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex gap-3 items-start">
                <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-white dark:bg-[#0b0d15] border border-[#E8E5EE] dark:border-slate-800 rounded-2xl rounded-tl-none p-4 shadow-2xs">
                  <div className="flex items-center gap-3 text-xs text-[#686476] dark:text-slate-400">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                    <span>
                      {enableSearchGrounding
                        ? 'Grounding answer with live Google Search data via gemini-3.5-flash...'
                        : taskType === 'complex'
                        ? 'Processing periodization and biomechanics with gemini-3.1-pro-preview...'
                        : 'Generating fitness recommendations...'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Bar */}
          <div className="p-4 bg-white dark:bg-[#0b0d15] border-t border-[#E8E5EE] dark:border-slate-800 shrink-0 theme-transition">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-3"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  enableSearchGrounding
                    ? 'Ask questions grounded with Google Search (e.g., "Latest studies on hypertrophy rep ranges")...'
                    : 'Ask anything about your workout, macros, exercise form, or recovery...'
                }
                disabled={isLoading}
                className="flex-1 px-4 py-3 text-xs border border-[#E8E5EE] dark:border-slate-800 rounded-xl focus:outline-hidden focus:border-purple-600 bg-[#F8F7FA] dark:bg-slate-900 text-[#15131D] dark:text-white transition-colors"
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="px-5 py-3 bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white text-xs font-bold rounded-xl shadow-md shadow-purple-600/25 transition-all flex items-center gap-2 cursor-pointer shrink-0"
              >
                <span>Send</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
