export interface Clinic {
  id: string;
  slug: string;
  number: number;
  romanNumeral: string;
  name: string;
  nameAr: string;
  location: string;
  locationAr: string;
  description: string;
  descriptionAr: string;
  floors: string;
  floorsAr: string;
  specialties: string[];
  specialtiesAr: string[];
  features: string[];
  featuresAr: string[];
  totalUnits: number;
  availableUnits: number;
  priceRange: string;
  priceRangeAr: string;
  colorAccent: string;
}

export const clinics: Clinic[] = [
  {
    id: "clinic-i",
    slug: "clinic-i",
    number: 1,
    romanNumeral: "I",
    name: "Clover Centre",
    nameAr: "مركز كلوفر",
    location: "Al Jabriya, Kuwait City",
    locationAr: "الجابرية، مدينة الكويت",
    description:
      "Mazaya Clinic I at Clover Centre in Al Jabriya is a premier medical facility offering modern clinic spaces for specialist practitioners. Strategically located in the heart of Al Jabriya, it provides excellent accessibility for patients across Kuwait.",
    descriptionAr:
      "مزايا كلينيك الأول في مركز كلوفر بالجابرية مرفق طبي متميز يوفر مساحات عيادات حديثة للأطباء المتخصصين. يقع في موقع استراتيجي في قلب الجابرية، مما يوفر إمكانية وصول ممتازة للمرضى في جميع أنحاء الكويت.",
    floors: "Floors 4–12 (Medical)",
    floorsAr: "الطوابق 4–12 (طبية)",
    specialties: ["Cardiology", "Orthopaedics", "Paediatrics", "General Medicine"],
    specialtiesAr: ["أمراض القلب", "العظام", "طب الأطفال", "الطب العام"],
    features: [
      "Modern fit-out ready units",
      "24/7 security and reception",
      "Dedicated parking for patients and staff",
      "Central AC and medical gas supply",
      "High-speed internet infrastructure",
    ],
    featuresAr: [
      "وحدات جاهزة للتشطيب الحديث",
      "أمن واستقبال على مدار الساعة",
      "مواقف سيارات مخصصة للمرضى والموظفين",
      "تكييف مركزي وإمداد الغازات الطبية",
      "بنية تحتية للإنترنت عالي السرعة",
    ],
    totalUnits: 48,
    availableUnits: 12,
    priceRange: "KD 900–2,000/mo",
    priceRangeAr: "900–2,000 د.ك/شهر",
    colorAccent: "#005B41",
  },
  {
    id: "clinic-ii",
    slug: "clinic-ii",
    number: 2,
    romanNumeral: "II",
    name: "Sabah Al Salim",
    nameAr: "صباح السالم",
    location: "Sabah Al Salim, Kuwait",
    locationAr: "صباح السالم، الكويت",
    description:
      "Mazaya Clinic II in Sabah Al Salim offers premium medical clinic spaces in one of Kuwait's well-established residential areas. The tower hosts a variety of specialist clinics serving the local community.",
    descriptionAr:
      "مزايا كلينيك الثاني في صباح السالم يوفر مساحات عيادات طبية متميزة في أحد المناطق السكنية الراسخة في الكويت. يستضيف البرج مجموعة متنوعة من العيادات المتخصصة التي تخدم المجتمع المحلي.",
    floors: "Floors 3–10 (Medical)",
    floorsAr: "الطوابق 3–10 (طبية)",
    specialties: ["Dentistry", "Ophthalmology", "Dermatology", "ENT"],
    specialtiesAr: ["طب الأسنان", "طب العيون", "الأمراض الجلدية", "أمراض الأنف والأذن والحنجرة"],
    features: [
      "Fully equipped dental suites available",
      "Optic lab and imaging room",
      "Pharmacy unit on ground floor",
      "Patient waiting lounges on each floor",
      "Elevator access to all clinical floors",
    ],
    featuresAr: [
      "أجنحة أسنان مجهزة بالكامل متاحة",
      "مختبر بصري وغرفة تصوير",
      "وحدة صيدلية في الطابق الأرضي",
      "صالات انتظار للمرضى في كل طابق",
      "مصعد للوصول إلى جميع الطوابق الطبية",
    ],
    totalUnits: 42,
    availableUnits: 8,
    priceRange: "KD 850–1,800/mo",
    priceRangeAr: "850–1,800 د.ك/شهر",
    colorAccent: "#006B50",
  },
  {
    id: "clinic-iii",
    slug: "clinic-iii",
    number: 3,
    romanNumeral: "III",
    name: "Bneid Al Gar",
    nameAr: "بنيد القار",
    location: "Bneid Al Gar, Kuwait City",
    locationAr: "بنيد القار، مدينة الكويت",
    description:
      "Mazaya Clinic III in the prestigious Bneid Al Gar district is ideally positioned near Kuwait City's central business area. The tower offers spacious medical suites and is home to some of Kuwait's leading specialist practitioners.",
    descriptionAr:
      "مزايا كلينيك الثالث في منطقة بنيد القار المرموقة مثالية الموقع بالقرب من منطقة الأعمال المركزية في الكويت. يوفر البرج أجنحة طبية فسيحة ويضم بعض أبرز الأطباء المتخصصين في الكويت.",
    floors: "Floors 5–14 (Medical)",
    floorsAr: "الطوابق 5–14 (طبية)",
    specialties: ["Neurology", "Oncology", "Gastroenterology", "Endocrinology"],
    specialtiesAr: ["طب الأعصاب", "علم الأورام", "أمراض الجهاز الهضمي", "الغدد الصماء"],
    features: [
      "Premium grade fit-out standards",
      "Advanced diagnostic imaging centre",
      "Research and consultation suites",
      "VIP patient lounge facilities",
      "Valet parking service",
    ],
    featuresAr: [
      "معايير تشطيب درجة ممتازة",
      "مركز تصوير تشخيصي متقدم",
      "أجنحة للبحث والاستشارة",
      "مرافق صالة انتظار VIP للمرضى",
      "خدمة صف السيارات",
    ],
    totalUnits: 56,
    availableUnits: 15,
    priceRange: "KD 1,200–3,000/mo",
    priceRangeAr: "1,200–3,000 د.ك/شهر",
    colorAccent: "#005B41",
  },
  {
    id: "clinic-iv",
    slug: "clinic-iv",
    number: 4,
    romanNumeral: "IV",
    name: "Hawally",
    nameAr: "حولي",
    location: "Hawally, Kuwait",
    locationAr: "حولي، الكويت",
    description:
      "Mazaya Clinic IV in Hawally is one of our most popular towers, situated in the densely populated and commercially active Hawally area. With over 48 active clinics, it represents a thriving medical community.",
    descriptionAr:
      "مزايا كلينيك الرابع في حولي هو أحد أكثر أبراجنا شعبية، ويقع في منطقة حولي المكتظة بالسكان والنشطة تجارياً. مع أكثر من 48 عيادة نشطة، يمثل مجتمعاً طبياً مزدهراً.",
    floors: "Floors 4–13 (Medical)",
    floorsAr: "الطوابق 4–13 (طبية)",
    specialties: ["General Medicine", "Paediatrics", "Cardiology", "Orthopaedics", "Dentistry"],
    specialtiesAr: ["الطب العام", "طب الأطفال", "أمراض القلب", "العظام", "طب الأسنان"],
    features: [
      "High occupancy — established medical hub",
      "Ground floor retail and pharmacy",
      "Ample multi-level parking",
      "Strong patient footfall from residential area",
      "Digital signage directory in lobby",
    ],
    featuresAr: [
      "نسبة إشغال عالية — مركز طبي راسخ",
      "تجزئة وصيدلية في الطابق الأرضي",
      "مواقف سيارات متعددة الطوابق",
      "حركة مرضى قوية من المنطقة السكنية",
      "دليل لافتات رقمي في الردهة",
    ],
    totalUnits: 60,
    availableUnits: 10,
    priceRange: "KD 900–2,000/mo",
    priceRangeAr: "900–2,000 د.ك/شهر",
    colorAccent: "#004A36",
  },
  {
    id: "clinic-v",
    slug: "clinic-v",
    number: 5,
    romanNumeral: "V",
    name: "Jabriya",
    nameAr: "الجابرية",
    location: "Jabriya, Kuwait",
    locationAr: "الجابرية، الكويت",
    description:
      "Mazaya Clinic V in Jabriya offers modern medical spaces in one of Kuwait's most sought-after clinic districts. Close to major hospitals and educational institutions, it attracts specialist practitioners seeking a prestigious address.",
    descriptionAr:
      "مزايا كلينيك الخامس في الجابرية يوفر مساحات طبية حديثة في أحد أكثر أحياء العيادات المرغوبة في الكويت. بالقرب من المستشفيات الكبرى والمؤسسات التعليمية، يجذب الأطباء المتخصصين الباحثين عن عنوان مرموق.",
    floors: "Floors 3–11 (Medical)",
    floorsAr: "الطوابق 3–11 (طبية)",
    specialties: ["Surgery", "Psychiatry", "Rehabilitation", "Physiotherapy"],
    specialtiesAr: ["الجراحة", "الطب النفسي", "إعادة التأهيل", "العلاج الطبيعي"],
    features: [
      "Adjacent to Kuwait University Medical School",
      "Rehabilitation suites with equipment room",
      "Conference and seminar facilities",
      "Post-surgery recovery rooms available",
      "24-hour security with CCTV",
    ],
    featuresAr: [
      "مجاور لكلية الطب بجامعة الكويت",
      "أجنحة إعادة تأهيل مع غرفة معدات",
      "مرافق مؤتمرات وندوات",
      "غرف تعافي ما بعد الجراحة متاحة",
      "أمن على مدار الساعة مع كاميرات مراقبة",
    ],
    totalUnits: 44,
    availableUnits: 11,
    priceRange: "KD 950–2,200/mo",
    priceRangeAr: "950–2,200 د.ك/شهر",
    colorAccent: "#005B41",
  },
  {
    id: "clinic-vi",
    slug: "clinic-vi",
    number: 6,
    romanNumeral: "VI",
    name: "Salmiya",
    nameAr: "السالمية",
    location: "Salmiya, Kuwait",
    locationAr: "السالمية، الكويت",
    description:
      "Mazaya Clinic VI in Salmiya is located in Kuwait's most vibrant commercial and residential zone. The tower benefits from exceptional visibility and accessibility, attracting a high volume of walk-in patients.",
    descriptionAr:
      "مزايا كلينيك السادس في السالمية يقع في أكثر المناطق التجارية والسكنية حيوية في الكويت. يستفيد البرج من رؤية وإمكانية وصول استثنائيتين، مما يجذب حجماً كبيراً من المرضى.",
    floors: "Floors 4–12 (Medical)",
    floorsAr: "الطوابق 4–12 (طبية)",
    specialties: ["Dermatology", "Cosmetology", "Ophthalmology", "Dentistry"],
    specialtiesAr: ["الأمراض الجلدية", "التجميل", "طب العيون", "طب الأسنان"],
    features: [
      "Prime commercial location on Gulf Road",
      "Walk-in patient volume highest in portfolio",
      "Premium lobby and reception fit-out",
      "Cosmetic and laser treatment suites",
      "International patient services support",
    ],
    featuresAr: [
      "موقع تجاري رئيسي على الطريق البحري",
      "أعلى حجم مرضى في المحفظة",
      "ردهة واستقبال بتشطيب متميز",
      "أجنحة علاج تجميلي وليزر",
      "دعم خدمات المرضى الدوليين",
    ],
    totalUnits: 52,
    availableUnits: 9,
    priceRange: "KD 1,000–2,500/mo",
    priceRangeAr: "1,000–2,500 د.ك/شهر",
    colorAccent: "#006B50",
  },
  {
    id: "clinic-vii",
    slug: "clinic-vii",
    number: 7,
    romanNumeral: "VII",
    name: "Jahra",
    nameAr: "الجهراء",
    location: "Jahra, Kuwait",
    locationAr: "الجهراء، الكويت",
    description:
      "Mazaya Clinic VII serves the underserved Jahra governorate with modern medical infrastructure. This tower is strategically important as the primary specialist clinic destination for the western regions of Kuwait.",
    descriptionAr:
      "مزايا كلينيك السابع يخدم محافظة الجهراء ببنية تحتية طبية حديثة. هذا البرج مهم استراتيجياً باعتباره الوجهة الرئيسية لعيادات المتخصصين في المناطق الغربية من الكويت.",
    floors: "Floors 3–9 (Medical)",
    floorsAr: "الطوابق 3–9 (طبية)",
    specialties: ["General Medicine", "Paediatrics", "Obstetrics", "Internal Medicine"],
    specialtiesAr: ["الطب العام", "طب الأطفال", "التوليد", "الطب الباطني"],
    features: [
      "Only specialist tower in Jahra governorate",
      "Ground floor pharmacy and lab",
      "Extended operating hours",
      "Arabic-speaking staff requirement",
      "Affordable unit sizes from 45 sqm",
    ],
    featuresAr: [
      "البرج المتخصص الوحيد في محافظة الجهراء",
      "صيدلية ومختبر في الطابق الأرضي",
      "ساعات عمل ممتدة",
      "متطلب طاقم ناطق بالعربية",
      "أحجام وحدات بأسعار معقولة تبدأ من 45 متراً مربعاً",
    ],
    totalUnits: 36,
    availableUnits: 14,
    priceRange: "KD 700–1,500/mo",
    priceRangeAr: "700–1,500 د.ك/شهر",
    colorAccent: "#004A36",
  },
  {
    id: "clinic-viii",
    slug: "clinic-viii",
    number: 8,
    romanNumeral: "VIII",
    name: "Sabah Al Salem",
    nameAr: "صباح السالم",
    location: "Sabah Al Salem, South Kuwait",
    locationAr: "صباح السالم، جنوب الكويت",
    description:
      "Mazaya Clinic VIII in Sabah Al Salem is our newest addition to the portfolio, serving the rapidly growing southern residential areas of Kuwait. The modern tower offers the latest medical infrastructure standards.",
    descriptionAr:
      "مزايا كلينيك الثامن في صباح السالم هو أحدث إضافة لمحفظتنا، ويخدم المناطق السكنية الجنوبية سريعة النمو في الكويت. يوفر البرج الحديث أحدث معايير البنية التحتية الطبية.",
    floors: "Floors 4–11 (Medical)",
    floorsAr: "الطوابق 4–11 (طبية)",
    specialties: ["Family Medicine", "Gynaecology", "Paediatrics", "Dermatology"],
    specialtiesAr: ["طب الأسرة", "أمراض النساء", "طب الأطفال", "الأمراض الجلدية"],
    features: [
      "Newest tower with latest MEP standards",
      "Smart building management system",
      "Large format family clinic suites",
      "Children's play area in waiting zones",
      "Close to major residential compounds",
    ],
    featuresAr: [
      "أحدث برج بأحدث معايير المقاولات الكهربائية والميكانيكية والسباكة",
      "نظام إدارة مباني ذكي",
      "أجنحة عيادات عائلية ذات تنسيق كبير",
      "منطقة ألعاب للأطفال في مناطق الانتظار",
      "قريب من المجمعات السكنية الكبرى",
    ],
    totalUnits: 40,
    availableUnits: 18,
    priceRange: "KD 800–1,800/mo",
    priceRangeAr: "800–1,800 د.ك/شهر",
    colorAccent: "#005B41",
  },
];

export function getClinicBySlug(slug: string): Clinic | undefined {
  return clinics.find((c) => c.slug === slug);
}
