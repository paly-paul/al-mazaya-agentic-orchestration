interface Props {
  replies: string[];
  onSelect: (reply: string) => void;
  lang: "en" | "ar";
}

export default function QuickReplies({ replies, onSelect, lang }: Props) {
  if (!replies || replies.length === 0) return null;

  return (
    <div
      className={`flex flex-wrap gap-2 px-3 pb-3 ${lang === "ar" ? "justify-end" : "justify-start"}`}
    >
      {replies.map((reply) => (
        <button
          key={reply}
          onClick={() => onSelect(reply)}
          className="text-xs border border-[#E8E5DF] rounded-full px-3 py-1.5 bg-white text-gray-700 hover:border-[#005B41] hover:text-[#005B41] hover:bg-[#F0F8F5] transition-colors"
        >
          {reply}
        </button>
      ))}
    </div>
  );
}
