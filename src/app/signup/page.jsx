"use client";
import React, { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { IconAlertTriangle, IconBuildingHospital, IconCircleCheck, IconClipboardText, IconClock, IconEye, IconEyeOff, IconNurse, IconShieldCheck, IconSparkles, IconStethoscope, IconUser, IconUserPlus, } from "@tabler/icons-react";
import { usePlatform } from "@/context/PlatformContext";
import { useLanguage } from "@/context/LanguageContext";
import { PublicHeader } from "@/components/PublicHeader";
import { SearchableCombobox } from "@/components/SearchableCombobox";
import { InfoTooltip } from "@/components/InfoTooltip";
import { AiSignupAssistant } from "@/components/AiSignupAssistant";
import { createInitialDraft, } from "@/lib/ai-signup-helper";
import { BLOOD_TYPE_OPTIONS, UZ_REGIONS } from "@/lib/uz-locations";
const PERSONA_CARDS = [
    {
        persona: "PATIENT",
        title: {
            uz: "Bemor / Ona",
            ru: "Пациент / Мама",
            en: "Patient / Mother",
        },
        desc: {
            uz: "Shaxsiy parvarish rejasi, kunlik holat tekshiruvi va 24 soatlik uy tashrifi",
            ru: "Личный план восстановления, проверка самочувствия и визит врача на дом за 24ч",
            en: "Personal recovery plan, daily check-ins & 24-hour family doctor visit",
        },
        tag: {
            uz: "Bemor kabineti",
            ru: "Кабинет пациента",
            en: "Patient portal",
        },
        icon: <IconUser className="h-5 w-5 text-teal-700 dark:text-teal-400"/>,
    },
    {
        persona: "DOCTOR",
        title: {
            uz: "Shifokor",
            ru: "Врач",
            en: "Doctor",
        },
        desc: {
            uz: "Tug'ruqxona yoki oilaviy poliklinika shifokorlari uchun klinik ish maydoni",
            ru: "Рабочий кабинет для врачей роддома и семейных поликлиник",
            en: "Clinical workspace for Maternity Hospital and Local Family Doctors",
        },
        tag: {
            uz: "Shifokor kabineti",
            ru: "Кабинет врача",
            en: "Doctor portal",
        },
        icon: <IconStethoscope className="h-5 w-5 text-indigo-700 dark:text-indigo-400"/>,
    },
    {
        persona: "NURSE",
        title: {
            uz: "Kuzatuv hamshirasi",
            ru: "Медсестра наблюдения",
            en: "Monitoring Nurse",
        },
        desc: {
            uz: "24 soatlik uy ko'rigi, qon bosimi/holat nazorati va bemorlarni kuzatish",
            ru: "Домашние визиты за 24 часа, контроль показателей и наблюдение мам",
            en: "24-hour home check-ups, vitals monitoring & postpartum follow-ups",
        },
        tag: {
            uz: "Hamshira nazorati",
            ru: "Наблюдение и уход",
            en: "Monitoring team",
        },
        icon: <IconNurse className="h-5 w-5 text-emerald-700 dark:text-emerald-400"/>,
    },
];
const COPY = {
    uz: {
        title: "OnaCare hisobini yaratish",
        subtitle: "Avval kim ekanligingizni tanlang, so'ngra odatiy shakl yoki AI yordamchisi orqali tez ro'yxatdan o'ting.",
        step1Title: "1-qadam: Siz kimsiz?",
        step2Title: "2-qadam: Ro'yxatdan o'tish usulini tanlang",
        aiCardTitle: "AI yordamchisi bilan ro'yxatdan o'tish",
        aiCardBadge: "Tavsiya etiladi",
        aiCardDesc: "AI sizdan ismingiz, tug'ilgan sanangiz va kerakli ma'lumotlarni so'rab, shaklni o'zi to'ldirib beradi.",
        tradCardTitle: "An'anaviy ro'yxatdan o'tish",
        tradCardDesc: "Standart ro'yxatdan o'tish maydonlarini o'zingiz qo'lda to'ldiring.",
        adminToggle: "Poliklinika koordinatori / administrator sifatida ro'yxatdan o'tish",
        adminBadge: "Poliklinika koordinatori",
        doctorTypeLabel: "Shifokor ish joyi",
        doctorHospital: "Tug'ruqxona shifokori (OvaBMU)",
        doctorFamily: "Hududiy oilaviy shifokor",
        specialtyLabel: "Mutaxassislik / Bo'lim",
        specialtyPlaceholder: "Masalan: Patronaj hamshirasi yoki Akusher-ginekolog",
        fullName: "F.I.O. (To'liq ism-familiya)",
        fullNamePlaceholder: "Masalan: Malika Karimova",
        email: "Elektron pochta",
        emailPlaceholder: "siz@example.uz",
        password: "Parol (kamida 6 belgi)",
        passwordPlaceholder: "Kamida 6 ta belgi",
        togglePw: "Parolni ko'rsatish yoki yashirish",
        phone: "Telefon raqami",
        region: "Hudud (Viloyat / Toshkent sh.)",
        regionPlaceholder: "Hududni qidiring (masalan: Toshkent shahri)...",
        district: "Tuman / Shahar",
        districtPlaceholder: "Tuman yoki shaharni qidiring...",
        mahalla: "Mahalla",
        mahallaTooltip: "MFY — siz yashaydigan mahalla fuqarolar yig'ini nomi.",
        mahallaPlaceholder: "Mahallani tanlang yoki yozing...",
        emptySearch: "Mos natija topilmadi",
        customHint: "o'zingiz yozishingiz mumkin",
        dob: "Tug'ilgan sana",
        bloodType: "Qon guruhi",
        bloodPlaceholder: "Qon guruhini tanlang...",
        districtError: "Iltimos, ro'yxatdan tuman yoki shahringizni tanlang.",
        submitError: "Hisob yaratib bo'lmadi.",
        submit: "Hisob yaratish va davom etish",
        submitting: "Hisob yaratilmoqda...",
        already: "Allaqachon hisobingiz bormi?",
        signInHere: "Bu yerda kiring",
        loadingForm: "Ro'yxatdan o'tish shakli yuklanmoqda...",
        verifyNotice: "Bemorlar, shifokorlar va kuzatuv hamshiralari ro'yxatdan o'tgandan so'ng tizimga kirishdan oldin administrator tomonidan tasdiqlanadi.",
        pendingTitle: "Arizangiz qabul qilindi — tasdiqlash kutilmoqda",
        pendingDesc: "Xavfsizlik va bemorlar ma'lumotlarini himoyalash uchun barcha bemor, shifokor va hamshira hisoblari poliklinika administratori tomonidan tasdiqlanadi. Tasdiqlangandan so'ng elektron pochtangiz va parolingiz bilan tizimga kirishingiz mumkin.",
        pendingStatusBadge: "Administrator tasdig'ini kutmoqda",
        pendingGoLogin: "Kirish sahifasiga o'tish",
        pendingBackHome: "Bosh sahifaga qaytish",
    },
    ru: {
        title: "Создать аккаунт OnaCare",
        subtitle: "Сначала выберите вашу роль, а затем — удобный способ регистрации: с AI-помощником или через обычную форму.",
        step1Title: "Шаг 1: Кем вы являетесь?",
        step2Title: "Шаг 2: Выберите способ регистрации",
        aiCardTitle: "Регистрация с AI-помощником",
        aiCardBadge: "Быстро и просто",
        aiCardDesc: "AI задаст вопросы об имени, дате рождения и нужных данных и сам заполнит анкету за вас.",
        tradCardTitle: "Традиционная форма",
        tradCardDesc: "Заполните все поля стандартной регистрационной анкеты вручную.",
        adminToggle: "Регистрация для координатора клиники / администратора",
        adminBadge: "Координатор клиники",
        doctorTypeLabel: "Место работы врача",
        doctorHospital: "Врач роддома (стационар)",
        doctorFamily: "Участковый семейный врач",
        specialtyLabel: "Специальность / Направление",
        specialtyPlaceholder: "Например: Патронажная медсестра или Акушер-гинеколог",
        fullName: "ФИО (Полное имя)",
        fullNamePlaceholder: "Например: Малика Каримова",
        email: "Электронная почта",
        emailPlaceholder: "you@example.uz",
        password: "Пароль (минимум 6 символов)",
        passwordPlaceholder: "Не менее 6 символов",
        togglePw: "Показать или скрыть пароль",
        phone: "Номер телефона",
        region: "Регион (Область / г. Ташкент)",
        regionPlaceholder: "Поиск региона (например: г. Ташкент)...",
        district: "Район / Город",
        districtPlaceholder: "Поиск района или города...",
        mahalla: "Махалля",
        mahallaTooltip: "МСГ / МФЙ — название вашей махалли по месту жительства.",
        mahallaPlaceholder: "Выберите или введите махаллю...",
        emptySearch: "Ничего не найдено",
        customHint: "продолжайте ввод для своего варианта",
        dob: "Дата рождения",
        bloodType: "Группа крови",
        bloodPlaceholder: "Выберите группу крови...",
        districtError: "Пожалуйста, выберите ваш район или город из списка.",
        submitError: "Не удалось создать аккаунт.",
        submit: "Создать аккаунт и продолжить",
        submitting: "Создание аккаунта...",
        already: "Уже есть аккаунт?",
        signInHere: "Войти здесь",
        loadingForm: "Загрузка формы регистрации...",
        verifyNotice: "Новые аккаунты пациентов, врачей и медсестер проходят проверку администратором перед входом в систему.",
        pendingTitle: "Заявка отправлена — ожидается проверка",
        pendingDesc: "Для защиты медицинских данных новые аккаунты пациентов, врачей и медсестер подтверждаются администратором клиники. После подтверждения вы сможете войти с вашим email и паролем.",
        pendingStatusBadge: "Ожидает подтверждения администратором",
        pendingGoLogin: "Перейти ко входу",
        pendingBackHome: "На главную",
    },
    en: {
        title: "Create Your OnaCare Account",
        subtitle: "First tell us who you are, then choose either the traditional form or our AI Sign-Up Helper.",
        step1Title: "Step 1: Who are you?",
        step2Title: "Step 2: Choose how you want to sign up",
        aiCardTitle: "Sign Up with AI Helper",
        aiCardBadge: "Easy & Guided",
        aiCardDesc: "AI asks simple questions about your name, birth date, and details, and fills everything out for you.",
        tradCardTitle: "Traditional Sign Up",
        tradCardDesc: "Fill in the standard registration fields manually yourself.",
        adminToggle: "Registering as a Clinic Coordinator / Admin instead?",
        adminBadge: "Clinic Coordinator",
        doctorTypeLabel: "Doctor Practice Type",
        doctorHospital: "Hospital Doctor (Maternity)",
        doctorFamily: "Local Family Doctor",
        specialtyLabel: "Specialty / Focus",
        specialtyPlaceholder: "e.g. Monitoring Nurse or OB-GYN",
        fullName: "Full Name",
        fullNamePlaceholder: "e.g. Malika Karimova",
        email: "Email Address",
        emailPlaceholder: "you@example.uz",
        password: "Password (min 6 chars)",
        passwordPlaceholder: "At least 6 characters",
        togglePw: "Toggle password visibility",
        phone: "Phone Number",
        region: "Region",
        regionPlaceholder: "Search region (e.g. Toshkent shahri)...",
        district: "District / City",
        districtPlaceholder: "Search district or city...",
        mahalla: "Neighborhood (Mahalla)",
        mahallaTooltip: "Local neighborhood community name (MFY) used to match your clinic.",
        mahallaPlaceholder: "Search or type your mahalla...",
        emptySearch: "No matches found",
        customHint: "keep typing to use your own entry",
        dob: "Date of Birth",
        bloodType: "Blood Type",
        bloodPlaceholder: "Select blood type...",
        districtError: "Please select your district or city from the list.",
        submitError: "Could not create account.",
        submit: "Create Account & Continue",
        submitting: "Creating account...",
        already: "Already have an account?",
        signInHere: "Sign In here",
        loadingForm: "Loading registration form...",
        verifyNotice: "Patient, Doctor, and Monitoring Nurse accounts require verification by a clinic Administrator before you can sign in.",
        pendingTitle: "Registration Submitted — Verification Pending",
        pendingDesc: "To keep patient records safe, all new patient, doctor, and nurse registrations are verified by an Administrator. Once approved, you can sign in with your email and password.",
        pendingStatusBadge: "Pending Admin Verification",
        pendingGoLogin: "Go to Sign In",
        pendingBackHome: "Back to Home",
    },
};
function parseInitialSelection(param) {
    if (!param)
        return { persona: null };
    const upper = param.trim().toUpperCase();
    if (upper === "PATIENT")
        return { persona: "PATIENT", presetRole: "PATIENT" };
    if (upper === "NURSE")
        return { persona: "NURSE", presetRole: "FAMILY_MD" };
    if (upper === "DOCTOR")
        return { persona: "DOCTOR" };
    if (upper === "OVABMU_MD")
        return { persona: "DOCTOR", presetRole: "OVABMU_MD" };
    if (upper === "FAMILY_MD")
        return { persona: "DOCTOR", presetRole: "FAMILY_MD" };
    if (upper === "ADMIN_RECEPTION") {
        return { persona: "ADMIN_RECEPTION", presetRole: "ADMIN_RECEPTION" };
    }
    return { persona: null };
}
function SignupFormInner() {
    const { signup } = usePlatform();
    const { lang } = useLanguage();
    const searchParams = useSearchParams();
    const t = COPY[lang];
    const queryRole = searchParams.get("role");
    const initialSelection = useMemo(() => parseInitialSelection(queryRole), [queryRole]);
    const [selectedPersona, setSelectedPersona] = useState(() => initialSelection.persona);
    const [doctorSubRole, setDoctorSubRole] = useState(() => initialSelection.presetRole === "OVABMU_MD" ? "OVABMU_MD" : "FAMILY_MD");
    const [signupMethod, setSignupMethod] = useState("ai");
    const [aiSessionKey, setAiSessionKey] = useState(0);
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPw, setShowPw] = useState(false);
    const [phone, setPhone] = useState("");
    const [region, setRegion] = useState("");
    const [district, setDistrict] = useState("");
    const [mahalla, setMahalla] = useState("");
    const [dateOfBirth, setDateOfBirth] = useState("");
    const [bloodType, setBloodType] = useState("");
    const [specialty, setSpecialty] = useState("");
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState(null);
    const [pendingInfo, setPendingInfo] = useState(null);
    const effectiveRole = selectedPersona === "PATIENT"
        ? "PATIENT"
        : selectedPersona === "ADMIN_RECEPTION"
            ? "ADMIN_RECEPTION"
            : selectedPersona === "NURSE"
                ? "FAMILY_MD"
                : doctorSubRole;
    const regionNames = useMemo(() => UZ_REGIONS.map((r) => r.name), []);
    const selectedRegionObj = useMemo(() => UZ_REGIONS.find((r) => r.name === region) ?? null, [region]);
    const districtNames = useMemo(() => {
        if (selectedRegionObj) {
            return selectedRegionObj.districts.map((d) => d.name);
        }
        return UZ_REGIONS.flatMap((r) => r.districts.map((d) => d.name));
    }, [selectedRegionObj]);
    const mahallaSuggestions = useMemo(() => {
        if (!district)
            return [];
        for (const r of UZ_REGIONS) {
            if (region && r.name !== region)
                continue;
            const found = r.districts.find((d) => d.name === district);
            if (found)
                return found.mahallas;
        }
        return [];
    }, [region, district]);
    const handleSelectPersona = (nextPersona) => {
        setError(null);
        if (nextPersona !== selectedPersona) {
            setSpecialty("");
        }
        setSelectedPersona(nextPersona);
        setAiSessionKey((k) => k + 1);
    };
    const applyDraftToForm = (draft) => {
        if (draft.persona === "DOCTOR") {
            setDoctorSubRole(draft.role === "OVABMU_MD" ? "OVABMU_MD" : "FAMILY_MD");
        }
        if (draft.fullName)
            setFullName(draft.fullName);
        if (draft.dateOfBirth)
            setDateOfBirth(draft.dateOfBirth);
        if (draft.phone)
            setPhone(draft.phone);
        if (draft.region)
            setRegion(draft.region);
        if (draft.district)
            setDistrict(draft.district);
        if (draft.mahalla)
            setMahalla(draft.mahalla);
        if (draft.bloodType)
            setBloodType(draft.bloodType);
        if (draft.specialty)
            setSpecialty(draft.specialty);
        if (draft.email)
            setEmail(draft.email);
        if (draft.password)
            setPassword(draft.password);
    };
    const handleRegionChange = (nextRegion) => {
        setRegion(nextRegion);
        setDistrict("");
        setMahalla("");
    };
    const handleDistrictChange = (nextDistrict) => {
        setDistrict(nextDistrict);
        setMahalla("");
        if (nextDistrict && !region) {
            const parentRegion = UZ_REGIONS.find((r) => r.districts.some((d) => d.name === nextDistrict));
            if (parentRegion) {
                setRegion(parentRegion.name);
            }
        }
    };
    const performSignup = async (payload) => {
        setError(null);
        setBusy(true);
        try {
            const res = await signup({
                fullName: payload.fullName,
                email: payload.email,
                password: payload.password,
                role: payload.role,
                specialty: payload.specialty,
                phone: payload.phone,
                region: payload.region,
                district: payload.district,
                mahalla: payload.mahalla,
                dateOfBirth: payload.dateOfBirth,
                bloodType: payload.bloodType,
            });
            if (!res.ok) {
                setError(res.error || t.submitError);
            }
            else if (res.pendingVerification) {
                setPendingInfo({
                    fullName: payload.fullName.trim(),
                    email: payload.email.trim().toLowerCase(),
                    persona: payload.persona,
                    role: payload.role,
                });
            }
        }
        finally {
            setBusy(false);
        }
    };
    const handleTraditionalSubmit = async (e) => {
        e.preventDefault();
        if (!selectedPersona)
            return;
        if (!district.trim()) {
            setError(t.districtError);
            return;
        }
        await performSignup({
            persona: selectedPersona,
            fullName,
            email,
            password,
            role: effectiveRole,
            specialty: selectedPersona === "NURSE"
                ? specialty.trim() || "Patronaj hamshirasi (Monitoring Nurse)"
                : selectedPersona === "DOCTOR"
                    ? specialty.trim() || undefined
                    : undefined,
            phone: phone.trim(),
            region: region.trim(),
            district: district.trim(),
            mahalla: selectedPersona === "PATIENT" ? mahalla.trim() : undefined,
            dateOfBirth: selectedPersona === "PATIENT" ? dateOfBirth : undefined,
            bloodType: selectedPersona === "PATIENT" ? bloodType : undefined,
        });
    };
    const handleAiCreateAccount = async (draft) => {
        applyDraftToForm(draft);
        await performSignup({
            persona: draft.persona,
            fullName: draft.fullName,
            email: draft.email,
            password: draft.password,
            role: draft.role,
            specialty: draft.persona === "NURSE"
                ? draft.specialty.trim() || "Patronaj hamshirasi (Monitoring Nurse)"
                : draft.persona === "DOCTOR"
                    ? draft.specialty.trim() || undefined
                    : undefined,
            phone: draft.phone.trim(),
            region: draft.region.trim(),
            district: draft.district.trim(),
            mahalla: draft.persona === "PATIENT" ? draft.mahalla.trim() : undefined,
            dateOfBirth: draft.persona === "PATIENT" ? draft.dateOfBirth : undefined,
            bloodType: draft.persona === "PATIENT" ? draft.bloodType : undefined,
        });
    };
    const aiInitialDraft = useMemo(() => {
        const base = createInitialDraft(selectedPersona ?? "PATIENT", initialSelection.presetRole);
        return {
            ...base,
            role: selectedPersona === "DOCTOR"
                ? doctorSubRole
                : base.role,
            doctorTypePicked: selectedPersona === "DOCTOR"
                ? Boolean(initialSelection.presetRole)
                : true,
            fullName: fullName || base.fullName,
            dateOfBirth: dateOfBirth || base.dateOfBirth,
            phone: phone || base.phone,
            region: region || base.region,
            district: district || base.district,
            mahalla: mahalla || base.mahalla,
            bloodType: bloodType || base.bloodType,
            specialty: specialty || base.specialty,
            email: email || base.email,
            password: password || base.password,
        };
        // Intentionally keyed by selectedPersona + aiSessionKey so live typing doesn't reset chat state
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedPersona, aiSessionKey]);
    if (pendingInfo) {
        const personaCard = PERSONA_CARDS.find((c) => c.persona === pendingInfo.persona);
        return (<div className="w-full max-w-xl rounded-2xl border border-amber-200 dark:border-amber-800/70 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm space-y-5 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
          <IconClock className="h-6 w-6"/>
        </div>
        <div className="space-y-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 dark:bg-amber-950/60 px-3 py-1 text-xs font-semibold text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            <IconCircleCheck className="h-3.5 w-3.5"/>
            {t.pendingStatusBadge}
          </span>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">
            {t.pendingTitle}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            {t.pendingDesc}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 p-4 text-left text-xs space-y-1.5">
          <p className="font-bold text-slate-900 dark:text-slate-100">
            {pendingInfo.fullName}
          </p>
          <p className="text-slate-600 dark:text-slate-300 font-mono">
            {pendingInfo.email}
          </p>
          {personaCard && (<p className="text-teal-700 dark:text-teal-400 font-semibold">
              {personaCard.title[lang]}
            </p>)}
        </div>

        <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
          <Link href="/login" className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-700 transition">
            {t.pendingGoLogin}
          </Link>
          <Link href="/" className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition">
            {t.pendingBackHome}
          </Link>
        </div>
      </div>);
    }
    return (<div className="w-full max-w-4xl rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
          {t.title}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          {t.subtitle}
        </p>
      </div>

      {/* Step 1: Who are you? (Patient / Doctor / Monitoring Nurse) */}
      <fieldset className="space-y-3">
        <legend className="text-xs font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400">
          {t.step1Title}
        </legend>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {PERSONA_CARDS.map((card) => {
            const active = selectedPersona === card.persona;
            return (<button key={card.persona} type="button" aria-pressed={active} onClick={() => handleSelectPersona(card.persona)} className={`flex flex-col justify-between gap-3 rounded-2xl border p-4 text-left transition ${active
                    ? "border-teal-600 bg-teal-50/70 dark:bg-teal-950/50 ring-2 ring-teal-600/40"
                    : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 hover:border-slate-300 dark:hover:border-slate-700"}`}>
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                    {card.icon}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      {card.title[lang]}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug mt-1">
                      {card.desc[lang]}
                    </p>
                  </div>
                </div>
                <span className="self-start rounded-full bg-white dark:bg-slate-900 px-2.5 py-0.5 text-[10px] font-semibold text-teal-700 dark:text-teal-400 border border-slate-200 dark:border-slate-700">
                  {card.tag[lang]}
                </span>
              </button>);
        })}
        </div>

        <div className="flex items-center justify-end">
          <button type="button" onClick={() => handleSelectPersona("ADMIN_RECEPTION")} className={`inline-flex items-center gap-1.5 text-[11px] font-semibold transition ${selectedPersona === "ADMIN_RECEPTION"
            ? "text-teal-700 dark:text-teal-400 underline"
            : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"}`}>
            <IconShieldCheck className="h-3.5 w-3.5"/>
            {selectedPersona === "ADMIN_RECEPTION" ? t.adminBadge : t.adminToggle}
          </button>
        </div>
      </fieldset>

      {/* Step 2 & 3 appear once a role is chosen */}
      {selectedPersona && (<>
          {selectedPersona !== "ADMIN_RECEPTION" && (<div className="flex items-start gap-2 rounded-xl border border-amber-200 dark:border-amber-800/70 bg-amber-50/70 dark:bg-amber-950/40 px-3.5 py-2.5 text-xs text-amber-900 dark:text-amber-200">
              <IconClock className="h-4 w-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400"/>
              <span>{t.verifyNotice}</span>
            </div>)}

          <fieldset className="space-y-3 pt-1 border-t border-slate-100 dark:border-slate-800">
            <legend className="text-xs font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400 pt-2">
              {t.step2Title}
            </legend>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button type="button" aria-pressed={signupMethod === "ai"} onClick={() => {
                setError(null);
                setSignupMethod("ai");
            }} className={`flex items-start gap-3 rounded-2xl border p-4 text-left transition ${signupMethod === "ai"
                ? "border-teal-600 bg-teal-50/70 dark:bg-teal-950/50 ring-2 ring-teal-600/40"
                : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 hover:border-slate-300 dark:hover:border-slate-700"}`}>
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-600 text-white">
                  <IconSparkles className="h-5 w-5"/>
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      {t.aiCardTitle}
                    </p>
                    <span className="rounded-full bg-emerald-100 dark:bg-emerald-950/80 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      {t.aiCardBadge}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 leading-snug">
                    {t.aiCardDesc}
                  </p>
                </div>
              </button>

              <button type="button" aria-pressed={signupMethod === "traditional"} onClick={() => {
                setError(null);
                setSignupMethod("traditional");
            }} className={`flex items-start gap-3 rounded-2xl border p-4 text-left transition ${signupMethod === "traditional"
                ? "border-teal-600 bg-teal-50/70 dark:bg-teal-950/50 ring-2 ring-teal-600/40"
                : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 hover:border-slate-300 dark:hover:border-slate-700"}`}>
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                  <IconClipboardText className="h-5 w-5"/>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    {t.tradCardTitle}
                  </p>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 leading-snug">
                    {t.tradCardDesc}
                  </p>
                </div>
              </button>
            </div>
          </fieldset>

          {signupMethod === "ai" ? (<AiSignupAssistant key={`${selectedPersona}-${aiSessionKey}`} persona={selectedPersona} initialDraft={aiInitialDraft} lang={lang} busy={busy} error={error} onDraftChange={applyDraftToForm} onSwitchToForm={(draft) => {
                    applyDraftToForm(draft);
                    setError(null);
                    setSignupMethod("traditional");
                }} onCreateAccount={handleAiCreateAccount} onClearError={() => setError(null)}/>) : (<form onSubmit={handleTraditionalSubmit} className="space-y-5">
              {error && (<div role="alert" className="flex items-center gap-2 rounded-xl border border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/60 px-3.5 py-2.5 text-xs font-semibold text-rose-800 dark:text-rose-200">
                  <IconAlertTriangle className="h-4 w-4 shrink-0"/>
                  <span>{error}</span>
                </div>)}

              {selectedPersona === "DOCTOR" && (<div>
                  <span className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    {t.doctorTypeLabel}
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <button type="button" onClick={() => setDoctorSubRole("OVABMU_MD")} className={`flex items-center gap-2 rounded-xl border px-3.5 py-2.5 text-xs font-semibold transition ${doctorSubRole === "OVABMU_MD"
                        ? "border-teal-600 bg-teal-50 dark:bg-teal-950/50 text-teal-800 dark:text-teal-300"
                        : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 text-slate-700 dark:text-slate-300"}`}>
                      <IconBuildingHospital className="h-4 w-4 text-indigo-600 dark:text-indigo-400"/>
                      {t.doctorHospital}
                    </button>
                    <button type="button" onClick={() => setDoctorSubRole("FAMILY_MD")} className={`flex items-center gap-2 rounded-xl border px-3.5 py-2.5 text-xs font-semibold transition ${doctorSubRole === "FAMILY_MD"
                        ? "border-teal-600 bg-teal-50 dark:bg-teal-950/50 text-teal-800 dark:text-teal-300"
                        : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 text-slate-700 dark:text-slate-300"}`}>
                      <IconStethoscope className="h-4 w-4 text-emerald-600 dark:text-emerald-400"/>
                      {t.doctorFamily}
                    </button>
                  </div>
                </div>)}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label htmlFor="signup-fullname" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {t.fullName}
                  </label>
                  <input id="signup-fullname" name="name" type="text" autoComplete="name" required value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder={t.fullNamePlaceholder} className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-teal-600 focus:outline-none"/>
                </div>

                <div>
                  <label htmlFor="signup-dob" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {t.dob}
                  </label>
                  <input id="signup-dob" name="bday" type="date" autoComplete="bday" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100 focus:border-teal-600 focus:outline-none"/>
                </div>

                <div>
                  <label htmlFor="signup-email" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {t.email}
                  </label>
                  <input id="signup-email" name="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t.emailPlaceholder} className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-teal-600 focus:outline-none"/>
                </div>

                <div>
                  <label htmlFor="signup-password" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {t.password}
                  </label>
                  <div className="relative">
                    <input id="signup-password" name="password" type={showPw ? "text" : "password"} autoComplete="new-password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder={t.passwordPlaceholder} className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3.5 py-2 pr-10 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-teal-600 focus:outline-none"/>
                    <button type="button" onClick={() => setShowPw((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200" aria-label={t.togglePw}>
                      {showPw ? (<IconEyeOff className="h-4 w-4"/>) : (<IconEye className="h-4 w-4"/>)}
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor="signup-phone" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {t.phone}
                  </label>
                  <input id="signup-phone" name="tel" type="tel" inputMode="tel" autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+998 90 123 45 67" className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-teal-600 focus:outline-none"/>
                </div>

                {(selectedPersona === "DOCTOR" || selectedPersona === "NURSE") && (<div>
                    <label htmlFor="signup-specialty" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      {t.specialtyLabel}
                    </label>
                    <input id="signup-specialty" name="specialty" type="text" value={specialty} onChange={(e) => setSpecialty(e.target.value)} placeholder={t.specialtyPlaceholder} className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-teal-600 focus:outline-none"/>
                  </div>)}

                <SearchableCombobox id="signup-region" name="address-level1" label={t.region} value={region} onChange={handleRegionChange} options={regionNames} placeholder={t.regionPlaceholder} autoComplete="address-level1" emptyText={t.emptySearch} customHint={t.customHint}/>

                <SearchableCombobox id="signup-district" name="address-level2" label={t.district} value={district} onChange={handleDistrictChange} options={districtNames} placeholder={t.districtPlaceholder} autoComplete="address-level2" emptyText={t.emptySearch} customHint={t.customHint} required/>

                {selectedPersona === "PATIENT" && (<>
                    <div>
                      <SearchableCombobox id="signup-mahalla" name="address-line1" label={t.mahalla} value={mahalla} onChange={setMahalla} options={mahallaSuggestions} placeholder={t.mahallaPlaceholder} autoComplete="street-address" emptyText={t.emptySearch} customHint={t.customHint} allowCustom/>
                      <p className="mt-1 text-[11px] text-slate-400 dark:text-slate-500">
                        <InfoTooltip label="MFY" explanation={t.mahallaTooltip}/>
                      </p>
                    </div>

                    <div>
                      <label htmlFor="signup-blood-type" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        {t.bloodType}
                      </label>
                      <select id="signup-blood-type" name="bloodType" value={bloodType} onChange={(e) => setBloodType(e.target.value)} className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100 focus:border-teal-600 focus:outline-none">
                        <option value="">{t.bloodPlaceholder}</option>
                        {BLOOD_TYPE_OPTIONS.map((bt) => (<option key={bt.value} value={bt.value}>
                            {lang === "ru"
                            ? bt.labelRu
                            : lang === "en"
                                ? bt.labelEn
                                : bt.labelUz}
                          </option>))}
                      </select>
                    </div>
                  </>)}
              </div>

              <button type="submit" disabled={busy} className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-50 transition">
                <IconUserPlus className="h-4 w-4"/>
                {busy ? t.submitting : t.submit}
              </button>
            </form>)}
        </>)}

      <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
        {t.already}{" "}
        <Link href="/login" className="font-semibold text-teal-700 dark:text-teal-400 hover:underline">
          {t.signInHere}
        </Link>
      </p>
    </div>);
}
function SignupFallback() {
    const { lang } = useLanguage();
    return (<div className="w-full max-w-4xl rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 text-center text-xs text-slate-500 dark:text-slate-400">
      {COPY[lang].loadingForm}
    </div>);
}
export default function SignupPage() {
    return (<div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
      <PublicHeader />
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <Suspense fallback={<SignupFallback />}>
          <SignupFormInner />
        </Suspense>
      </main>
    </div>);
}
