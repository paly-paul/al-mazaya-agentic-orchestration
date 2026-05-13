"use client";

import { useChatContext } from "./ChatProvider";
import { t } from "@/lib/translations";

export default function ChatTrigger() {
  const { isOpen, lang, openChat, closeChat } = useChatContext();
  const tr = t(lang);

  return (
    <button
      onClick={() => (isOpen ? closeChat() : openChat())}
      className="fixed bottom-5 right-5 z-50 w-14 h-14 rounded-full bg-[#005B41] text-white shadow-lg hover:bg-[#004A36] transition-all hover:scale-105 active:scale-95 flex items-center justify-center group"
      aria-label={tr.chat.triggerLabel}
    >
      {isOpen ? (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      ) : (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
      )}

      {/* Label tooltip */}
      <span className="absolute right-16 bg-[#005B41] text-white text-xs font-medium px-3 py-1.5 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity shadow-md pointer-events-none">
        {tr.chat.triggerLabel}
        <span className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1 border-4 border-transparent border-l-[#005B41]" />
      </span>
    </button>
  );
}
