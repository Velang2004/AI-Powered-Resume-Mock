import React, { useState, useRef, useEffect } from 'react';
import { ResumeData } from '../../types';
import { apiService } from '../../services/api';
import {
  Bot,
  Send,
  Sparkles,
  X,
  User,
  Loader2,
  ChevronRight,
  HelpCircle,
  Briefcase,
  Zap,
} from 'lucide-react';

interface CareerCopilotDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  resumeData: ResumeData;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const QUICK_PROMPTS = [
  'How do I negotiate salary for a Senior Full-Stack role?',
  'What are the most asked System Design interview questions?',
  'Give me 3 impactful bullet points for a FastAPI + Redis project.',
  'How do ATS screening algorithms score my resume keywords?',
];

export const CareerCopilotDrawer: React.FC<CareerCopilotDrawerProps> = ({
  isOpen,
  onClose,
  resumeData,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `Hello ${resumeData.personal.fullName || 'there'}! I'm your AI Career Copilot. I can analyze your resume, optimize your job search strategy, role-play mock interview scenarios, or assist in salary negotiations. How can I assist you today?`,
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  if (!isOpen) return null;

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || input || '';
    if (!text.trim() || isLoading) return;

    const newMessages: Message[] = [...messages, { role: 'user', content: text }];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const userContext = {
        title: resumeData.personal.title,
        skills: resumeData.skills,
        experienceCount: resumeData.experience?.length || 0,
      };

      const res = await apiService.sendCopilotMessage(newMessages, userContext);
      setMessages([...newMessages, { role: 'assistant', content: res.reply }]);
    } catch (e: any) {
      setMessages([
        ...newMessages,
        {
          role: 'assistant',
          content: 'Sorry, I encountered an issue reaching the Gemini engine. Please check your network or try again in a moment.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[450px] bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-850">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-linear-to-tr from-blue-600 to-indigo-600 rounded-xl text-white shadow-xs">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-1.5">
              Career & Interview Copilot
              <span className="px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 rounded text-[10px] font-bold">
                Gemini 3.7
              </span>
            </h2>
            <p className="text-[11px] text-slate-400">Context-aware career advice & coaching</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages Feed */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs">
        {messages.map((m, idx) => {
          const isAssistant = m.role === 'assistant';
          return (
            <div
              key={idx}
              className={`flex gap-2.5 ${isAssistant ? 'justify-start' : 'justify-end'}`}
            >
              {isAssistant && (
                <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                  <Bot className="w-4 h-4" />
                </div>
              )}
              <div
                className={`max-w-[82%] p-3 rounded-2xl leading-relaxed whitespace-pre-wrap ${
                  isAssistant
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200/60 dark:border-slate-700'
                    : 'bg-blue-600 text-white rounded-br-xs shadow-xs'
                }`}
              >
                {m.content}
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex gap-2.5 justify-start">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-2xl border border-slate-200/60 dark:border-slate-700 flex items-center gap-2 text-slate-500">
              <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
              <span className="text-[11px] font-medium">Copilot is thinking...</span>
            </div>
          </div>
        )}
      </div>

      {/* Suggested Quick Prompts */}
      <div className="p-3 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-200 dark:border-slate-800">
        <div className="text-[10.5px] font-semibold text-slate-400 mb-1.5 flex items-center gap-1">
          <Zap className="w-3 h-3 text-amber-500" /> Quick Inquiries:
        </div>
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {QUICK_PROMPTS.map((prompt, i) => (
            <button
              key={i}
              onClick={() => handleSendMessage(prompt)}
              className="px-2.5 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-400 rounded-lg text-[10.5px] text-slate-700 dark:text-slate-300 whitespace-nowrap transition"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Input Form */}
      <div className="p-3.5 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about resume tips, interview prep, stacks..."
            className="flex-1 px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="p-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl transition shadow-xs"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
