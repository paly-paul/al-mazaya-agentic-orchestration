"use client";

import { ReactNode } from "react";
import { ChatProvider, useChatContext } from "./chat/ChatProvider";
import TopBar from "./TopBar";
import Navigation from "./Navigation";
import Footer from "./Footer";
import ChatWidget from "./chat/ChatWidget";
import ChatTrigger from "./chat/ChatTrigger";

function ShellInner({ children }: { children: ReactNode }) {
  const { lang, toggleLang } = useChatContext();

  return (
    <div dir={lang === "ar" ? "rtl" : "ltr"} lang={lang} className="min-h-screen flex flex-col">
      <TopBar lang={lang} onLangToggle={toggleLang} />
      <Navigation lang={lang} />
      <main className="flex-1">{children}</main>
      <Footer lang={lang} />
      <ChatTrigger />
      <ChatWidget />
    </div>
  );
}

export default function SiteShell({ children }: { children: ReactNode }) {
  return (
    <ChatProvider>
      <ShellInner>{children}</ShellInner>
    </ChatProvider>
  );
}
