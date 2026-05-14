'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  actions?: ActionItem[];
}

interface ActionItem {
  label: string;
  score?: number;
  tier?: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const INITIAL_QUICK_REPLIES = [
  "I'm interested in renting a clinic",
  'Report a maintenance issue',
  'Request a facility service',
  'Register as a vendor',
];

const WELCOME_MESSAGE: Message = {
  role: 'assistant',
  content:
    "Hello! I'm the Mazaya FM Assistant. I can help you with clinic enquiries, maintenance requests, facility services, or vendor registration. How can I help you today?",
  timestamp: new Date(),
};

function generateSessionId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function parseActions(actionsTaken: unknown[]): ActionItem[] {
  if (!Array.isArray(actionsTaken) || actionsTaken.length === 0) return [];
  return actionsTaken.map((action) => {
    if (typeof action === 'string') return { label: action };
    if (typeof action === 'object' && action !== null) {
      const a = action as Record<string, unknown>;
      const label =
        (a.action as string) ||
        (a.type as string) ||
        (a.label as string) ||
        'Action taken';
      const score = typeof a.score === 'number' ? a.score : undefined;
      const tier = typeof a.tier === 'string' ? a.tier : undefined;
      return { label, score, tier };
    }
    return { label: String(action) };
  });
}

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const [quickReplies, setQuickReplies] = useState<string[]>(INITIAL_QUICK_REPLIES);
  const [hasOpened, setHasOpened] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Generate or restore session ID
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = sessionStorage.getItem('mazaya_session_id');
    if (stored) {
      setSessionId(stored);
    } else {
      const id = generateSessionId();
      sessionStorage.setItem('mazaya_session_id', id);
      setSessionId(id);
    }
  }, []);

  // Listen for open-chat event from CTA button on page
  useEffect(() => {
    const handler = () => setIsOpen(true);
    window.addEventListener('mazaya:open-chat', handler);
    return () => window.removeEventListener('mazaya:open-chat', handler);
  }, []);

  // Show welcome message on first open
  useEffect(() => {
    if (isOpen && !hasOpened) {
      setHasOpened(true);
      setMessages([{ ...WELCOME_MESSAGE, timestamp: new Date() }]);
      setQuickReplies(INITIAL_QUICK_REPLIES);
    }
  }, [isOpen, hasOpened]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isLoading || !sessionId) return;

      const userMessage: Message = {
        role: 'user',
        content: trimmed,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setInputValue('');
      setQuickReplies([]);
      setIsLoading(true);

      try {
        const response = await fetch(`${API_BASE}/api/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            session_id: sessionId,
            message: trimmed,
            language: 'en',
            use_case_hint: null,
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        const payload = data?.data ?? data;

        const assistantMessage: Message = {
          role: 'assistant',
          content: payload?.message || "I'm sorry, I couldn't process your request.",
          timestamp: new Date(),
          actions: parseActions(payload?.actions_taken || []),
        };

        setMessages((prev) => [...prev, assistantMessage]);
        setQuickReplies(Array.isArray(payload?.quick_replies) ? payload.quick_replies : []);
      } catch {
        const errorMessage: Message = {
          role: 'assistant',
          content: 'Sorry, something went wrong. Please try again.',
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);
        setQuickReplies([]);
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, sessionId]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputValue);
  };

  const handleQuickReply = (reply: string) => {
    sendMessage(reply);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-white transition-all duration-200 hover:scale-110 active:scale-95 ${
          isOpen ? 'opacity-0 pointer-events-none scale-90' : 'opacity-100 scale-100'
        }`}
        style={{ backgroundColor: '#005B41' }}
        aria-label="Open chat"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
          />
        </svg>
      </button>

      {/* Chat panel */}
      {isOpen && (
        <div
          className="fixed bottom-6 right-6 z-50 flex flex-col rounded-2xl shadow-2xl overflow-hidden chat-panel-enter"
          style={{
            width: '380px',
            height: '500px',
            backgroundColor: '#ffffff',
            border: '1px solid #e5e7eb',
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-4 py-3 shrink-0"
            style={{ backgroundColor: '#005B41' }}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-white font-semibold text-sm leading-tight">Mazaya FM Assistant</p>
                <p className="text-white/70 text-xs">Powered by AI</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 rounded-full flex items-center justify-center text-white/80 hover:text-white hover:bg-white/20 transition-colors"
              aria-label="Close chat"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Messages area */}
          <div
            className="flex-1 overflow-y-auto px-4 py-3 space-y-3"
            style={{ backgroundColor: '#F8F7F4' }}
          >
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div
                  className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'text-white rounded-br-md'
                      : 'text-gray-800 bg-white border border-gray-100 rounded-bl-md shadow-sm'
                  }`}
                  style={msg.role === 'user' ? { backgroundColor: '#005B41' } : {}}
                >
                  {msg.content}
                </div>

                {/* Actions taken info box */}
                {msg.actions && msg.actions.length > 0 && (
                  <div className="mt-1 max-w-[80%] px-2.5 py-1.5 rounded-lg text-xs text-gray-500 bg-white border border-gray-100 shadow-sm">
                    {msg.actions.map((action, aIdx) => (
                      <div key={aIdx} className="flex items-center gap-1.5">
                        <svg className="w-3 h-3 text-[#005B41] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>
                          {action.label}
                          {action.score !== undefined && (
                            <span className="ml-1 font-medium text-[#005B41]">
                              — Score: {action.score}
                              {action.tier && ` (${action.tier})`}
                            </span>
                          )}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                <span className="text-[10px] text-gray-400 mt-0.5 px-1">
                  {formatTime(msg.timestamp)}
                </span>

                {/* Quick replies after last assistant message */}
                {msg.role === 'assistant' &&
                  idx === messages.length - 1 &&
                  quickReplies.length > 0 &&
                  !isLoading && (
                    <div className="mt-2 flex flex-wrap gap-1.5 max-w-[90%]">
                      {quickReplies.map((reply, rIdx) => (
                        <button
                          key={rIdx}
                          onClick={() => handleQuickReply(reply)}
                          className="px-3 py-1.5 rounded-full text-xs font-medium border transition-all hover:text-white"
                          style={{
                            borderColor: '#005B41',
                            color: '#005B41',
                            backgroundColor: 'transparent',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#005B41';
                            e.currentTarget.style.color = '#ffffff';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                            e.currentTarget.style.color = '#005B41';
                          }}
                        >
                          {reply}
                        </button>
                      ))}
                    </div>
                  )}
              </div>
            ))}

            {/* Loading indicator */}
            {isLoading && (
              <div className="flex items-start">
                <div className="px-4 py-3 rounded-2xl rounded-bl-md bg-white border border-gray-100 shadow-sm">
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input area */}
          <form
            onSubmit={handleSubmit}
            className="flex items-center gap-2 px-3 py-3 border-t border-gray-100 bg-white shrink-0"
          >
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type a message..."
              disabled={isLoading}
              className="flex-1 text-sm px-3 py-2 rounded-xl border border-gray-200 outline-none focus:border-[#005B41] focus:ring-1 focus:ring-[#005B41]/20 transition-colors disabled:opacity-60 disabled:cursor-not-allowed bg-gray-50"
            />
            <button
              type="submit"
              disabled={isLoading || !inputValue.trim()}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white transition-all shrink-0 disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 active:scale-95"
              style={{ backgroundColor: '#005B41' }}
              aria-label="Send message"
            >
              <svg className="w-4 h-4 rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </form>
        </div>
      )}
    </>
  );
}
