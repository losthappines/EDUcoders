import { BLOOD_TYPE_OPTIONS, UZ_REGIONS } from "@/lib/uz-locations";
import { resolveCoordinatesForLocation } from "@/lib/geo";
export function createInitialDraft(persona, presetRole) {
    if (persona === "PATIENT") {
        return {
            persona,
            role: "PATIENT",
            doctorTypePicked: true,
            fullName: "",
            dateOfBirth: "",
            deliveryDate: "",
            phone: "",
            region: "",
            district: "",
            mahalla: "",
            bloodType: "",
            specialty: "",
            expertiseArea: "",
            experienceYears: "",
            latitude: null,
            longitude: null,
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
            deliveryDate: "",
            phone: "",
            region: "",
            district: "",
            mahalla: "",
            bloodType: "",
            specialty: "",
            expertiseArea: "",
            experienceYears: "",
            latitude: null,
            longitude: null,
            email: "",
            password: "",
        };
    }
    if (persona === "PSYCHOLOGIST") {
        return {
            persona,
            role: "PSYCHOLOGIST",
            doctorTypePicked: true,
            fullName: "",
            dateOfBirth: "",
            deliveryDate: "",
            phone: "",
            region: "",
            district: "",
            mahalla: "",
            bloodType: "",
            specialty: "",
            expertiseArea: "",
            experienceYears: "",
            latitude: null,
            longitude: null,
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
            deliveryDate: "",
            phone: "",
            region: "",
            district: "",
            mahalla: "",
            bloodType: "",
            specialty: "",
            expertiseArea: "",
            experienceYears: "",
            latitude: null,
            longitude: null,
            email: "",
            password: "",
        };
    }
    const hasExplicitDoctorRole = presetRole === "OVABMU_MD" || presetRole === "FAMILY_MD";
    return {
        persona: "DOCTOR",
        role: hasExplicitDoctorRole ? presetRole : "FAMILY_MD",
        doctorTypePicked: hasExplicitDoctorRole,
        fullName: "",
        dateOfBirth: "",
        deliveryDate: "",
        phone: "",
        region: "",
        district: "",
        mahalla: "",
        bloodType: "",
        specialty: "",
        expertiseArea: "",
        experienceYears: "",
        latitude: null,
        longitude: null,
        email: "",
        password: "",
    };
}
export function getNextStep(draft) {
    if (draft.persona === "DOCTOR" && !draft.doctorTypePicked) {
        return "doctorType";
    }
    if (!draft.fullName.trim())
        return "fullName";
    if (!draft.dateOfBirth.trim())
        return "dateOfBirth";
    if (!draft.phone.trim())
        return "phone";
    if (draft.persona === "DOCTOR" || draft.persona === "NURSE" || draft.persona === "PSYCHOLOGIST") {
        if (!draft.specialty.trim())
            return "specialty";
        if (!draft.expertiseArea.trim())
            return "expertiseArea";
        if (draft.experienceYears === "" || draft.experienceYears === null || draft.experienceYears === undefined)
            return "experienceYears";
    }
    if (!draft.district.trim())
        return "location";
    if (draft.persona === "PATIENT") {
        if (!draft.mahalla.trim())
            return "mahalla";
        if (!draft.bloodType.trim())
            return "bloodType";
    }
    if (!draft.email.trim())
        return "email";
    if (!draft.password || draft.password.length < 6)
        return "password";
    return "complete";
}
export function getProgressPercent(draft) {
    const requiredFields = [
        Boolean(draft.fullName.trim()),
        Boolean(draft.dateOfBirth.trim()),
        Boolean(draft.phone.trim()),
        Boolean(draft.district.trim()),
        Boolean(draft.email.trim()),
        Boolean(draft.password && draft.password.length >= 6),
    ];
    if (draft.persona === "DOCTOR") {
        requiredFields.push(draft.doctorTypePicked, Boolean(draft.specialty.trim()), Boolean(draft.expertiseArea.trim()), draft.experienceYears !== "" && draft.experienceYears !== null && draft.experienceYears !== undefined);
    }
    else if (draft.persona === "NURSE" || draft.persona === "PSYCHOLOGIST") {
        requiredFields.push(Boolean(draft.specialty.trim()), Boolean(draft.expertiseArea.trim()), draft.experienceYears !== "" && draft.experienceYears !== null && draft.experienceYears !== undefined);
    }
    else if (draft.persona === "PATIENT") {
        requiredFields.push(Boolean(draft.mahalla.trim()), Boolean(draft.bloodType.trim()));
    }
    const done = requiredFields.filter(Boolean).length;
    return Math.round((done / requiredFields.length) * 100);
}
const MONTH_MAP = {
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
function formatIsoDateRange(year, month, day, minYear, maxYear) {
    if (year < minYear || year > maxYear || month < 1 || month > 12 || day < 1 || day > 31) {
        return null;
    }
    const d = new Date(Date.UTC(year, month - 1, day));
    if (d.getUTCFullYear() !== year ||
        d.getUTCMonth() !== month - 1 ||
        d.getUTCDate() !== day) {
        return null;
    }
    return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}
function parseFlexibleDate(raw, minYear, maxYear) {
    const text = String(raw || "").trim();
    if (!text)
        return null;
    const isoMatch = text.match(/\b((?:19|20)\d{2})[-./](\d{1,2})[-./](\d{1,2})\b/);
    if (isoMatch) {
        return formatIsoDateRange(Number(isoMatch[1]), Number(isoMatch[2]), Number(isoMatch[3]), minYear, maxYear);
    }
    const dmyMatch = text.match(/\b(\d{1,2})[-./](\d{1,2})[-./]((?:19|20)\d{2})\b/);
    if (dmyMatch) {
        return formatIsoDateRange(Number(dmyMatch[3]), Number(dmyMatch[2]), Number(dmyMatch[1]), minYear, maxYear);
    }
    const lower = text.toLowerCase().replace(/[,']/g, " ");
    const yearMatch = lower.match(/\b((?:19|20)\d{2})\b/);
    if (yearMatch) {
        const year = Number(yearMatch[1]);
        let foundMonth = null;
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
                return formatIsoDateRange(year, foundMonth, Number(dayMatch[1]), minYear, maxYear);
            }
        }
    }
    return null;
}
export function parseBirthDate(raw) {
    return parseFlexibleDate(raw, 1915, new Date().getFullYear() - 14);
}
export function parseDeliveryDate(raw) {
    return parseFlexibleDate(raw, 2018, new Date().getFullYear() + 1);
}
export function parsePhoneNumber(raw) {
    const candidates = raw.match(/(\+?\d[\d\s\-()]{6,17}\d)/g) || [];
    for (const candidate of candidates) {
        const trimmed = candidate.trim();
        if (/^(?:19|20)\d{2}[-./]\d{1,2}[-./]\d{1,2}$/.test(trimmed) ||
            /^\d{1,2}[-./]\d{1,2}[-./](?:19|20)\d{2}$/.test(trimmed)) {
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
export function parseEmailAddress(raw) {
    const match = raw.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    return match ? match[0].toLowerCase() : null;
}
const LOCATION_ALIASES = [
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
export function parseLocation(raw, allowFreeDistrictFallback) {
    const lower = raw.trim().toLowerCase();
    if (!lower)
        return null;
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
    if (allowFreeDistrictFallback &&
        raw.trim().length >= 2 &&
        /[a-zA-Zа-яА-ЯёЁўЎқҚғҒҳҲ]/.test(raw)) {
        return { region: "", district: raw.trim() };
    }
    return null;
}
export function parseBloodType(raw) {
    const text = raw.trim();
    if (!text)
        return null;
    for (const bt of BLOOD_TYPE_OPTIONS) {
        if (text.toLowerCase() === bt.value.toLowerCase())
            return bt.value;
    }
    const lower = text.toLowerCase();
    if (lower.includes("don't know") ||
        lower.includes("dont know") ||
        lower.includes("unknown") ||
        lower.includes("not sure") ||
        lower.includes("bilmayman") ||
        lower.includes("aniqlanmagan") ||
        lower.includes("не знаю") ||
        lower.includes("незнаю")) {
        return "I don't know";
    }
    const hasNeg = /(?:rh\s*-|-\s*$|\bneg|\bnegative|\bmanfiy|отриц|\(-\))/i.test(lower) ||
        /^(?:o|a|b|ab|1|2|3|4|i|ii|iii|iv)\s*-$/i.test(lower);
    const hasPos = /(?:rh\s*\+|\+\s*$|\bpos|\bpositive|\bmusbat|полож|\(\+\))/i.test(lower) ||
        /^(?:o|a|b|ab|1|2|3|4|i|ii|iii|iv)\s*\+$/i.test(lower);
    if (!hasNeg && !hasPos)
        return null;
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
export function parseFullName(raw) {
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
export function getStepPrompt(draft, lang) {
    const step = getNextStep(draft);
    if (step === "doctorType") {
        return {
            step,
            inputType: "text",
            message: lang === "ru"
                ? "Здравствуйте! Я помогу заполнить анкету врача. Подскажите, вы работаете в роддоме (стационар) или в семейной поликлинике?"
                : lang === "en"
                    ? "Hello! I'll help fill out your doctor account step by step. First, do you work at a Maternity Hospital or a Local Family Clinic?"
                    : "Assalomu alaykum! Shifokor hisobingizni bosqichma-bosqich to'ldirib beraman. Avval ayting-chi, tug'ruqxonada ishlaysizmi yoki oilaviy poliklinikada?",
            placeholder: lang === "ru"
                ? "Роддом или семейная поликлиника..."
                : lang === "en"
                    ? "Maternity Hospital or Family Clinic..."
                    : "Tug'ruqxona yoki oilaviy poliklinika...",
            chips: [
                {
                    label: lang === "ru"
                        ? "Врач роддома (стационар)"
                        : lang === "en"
                            ? "Hospital Doctor (Maternity)"
                            : "Tug'ruqxona shifokori",
                    value: "OVABMU_MD",
                },
                {
                    label: lang === "ru"
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
            message: lang === "ru"
                ? "Как вас зовут? Напишите ваше полное имя (ФИО)."
                : lang === "en"
                    ? "What is your full name?"
                    : "To'liq ism-familiyangiz (F.I.O.) nima?",
            placeholder: lang === "ru"
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
            message: lang === "ru"
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
            message: lang === "ru"
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
        const chips = regionMatched
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
            placeholder: lang === "ru"
                ? "Например: Ташкент, Юнусабад"
                : lang === "en"
                    ? "e.g. Yunusobod, Tashkent"
                    : "Masalan: Yunusobod, Toshkent",
            chips,
        };
    }
    if (step === "mahalla") {
        let suggestions = [];
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
            message: lang === "ru"
                ? `Какая у вас махалля в районе ${draft.district}? Выберите вариант ниже или напишите свою.`
                : lang === "en"
                    ? `What is your neighborhood (mahalla) in ${draft.district}? Pick one below or type yours.`
                    : `${draft.district} tumanidagi mahallangiz nomi nima? Quyidagilardan tanlang yoki o'zingiz yozing:`,
            placeholder: lang === "ru"
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
            message: lang === "ru"
                ? "Укажите вашу группу крови и резус-фактор (или нажмите «Не знаю»):"
                : lang === "en"
                    ? "What is your blood type? Tap an option below or choose 'I don't know':"
                    : "Qon guruhingiz va rezus-faktoringizni tanlang (yoki «Bilmayman» tugmasini bosing):",
            placeholder: "O(I) Rh+, A(II) Rh-...",
            chips: BLOOD_TYPE_OPTIONS.map((bt) => ({
                label: lang === "ru"
                    ? bt.labelRu.split(" (")[0]
                    : lang === "en"
                        ? bt.labelEn.split(" (")[0]
                        : bt.labelUz.split(" (")[0],
                value: bt.value,
            })),
        };
    }
    if (step === "specialty") {
        const chips = draft.persona === "PSYCHOLOGIST"
            ? [
                {
                    label: lang === "ru"
                        ? "Перинатальный психолог"
                        : lang === "en"
                            ? "Perinatal Psychologist"
                            : "Perinatal psixolog",
                    value: "Perinatal psixolog",
                },
                {
                    label: lang === "ru"
                        ? "Семейный и послеродовый психолог"
                        : lang === "en"
                            ? "Postpartum & Family Psychologist"
                            : "Tug'ruqdan keyingi oilaviy psixolog",
                    value: "Tug'ruqdan keyingi oilaviy psixolog",
                },
                {
                    label: lang === "ru"
                        ? "Клинический психотерапевт"
                        : lang === "en"
                            ? "Clinical Psychotherapist"
                            : "Klinik psixoterapevt",
                    value: "Klinik psixoterapevt",
                },
            ]
            : draft.persona === "NURSE"
            ? [
                {
                    label: lang === "ru"
                        ? "Патронажная медсестра"
                        : lang === "en"
                            ? "Monitoring / Patronage Nurse"
                            : "Patronaj hamshirasi (Monitoring)",
                    value: "Patronaj hamshirasi (Monitoring Nurse)",
                },
                {
                    label: lang === "ru"
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
                        label: lang === "ru"
                            ? "Врач родового отделения"
                            : lang === "en"
                                ? "Maternity Ward Physician"
                                : "Tug'ruq bo'limi shifokori",
                        value: "Tug'ruq bo'limi shifokori",
                    },
                ]
                : [
                    {
                        label: lang === "ru"
                            ? "Семейный врач"
                            : lang === "en"
                                ? "Family Doctor"
                                : "Hududiy oilaviy shifokor",
                        value: "Hududiy oilaviy shifokor",
                    },
                    {
                        label: lang === "ru"
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
            message: draft.persona === "PSYCHOLOGIST"
                ? lang === "ru"
                    ? "Укажите вашу психологическую специализацию:"
                    : lang === "en"
                        ? "What is your psychological counseling specialty?"
                        : "Psixologik mutaxassisligingiz qaysi?"
                : draft.persona === "NURSE"
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
            placeholder: lang === "ru"
                ? "Специальность..."
                : lang === "en"
                    ? "Specialty..."
                    : "Mutaxassislik...",
            chips,
        };
    }
    if (step === "expertiseArea") {
        const psychChips = [
            {
                label: lang === "ru"
                    ? "Послеродовая тревожность и выгорание"
                    : lang === "en"
                        ? "Postpartum anxiety & emotional recovery"
                        : "Tug'ruqdan keyingi ruhiy tushkunlik va xavotir",
                value: "Tug'ruqdan keyingi ruhiy tushkunlik va xavotir",
            },
            {
                label: lang === "ru"
                    ? "Поддержка сна и привязанности с малышом"
                    : lang === "en"
                        ? "Mother-baby bonding & sleep stress"
                        : "Ona-bola bog'lanishi va uyqu muammolari",
                value: "Ona-bola bog'lanishi va uyqu muammolari",
            },
            {
                label: lang === "ru"
                    ? "Кризисное перинатальное консультирование"
                    : lang === "en"
                        ? "Crisis & high-risk perinatal counseling"
                        : "Favqulodda perinatal psixologik yordam",
                value: "Favqulodda perinatal psixologik yordam",
            },
        ];
        return {
            step,
            inputType: "text",
            message: lang === "ru"
                ? "Какая ваша ключевая клиническая экспертиза или направление помощи?"
                : lang === "en"
                    ? "What is your primary clinical expertise focus?"
                    : "Asosiy ekspertizangiz va qaysi holatlarda yordam ko'rsatishingizni yozing:",
            placeholder: lang === "ru"
                ? "Например: Послеродовое наблюдение и поддержка"
                : lang === "en"
                    ? "e.g. High-risk postpartum care & support"
                    : "Masalan: Tug'ruqdan keyingi nazorat va qo'llab-quvvatlash",
            chips: draft.persona === "PSYCHOLOGIST" ? psychChips : [
                {
                    label: lang === "ru"
                        ? "Послеродовое наблюдение и уход"
                        : lang === "en"
                            ? "Postpartum & maternal monitoring"
                            : "Tug'ruqdan keyingi ona va bola nazorati",
                    value: "Tug'ruqdan keyingi ona va bola nazorati",
                },
                {
                    label: lang === "ru"
                        ? "Гипертония, диабет и давление"
                        : lang === "en"
                            ? "Blood pressure & preeclampsia risk"
                            : "Qon bosimi, preeklampsiya va xavf nazorati",
                    value: "Qon bosimi, preeklampsiya va xavf nazorati",
                },
                {
                    label: lang === "ru"
                        ? "Неонатальный и домашний патронаж"
                        : lang === "en"
                            ? "Newborn & pediatric home check-ups"
                            : "Chaqaloq va uyda shoshilinch patronaj ko'rigi",
                    value: "Chaqaloq va uyda shoshilinch patronaj ko'rigi",
                },
            ],
        };
    }
    if (step === "experienceYears") {
        return {
            step,
            inputType: "text",
            message: lang === "ru"
                ? "Сколько лет у вас клинического стажа (опыта работы)?"
                : lang === "en"
                    ? "How many years of medical experience do you have?"
                    : "Tibbiy tajribangiz necha yil?",
            placeholder: lang === "ru" ? "Например: 5" : lang === "en" ? "e.g. 5" : "Masalan: 5",
            chips: [
                { label: lang === "ru" ? "1-2 года" : lang === "en" ? "2 years" : "2 yil", value: "2" },
                { label: lang === "ru" ? "5 лет" : lang === "en" ? "5 years" : "5 yil", value: "5" },
                { label: lang === "ru" ? "8 лет" : lang === "en" ? "8 years" : "8 yil", value: "8" },
                { label: lang === "ru" ? "12+ лет" : lang === "en" ? "12+ years" : "12+ yil", value: "12" },
            ],
        };
    }
    if (step === "email") {
        return {
            step,
            inputType: "email",
            message: lang === "ru"
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
            message: lang === "ru"
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
        message: lang === "ru"
            ? "Все готово! Я заполнил вашу анкету справа. Нажмите «Создать аккаунт», либо откройте форму для ручной правки."
            : lang === "en"
                ? "All done! I've filled out all your details in the summary card. Press 'Create Account' or 'Review & Edit Form' if you want to tweak anything."
                : "Hammasi tayyor! Ma'lumotlaringizni to'ldirib qo'ydim. Tekshirib «Hisob yaratish» tugmasini bosing yoki shakl ko'rinishida tahrirlang.",
        placeholder: "",
        chips: [],
    };
}
export function getStarterFaqChips(persona, lang) {
    if (lang === "ru") {
        return [
            { label: "❓ Как работает визит за 24ч?", value: "Как работает 24-часовой визит врача на дом?" },
            { label: "❓ Мои данные в безопасности?", value: "Как защищены мои медицинские данные и личная информация?" },
            persona === "PATIENT"
                ? { label: "❓ Зачем нужна группа крови?", value: "Зачем указывать группу крови и что делать, если я ее не знаю?" }
                : { label: "❓ Как проходит проверка аккаунта?", value: "Как проходит верификация специалиста?" },
        ];
    }
    if (lang === "en") {
        return [
            { label: "❓ How does the 24h home visit work?", value: "How does the 24-hour home visit work?" },
            { label: "❓ Is my health data private?", value: "How are my medical records and personal data protected?" },
            persona === "PATIENT"
                ? { label: "❓ Why do you need blood type?", value: "Why do you ask for blood type, and what if I don't know it?" }
                : { label: "❓ How does verification work?", value: "How does specialist account verification work?" },
        ];
    }
    return [
        { label: "❓ 24 soatlik uy tashrifi qanday?", value: "24 soatlik uy tashrifi qanday ishlaydi va bepulmi?" },
        { label: "❓ Ma'lumotlarim xavfsizmi?", value: "Tibbiy ma'lumotlarim va shaxsiy yozuvlarim qanday himoyalanadi?" },
        persona === "PATIENT"
            ? { label: "❓ Qon guruhimni bilmasam-chi?", value: "Qon guruhini nima uchun so'raysiz va bilmasam nima qilaman?" }
            : { label: "❓ Tasdiqlash qanday o'tadi?", value: "Shifokor va mutaxassis hisoblari qanday tasdiqlanadi?" },
    ];
}
export function isLikelyQuestion(raw) {
    const text = String(raw || "").trim();
    if (!text)
        return false;
    if (text.includes("?"))
        return true;
    const lower = text.toLowerCase();
    return /^(?:why|how|what|when|where|who|can i|do i|is it|are you|will |tell me|explain|зачем|почему|как|что|когда|где|кто|можно ли|нужно ли|расскажите|объясните|сколько|бесплатно|nima|nega|qanday|qachon|qayerda|kim|mumkinmi|kerakmi|tushuntiring|bepulmi|necha)/i.test(lower);
}
export function answerSignupQuestionFallback(raw, draft, lang) {
    const lower = String(raw || "").toLowerCase();
    if (lower.includes("blood") || lower.includes("кров") || lower.includes("qon") || lower.includes("резус")) {
        return lang === "ru"
            ? "Группа крови помогает бригаде роддома и семейному врачу быстрее ориентироваться при послеродовом осмотре и осложнениях. Если вы не знаете свою группу крови, просто нажмите «Не знаю» — это не помешает регистрации."
            : lang === "en"
                ? "Your blood type helps your maternity team and family doctor react faster during postpartum follow-ups. If you don't know it yet, simply choose 'I don't know' — you can still register right away."
                : "Qon guruhi tug'ruqxona va oilaviy shifokorga tug'ruqdan keyingi ko'rikda tezkor qaror qabul qilishga yordam beradi. Agar bilmasangiz, bemalol «Bilmayman» ni tanlang — ro'yxatdan o'tishga to'sqinlik qilmaydi.";
    }
    if (lower.includes("privacy") ||
        lower.includes("private") ||
        lower.includes("data") ||
        lower.includes("encrypt") ||
        lower.includes("безопас") ||
        lower.includes("защи") ||
        lower.includes("данн") ||
        lower.includes("конфиден") ||
        lower.includes("xavfsiz") ||
        lower.includes("maxfiy") ||
        lower.includes("himoya")) {
        return lang === "ru"
            ? "Все чувствительные данные (ПИНФЛ/JSHSHIR, клинические заметки и записи психолога) шифруются по стандарту AES-256-GCM. Доступ строго разграничен по ролям, а заметки перинатального психолога изолированы от больничного EHR и доступны только с вашего согласия (PsychConsent)."
            : lang === "en"
                ? "Sensitive fields (JSHSHIR, clinical notes, and psychologist notes) are encrypted with AES-256-GCM. Access is strictly role-based, and perinatal psychologist sessions are isolated from hospital clinical EHR records unless you explicitly consent."
                : "Barcha maxfiy ma'lumotlar (JSHSHIR, shifokor va psixolog qaydnomalari) AES-256-GCM shifrlash bilan himoyalanadi. Kirish huquqlari qat'iy rollarga ajratilgan, psixolog suhbatlari esa shifoxona klinik kartasidan alohida saqlanadi.";
    }
    if (/\b(?:telegram|телеграм|bot|botga|botda|бот|бота|боту|боте)\b/i.test(lower)) {
        return lang === "ru"
            ? "После создания аккаунта вы сразу получите персональную ссылку для привязки Telegram-бота (@OnaCarePatronajBot). Через бота приходят напоминания о лекарствах, утренний чек-ин, связь с врачом и доступ в мини-приложение."
            : lang === "en"
                ? "Right after creating your account, you'll receive a one-tap link for the OnaCare Telegram bot (@OnaCarePatronajBot) to get medication reminders, daily check-ins, and direct doctor/psychologist messaging."
                : "Hisob yaratganingizdan so'ng darhol Telegram botga (@OnaCarePatronajBot) ulash havolasi chiqadi. Bot orqali dori eslatmalari, kunlik holat tekshiruvi va shifokor bilan chat olasiz.";
    }
    if (lower.includes("verif") ||
        lower.includes("approv") ||
        lower.includes("провер") ||
        lower.includes("вериф") ||
        lower.includes("подтвер") ||
        lower.includes("tasdiq")) {
        return lang === "ru"
            ? "Для безопасности пациентов все новые аккаунты (мамы, врачи, медсестры и психологи) проверяет координатор поликлиники. После подтверждения вы сможете войти по вашему email и паролю."
            : lang === "en"
                ? "To protect patient safety, new mother, doctor, nurse, and psychologist accounts are reviewed by a clinic administrator before sign-in. You can still link Telegram immediately after submitting."
                : "Bemorlar xavfsizligi uchun barcha yangi hisoblar poliklinika administratori tomonidan tekshirib tasdiqlanadi. Tasdiqlangach elektron pochta va parol bilan kirasiz.";
    }
    if (lower.includes("gps") || lower.includes("locat") || lower.includes("район") || lower.includes("адрес") || lower.includes("локац") || lower.includes("tuman") || lower.includes("manzil")) {
        return lang === "ru"
            ? "Район и махалля нужны, чтобы автоматически закрепить за вами ближайшую семейную поликлинику и врача. Точный GPS необязателен — если вы не поделитесь им, система подставит центр вашего района."
            : lang === "en"
                ? "Your region, district, and mahalla match you with the nearest family clinic and home-visit team. Live GPS is optional — we automatically fall back to your district center if skipped."
                : "Hudud, tuman va mahalla sizga eng yaqin oilaviy poliklinika va uyga keluvchi shifokorni biriktirish uchun kerak. Jonli GPS ixtiyoriy — ulashmasangiz tuman markazi koordinatasi olinadi.";
    }
    if (lower.includes("24") || lower.includes("visit") || lower.includes("free") || lower.includes("cost") || lower.includes("визит") || lower.includes("бесплат") || lower.includes("tashrif") || lower.includes("bepul") || lower.includes("narx")) {
        return lang === "ru"
            ? "Базовый 24-часовой послеродовой визит семейного врача/патронажной медсестры, ежедневный чек-ин и экстренные уведомления бесплатны в рамках программы. Срочные случаи всегда направляются в службу 103."
            : lang === "en"
                ? "The core 24-hour postpartum family clinic home visit after hospital discharge, daily mother & baby check-ins, and emergency alerts are free. For urgent emergencies, always call 103."
                : "Tug'ruqxonadan chiqqandan keyingi 24 soat ichidagi oilaviy shifokor uy tashrifi, kunlik ona-bola nazorati va shoshilinch ogohlantirishlar bepul. Favqulodda holatlarda doimo 103 ga qo'ng'iroq qiling.";
    }
    if (lower.includes("psych") || lower.includes("псих") || lower.includes("epds") || lower.includes("ruhiy")) {
        return lang === "ru"
            ? "Перинатальные психологи OnaCare помогают при послеродовой тревожности и эмоциональной нагрузке. Они видят только шкалу настроения и EPDS при вашем согласии (PsychConsent) и не видят больничные анализы."
            : lang === "en"
                ? "OnaCare perinatal psychologists support maternal emotional health (including EPDS check-ins) with explicit consent and strict isolation from hospital clinical EHR records."
                : "OnaCare perinatal psixologlari onalarga ruhiy yordam ko'rsatadi; ular faqat roziligingiz (PsychConsent) bilan kayfiyat/EPDS natijalarini ko'radi va shifoxona tahlillariga kira olmaydi.";
    }
    return lang === "ru"
        ? `Я помогу ответить на любые вопросы об OnaCare и заполнить анкету. Текущая роль: ${draft.persona}. Сейчас осталось заполнить обязательные поля анкеты — можете писать данные естественным текстом или по одному шагу.`
        : lang === "en"
            ? `I'm happy to help with any questions about OnaCare and fill out your ${draft.persona.toLowerCase()} registration. You can share multiple details in one message (e.g., name, birth date, phone, district, email) or answer step by step.`
            : `OnaCare bo'yicha istalgan savolingizga javob beraman va arizangizni to'ldirishda yordamlashaman. Ma'lumotlaringizni bitta xabarda yozishingiz ham, bosqichma-bosqich kiritishingiz ham mumkin.`;
}
function extractExplicitNamePhrase(raw) {
    const match = String(raw || "").match(
        /(?:меня зовут|мо[её] имя|mening to'liq ismim|mening ismim|ismim|my name is|my full name is|i am|i'm)\s+([a-zA-Zа-яА-ЯёЁўЎқҚғҒҳҲ'’ʻ-]+(?:\s+[a-zA-Zа-яА-ЯёЁўЎқҚғҒҳҲ'’ʻ-]+){0,2})/i
    );
    return match ? match[1].trim() : null;
}
export function applyExtractedFields(draft, extracted) {
    if (!extracted || typeof extracted !== "object") {
        return { nextDraft: { ...draft }, filledFields: [] };
    }
    const next = { ...draft };
    const filledFields = [];
    const rawRole = typeof extracted.role === "string" ? extracted.role.trim().toUpperCase() : "";
    if (draft.persona === "DOCTOR" && (rawRole === "OVABMU_MD" || rawRole === "FAMILY_MD")) {
        if (next.role !== rawRole || !next.doctorTypePicked) {
            next.role = rawRole;
            next.doctorTypePicked = true;
            filledFields.push("role");
        }
    }
    if (typeof extracted.fullName === "string" && extracted.fullName.trim()) {
        const parsedName = parseFullName(extracted.fullName);
        if (parsedName && parsedName !== next.fullName) {
            next.fullName = parsedName;
            filledFields.push("fullName");
        }
    }
    if (typeof extracted.dateOfBirth === "string" && extracted.dateOfBirth.trim()) {
        const dob = parseBirthDate(extracted.dateOfBirth);
        if (dob && dob !== next.dateOfBirth) {
            next.dateOfBirth = dob;
            filledFields.push("dateOfBirth");
        }
    }
    if (typeof extracted.deliveryDate === "string" && extracted.deliveryDate.trim()) {
        const deliv = parseDeliveryDate(extracted.deliveryDate);
        if (deliv && deliv !== next.deliveryDate) {
            next.deliveryDate = deliv;
            filledFields.push("deliveryDate");
        }
    }
    if (typeof extracted.phone === "string" && extracted.phone.trim()) {
        const phone = parsePhoneNumber(extracted.phone);
        if (phone && phone !== next.phone) {
            next.phone = phone;
            filledFields.push("phone");
        }
    }
    const combinedLocationText = [extracted.region, extracted.district]
        .filter((v) => typeof v === "string" && v.trim())
        .join(", ");
    if (combinedLocationText) {
        const parsedLoc = parseLocation(combinedLocationText, Boolean(extracted.district && String(extracted.district).trim().length >= 2));
        if (parsedLoc) {
            if (parsedLoc.region && parsedLoc.region !== next.region) {
                next.region = parsedLoc.region;
                filledFields.push("region");
            }
            if (parsedLoc.district && parsedLoc.district !== next.district) {
                next.district = parsedLoc.district;
                filledFields.push("district");
            }
        }
        else if (typeof extracted.district === "string" && extracted.district.trim()) {
            const dVal = extracted.district.trim();
            if (dVal !== next.district) {
                next.district = dVal;
                filledFields.push("district");
            }
        }
        if (next.district && (next.latitude === null || next.longitude === null)) {
            const coords = resolveCoordinatesForLocation(next.district, next.region);
            next.latitude = coords.latitude;
            next.longitude = coords.longitude;
        }
    }
    if (typeof extracted.mahalla === "string" && extracted.mahalla.trim()) {
        const mVal = extracted.mahalla.trim();
        if (mVal !== next.mahalla) {
            next.mahalla = mVal;
            filledFields.push("mahalla");
        }
    }
    if (typeof extracted.bloodType === "string" && extracted.bloodType.trim()) {
        const bt = parseBloodType(extracted.bloodType);
        if (bt && bt !== next.bloodType) {
            next.bloodType = bt;
            filledFields.push("bloodType");
        }
    }
    if (typeof extracted.specialty === "string" && extracted.specialty.trim()) {
        const sVal = extracted.specialty.trim();
        if (sVal !== next.specialty) {
            next.specialty = sVal;
            filledFields.push("specialty");
        }
    }
    if (typeof extracted.expertiseArea === "string" && extracted.expertiseArea.trim()) {
        const eVal = extracted.expertiseArea.trim();
        if (eVal !== next.expertiseArea) {
            next.expertiseArea = eVal;
            filledFields.push("expertiseArea");
        }
    }
    if (extracted.experienceYears !== undefined &&
        extracted.experienceYears !== null &&
        String(extracted.experienceYears).trim() !== "") {
        const numMatch = String(extracted.experienceYears).match(/\d+/);
        if (numMatch) {
            const yrs = String(Math.min(65, Math.max(0, parseInt(numMatch[0], 10))));
            if (yrs !== String(next.experienceYears)) {
                next.experienceYears = yrs;
                filledFields.push("experienceYears");
            }
        }
    }
    if (typeof extracted.email === "string" && extracted.email.trim()) {
        const email = parseEmailAddress(extracted.email);
        if (email && email !== next.email) {
            next.email = email;
            filledFields.push("email");
        }
    }
    return { nextDraft: next, filledFields };
}
export function processAiAnswer(draft, rawInput, lang) {
    const step = getNextStep(draft);
    const input = rawInput.trim();
    if (!input) {
        return { nextDraft: draft, reply: getStepPrompt(draft, lang).message, filledFields: [] };
    }
    const next = { ...draft };
    // Handle password step exclusively & securely on client
    if (step === "password" && !isLikelyQuestion(input)) {
        if (input.length < 6) {
            return {
                nextDraft: next,
                filledFields: [],
                maskedUserMessage: "••••",
                reply: lang === "ru"
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
            filledFields: ["password"],
            maskedUserMessage: "•".repeat(Math.min(input.length, 10)),
            reply: nextPrompt.message,
        };
    }
    const capturedLabels = [];
    const filledFields = [];
    // 1. Opportunistically extract unambiguous structured fields if user typed a multi-part sentence
    if (!next.fullName) {
        const explicitName = extractExplicitNamePhrase(input);
        if (explicitName) {
            next.fullName = explicitName;
            capturedLabels.push(lang === "ru" ? "ФИО" : lang === "en" ? "Name" : "F.I.O.");
            filledFields.push("fullName");
        }
    }
    if (step !== "email" && !next.email) {
        const email = parseEmailAddress(input);
        if (email) {
            next.email = email;
            capturedLabels.push("Email");
            filledFields.push("email");
        }
    }
    if (step !== "dateOfBirth" && !next.dateOfBirth) {
        const dob = parseBirthDate(input);
        if (dob) {
            next.dateOfBirth = dob;
            capturedLabels.push(lang === "ru" ? "Дата рождения" : lang === "en" ? "DOB" : "Tug'ilgan sana");
            filledFields.push("dateOfBirth");
        }
    }
    if (step !== "phone" && !next.phone) {
        const phone = parsePhoneNumber(input);
        if (phone) {
            next.phone = phone;
            capturedLabels.push(lang === "ru" ? "Телефон" : lang === "en" ? "Phone" : "Telefon");
            filledFields.push("phone");
        }
    }
    if (step !== "location" && !next.district) {
        const loc = parseLocation(input, false);
        if (loc && (loc.district || loc.region)) {
            if (loc.region)
                next.region = loc.region;
            if (loc.district)
                next.district = loc.district;
            if (next.district && (next.latitude === null || next.longitude === null)) {
                const coords = resolveCoordinatesForLocation(next.district, next.region);
                next.latitude = coords.latitude;
                next.longitude = coords.longitude;
            }
            if (loc.district) {
                capturedLabels.push(lang === "ru" ? "Район" : lang === "en" ? "District" : "Tuman");
                filledFields.push("district");
            }
        }
    }
    if (next.persona === "PATIENT" && step !== "bloodType" && !next.bloodType) {
        const bt = parseBloodType(input);
        if (bt) {
            next.bloodType = bt;
            capturedLabels.push(lang === "ru" ? "Группа крови" : lang === "en" ? "Blood type" : "Qon guruhi");
            filledFields.push("bloodType");
        }
    }
    // If user is asking a question, answer it cleanly instead of treating the question as a field value!
    if (isLikelyQuestion(input)) {
        const faqAnswer = answerSignupQuestionFallback(input, next, lang);
        const nextPrompt = getStepPrompt(next, lang);
        return {
            nextDraft: next,
            filledFields,
            answeredQuestion: true,
            reply: `${faqAnswer}\n\n${nextPrompt.message}`,
        };
    }
    // 2. Process the active step specifically
    if (step === "doctorType") {
        const lower = input.toLowerCase();
        if (input === "OVABMU_MD" ||
            lower.includes("hospital") ||
            lower.includes("maternity") ||
            lower.includes("tug'ruq") ||
            lower.includes("rod") ||
            lower.includes("роддом") ||
            lower.includes("стационар")) {
            next.role = "OVABMU_MD";
            next.doctorTypePicked = true;
            filledFields.push("role");
        }
        else if (input === "FAMILY_MD" ||
            lower.includes("family") ||
            lower.includes("clinic") ||
            lower.includes("oilaviy") ||
            lower.includes("poliklinika") ||
            lower.includes("семейн") ||
            lower.includes("поликлин")) {
            next.role = "FAMILY_MD";
            next.doctorTypePicked = true;
            filledFields.push("role");
        }
        else {
            return {
                nextDraft: next,
                filledFields,
                reply: lang === "ru"
                    ? "Пожалуйста, выберите один из вариантов: Врач роддома или Семейный врач."
                    : lang === "en"
                        ? "Please pick one of the two options: Hospital Doctor or Family Doctor."
                        : "Iltimos, ikkitadan birini tanlang: Tug'ruqxona shifokori yoki Hududiy oilaviy shifokor.",
            };
        }
    }
    else if (step === "fullName") {
        const firstSegment = input.split(/[,;]/)[0] || input;
        const parsedName = parseFullName(firstSegment);
        if (!parsedName) {
            return {
                nextDraft: next,
                filledFields,
                reply: lang === "ru"
                    ? "Пожалуйста, напишите ваше полное имя буквами (не менее 2 символов)."
                    : lang === "en"
                        ? "Please enter your full name (at least 2 letters)."
                        : "Iltimos, to'liq ismingizni kiriting (kamida 2 ta harf).",
            };
        }
        next.fullName = parsedName;
        filledFields.push("fullName");
    }
    else if (step === "dateOfBirth") {
        const dob = parseBirthDate(input);
        if (!dob) {
            return {
                nextDraft: next,
                filledFields,
                reply: lang === "ru"
                    ? "Не удалось распознать дату рождения. Напишите, например: 14.05.1996 или 1996-05-14."
                    : lang === "en"
                        ? "I couldn't recognize that date. Please type e.g. 14.05.1996 or 1996-05-14."
                        : "Tug'ilgan sanani tushunolmadim. Masalan, 14.05.1996 yoki 1996-05-14 ko'rinishida yozing.",
            };
        }
        next.dateOfBirth = dob;
        filledFields.push("dateOfBirth");
    }
    else if (step === "phone") {
        const phone = parsePhoneNumber(input);
        if (!phone) {
            return {
                nextDraft: next,
                filledFields,
                reply: lang === "ru"
                    ? "Пожалуйста, введите корректный номер телефона (например: +998 90 123 45 67)."
                    : lang === "en"
                        ? "Please enter a valid phone number (e.g. +998 90 123 45 67)."
                        : "Iltimos, to'g'ri telefon raqamini kiriting (masalan: +998 90 123 45 67).",
            };
        }
        next.phone = phone;
        filledFields.push("phone");
    }
    else if (step === "location") {
        const loc = parseLocation(input, Boolean(next.region) || input.length >= 3);
        if (!loc) {
            return {
                nextDraft: next,
                filledFields,
                reply: lang === "ru"
                    ? "Пожалуйста, напишите ваш город или район (или выберите вариант ниже)."
                    : lang === "en"
                        ? "Please type your district/city or choose one of the quick options below."
                        : "Iltimos, tuman yoki shahringizni yozing yoki quyidagi tugmalardan birini tanlang.",
            };
        }
        if (loc.region)
            next.region = loc.region;
        if (loc.district) {
            next.district = loc.district;
            filledFields.push("district");
        }
        if (next.district && (next.latitude === null || next.longitude === null)) {
            const coords = resolveCoordinatesForLocation(next.district, next.region);
            next.latitude = coords.latitude;
            next.longitude = coords.longitude;
        }
    }
    else if (step === "mahalla") {
        next.mahalla = input;
        filledFields.push("mahalla");
    }
    else if (step === "bloodType") {
        const bt = parseBloodType(input);
        if (!bt) {
            return {
                nextDraft: next,
                filledFields,
                reply: lang === "ru"
                    ? "Выберите группу крови кнопкой ниже или напишите например: A(II) Rh-, O(I) Rh+ или «Не знаю»."
                    : lang === "en"
                        ? "Please tap one of the blood types below, or type e.g. A-, O+, or 'I don't know'."
                        : "Quyidagi qon guruhlaridan birini bosing yoki masalan A-, O+ yoxud «Bilmayman» deb yozing.",
            };
        }
        next.bloodType = bt;
        filledFields.push("bloodType");
    }
    else if (step === "specialty") {
        next.specialty = input;
        filledFields.push("specialty");
    }
    else if (step === "expertiseArea") {
        next.expertiseArea = input;
        filledFields.push("expertiseArea");
    }
    else if (step === "experienceYears") {
        const numMatch = input.match(/\d+/);
        const yrs = numMatch ? Math.min(65, Math.max(0, parseInt(numMatch[0], 10))) : NaN;
        if (Number.isNaN(yrs)) {
            return {
                nextDraft: next,
                filledFields,
                reply: lang === "ru"
                    ? "Укажите количество лет стажа числом (например: 5)."
                    : lang === "en"
                        ? "Please enter years of experience as a number (e.g. 5)."
                        : "Iltimos, ish tajribangizni yil hisobida raqam bilan kiriting (masalan: 5).",
            };
        }
        next.experienceYears = String(yrs);
        filledFields.push("experienceYears");
    }
    else if (step === "email") {
        const email = parseEmailAddress(input);
        if (!email) {
            return {
                nextDraft: next,
                filledFields,
                reply: lang === "ru"
                    ? "Пожалуйста, введите корректный адрес электронной почты (например: name@example.uz)."
                    : lang === "en"
                        ? "Please enter a valid email address (e.g. name@example.uz)."
                        : "Iltimos, to'g'ri elektron pochta manzilini kiriting (masalan: ism@example.uz).",
            };
        }
        next.email = email;
        filledFields.push("email");
    }
    const nextPrompt = getStepPrompt(next, lang);
    const ack = capturedLabels.length > 0 && nextPrompt.step !== "complete"
        ? lang === "ru"
            ? `Отлично (${capturedLabels.join(", ")} тоже заполнено). `
            : lang === "en"
                ? `Got it (also filled: ${capturedLabels.join(", ")}). `
                : `Ajoyib (${capturedLabels.join(", ")} ham to'ldirildi). `
        : "";
    return {
        nextDraft: next,
        filledFields,
        reply: `${ack}${nextPrompt.message}`,
    };
}

