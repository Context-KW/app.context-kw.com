/**
 * CONTEXT PORTAL - GLOBAL CONFIGURATION
 * 
 * This file contains all operational variables for the Context portal.
 * Edit these values directly to update pricing, rates, contact info, and specifications.
 * DO NOT modify the structure or variable names - only update the values.
 */

export const config = {
  // ============================================
  // COMPANY INFORMATION
  // ============================================
  company: {
    name: "Context",
    nameArabic: "كونتكست",
    tagline: "English Tutoring, Translation & Business Solutions",
    taglineArabic: "تدريس الإنجليزية والترجمة وحلول الأعمال",
  },

  // ============================================
  // CONTACT INFORMATION
  // ============================================
  contact: {
    email: "info@context-kw.com",
    phone: "+965 5503 9794",
    address: "Farwaniya, Habib Al-Munawir Street, between Ibn Al-Wazeer and Al-Ameed Coffee, Shop 16 (Basement).",
  },

  // ============================================
  // SERVICE 1: TUTORING & EXAM PREP
  // ============================================
  tutoring: {
    titleEn: "1-on-1 English Tutoring & Exam Prep",
    titleAr: "تدريس اللغة الإنجليزية والتحضير للاختبارات المهنية",
    descriptionEn: "Comprehensive English language training with specialized exam preparation",
    descriptionAr: "تدريب شامل على اللغة الإنجليزية مع تحضير متخصص للاختبارات",
    
    // Service options
    options: [
      {
        id: "ielts",
        labelEn: "IELTS & TOEFL Prep (1-on-1 Private)",
        labelAr: "التحضير لاختبارات أيلتس و توفل",
        descriptionEn: "Intensive exam strategy training for university admission or migration",
        descriptionAr: "تدريب مكثف على استراتيجيات الاختبار لتحقيق الدرجات المطلوبة للقبول الجامعي أو الهجرة",
      },
      {
        id: "ieltsSemiPrivate",
        labelEn: "IELTS & TOEFL Prep (1-on-2 Semi-Private)",
        labelAr: "التحضير لاختبارات أيلتس و توفل (جلسات ثنائية)",
        descriptionEn: "Shared intensive exam strategy training for two students (rate is per hour, total for the pair)",
        descriptionAr: "تدريب مكثف مشترك على استراتيجيات الاختبار لطالبين (السعر بالساعة للمجموعة كاملة)",
      },

      {
        id: "general",
        labelEn: "General English Tutoring",
        labelAr: "تدريس خصوصي",
        descriptionEn: "Customized language skills development (online or in-person)",
        descriptionAr: "تطوير مهارات اللغة الإنجليزية بشكل مخصص ومباشر (حضوري أو أونلاين)",
      },
      {
        id: "business",
        labelEn: "Business English & Interview Prep",
        labelAr: "اللغة الإنجليزية العامة وللأعمال",
        descriptionEn: "Professional language competency for university students and corporate employees",
        descriptionAr: "بناء الكفاءة اللغوية الأساسية لطلبة الجامعات والموظفين في قطاع الشركات",
      },
    ],

    // Hourly rates in KWD
    rates: {
      ielts: 18,
      ieltsSemiPrivate: 28,
      general: 15,
      business: 20,
    },
    // Promotional pricing (General English tutoring)
    promo: {
      generalRate: 7.5,
      discountPercent: 50,
    },



    // Delivery modes
    deliveryModes: [
      { id: "online", labelEn: "Online (Zoom/Teams)", labelAr: "أونلاين (زوم/تيمز)" },
      { id: "inPerson", labelEn: "In-Person (Kuwait)", labelAr: "حضوري (الكويت)" },
    ],

    // Session durations (in hours)
    sessionDurations: [1, 1.5, 2],

    // Package options
    packages: [
      { id: "single", labelEn: "Single Session Trial", labelAr: "جلسة تجريبية واحدة", sessions: 1, discount: 0 },
      { id: "five", labelEn: "5-Session Intensive Package", labelAr: "باقة 5 جلسات مكثفة", sessions: 5, discount: 10 },
      { id: "ten", labelEn: "10-Session Master Package", labelAr: "باقة 10 جلسات متقدمة", sessions: 10, discount: 15 },
    ],
  },

  // ============================================
  // SERVICE 2: ACCENT COACHING & INTERVIEW PREP
  // ============================================
  accentCoaching: {
    titleEn: "Accent Coaching & Interview Prep",
    titleAr: "تطوير النطق والتحضير للمقابلات الشخصية",
    descriptionEn: "Professional accent reduction and interview preparation training",
    descriptionAr: "تدريب احترافي على تقليل الهجاء وتحضير المقابلات الشخصية",

    // Service options
    options: [
      {
        id: "accentReduction",
        labelEn: "Accent Reduction",
        labelAr: "تطوير اللهجة الإنجليزية",
        descriptionEn: "Intensive pronunciation training based on linguistic methodology (American accent focus)",
        descriptionAr: "تدريب مكثف على النطق الصحيح وتقليل الهجاء الخاطئ بالاعتماد على أسس علم اللغويات (التركيز على اللهجة الأمريكية)",
      },
      {
        id: "interviewPrep",
        labelEn: "Job Interview Prep",
        labelAr: "التحضير للمقابلات",
        descriptionEn: "Targeted preparation for job interviews and public speaking",
        descriptionAr: "تأهيل مستهدف لمقابلات العمل والتحدث أمام الجمهور",
      },
      {
        id: "publicSpeaking",
        labelEn: "Public Speaking & Presentation",
        labelAr: "الإلقاء والخطابة",
        descriptionEn: "Speech rehearsal and presentation delivery training",
        descriptionAr: "تدريب على الإلقاء والعروض التقديمية",
      },
    ],

    // Focus areas
    focusAreas: [
      { id: "pronunciation", labelEn: "Pronunciation & Accent Reduction", labelAr: "النطق وتقليل الهجاء" },
      { id: "jobInterview", labelEn: "Upcoming Job Interview Prep", labelAr: "التحضير للمقابلة الوظيفية" },
      { id: "publicSpeaking", labelEn: "Public Speaking / Speech Rehearsal", labelAr: "الإلقاء والخطابة" },
    ],

    // Hourly rates in KWD
    rates: {
      accentCoaching: 16,
      interviewPrep: 17,
      combined: 18,
    },

    // Session durations (in hours)
    sessionDurations: [1, 1.5, 2],
  },

  // ============================================
  // SERVICE 3: TRANSLATION & PROOFREADING
  // ============================================
  translation: {
    titleEn: "Professional Translation & Academic Proofreading",
    titleAr: "الترجمة الاحترافية والتدقيق اللغوي",
    descriptionEn: "High-quality translation and linguistic consultation services",
    descriptionAr: "خدمات ترجمة عالية الجودة واستشارات لغوية",

    // Service options
    options: [
      {
        id: "translation",
        labelEn: "Document Translation (English ⇄ Arabic)",
        labelAr: "الترجمة الاحترافية",
        descriptionEn: "Professional high-quality translation for documents and records (non-sworn consultation)",
        descriptionAr: "ترجمة عالية الجودة للمستندات والوثائق بين اللغتين (العربية ⇄ الإنجليزية) بصيغة استشارات لغوية (غير محلفة)",
      },
      {
        id: "proofreading",
        labelEn: "Academic Proofreading & Essay Polishing",
        labelAr: "التدقيق اللغوي والأكاديمي",
        descriptionEn: "Review and refinement of research papers, essays, and academic reports",
        descriptionAr: "مراجعة وصقل الأبحاث والمقالات والتقارير الجامعية",
      },
      {
        id: "researchSupport",
        labelEn: "Research Support & Linguistic Guidance",
        labelAr: "دعم الأبحاث والمشاريع",
        descriptionEn: "Comprehensive linguistic guidance and support for academic projects",
        descriptionAr: "تقديم التوجيه والإرشاد اللغوي المتكامل للمشاريع الأكاديمية",
      },
    ],

    // Pricing per word in KWD
    rates: {
      englishToArabic: 0.5,
      arabicToEnglish: 0.5,
      proofreading: 0.15,
      researchSupport: 25, // per hour
    },

    // Document types
    documentTypes: [
      { id: "academic", labelEn: "Academic Papers", labelAr: "الأوراق الأكاديمية" },
      { id: "corporate", labelEn: "Corporate Documents", labelAr: "المستندات الشركات" },
      { id: "legal", labelEn: "Legal Documents", labelAr: "المستندات القانونية" },
      { id: "technical", labelEn: "Technical Content", labelAr: "المحتوى التقني" },
      { id: "creative", labelEn: "Creative Writing", labelAr: "الكتابة الإبداعية" },
      { id: "presentations", labelEn: "Presentations", labelAr: "العروض التقديمية" },
    ],
  },

  // ============================================
  // SERVICE 4: UNIVERSITY ADVISING & ADMISSIONS
  // ============================================
  universityAdvising: {
    titleEn: "University Advising & Admissions",
    titleAr: "الاستشارات الأكاديمية و القبول الجامعي",
    descriptionEn: "Comprehensive guidance for university applications and academic planning",
    descriptionAr: "إرشادات متكاملة للتقديمات الجامعية والتخطيط الأكاديمي",

    // Service options
    options: [
      {
        id: "applications",
        labelEn: "University Applications",
        labelAr: "التقديمات الجامعية",
        descriptionEn: "Integrated guidance and support for university admission applications",
        descriptionAr: "إرشادات وتوجيهات متكاملة لمعاملات التقديم والقبول في الجامعات",
      },
      {
        id: "coursePlanning",
        labelEn: "Course Planning & Degree Mapping",
        labelAr: "الجداول الدراسية",
        descriptionEn: "Strategic assistance in course planning and academic schedule selection",
        descriptionAr: "مساعدة استراتيجية في تخطيط المقررات واختيار الجداول الأكاديمية",
      },
      {
        id: "academicGuidance",
        labelEn: "Academic Guidance & Consultation",
        labelAr: "الاستشارات الأكاديمية",
        descriptionEn: "Educational advice and appropriate language pathway identification",
        descriptionAr: "تقديم المشورة التعليمية وتحديد المسارات اللغوية المناسبة",
      },
    ],

    // Target degree levels. Only Bachelor's and Master's are offered.
    // priceMultiplier scales per-session prices; Bachelor's is the baseline (1x).
    targetDegrees: [
      { id: "bachelor", labelEn: "Bachelor's Degree", labelAr: "درجة البكالوريوس", priceMultiplier: 1 },
      { id: "master", labelEn: "Master's Degree", labelAr: "درجة الماجستير", priceMultiplier: 1.5 },
    ],

    // Consultation rates in KWD
    rates: {
      initialConsultation: 50,
      followUpSession: 40,
      fullPackage: 200,
    },

    // Session durations
    sessionDurations: [0.5, 1], // 30 min or 60 min
    // 30-minute sessions cost this share of the 1-hour rate (60%, not a 50% pro-rata split)
    shortSessionRatio: 0.6,
  },

  // ============================================
  // SERVICE 5: CORPORATE & EXECUTIVE SOLUTIONS
  // ============================================
  corporate: {
    titleEn: "Corporate & Executive Solutions",
    titleAr: "حلول الشركات والتطوير التنفيذي",
    descriptionEn: "B2B training and executive communication solutions",
    descriptionAr: "حلول تدريب وتواصل تنفيذي للشركات",

    // Service options
    options: [
      {
        id: "businessComm",
        labelEn: "Business Communication Training",
        labelAr: "التواصل المهني للأعمال",
        descriptionEn: "Specialized executive training on email writing, memos, and reports in English",
        descriptionAr: "تدريب تنفيذي متخصص على كتابة المراسلات الإلكترونية ومذكرات العمل والتقارير بالإنجليزية",
      },
      {
        id: "financialTranslation",
        labelEn: "Financial & Commercial Translation",
        labelAr: "الترجمة المالية والتجارية",
        descriptionEn: "Professional translation for financial and commercial documents",
        descriptionAr: "ترجمة احترافية للمستندات المالية والتجارية",
      },
      {
        id: "executivePitch",
        labelEn: "Executive Pitch Deck Polishing",
        labelAr: "تأهيل العروض التقديمية التنفيذية",
        descriptionEn: "Refine presentation skills and boardroom speaking strategies",
        descriptionAr: "صقل مهارات الإلقاء والعروض الترويجية واستراتيجيات التحدث في اجتماعات مجالس الإدارات",
      },
    ],

    // Small Team Package: 3-8 people, on-site delivery
    smallTeamPackage: {
      minPeople: 3,
      maxPeople: 8,
      priceStandard: 300,
      priceLaunch: 150,
      descriptionEn: "6-Hour Professional Communication Workshop Block delivered on-site at client location",
      descriptionAr: "كتلة ورشة عمل مهارات التواصل الاحترافية الممتدة لـ6 ساعات، تُقدَّم على الموقع المُخصَّص للعميل"
    },

    minimumTeamSize: 3,
    maximumTeamSize: 8,
  },

  // ============================================
  // SERVICE 6: PRINT SHOP & DOCUMENT CENTER
  // ============================================
  printShop: {
    titleEn: "Copy, Printing & Document Center",
    titleAr: "مركز خدمة الطالب والطباعة",
    descriptionEn: "Fast digital printing, copying, and document services",
    descriptionAr: "خدمات طباعة رقمية سريعة وتصوير ونسخ",

    // Paper specifications (Epson L3350 compatible)
    // All print paper is standard A4 size.
    paperTypes: [
      {
        id: "plain",
        labelEn: "Standard Office Paper (Plain)",
        labelAr: "ورق عادي",
        helperTextEn: "Best for text documents, drafts, and multi-page manuscripts",
        helperTextAr: "الأفضل للمستندات النصية والمسودات والمخطوطات متعددة الصفحات",
        pricePerPage: 0.05,
        // Bulk steps (by total sheets). Each step applies 25% off the price after the promo, and steps stack.
        bulkDiscounts: [
          { minSheets: 50, percent: 25 },
          { minSheets: 500, percent: 25 },
        ],
      },
    ],

    // Promotional discount for printing (25%). Other services use 50%.
    promoDiscountPercent: 25,

    // Volume tiers (per page, KWD). Display price is struck through; billed price applies.
    printTiers: {
      threshold: 25,
      bw: { displayPrice: 0.05, belowThreshold: 0.05, atOrAboveThreshold: 0.05 },
      color: { displayPrice: 0.15, belowThreshold: 0.1, atOrAboveThreshold: 0.09 },
    },

    // Delivery zones (flat fee, KWD)
    deliveryZones: [
      { id: "farwaniya", labelEn: "Farwaniya", labelAr: "الفروانية", fee: 1.5 },
      { id: "capital", labelEn: "Capital / Hawally / Mubarak Al-Kabeer", labelAr: "العاصمة / حولي / مبارك الكبير", fee: 2.0 },
      { id: "ahmadi", labelEn: "Ahmadi / Jahra", labelAr: "الأحمدي / الجهراء", fee: 3.0 },
    ],

    // Color configuration
    colorModes: [
      { id: "bw", labelEn: "Pure Black & White", labelAr: "أسود وأبيض فقط", priceMultiplier: 1.0 },
      { id: "color", labelEn: "Color Accent / Full Color", labelAr: "ألوان كاملة", priceMultiplier: 2.5 },
    ],

    // Layout modes
    layoutModes: [
      { id: "single", labelEn: "Single-Sided", labelAr: "وجه واحد", priceMultiplier: 1.0 },
      { id: "double", labelEn: "Double-Sided (Duplex)", labelAr: "وجهين", priceMultiplier: 2.0 },
    ],

    // Finishing options
    finishingOptions: [
      { id: "stapling", labelEn: "Corner Stapling", labelAr: "دبابيس الزوايا", price: 0 },
      { id: "binding", labelEn: "Spiral Binding & Cover Sheets", labelAr: "التجليد الحلزوني", price: 0.75 },
      { id: "scanning", labelEn: "Digital Scanning & OCR", labelAr: "المسح الضوئي الرقمي", price: 0.1 },
      { id: "protectors", labelEn: "Sheet Protectors (A4 Size)", labelAr: "أغلفة شفافة للورق (A4)", price: 0.1 },
    ],

    // Sheet protector thickness (regular price per protector, KWD, before promo).
    protectorThicknesses: [
      { id: "50", labelEn: "50 micron (standard)", labelAr: "50 ميكرون (عادي)", price: 0.1 },
      { id: "80", labelEn: "80 micron (thick)", labelAr: "80 ميكرون (سميك)", price: 0.125 },
    ],

    // Printer specifications
    printerSpecs: {
      model: "Epson L3350",
      maxPageSize: "A4",
      maxPagesPerMinute: 33,
      colorSupport: true,
      duplexPrinting: true,
    },
  },

  // ============================================
  // LINGUISTICS & EDITORIAL CONSULTATIONS
  // ============================================
  linguisticConsultation: {
    titleEn: "Linguistics & Editorial Consultations",
    titleAr: "الاستشارات اللغوية والتحريرية",
    descriptionEn: "Structural clarity and cultural appropriateness analysis",
    descriptionAr: "تحليل الوضوح الهيكلي والملاءمة الثقافية",
    
    introEn: "We analyze structural clarity, localization nuances, and cultural appropriateness for the Kuwaiti market.",
    introAr: "نحلل الوضوح الهيكلي والفروقات المحلية والملاءمة الثقافية للسوق الكويتي.",

    // Project types
    projectTypes: [
      { id: "academic", labelEn: "Academic / Thesis Abstract", labelAr: "أكاديمي / ملخص الرسالة" },
      { id: "corporate", labelEn: "Corporate Marketing Copy / Slogans", labelAr: "نصوص تسويقية شركات / شعارات" },
      { id: "legal", labelEn: "Legal / Contract Tone Check", labelAr: "قانوني / فحص نبرة العقد" },
      { id: "manuscript", labelEn: "General Manuscript Proofreading", labelAr: "تدقيق المخطوطات العام" },
    ],

    rates: {
      consultation: 30, // per hour
      proofreading: 0.15, // per word
    },
  },

  // ============================================
  // CURRENCY & LOCALIZATION
  // ============================================
  currency: {
    code: "KWD",
    symbol: "د.ك",
    symbolPosition: "suffix",
    decimalPlaces: 3,
  },

  // ============================================
  // LANGUAGE SETTINGS
  // ============================================
  languages: {
    default: "en",
    supported: ["en", "ar"],
    labels: {
      en: "English",
      ar: "عربي",
    },
  },

  // ============================================
  // UI/UX SETTINGS
  // ============================================
  ui: {
    // Color scheme - Premium minimalist aesthetic
    colors: {
      primary: "#000000", // Stark black
      background: "#f1f0eb", // Clean white
      text: "#000000", // Stark black text
      textSecondary: "#666666", // Medium gray for secondary text
      border: "#E5E5E5", // Light gray borders
      shadow: "rgba(0, 0, 0, 0.1)", // Subtle shadows
      accentLight: "#F5F5F5", // Very light gray for accents
    },
    // Card styling
    cardShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
    cardBorderRadius: "8px",
    // Animation settings
    animationDuration: 300, // milliseconds
  },

  // ============================================
  // NAVIGATION STRUCTURE
  // ============================================
  navigation: {
    tabs: [
      { id: "contact", labelEn: "Contact", labelAr: "تواصل معنا", icon: "mail" },
      { id: "services", labelEn: "Services", labelAr: "الخدمات", icon: "grid" },
      { id: "orders", labelEn: "My Orders", labelAr: "طلباتي", icon: "package" },
      { id: "calculator", labelEn: "Quote Builder", labelAr: "حاسبة الأسعار", icon: "calculator" },
      { id: "profile", labelEn: "Profile", labelAr: "الملف الشخصي", icon: "user" },
    ],
  },
};

export default config;
