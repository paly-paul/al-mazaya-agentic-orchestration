import { StructuredOutput as SO } from "@/lib/chatApi";

interface Props {
  output: SO;
  lang: "en" | "ar";
}

export default function StructuredOutput({ output, lang }: Props) {
  if (!output || !output.type) return null;

  const p = output.payload;

  if (output.type === "lead_score") {
    const score = p.score as number;
    const tier = p.tier as string;
    const tierColor = tier === "hot" ? "#16a34a" : tier === "warm" ? "#d97706" : "#6b7280";
    const tierLabel =
      lang === "ar"
        ? tier === "hot" ? "عميل ساخن ✅" : tier === "warm" ? "عميل دافئ" : "عميل بارد"
        : tier === "hot" ? "Hot Lead ✅" : tier === "warm" ? "Warm Lead" : "Cold Lead";

    return (
      <div className="mt-2 border border-[#E8E5DF] rounded-lg p-3 bg-white text-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="font-semibold text-gray-700">
            {lang === "ar" ? "نتيجة تأهيل العميل" : "Lead Qualification Score"}
          </span>
          <span className="font-bold text-lg" style={{ color: tierColor }}>
            {score}/100
          </span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2 mb-2">
          <div
            className="h-2 rounded-full transition-all"
            style={{ width: `${score}%`, backgroundColor: tierColor }}
          />
        </div>
        <div className="flex items-center justify-between text-xs">
          <span style={{ color: tierColor }} className="font-semibold">{tierLabel}</span>
          {typeof p.best_match === "string" && <span className="text-gray-500">{p.best_match}</span>}
        </div>
      </div>
    );
  }

  if (output.type === "quote") {
    const items = p.items as Array<{ label: string; amount_kd: number }> | undefined;
    const total = p.total_kd as number;
    const ref = p.ref as string;
    const autoApproved = p.auto_approved as boolean;

    return (
      <div className="mt-2 border border-[#E8E5DF] rounded-lg overflow-hidden text-sm">
        <div className="bg-[#005B41] text-white px-3 py-2 flex items-center justify-between">
          <span className="font-semibold">📋 {lang === "ar" ? "عرض سعر الخدمة" : "Service Quote"} — {ref}</span>
        </div>
        <div className="bg-white p-3">
          {items?.map((item, i) => (
            <div key={i} className="flex justify-between py-1 border-b border-gray-100 last:border-b-0 text-gray-700">
              <span>{item.label}</span>
              <span className="font-medium">KD {item.amount_kd}</span>
            </div>
          ))}
          <div className="flex justify-between pt-2 mt-1 font-bold text-gray-900 border-t border-gray-200">
            <span>{lang === "ar" ? "الإجمالي" : "Total"}</span>
            <span>KD {total}</span>
          </div>
          {autoApproved && (
            <div className="mt-2 text-xs text-green-600 font-semibold">
              ✅ {lang === "ar" ? "موافقة تلقائية (أقل من حد KD 500)" : "Auto-approved (below KD 500 threshold)"}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (output.type === "ticket_ref") {
    const ref = p.ref as string;
    const priority = p.priority as string;
    const sla = p.sla as string;
    const vendor = p.vendor as string;
    const priorityColor = priority === "P1" ? "#dc2626" : priority === "P2" ? "#d97706" : "#16a34a";

    return (
      <div className="mt-2 border border-[#E8E5DF] rounded-lg overflow-hidden text-sm">
        <div className="bg-[#F8F7F4] px-3 py-2 border-b border-[#E8E5DF] font-semibold text-gray-700">
          🎫 {lang === "ar" ? "تذكرة الصيانة" : "Maintenance Ticket"}: {ref}
        </div>
        <div className="bg-white p-3 space-y-1.5 text-gray-700">
          <div className="flex items-center gap-2">
            <span className="font-medium">{lang === "ar" ? "الأولوية:" : "Priority:"}</span>
            <span className="font-bold" style={{ color: priorityColor }}>{priority}</span>
          </div>
          {sla && (
            <div>
              <span className="font-medium">{lang === "ar" ? "اتفاقية مستوى الخدمة:" : "SLA:"}</span>{" "}
              {sla}
            </div>
          )}
          {vendor && (
            <div>
              <span className="font-medium">{lang === "ar" ? "المورد المعين:" : "Assigned to:"}</span>{" "}
              {vendor}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (output.type === "vendor_ref") {
    const ref = p.ref as string;
    const company = p.company as string;
    const score = p.initial_score as number;
    const categories = p.categories as string[];

    return (
      <div className="mt-2 border border-[#E8E5DF] rounded-lg overflow-hidden text-sm">
        <div className="bg-[#005B41] text-white px-3 py-2 font-semibold">
          🤝 {lang === "ar" ? "تسجيل المورد" : "Vendor Registration"} — {ref}
        </div>
        <div className="bg-white p-3 space-y-1.5 text-gray-700">
          <div><span className="font-medium">{lang === "ar" ? "الشركة:" : "Company:"}</span> {company}</div>
          {categories && (
            <div>
              <span className="font-medium">{lang === "ar" ? "الفئات:" : "Categories:"}</span>{" "}
              {categories.join(", ")}
            </div>
          )}
          <div>
            <span className="font-medium">{lang === "ar" ? "النقاط الأولية:" : "Initial score:"}</span>{" "}
            <span className="font-bold text-[#005B41]">{score}/100</span>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
