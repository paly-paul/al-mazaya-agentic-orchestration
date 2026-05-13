import { ChatMessage } from "@/lib/chatApi";
import StructuredOutput from "./StructuredOutput";

interface Props {
  message: ChatMessage;
  lang: "en" | "ar";
}

export default function MessageBubble({ message, lang }: Props) {
  const isUser = message.role === "user";

  return (
    <div className={`flex items-start gap-2 mb-3 ${isUser ? "flex-row-reverse" : ""}`}>
      {/* Avatar */}
      {!isUser && (
        <div className="w-7 h-7 rounded-full bg-[#005B41] flex items-center justify-center flex-shrink-0 text-white text-xs font-bold">
          M
        </div>
      )}
      {isUser && (
        <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 text-gray-600 text-xs font-bold">
          U
        </div>
      )}

      <div className={`max-w-[80%] ${isUser ? "items-end" : "items-start"} flex flex-col`}>
        {/* Bubble */}
        <div
          className={`px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
            isUser
              ? "bg-[#005B41] text-white rounded-2xl rounded-tr-sm"
              : "bg-[#F8F7F4] text-gray-800 rounded-2xl rounded-tl-sm"
          }`}
        >
          {message.content}
        </div>

        {/* Structured output */}
        {message.structuredOutput && message.structuredOutput.type && (
          <div className="w-full mt-1">
            <StructuredOutput output={message.structuredOutput} lang={lang} />
          </div>
        )}

        {/* Timestamp */}
        <span className="text-[10px] text-gray-400 mt-1 px-1">
          {message.createdAt.toLocaleTimeString(lang === "ar" ? "ar" : "en", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>
    </div>
  );
}
