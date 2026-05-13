"use client";

import { useEffect, useRef, useState } from "react";
import { useChatContext } from "./ChatProvider";
import MessageBubble from "./MessageBubble";
import QuickReplies from "./QuickReplies";
import TypingIndicator from "./TypingIndicator";
import { t } from "@/lib/translations";

export default function ChatWidget() {
  const { isOpen, lang, messages, isTyping, closeChat, toggleLang, sendUserMessage } = useChatContext();
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const tr = t(lang);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, messages]);

  const lastMessage = messages[messages.length - 1];
  const quickReplies = !isTyping && lastMessage?.role === "assistant" ? (lastMessage.quickReplies ?? []) : [];

  const handleSend = () => {
    const text = inputValue.trim();
    if (!text) return;
    setInputValue("");
    sendUserMessage(text);
  };

  const handleQuickReply = (reply: string) => {
    sendUserMessage(reply);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const isRtl = lang === "ar";

  if (!isOpen) return null;

  return (
    <>
      {/* Desktop: fixed modal-like popup */}
      <div
        className={`fixed bottom-24 right-4 z-50 flex flex-col shadow-2xl rounded-xl overflow-hidden
          w-[calc(100vw-32px)] sm:w-[420px] h-[85vh] sm:h-[620px] max-h-[85vh]`}
        dir={isRtl ? "rtl" : "ltr"}
        style={{ fontFamily: "Arial, Helvetica Neue, system-ui, sans-serif" }}
      >
        {/* Header */}
        <div className="bg-[#005B41] text-white flex items-center justify-between px-4 py-3 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-white bg-opacity-20 flex items-center justify-center font-bold text-sm flex-shrink-0">
              M
            </div>
            <div>
              <div className="font-semibold text-sm leading-tight">{tr.chat.headerTitle}</div>
              <div className="flex items-center gap-1 text-xs text-green-200">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full inline-block animate-pulse" />
                {tr.chat.headerSubtitle}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Language toggle */}
            <button
              onClick={toggleLang}
              className="text-xs bg-white bg-opacity-20 hover:bg-opacity-30 rounded px-2 py-1 transition-colors font-medium"
              title={`Switch to ${lang === "en" ? "Arabic" : "English"}`}
            >
              {tr.chat.langToggle}
            </button>
            {/* Close */}
            <button
              onClick={closeChat}
              className="w-7 h-7 rounded-full hover:bg-white hover:bg-opacity-20 flex items-center justify-center transition-colors"
              aria-label={tr.chat.close}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto bg-white p-3">
          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} lang={lang} />
          ))}
          {isTyping && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick replies */}
        {quickReplies.length > 0 && (
          <div className="bg-white border-t border-gray-100">
            <QuickReplies replies={quickReplies} onSelect={handleQuickReply} lang={lang} />
          </div>
        )}

        {/* Input */}
        <div className="bg-white border-t border-gray-200 p-3 flex-shrink-0">
          <div className="flex items-center gap-2 bg-gray-50 rounded-full border border-gray-200 px-3 py-1.5">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={tr.chat.placeholder}
              disabled={isTyping}
              className="flex-1 bg-transparent text-sm text-gray-800 placeholder-gray-400 outline-none min-w-0"
              dir={isRtl ? "rtl" : "ltr"}
            />
            <button
              onClick={handleSend}
              disabled={!inputValue.trim() || isTyping}
              className="w-8 h-8 rounded-full bg-[#005B41] text-white flex items-center justify-center hover:bg-[#004A36] transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
              aria-label={tr.chat.send}
            >
              <svg
                className={`w-4 h-4 ${isRtl ? "rotate-180" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
          <p className="text-[10px] text-gray-400 text-center mt-1.5">
            {lang === "ar" ? "مدعوم بالذكاء الاصطناعي من مزايا" : "Powered by Mazaya AI"}
          </p>
        </div>
      </div>
    </>
  );
}
