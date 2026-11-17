import type { AppLang } from "@/context/LanguageContext";
import type { UserRole } from "@/lib/types";
import { BLOOD_TYPE_OPTIONS, UZ_REGIONS } from "@/lib/uz-locations";

export type SignupPersona = "PATIENT" | "DOCTOR" | "NURSE" | "ADMIN_RECEPTION";

export type AiSignupStep =
  | "doctorType"
  | "fullName"
  | "dateOfBirth"
  | "phone"
  | "location"
  | "mahalla"
  | "bloodType"
  | "specialty"
  | "email"
  | "password"
  | "complete";

export interface AiSignupDraft {
  persona: SignupPersona;
  role: UserRole;
  doctorTypePicked: boolean;
  fullName: string;
  dateOfBirth: string;
  phone: string;
  region: string;
  district: string;
  mahalla: string;
  bloodType: string;
  specialty: string;
  email: string;
  password: string;
}

export interface QuickReplyChip {
  label: string;
  value: string;
}

export interface AiStepPrompt {
  step: AiSignupStep;
  message: string;
  placeholder: string;
  inputType: "text" | "email" | "password" | "tel";
  chips: QuickReplyChip[];
}

export function createInitialDraft(
  persona: SignupPersona,
  presetRole?: UserRole
): AiSignupDraft {
  if (persona === "PATIENT") {
    return {
      persona,
      role: "PATIENT",
      doctorTypePicked: true,
      fullName: "",
      dateOfBirth: "",
      phone: "",
      region: "",
      district: "",
      mahalla: "",
      bloodType: "",
      specialty: "",
      email: "",
      password: "",
    };
  }
  if (persona === "NURSE") {
    return {
      persona,
      role: "FAMILY_MD",
      doctorTypePicked: true,
      fullName: "",
      dateOfBirth: "",
      phone: "",
      region: "",
      district: "",
      mahalla: "",
      bloodType: "",
      specialty: "",
      email: "",
      password: "",
    };
  }
  if (persona === "ADMIN_RECEPTION") {
    return {
      persona,
      role: "ADMIN_RECEPTION",
      doctorTypePicked: true,
      fullName: "",
      dateOfBirth: "",
      phone: "",
      region: "",
      district: "",
      mahalla: "",
      bloodType: "",
      specialty: "",
      email: "",
      password: "",
    };
  }
  const hasExplicitDoctorRole =
    presetRole === "OVABMU_MD" || presetRole === "FAMILY_MD";
  return {
    persona: "DOCTOR",
    role: hasExplicitDoctorRole ? presetRole : "FAMILY_MD",
    doctorTypePicked: hasExplicitDoctorRole,
    fullName: "",
    dateOfBirth: "",
    phone: "",
    region: "",
    district: "",
    mahalla: "",
    bloodType: "",
    specialty: "",
    email: "",
    password: "",
  };
}

export function getNextStep(draft: AiSignupDraft): AiSignupStep {
  if (draft.persona === "DOCTOR" && !draft.doctorTypePicked) {
    return "doctorType";
  }
  if (!draft.fullName.trim()) return "fullName";
  if (!draft.dateOfBirth.trim()) return "dateOfBirth";
  if (!draft.phone.trim()) return "phone";
  if (!draft.district.trim()) return "location";

  if (draft.persona === "PATIENT") {
    if (!draft.mahalla.trim()) return "mahalla";
    if (!draft.bloodType.trim()) return "bloodType";
  } else if (draft.persona === "DOCTOR" || draft.persona === "NURSE") {
    if (!draft.specialty.trim()) return "specialty";
  }

  if (!draft.email.trim()) return "email";
  if (!draft.password || draft.password.length < 6) return "password";
  return "complete";
}

export function getProgressPercent(draft: AiSignupDraft): number {
  const requiredFields: boolean[] = [
    Boolean(draft.fullName.trim()),
    Boolean(draft.dateOfBirth.trim()),
    Boolean(draft.phone.trim()),
    Boolean(draft.district.trim()),
    Boolean(draft.email.trim()),
    Boolean(draft.password && draft.password.length >= 6),
  ];
  if (draft.persona === "DOCTOR") {
    requiredFields.push(draft.doctorTypePicked, Boolean(draft.specialty.trim()));
  } else if (draft.persona === "NURSE") {
    requiredFields.push(Boolean(draft.specialty.trim()));
  } else if (draft.persona === "PATIENT") {
    requiredFields.push(
      Boolean(draft.mahalla.trim()),
      Boolean(draft.bloodType.trim())
    );
  }
  const done = requiredFields.filter(Boolean).length;
  return Math.round((done / requiredFields.length) * 100);
}

const MONTH_MAP: Record<string, number> = {
  jan: 1, january: 1, yanvar: 1, yan: 1, январь: 1, января: 1, янв: 1,
  feb: 2, february: 2, fevral: 2, fev: 2, февраль: 2, февраля: 2, фев: 2,
  mar: 3, march: 3, mart: 3, март: 3, марта: 3, мар: 3,
  apr: 4, april: 4, aprel: 4, apr_uz: 4, апрель: 4, апреля: 4, апр: 4,
  may: 5, май: 5, мая: 5,
  jun: 6, june: 6, iyun: 6, июнь: 6, июня: 6,
  jul: 7, july: 7, iyul: 7, июль: 7, июля: 7,
  aug: 8, august: 8, avgust: 8, avg: 8, август: 8, августа: 8, авг: 8,
  sep: 9, sept: 9, september: 9, sentabr: 9, sentyabr: 9, сентябрь: 9, сентября: 9, сен: 9,
  oct: 10, october: 10, oktabr: 10, oktyabr: 10, октябрь: 10, октября: 10, окт: 10,
  nov: 11, november: 11, noyabr: 11, ноябрь: 11, ноября: 11, ноя: 11,
  dec: 12, december: 12, dekabr: 12, декабрь: 12, декабря: 12, дек: 12,
};

function formatIsoDate(year: number, month: number, day: number): string | null {
  const maxYear = new Date().getFullYear() - 14;
  if (year < 1915 || year > maxYear || month < 1 || month > 12 || day < 1 || day > 31) {
    return null;
  }
  const d = new Date(Date.UTC(year, month - 1, day));
  if (
    d.getUTCFullYear() !== year ||
    d.getUTCMonth() !== month - 1 ||
    d.getUTCDate() !== day
  ) {
    return null;
  }
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function parseBirthDate(raw: string): string | null {
  const text = raw.trim();

  // YYYY-MM-DD or YYYY.MM.DD or YYYY/MM/DD
  const isoMatch = text.match(/\b((?:19|20)\d{2})[-./](\d{1,2})[-./](\d{1,2})\b/);
  if (isoMatch) {
    return formatIsoDate(Number(isoMatch[1]), Number(isoMatch[2]), Number(isoMatch[3]));
  }

  // DD.MM.YYYY or DD/MM/YYYY or DD-MM-YYYY
  const dmyMatch = text.match(/\b(\d{1,2})[-./](\d{1,2})[-./]((?:19|20)\d{2})\b/);
  if (dmyMatch) {
    return formatIsoDate(Number(dmyMatch[3]), Number(dmyMatch[2]), Number(dmyMatch[1]));
  }

  // Named month formats: "14 may 1996", "May 14, 1996", "1996 yil 14 may", "14 мая 1996"
  const lower = text.toLowerCase().replace(/[,']/g, " ");
  const yearMatch = lower.match(/\b((?:19|20)\d{2})\b/);
  if (yearMatch) {
    const year = Number(yearMatch[1]);
    let foundMonth: number | null = null;
    const words = lower.split(/\s+/);
    for (const w of words) {
      if (MONTH_MAP[w]) {
        foundMonth = MONTH_MAP[w];
        break;
      }
    }
    if (foundMonth) {
      const cleanedNoYear = lower.replace(yearMatch[0], " ");
      const dayMatch = cleanedNoYear.match(/\b(\d{1,2})\b/);
      if (dayMatch) {
        return formatIsoDate(year, foundMonth, Number(dayMatch[1]));
      }
    }
  }

  return null;
}

export function parsePhoneNumber(raw: string): string | null {
  const candidates = raw.match(/(\+?\d[\d\s\-()]{6,17}\d)/g) || [];
  for (const candidate of candidates) {
    const trimmed = candidate.trim();
    if (
      /^(?:19|20)\d{2}[-./]\d{1,2}[-./]\d{1,2}$/.test(trimmed) ||
      /^\d{1,2}[-./]\d{1,2}[-./](?:19|20)\d{2}$/.test(trimmed)
    ) {
      continue;
    }
    const digits = trimmed.replace(/\D/g, "");
    if (digits.length === 9 && /^(9\d|33|55|71|77|88)/.test(digits)) {
      return `+998 ${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5, 7)} ${digits.slice(7, 9)}`;
    }
    if (digits.length === 12 && digits.startsWith("998")) {
      const local = digits.slice(3);
      return `+998 ${local.slice(0, 2)} ${local.slice(2, 5)} ${local.slice(5, 7)} ${local.slice(7, 9)}`;
    }
    if (digits.length >= 7 && digits.length <= 15 && !/^(19|20)\d{2}$/.test(digits)) {
      return trimmed.startsWith("+") ? trimmed : `+${digits}`;
    }
  }
  return null;
}

export function parseEmailAddress(raw: string): string | null {
  const match = raw.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  return match ? match[0].toLowerCase() : null;
}

const LOCATION_ALIASES: Array<[string[], string, string]> = [
  [["yunusabad", "yunusobod", "юнусабад"], "Toshkent shahri", "Yunusobod"],
  [["chilanzar", "chilonzor", "чиланзар"], "Toshkent shahri", "Chilonzor"],
  [["mirzo ulugbek", "mirzo ulug'bek", "мирзо улугбек"], "Toshkent shahri", "Mirzo Ulug'bek"],
  [["shayxontohur", "shaykhantahur", "шайхантахур"], "Toshkent shahri", "Shayxontohur"],
  [["olmazor", "almazar", "алмазар"], "Toshkent shahri", "Olmazor"],
  [["yakkasaroy", "yakkasaray", "яккасарай"], "Toshkent shahri", "Yakkasaroy"],
  [["mirobod", "mirabad", "мирабад"], "Toshkent shahri", "Mirobod"],
  [["sergeli", "сергели"], "Toshkent shahri", "Sergeli"],
  [["uchtepa", "учтепа"], "Toshkent shahri", "Uchtepa"],
  [["yashnobod", "yashnabad", "яшнабад"], "Toshkent shahri", "Yashnobod"],
  [["bektemir", "бектемир"], "Toshkent shahri", "Bektemir"],
  [["yangihayot", "янгихаёт"], "Toshkent shahri", "Yangihayot"],
  [["davlatobod", "давлатабад"], "Namangan viloyati", "Davlatobod"],
  [["namangan", "наманган"], "Namangan viloyati", "Namangan shahri"],
  [["samarkand", "samarqand", "самарканд"], "Samarqand viloyati", "Samarqand shahri"],
  [["andijan", "andijon", "андижан"], "Andijon viloyati", "Andijon shahri"],
  [["fergana", "fargona", "farg'ona", "фергана"], "Farg'ona viloyati", "Farg'ona shahri"],
  [["bukhara", "buxoro", "бухара"], "Buxoro viloyati", "Buxoro shahri"],
  [["kokand", "qo'qon", "qoqon", "коканд"], "Farg'ona viloyati", "Qo'qon shahri"],
  [["margilan", "marg'ilon", "маргилан"], "Farg'ona viloyati", "Marg'ilon shahri"],
  [["chirchiq", "chirchik", "чирчик"], "Toshkent viloyati", "Chirchiq shahri"],
  [["almalyk", "olmaliq", "алмалык"], "Toshkent viloyati", "Olmaliq shahri"],
  [["angren", "ангрен"], "Toshkent viloyati", "Angren shahri"],
  [["qarshi", "karshi", "карши"], "Qashqadaryo viloyati", "Qarshi shahri"],
  [["termez", "termiz", "термез"], "Surxondaryo viloyati", "Termiz shahri"],
  [["urgench", "urganch", "ургенч"], "Xorazm viloyati", "Urganch shahri"],
  [["navoi", "navoiy", "навои"], "Navoiy viloyati", "Navoiy shahri"],
  [["jizzakh", "jizzax", "джизак"], "Jizzax viloyati", "Jizzax shahri"],
  [["gulistan", "guliston", "гулистан"], "Sirdaryo viloyati", "Guliston shahri"],
  [["nukus", "нукус"], "Qoraqalpog'iston Respublikasi", "Nukus shahri"],
  [["tashkent", "toshkent", "ташкент"], "Toshkent shahri", ""],
];

export function parseLocation(
  raw: string,
  allowFreeDistrictFallback: boolean
): { region: string; district: string } | null {
  const lower = raw.trim().toLowerCase();
  if (!lower) return null;

  // 1. Exact/substring match on districts first across all UZ_REGIONS
  for (const reg of UZ_REGIONS) {
    for (const dist of reg.districts) {
      const distNorm = dist.name.toLowerCase();
      const baseName = distNorm.replace(" shahri", "").replace(" tumani", "");
      if (lower.includes(distNorm) || (baseName.length >= 4 && lower.includes(baseName))) {
        return { region: reg.name, district: dist.name };
      }
    }
  }

  // 2. Alias map (English / Russian / transliterated Uzbek)
  for (const [keywords, region, district] of LOCATION_ALIASES) {
    if (keywords.some((kw) => lower.includes(kw))) {
      return { region, district };
    }
  }

  // 3. Exact/substring match on region name
  for (const reg of UZ_REGIONS) {
    const regBase = reg.name
      .toLowerCase()
      .replace(" viloyati", "")
      .replace(" shahri", "")
      .replace(" respublikasi", "");
    if (lower.includes(reg.name.toLowerCase()) || lower.includes(regBase)) {
      return { region: reg.name, district: "" };
    }
  }

  if (
    allowFreeDistrictFallback &&
    raw.trim().length >= 2 &&
    /[a-zA-Zа-яА-ЯёЁўЎқҚғҒҳҲ]/.test(raw)
  ) {
    return { region: "", district: raw.trim() };
  }
  return null;
}

export function parseBloodType(raw: string): string | null {
  const text = raw.trim();
  if (!text) return null;

  for (const bt of BLOOD_TYPE_OPTIONS) {
    if (text.toLowerCase() === bt.value.toLowerCase()) return bt.value;
  }

  const lower = text.toLowerCase();
  if (
    lower.includes("don't know") ||
    lower.includes("dont know") ||
    lower.includes("unknown") ||
    lower.includes("not sure") ||
    lower.includes("bilmayman") ||
    lower.includes("aniqlanmagan") ||
    lower.includes("не знаю") ||
    lower.includes("незнаю")
  ) {
    return "I don't know";
  }

  const hasNeg =
    /(?:rh\s*-|-\s*$|\bneg|\bnegative|\bmanfiy|отриц|\(-\))/i.test(lower) ||
    /^(?:o|a|b|ab|1|2|3|4|i|ii|iii|iv)\s*-$/i.test(lower);
  const hasPos =
    /(?:rh\s*\+|\+\s*$|\bpos|\bpositive|\bmusbat|полож|\(\+\))/i.test(lower) ||
    /^(?:o|a|b|ab|1|2|3|4|i|ii|iii|iv)\s*\+$/i.test(lower);

  if (!hasNeg && !hasPos) return null;
  const sign = hasNeg ? "-" : "+";

  if (/\bab\b|\biv\b|\b4\b/i.test(lower.replace(/rh[+-]?/g, ""))) {
    return `AB(IV) Rh${sign}`;
  }
  if (/\biii\b|\b3\b|\bb\b/i.test(lower.replace(/rh[+-]?/g, ""))) {
    return `B(III) Rh${sign}`;
  }
  if (/\bii\b|\b2\b|\ba\b/i.test(lower.replace(/rh[+-]?/g, ""))) {
    return `A(II) Rh${sign}`;
  }
  if (/\bo\b|\bi\b|\b1\b|0/i.test(lower.replace(/rh[+-]?/g, ""))) {
    return `O(I) Rh${sign}`;
  }
  return null;
}

export function parseFullName(raw: string): string | null {
  let cleaned = raw.trim();
  const prefixes = [
    /^(?:hello|hi|salom|assalomu alaykum|привет|здравствуйте)[,!.\s]+/i,
    /^(?:my full name is|my name is|i am|i'm|name is|name:)\s+/i,
    /^(?:mening to'liq ismim|mening ismim|ismim|f\.?i\.?o\.?:?)\s+/i,
    /^(?:меня зовут|мо[её] имя|фио:?|я)\s+/i,
  ];
  for (const re of prefixes) {
    cleaned = cleaned.replace(re, "").trim();
  }
  cleaned = cleaned.replace(/[.!,;:]+$/, "").trim();
  if (cleaned.length < 2 || !/[a-zA-Zа-яА-ЯёЁўЎқҚғҒҳҲʻ'’]/.test(cleaned)) {
    return null;
  }
  return cleaned;
}

export function getStepPrompt(
  draft: AiSignupDraft,
  lang: AppLang
): AiStepPrompt {
  const step = getNextStep(draft);

  if (step === "doctorType") {
    return {
      step,
      inputType: "text",
      message:
        lang === "ru"
          ? "Здравствуйте! Я помогу заполнить анкету врача. Подскажите, вы работаете в роддоме (стационар) или в семейной поликлинике?"
          : lang === "en"
            ? "Hello! I'll help fill out your doctor account step by step. First, do you work at a Maternity Hospital or a Local Family Clinic?"
            : "Assalomu alaykum! Shifokor hisobingizni bosqichma-bosqich to'ldirib beraman. Avval ayting-chi, tug'ruqxonada ishlaysizmi yoki oilaviy poliklinikada?",
      placeholder:
        lang === "ru"
          ? "Роддом или семейная поликлиника..."
          : lang === "en"
            ? "Maternity Hospital or Family Clinic..."
            : "Tug'ruqxona yoki oilaviy poliklinika...",
      chips: [
        {
          label:
            lang === "ru"
              ? "Врач роддома (стационар)"
              : lang === "en"
                ? "Hospital Doctor (Maternity)"
                : "Tug'ruqxona shifokori",
          value: "OVABMU_MD",
        },
        {
          label:
            lang === "ru"
              ? "Семейный врач (поликлиника)"
              : lang === "en"
                ? "Family Doctor (Local Clinic)"
                : "Hududiy oilaviy shifokor",
          value: "FAMILY_MD",
        },
      ],
    };
  }

  if (step === "fullName") {
    return {
      step,
      inputType: "text",
      message:
        lang === "ru"
          ? "Как вас зовут? Напишите ваше полное имя (ФИО)."
          : lang === "en"
            ? "What is your full name?"
            : "To'liq ism-familiyangiz (F.I.O.) nima?",
      placeholder:
        lang === "ru"
          ? "Например: Малика Каримова"
          : lang === "en"
            ? "e.g. Malika Karimova"
            : "Masalan: Malika Karimova",
      chips: [],
    };
  }

  if (step === "dateOfBirth") {
    return {
      step,
      inputType: "text",
      message:
        lang === "ru"
          ? `Приятно познакомиться, ${draft.fullName}! Укажите вашу дату рождения (например: 14.05.1996 или 1996-05-14).`
          : lang === "en"
            ? `Nice to meet you, ${draft.fullName}! When is your date of birth? (e.g. 14.05.1996 or May 14, 1996)`
            : `Tanishganimdan xursandman, ${draft.fullName}! Tug'ilgan sanangizni yozing (masalan: 14.05.1996 yoki 1996-05-14).`,
      placeholder: "14.05.1996",
      chips: [],
    };
  }

  if (step === "phone") {
    return {
      step,
      inputType: "tel",
      message:
        lang === "ru"
          ? "Какой номер телефона использовать для связи и уведомлений?"
          : lang === "en"
            ? "What is your phone number so your clinic can contact you?"
            : "Bog'lanish uchun telefon raqamingizni kiriting:",
      placeholder: "+998 90 123 45 67",
      chips: [],
    };
  }

  if (step === "location") {
    const regionMatched = draft.region
      ? UZ_REGIONS.find((r) => r.name === draft.region)
      : null;
    const chips: QuickReplyChip[] = regionMatched
      ? regionMatched.districts.slice(0, 6).map((d) => ({ label: d.name, value: d.name }))
      : [
          { label: "Yunusobod", value: "Yunusobod" },
          { label: "Chilonzor", value: "Chilonzor" },
          { label: "Mirzo Ulug'bek", value: "Mirzo Ulug'bek" },
          { label: "Namangan shahri", value: "Namangan shahri" },
          { label: "Samarqand shahri", value: "Samarqand shahri" },
          { label: "Andijon shahri", value: "Andijon shahri" },
        ];
    return {
      step,
      inputType: "text",
      message: regionMatched
        ? lang === "ru"
          ? `Вы выбрали регион ${regionMatched.name}. Теперь напишите или выберите ваш район/город:`
          : lang === "en"
            ? `Got it (${regionMatched.name}). Which district or city are you in?`
            : `${regionMatched.name} tanlandi. Endi tuman yoki shahringizni yozing yoki tanlang:`
        : lang === "ru"
          ? "В каком городе или районе вы находитесь? (Мы подберем ближайшую поликлинику)"
          : lang === "en"
            ? "Which region and district/city are you in? (We use this to match your local clinic)"
            : "Qaysi viloyat va tuman/shaharda yashaysiz yoki ishlaysiz?",
      placeholder:
        lang === "ru"
          ? "Например: Ташкент, Юнусабад"
          : lang === "en"
            ? "e.g. Yunusobod, Tashkent"
            : "Masalan: Yunusobod, Toshkent",
      chips,
    };
  }

  if (step === "mahalla") {
    let suggestions: string[] = [];
    for (const r of UZ_REGIONS) {
      const found = r.districts.find((d) => d.name === draft.district);
      if (found) {
        suggestions = found.mahallas;
        break;
      }
    }
    return {
      step,
      inputType: "text",
      message:
        lang === "ru"
          ? `Какая у вас махалля в районе ${draft.district}? Выберите вариант ниже или напишите свою.`
          : lang === "en"
            ? `What is your neighborhood (mahalla) in ${draft.district}? Pick one below or type yours.`
            : `${draft.district} tumanidagi mahallangiz nomi nima? Quyidagilardan tanlang yoki o'zingiz yozing:`,
      placeholder:
        lang === "ru"
          ? "Название махалли..."
          : lang === "en"
            ? "Mahalla name..."
            : "Mahalla nomi...",
      chips: suggestions.slice(0, 6).map((m) => ({ label: m, value: m })),
    };
  }

  if (step === "bloodType") {
    return {
      step,
      inputType: "text",
      message:
        lang === "ru"
          ? "Укажите вашу группу крови и резус-фактор (или нажмите «Не знаю»):"
          : lang === "en"
            ? "What is your blood type? Tap an option below or choose 'I don't know':"
            : "Qon guruhingiz va rezus-faktoringizni tanlang (yoki «Bilmayman» tugmasini bosing):",
      placeholder: "O(I) Rh+, A(II) Rh-...",
      chips: BLOOD_TYPE_OPTIONS.map((bt) => ({
        label:
          lang === "ru"
            ? bt.labelRu.split(" (")[0]
            : lang === "en"
              ? bt.labelEn.split(" (")[0]
              : bt.labelUz.split(" (")[0],
        value: bt.value,
      })),
    };
  }

  if (step === "specialty") {
    const chips: QuickReplyChip[] =
      draft.persona === "NURSE"
        ? [
            {
              label:
                lang === "ru"
                  ? "Патронажная медсестра"
                  : lang === "en"
                    ? "Monitoring / Patronage Nurse"
                    : "Patronaj hamshirasi (Monitoring)",
              value: "Patronaj hamshirasi (Monitoring Nurse)",
            },
            {
              label:
                lang === "ru"
                  ? "Медсестра послеродового наблюдения"
                  : lang === "en"
                    ? "Postpartum Home-Care Nurse"
                    : "Tug'ruqdan keyingi nazorat hamshirasi",
              value: "Tug'ruqdan keyingi nazorat hamshirasi",
            },
          ]
        : draft.role === "OVABMU_MD"
          ? [
              { label: "Akusher-ginekolog", value: "Akusher-ginekolog (OvaBMU)" },
              { label: "Neonatolog", value: "Neonatolog" },
              {
                label:
                  lang === "ru"
                    ? "Врач родового отделения"
                    : lang === "en"
                      ? "Maternity Ward Physician"
                      : "Tug'ruq bo'limi shifokori",
                value: "Tug'ruq bo'limi shifokori",
              },
            ]
          : [
              {
                label:
                  lang === "ru"
                    ? "Семейный врач"
                    : lang === "en"
                      ? "Family Doctor"
                      : "Hududiy oilaviy shifokor",
                value: "Hududiy oilaviy shifokor",
              },
              {
                label:
                  lang === "ru"
                    ? "Врач общей практики"
                    : lang === "en"
                      ? "General Practitioner"
                      : "Umumiy amaliyot shifokori",
                value: "Umumiy amaliyot shifokori",
              },
              {
                label: lang === "ru" ? "Педиатр" : lang === "en" ? "Pediatrician" : "Pediatr",
                value: "Pediatr",
              },
            ];

    return {
      step,
      inputType: "text",
      message:
        draft.persona === "NURSE"
          ? lang === "ru"
            ? "Укажите ваше направление работы или выберите ниже:"
            : lang === "en"
              ? "What is your nursing monitoring focus? Pick below or type it:"
              : "Hamshiralik yo'nalishingizni tanlang yoki yozing:"
          : lang === "ru"
            ? "Какая у вас врачебная специальность?"
            : lang === "en"
              ? "What is your medical specialty?"
              : "Tibbiy mutaxassisligingiz qaysi?",
      placeholder:
        lang === "ru"
          ? "Специальность..."
          : lang === "en"
            ? "Specialty..."
            : "Mutaxassislik...",
      chips,
    };
  }

  if (step === "email") {
    return {
      step,
      inputType: "email",
      message:
        lang === "ru"
          ? "Почти готово! Какую электронную почту вы будете использовать для входа?"
          : lang === "en"
            ? "Almost done! What email address would you like to use to sign in?"
            : "Deyarli tayyor! Tizimga kirish uchun qaysi elektron pochtadan foydalanasiz?",
      placeholder: "siz@example.uz",
      chips: [],
    };
  }

  if (step === "password") {
    return {
      step,
      inputType: "password",
      message:
        lang === "ru"
          ? "Последний шаг — придумайте пароль (минимум 6 символов). Поле ниже скрыто для вашей безопасности."
          : lang === "en"
            ? "Last step — choose a password (at least 6 characters). Your input is masked for privacy."
            : "Oxirgi qadam — parol o'ylab toping (kamida 6 belgi). Xavfsizlik uchun kiritish yashiriladi.",
      placeholder: "••••••",
      chips: [],
    };
  }

  return {
    step: "complete",
    inputType: "text",
    message:
      lang === "ru"
        ? "Все готово! Я заполнил вашу анкету справа. Нажмите «Создать аккаунт», либо откройте форму для ручной правки."
        : lang === "en"
          ? "All done! I've filled out all your details in the summary card. Press 'Create Account' or 'Review & Edit Form' if you want to tweak anything."
          : "Hammasi tayyor! Ma'lumotlaringizni to'ldirib qo'ydim. Tekshirib «Hisob yaratish» tugmasini bosing yoki shakl ko'rinishida tahrirlang.",
    placeholder: "",
    chips: [],
  };
}

export function processAiAnswer(
  draft: AiSignupDraft,
  rawInput: string,
  lang: AppLang
): { nextDraft: AiSignupDraft; reply: string; maskedUserMessage?: string } {
  const step = getNextStep(draft);
  const input = rawInput.trim();
  if (!input) {
    return { nextDraft: draft, reply: getStepPrompt(draft, lang).message };
  }

  const next: AiSignupDraft = { ...draft };

  // Handle password step exclusively & securely
  if (step === "password") {
    if (input.length < 6) {
      return {
        nextDraft: next,
        maskedUserMessage: "••••",
        reply:
          lang === "ru"
            ? "Пароль должен содержать не менее 6 символов. Попробуйте еще раз:"
            : lang === "en"
              ? "Please enter a password with at least 6 characters:"
              : "Parol kamida 6 ta belgidan iborat bo'lishi kerak. Qaytadan kiriting:",
      };
    }
    next.password = input;
    const nextPrompt = getStepPrompt(next, lang);
    return {
      nextDraft: next,
      maskedUserMessage: "•".repeat(Math.min(input.length, 10)),
      reply: nextPrompt.message,
    };
  }

  const capturedLabels: string[] = [];

  // 1. Opportunistically extract unambiguous structured fields if user typed a multi-part sentence
  if (step !== "email" && !next.email) {
    const email = parseEmailAddress(input);
    if (email) {
      next.email = email;
      capturedLabels.push("Email");
    }
  }
  if (step !== "dateOfBirth" && !next.dateOfBirth) {
    const dob = parseBirthDate(input);
    if (dob) {
      next.dateOfBirth = dob;
      capturedLabels.push(lang === "ru" ? "Дата рождения" : lang === "en" ? "DOB" : "Tug'ilgan sana");
    }
  }
  if (step !== "phone" && !next.phone) {
    const phone = parsePhoneNumber(input);
    if (phone) {
      next.phone = phone;
      capturedLabels.push(lang === "ru" ? "Телефон" : lang === "en" ? "Phone" : "Telefon");
    }
  }
  if (step === "fullName" && !next.district) {
    const loc = parseLocation(input, false);
    if (loc && loc.district) {
      next.region = loc.region;
      next.district = loc.district;
    }
  }

  // 2. Process the active step specifically
  if (step === "doctorType") {
    const lower = input.toLowerCase();
    if (
      input === "OVABMU_MD" ||
      lower.includes("hospital") ||
      lower.includes("maternity") ||
      lower.includes("tug'ruq") ||
      lower.includes("rod") ||
      lower.includes("роддом") ||
      lower.includes("стационар")
    ) {
      next.role = "OVABMU_MD";
      next.doctorTypePicked = true;
    } else if (
      input === "FAMILY_MD" ||
      lower.includes("family") ||
      lower.includes("clinic") ||
      lower.includes("oilaviy") ||
      lower.includes("poliklinika") ||
      lower.includes("семейн") ||
      lower.includes("поликлин")
    ) {
      next.role = "FAMILY_MD";
      next.doctorTypePicked = true;
    } else {
      return {
        nextDraft: next,
        reply:
          lang === "ru"
            ? "Пожалуйста, выберите один из вариантов: Врач роддома или Семейный врач."
            : lang === "en"
              ? "Please pick one of the two options: Hospital Doctor or Family Doctor."
              : "Iltimos, ikkitadan birini tanlang: Tug'ruqxona shifokori yoki Hududiy oilaviy shifokor.",
      };
    }
  } else if (step === "fullName") {
    // Strip trailing multi-field parts (after comma if DOB/phone were included)
    const firstSegment = input.split(/[,;]/)[0] || input;
    const parsedName = parseFullName(firstSegment);
    if (!parsedName) {
      return {
        nextDraft: next,
        reply:
          lang === "ru"
            ? "Пожалуйста, напишите ваше полное имя буквами (не менее 2 символов)."
            : lang === "en"
              ? "Please enter your full name (at least 2 letters)."
              : "Iltimos, to'liq ismingizni kiriting (kamida 2 ta harf).",
      };
    }
    next.fullName = parsedName;
  } else if (step === "dateOfBirth") {
    const dob = parseBirthDate(input);
    if (!dob) {
      return {
        nextDraft: next,
        reply:
          lang === "ru"
            ? "Не удалось распознать дату рождения. Напишите, например: 14.05.1996 или 1996-05-14."
            : lang === "en"
              ? "I couldn't recognize that date. Please type e.g. 14.05.1996 or 1996-05-14."
              : "Tug'ilgan sanani tushunolmadim. Masalan, 14.05.1996 yoki 1996-05-14 ko'rinishida yozing.",
      };
    }
    next.dateOfBirth = dob;
  } else if (step === "phone") {
    const phone = parsePhoneNumber(input);
    if (!phone) {
      return {
        nextDraft: next,
        reply:
          lang === "ru"
            ? "Пожалуйста, введите корректный номер телефона (например: +998 90 123 45 67)."
            : lang === "en"
              ? "Please enter a valid phone number (e.g. +998 90 123 45 67)."
              : "Iltimos, to'g'ri telefon raqamini kiriting (masalan: +998 90 123 45 67).",
      };
    }
    next.phone = phone;
  } else if (step === "location") {
    const loc = parseLocation(input, Boolean(next.region) || input.length >= 3);
    if (!loc) {
      return {
        nextDraft: next,
        reply:
          lang === "ru"
            ? "Пожалуйста, напишите ваш город или район (или выберите вариант ниже)."
            : lang === "en"
              ? "Please type your district/city or choose one of the quick options below."
              : "Iltimos, tuman yoki shahringizni yozing yoki quyidagi tugmalardan birini tanlang.",
      };
    }
    if (loc.region) next.region = loc.region;
    if (loc.district) next.district = loc.district;
  } else if (step === "mahalla") {
    next.mahalla = input;
  } else if (step === "bloodType") {
    const bt = parseBloodType(input);
    if (!bt) {
      return {
        nextDraft: next,
        reply:
          lang === "ru"
            ? "Выберите группу крови кнопкой ниже или напишите например: A(II) Rh-, O(I) Rh+ или «Не знаю»."
            : lang === "en"
              ? "Please tap one of the blood types below, or type e.g. A-, O+, or 'I don't know'."
              : "Quyidagi qon guruhlaridan birini bosing yoki masalan A-, O+ yoxud «Bilmayman» deb yozing.",
      };
    }
    next.bloodType = bt;
  } else if (step === "specialty") {
    next.specialty = input;
  } else if (step === "email") {
    const email = parseEmailAddress(input);
    if (!email) {
      return {
        nextDraft: next,
        reply:
          lang === "ru"
            ? "Пожалуйста, введите корректный адрес электронной почты (например: name@example.uz)."
            : lang === "en"
              ? "Please enter a valid email address (e.g. name@example.uz)."
              : "Iltimos, to'g'ri elektron pochta manzilini kiriting (masalan: ism@example.uz).",
      };
    }
    next.email = email;
  }

  const nextPrompt = getStepPrompt(next, lang);
  const ack =
    capturedLabels.length > 0 && nextPrompt.step !== "complete"
      ? lang === "ru"
        ? `Отлично (${capturedLabels.join(", ")} тоже заполнено). `
        : lang === "en"
          ? `Got it (also filled: ${capturedLabels.join(", ")}). `
          : `Ajoyib (${capturedLabels.join(", ")} ham to'ldirildi). `
      : "";

  return {
    nextDraft: next,
    reply: `${ack}${nextPrompt.message}`,
  };
}
