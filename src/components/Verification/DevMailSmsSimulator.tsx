import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Mail, Smartphone, RefreshCw, Trash2, ExternalLink, ChevronDown, ChevronUp, CheckCircle, ShieldCheck } from 'lucide-react';

interface DevMailSmsSimulatorProps {
  onSelectToken?: (token: string) => void;
  onSelectOtp?: (otp: string) => void;
}

export const DevMailSmsSimulator: React.FC<DevMailSmsSimulatorProps> = ({
  onSelectToken,
  onSelectOtp,
}) => {
  const { simulatedMessages, refreshSimulatedMessages, authProvider, setAuthProvider } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'email' | 'sms'>('all');

  const filteredMessages = simulatedMessages.filter((msg) => {
    if (activeTab === 'all') return true;
    return msg.type === activeTab;
  });

  const unreadCount = simulatedMessages.filter((m) => !m.read).length;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Trigger Button */}
      <button
        id="dev-inbox-toggle-btn"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3.5 py-2.5 bg-slate-900 dark:bg-slate-800 text-white rounded-full shadow-xl hover:bg-slate-800 border border-slate-700 transition-all text-xs font-semibold"
      >
        <div className="flex items-center gap-1.5">
          <Mail className="w-3.5 h-3.5 text-blue-400" />
          <span>/</span>
          <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
        </div>
        <span>Live Email & SMS Stream</span>
        {simulatedMessages.length > 0 && (
          <span className="bg-blue-600 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
            {simulatedMessages.length}
          </span>
        )}
        {isOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
      </button>

      {/* Slide-up Container */}
      {isOpen && (
        <div className="absolute bottom-12 right-0 w-96 max-w-[90vw] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[480px] animate-in fade-in slide-in-from-bottom-4 duration-200">
          {/* Header */}
          <div className="px-4 py-3 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <div>
                <h4 className="text-xs font-bold leading-tight">Verification Stream Service</h4>
                <p className="text-[10px] text-slate-400">Simulating real Email dispatch & SMS gateway</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => refreshSimulatedMessages()}
                title="Refresh messages"
                className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Auth Provider Switcher Bar */}
          <div className="px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px]">
            <span className="text-slate-500 dark:text-slate-400 font-medium">Auth Mode:</span>
            <div className="flex bg-slate-200 dark:bg-slate-700 p-0.5 rounded-lg font-medium">
              <button
                onClick={() => setAuthProvider('internal')}
                className={`px-2 py-0.5 rounded text-[10px] transition ${
                  authProvider === 'internal'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                }`}
              >
                JWT + DB
              </button>
              <button
                onClick={() => setAuthProvider('supabase')}
                className={`px-2 py-0.5 rounded text-[10px] transition ${
                  authProvider === 'supabase'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                }`}
              >
                Supabase
              </button>
              <button
                onClick={() => setAuthProvider('firebase')}
                className={`px-2 py-0.5 rounded text-[10px] transition ${
                  authProvider === 'firebase'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                }`}
              >
                Firebase
              </button>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex border-b border-slate-200 dark:border-slate-800 text-xs font-medium">
            <button
              onClick={() => setActiveTab('all')}
              className={`flex-1 py-2 text-center transition ${
                activeTab === 'all'
                  ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 font-semibold'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
              }`}
            >
              All ({simulatedMessages.length})
            </button>
            <button
              onClick={() => setActiveTab('email')}
              className={`flex-1 py-2 text-center flex items-center justify-center gap-1 transition ${
                activeTab === 'email'
                  ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 font-semibold'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
              }`}
            >
              <Mail className="w-3 h-3" /> Emails
            </button>
            <button
              onClick={() => setActiveTab('sms')}
              className={`flex-1 py-2 text-center flex items-center justify-center gap-1 transition ${
                activeTab === 'sms'
                  ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 font-semibold'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
              }`}
            >
              <Smartphone className="w-3 h-3" /> SMS OTPs
            </button>
          </div>

          {/* Messages List */}
          <div className="overflow-y-auto p-3 space-y-2.5 flex-1 min-h-[160px] max-h-[300px]">
            {filteredMessages.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs">
                <p>No messages in stream yet.</p>
                <p className="text-[10px] mt-1 text-slate-500">
                  Register a new account or click "Resend OTP" to see live dispatches here.
                </p>
              </div>
            ) : (
              filteredMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`p-3 rounded-xl border transition text-xs ${
                    msg.type === 'email'
                      ? 'bg-blue-50/70 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900/50'
                      : 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span
                      className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${
                        msg.type === 'email'
                          ? 'bg-blue-600 text-white'
                          : 'bg-emerald-600 text-white'
                      }`}
                    >
                      {msg.type === 'email' ? <Mail className="w-2.5 h-2.5" /> : <Smartphone className="w-2.5 h-2.5" />}
                      {msg.type}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">{msg.timestamp}</span>
                  </div>

                  <div className="text-[11px] font-semibold text-slate-800 dark:text-slate-200 mb-0.5">
                    To: {msg.recipient}
                  </div>
                  {msg.subject && (
                    <div className="text-[11px] text-slate-600 dark:text-slate-400 font-medium mb-1">
                      Subject: {msg.subject}
                    </div>
                  )}

                  <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed break-words bg-white/60 dark:bg-slate-900/60 p-2 rounded-lg border border-slate-200/60 dark:border-slate-800 mb-2">
                    {msg.content}
                  </p>

                  {/* Action Affordance for quick testing */}
                  {msg.type === 'email' && msg.token && (
                    <button
                      onClick={() => onSelectToken && onSelectToken(msg.token!)}
                      className="w-full flex items-center justify-center gap-1.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-[11px] transition shadow-xs"
                    >
                      <ExternalLink className="w-3 h-3" />
                      Verify Email with this Token
                    </button>
                  )}

                  {msg.type === 'sms' && msg.otp && (
                    <button
                      onClick={() => onSelectOtp && onSelectOtp(msg.otp!)}
                      className="w-full flex items-center justify-center gap-1.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold text-[11px] transition shadow-xs"
                    >
                      <CheckCircle className="w-3 h-3" />
                      Auto-fill OTP: <span className="font-mono tracking-wider">{msg.otp}</span>
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
