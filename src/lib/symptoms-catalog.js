export const PRIMARY_RED_FLAG_SYMPTOMS = [
    {
        key: "fever",
        uz: "Isitma > 38.0°C",
        ru: "Температура > 38.0°C",
        en: "Fever > 38.0°C",
    },
    {
        key: "severeHeadache",
        uz: "Kuchli bosh og'rig'i / ko'z xiralashishi",
        ru: "Сильная головная боль / туман",
        en: "Severe headache / blurred vision",
    },
    {
        key: "bleeding",
        uz: "Kuchli qon ketishi",
        ru: "Обильное кровотечение",
        en: "Heavy bleeding",
    },
    {
        key: "swelling",
        uz: "Yuz / qo'l / oyoqda kuchli shish",
        ru: "Сильные отеки лица / ног",
        en: "Severe face or leg swelling",
    },
];
export const EXTENDED_SYMPTOMS_CATALOG = [
    // Physical / Postpartum warning symptoms
    {
        id: "chest_pain",
        category: "physical",
        triage: "CRITICAL",
        uz: "Ko'krak qafasida og'riq yoki nafas qisishi",
        ru: "Боль в груди или одышка",
        en: "Chest pain or shortness of breath",
    },
    {
        id: "dizziness",
        category: "physical",
        triage: "CRITICAL",
        uz: "Bosh aylanishi yoki hushdan ketish hissi",
        ru: "Головокружение или предобморочное состояние",
        en: "Dizziness or feeling faint",
    },
    {
        id: "abdominal_pain",
        category: "physical",
        triage: "CRITICAL",
        uz: "Qorin pastida yoki o'ng qovurg'a ostida kuchli og'riq",
        ru: "Сильная боль внизу живота или под правым ребром",
        en: "Severe lower or upper-right belly pain",
    },
    {
        id: "leg_pain",
        category: "physical",
        triage: "CRITICAL",
        uz: "Bitta oyoqda og'riq, qizarish yoki issiqlik",
        ru: "Боль, покраснение или жар в одной ноге",
        en: "Pain, redness, or warmth in one leg",
    },
    {
        id: "wound_infection",
        category: "physical",
        triage: "WARNING",
        uz: "Chok atrofida qizarish, shish yoki yiringli ajralma",
        ru: "Покраснение, отек или гной в области шва",
        en: "Redness, swelling, or pus near stitches",
    },
    {
        id: "foul_discharge",
        category: "physical",
        triage: "WARNING",
        uz: "Badbo'y yoki g'ayrioddiy ajralmalar",
        ru: "Неприятный запах или необычные выделения",
        en: "Foul-smelling or unusual discharge",
    },
    {
        id: "breast_mastitis",
        category: "physical",
        triage: "WARNING",
        uz: "Ko'krakda og'riq, qattiqlashish yoki qizarish",
        ru: "Боль, уплотнение или покраснение в груди",
        en: "Breast pain, lump, or redness",
    },
    {
        id: "urinary_pain",
        category: "physical",
        triage: "WARNING",
        uz: "Siyish paytida achishish yoki og'riq",
        ru: "Жжение или боль при мочеиспускании",
        en: "Burning or pain when urinating",
    },
    {
        id: "mild_fatigue",
        category: "physical",
        triage: "MILD",
        uz: "Umumiy holsizlik yoki charchoq",
        ru: "Общая слабость или усталость",
        en: "General weakness or fatigue",
    },
    // General / Chronic illnesses & other conditions
    {
        id: "anemia",
        category: "conditions",
        triage: "WARNING",
        uz: "Kamqonlik (anemiya) yoki teri rangparligi",
        ru: "Признаки анемии, сильная бледность",
        en: "Anemia signs or paleness",
    },
    {
        id: "hypertension",
        category: "conditions",
        triage: "WARNING",
        uz: "Qon bosimi oshishi (gipertoniya)",
        ru: "Повышенное давление (гипертония)",
        en: "High blood pressure (hypertension)",
    },
    {
        id: "gestational_diabetes",
        category: "conditions",
        triage: "WARNING",
        uz: "Qondagi qand miqdori o'zgarishi (diabet)",
        ru: "Колебания сахара в крови (диабет)",
        en: "Blood sugar changes (diabetes)",
    },
    {
        id: "digestive_nausea",
        category: "conditions",
        triage: "WARNING",
        uz: "Ko'ngil aynishi, qusish yoki ich ketishi",
        ru: "Тошнота, рвота или диарея",
        en: "Nausea, vomiting, or diarrhea",
    },
    {
        id: "postpartum_mood",
        category: "conditions",
        triage: "WARNING",
        uz: "Kuchli xavotir, tushkunlik yoki uyqusizlik",
        ru: "Сильная тревога, подавленность или бессонница",
        en: "Strong anxiety, sadness, or poor sleep",
    },
    {
        id: "respiratory_infection",
        category: "conditions",
        triage: "MILD",
        uz: "Shamollash, yo'tal yoki tomoq og'rig'i",
        ru: "Простуда, кашель или боль в горле",
        en: "Cold, cough, or sore throat",
    },
    {
        id: "thyroid_issue",
        category: "conditions",
        triage: "MILD",
        uz: "Qalqonsimon bez bilan bog'liq bezovtalik",
        ru: "Беспокойство со щитовидной железой",
        en: "Thyroid condition flare-up",
    },
    {
        id: "back_joint_pain",
        category: "conditions",
        triage: "MILD",
        uz: "Bel yoki bo'g'imlarda og'riq",
        ru: "Боль в пояснице или суставах",
        en: "Back or joint pain",
    },
];
export const VALID_SYMPTOM_IDS = new Set(EXTENDED_SYMPTOMS_CATALOG.map((s) => s.id));
export const CONDITION_SEVERITY_OPTIONS = [
    {
        value: "MILD",
        score: 1,
        uz: "1 · Yengil",
        ru: "1 · Легкая",
        en: "1 · Mild",
        badgeClass: "border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300",
    },
    {
        value: "MODERATE",
        score: 2,
        uz: "2 · O'rtacha",
        ru: "2 · Умеренная",
        en: "2 · Moderate",
        badgeClass: "border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300",
    },
    {
        value: "SEVERE",
        score: 3,
        uz: "3 · Jiddiy",
        ru: "3 · Серьезная",
        en: "3 · Serious",
        badgeClass: "border-orange-300 dark:border-orange-800 bg-orange-50 dark:bg-orange-950/60 text-orange-800 dark:text-orange-300",
    },
    {
        value: "CRITICAL",
        score: 4,
        uz: "4 · O'ta jiddiy",
        ru: "4 · Критическая",
        en: "4 · Very Serious",
        badgeClass: "border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300",
    },
];
export function getSymptomLabel(id, lang) {
    const item = EXTENDED_SYMPTOMS_CATALOG.find((s) => s.id === id);
    if (!item)
        return id;
    return lang === "ru" ? item.ru : lang === "en" ? item.en : item.uz;
}
export function getSeverityMeta(severity) {
    return (CONDITION_SEVERITY_OPTIONS.find((o) => o.value === severity) ??
        CONDITION_SEVERITY_OPTIONS[0]);
}
