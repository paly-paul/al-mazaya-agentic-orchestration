"use client";

import { createContext, useContext, useState, useCallback, useRef, ReactNode } from "react";
import { v4 as uuidv4 } from "uuid";
import { ChatMessage, StructuredOutput, sendMessage } from "@/lib/chatApi";
import { Lang } from "@/lib/translations";

type UseCaseHint = "enquiry" | "maintenance" | "facility" | "vendor" | "management" | null;

interface ChatContextType {
  isOpen: boolean;
  lang: Lang;
  messages: ChatMessage[];
  isTyping: boolean;
  sessionId: string;
  openChat: (useCaseHint?: UseCaseHint) => void;
  closeChat: () => void;
  toggleLang: () => void;
  sendUserMessage: (text: string) => void;
}

const ChatContext = createContext<ChatContextType | null>(null);

export function useChatContext() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChatContext must be used within ChatProvider");
  return ctx;
}

const GREETING_EN =
  "Hello! Welcome to Mazaya Clinics. I'm your AI facility assistant.\n\nHow can I help you today?";
const GREETING_AR =
  "أهلاً وسهلاً! مرحباً بكم في مزايا كلينيك. أنا مساعدكم الذكي للمرافق.\n\nكيف يمكنني مساعدتكم اليوم؟";

const QUICK_REPLIES_EN = [
  "Clinic space enquiry",
  "Report maintenance",
  "Request service",
  "Vendor registration",
  "Other question",
];
const QUICK_REPLIES_AR = [
  "الاستفسار عن مساحة عيادة",
  "الإبلاغ عن صيانة",
  "طلب خدمة",
  "تسجيل مورد",
  "سؤال آخر",
];

function makeMsgId() {
  return uuidv4();
}

export function ChatProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [lang, setLang] = useState<Lang>("en");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const sessionIdRef = useRef<string>(uuidv4());
  const currentUseCase = useRef<UseCaseHint>(null);

  const sessionId = sessionIdRef.current;

  const buildGreeting = useCallback(
    (language: Lang, hint: UseCaseHint): ChatMessage => {
      let content = language === "ar" ? GREETING_AR : GREETING_EN;
      let quickReplies = language === "ar" ? QUICK_REPLIES_AR : QUICK_REPLIES_EN;

      if (hint === "enquiry") {
        content =
          language === "ar"
            ? "أهلاً! سأساعدكم في إيجاد مساحة العيادة المناسبة. دعني أطرح عليكم بعض الأسئلة السريعة."
            : "Hello! I'll help you find the right clinic space. Let me ask a few quick questions.\n\nWhat medical specialty will you be practising?";
        quickReplies =
          language === "ar"
            ? ["أمراض القلب", "طب الأسنان", "طب الأطفال", "العظام", "طب العيون", "أخرى"]
            : ["Cardiology", "Dentistry", "Paediatrics", "Orthopaedics", "Ophthalmology", "Other"];
      } else if (hint === "maintenance") {
        content =
          language === "ar"
            ? "سأسجّل طلب صيانتكم. في أي برج أنتم؟"
            : "I'll log your maintenance request. Which tower are you in?";
        quickReplies =
          language === "ar"
            ? ["كلينيك I", "كلينيك II", "كلينيك III", "كلينيك IV", "كلينيك V", "كلينيك VI", "كلينيك VII", "كلينيك VIII"]
            : ["Clinic I", "Clinic II", "Clinic III", "Clinic IV", "Clinic V", "Clinic VI", "Clinic VII", "Clinic VIII"];
      } else if (hint === "vendor") {
        content =
          language === "ar"
            ? "مرحباً بكم في شبكة موردي مزايا! دعونا نبدأ تسجيلكم.\n\nما اسم شركتكم؟"
            : "Welcome to the Mazaya vendor network! Let's get you registered.\n\nWhat is your company name?";
        quickReplies = [];
      } else if (hint === "facility") {
        content =
          language === "ar"
            ? "ما نوع خدمة المرافق التي تحتاجونها؟"
            : "What facility service do you need?";
        quickReplies =
          language === "ar"
            ? ["شاشة LED / عرض رقمي", "لافتة العيادة", "جدران تقسيم", "ترقية الإضاءة", "كاميرات المراقبة", "أخرى"]
            : ["Digital display / LED screen", "Clinic signage", "Partition walls", "Lighting upgrade", "CCTV / security cameras", "Other"];
      }

      return {
        id: makeMsgId(),
        role: "assistant",
        content,
        createdAt: new Date(),
        quickReplies,
      };
    },
    []
  );

  const openChat = useCallback(
    (hint: UseCaseHint = null) => {
      currentUseCase.current = hint;
      setIsOpen(true);
      setMessages((prev) => {
        if (prev.length === 0 || hint !== currentUseCase.current) {
          return [buildGreeting(lang, hint)];
        }
        return prev;
      });
    },
    [lang, buildGreeting]
  );

  const closeChat = useCallback(() => {
    setIsOpen(false);
  }, []);

  const toggleLang = useCallback(() => {
    setLang((prev) => {
      const next: Lang = prev === "en" ? "ar" : "en";
      const hint = currentUseCase.current;
      setMessages([buildGreeting(next, hint)]);
      return next;
    });
  }, [buildGreeting]);

  const sendUserMessage = useCallback(
    async (text: string) => {
      const userMsg: ChatMessage = {
        id: makeMsgId(),
        role: "user",
        content: text,
        createdAt: new Date(),
      };
      setMessages((prev) => [...prev, userMsg]);
      setIsTyping(true);

      try {
        const res = await sendMessage({
          session_id: sessionId,
          message: text,
          language: lang,
          use_case_hint: currentUseCase.current,
        });

        const data = res.data;
        const assistantMsg: ChatMessage = {
          id: makeMsgId(),
          role: "assistant",
          content: data.message,
          createdAt: new Date(),
          quickReplies: data.quick_replies,
          structuredOutput: data.structured_output as StructuredOutput | null,
        };
        setMessages((prev) => [...prev, assistantMsg]);
      } catch {
        const errMsg: ChatMessage = {
          id: makeMsgId(),
          role: "assistant",
          content:
            lang === "ar"
              ? "عذراً، يتعذر الاتصال بالنظام حالياً. يرجى المحاولة مجدداً أو الاتصال بنا مباشرة."
              : "Sorry, I'm having trouble connecting right now. Please try again or contact us directly at info@mazayaclinics.com.",
          createdAt: new Date(),
          quickReplies: [],
        };
        setMessages((prev) => [...prev, errMsg]);
      } finally {
        setIsTyping(false);
      }
    },
    [sessionId, lang]
  );

  return (
    <ChatContext.Provider
      value={{
        isOpen,
        lang,
        messages,
        isTyping,
        sessionId,
        openChat,
        closeChat,
        toggleLang,
        sendUserMessage,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}
