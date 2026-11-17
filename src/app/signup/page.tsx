"use client";

import React, { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  IconAlertTriangle,
  IconBuildingHospital,
  IconEye,
  IconEyeOff,
  IconShieldCheck,
  IconStethoscope,
  IconUser,
  IconUserPlus,
} from "@tabler/icons-react";
import { usePlatform } from "@/context/PlatformContext";
import { useLanguage, type AppLang } from "@/context/LanguageContext";
import { PublicHeader } from "@/components/PublicHeader";
import { SearchableCombobox } from "@/components/SearchableCombobox";
import { InfoTooltip } from "@/components/InfoTooltip";
import { BLOOD_TYPE_OPTIONS, UZ_REGIONS } from "@/lib/uz-locations";
import type { UserRole } from "@/lib/types";

const VALID_ROLES: UserRole[] = [
  "PATIENT",
  "OVABMU_MD",
  "FAMILY_MD",
  "ADMIN_RECEPTION",
];

const ROLE_OPTIONS: Array<{
  role: UserRole;
  title: Record<AppLang, string>;
  desc: Record<AppLang, string>;
  tag: Record<AppLang, string>;
  icon: React.ReactNode;
}> = [
  {
    role: "PATIENT",
    title: {
      uz: "Bemor / Ona",
      ru: "Мама / Пациент",
      en: "Mother / Patient",
    },
    desc: {
      uz: "Shaxsiy parvarish rejasi, kunlik holat tekshiruvi va tashrif kodi",
      ru: "Личный план восстановления, проверка самочувствия и код визита",
      en: "Your personal recovery plan, daily check-ins & visit confirmation",
    },
    tag: {
      uz: "Shaxsiy kabinet",
      ru: "Личный кабинет",
      en: "Personal portal",
    },
    icon: <IconUser className="h-4 w-4 text-teal-700 dark:text-teal-400" />,
  },
  {
    role: "OVABMU_MD",
    title: {
      uz: "Tug'ruqxona shifokori",
      ru: "Врач роддома",
      en: "Hospital Doctor",
    },
    desc: {
      uz: "Chiqarish xulosasini tayyorlash va poliklinikaga yuborish",
      ru: "Оформление выписки и передача пациентки в поликлинику",
      en: "Prepare hospital discharge summaries & arrange home care",
    },
    tag: {
      uz: "Shifokor kabineti",
      ru: "Кабинет врача",
      en: "Doctor workspace",
    },
    icon: <IconBuildingHospital className="h-4 w-4 text-indigo-700 dark:text-indigo-400" />,
  },
  {
    role: "FAMILY_MD",
    title: {
      uz: "Hududiy oilaviy shifokor",
      ru: "Семейный врач",
      en: "Local Family Doctor",
    },
    desc: {
      uz: "24 soatlik uy tashrifi ko'rik ro'yxati va natijalarni kiritish",
      ru: "Домашний осмотр за 24 часа и запись показателей здоровья",
      en: "24-hour home visit check-ups & health verification",
    },
    tag: {
      uz: "Shifokor kabineti",
      ru: "Кабинет врача",
      en: "Doctor workspace",
    },
    icon: <IconStethoscope className="h-4 w-4 text-emerald-700 dark:text-emerald-400" />,
  },
  {
    role: "ADMIN_RECEPTION",
    title: {
      uz: "Poliklinika koordinatori",
      ru: "Координатор клиники",
      en: "Clinic Coordinator",
    },
    desc: {
      uz: "Qabulxona, 24 soatlik tashriflar va dorixona hisobotini kuzatish",
      ru: "Контроль визитов за 24 часа, регистратура и отчетность",
      en: "Reception, 24-hour visit monitoring & clinic summaries",
    },
    tag: {
      uz: "Klinika boshqaruvi",
      ru: "Координация клиники",
      en: "Coordinator view",
    },
    icon: <IconShieldCheck className="h-4 w-4 text-slate-700 dark:text-slate-300" />,
  },
];

const COPY: Record<
  AppLang,
  {
    title: string;
    subtitle: string;
    roleLabel: string;
    fullName: string;
    fullNamePlaceholder: string;
    email: string;
    emailPlaceholder: string;
    password: string;
    passwordPlaceholder: string;
    togglePw: string;
    phone: string;
    region: string;
    regionPlaceholder: string;
    district: string;
    districtPlaceholder: string;
    mahalla: string;
    mahallaTooltip: string;
    mahallaPlaceholder: string;
    emptySearch: string;
    customHint: string;
    dob: string;
    bloodType: string;
    bloodPlaceholder: string;
    districtError: string;
    submitError: string;
    submit: string;
    submitting: string;
    already: string;
    signInHere: string;
    loadingForm: string;
  }
> = {
  uz: {
    title: "OnaCare hisobini yaratish",
    subtitle:
      "Quyida rolingizni tanlang. Hisobingiz faqat o'zingizga tegishli kabinetga kirish huquqiga ega bo'ladi.",
    roleLabel: "Sizning rolingiz",
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
  },
  ru: {
    title: "Создать аккаунт OnaCare",
    subtitle:
      "Выберите вашу роль ниже. Аккаунт откроет доступ только к вашему личному кабинету.",
    roleLabel: "Ваша роль",
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
    submit: "Создать аккаунт и войти",
    submitting: "Создание аккаунта...",
    already: "Уже есть аккаунт?",
    signInHere: "Войти здесь",
    loadingForm: "Загрузка формы регистрации...",
  },
  en: {
    title: "Create Your OnaCare Account",
    subtitle:
      "Choose your role below. Your account will only open the portal meant for your role.",
    roleLabel: "Your Role",
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
    mahallaTooltip:
      "Local neighborhood community name (MFY) used to match your clinic.",
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
  },
};

function parseInitialRole(param: string | null): UserRole {
  if (!param) return "PATIENT";
  const upper = param.trim().toUpperCase() as UserRole;
  return VALID_ROLES.includes(upper) ? upper : "PATIENT";
}

function SignupFormInner() {
  const { signup } = usePlatform();
  const { lang } = useLanguage();
  const searchParams = useSearchParams();
  const t = COPY[lang];

  const queryRole = searchParams.get("role");
  const initialRole = parseInitialRole(queryRole);

  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const role = selectedRole ?? initialRole;

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
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const regionNames = useMemo(() => UZ_REGIONS.map((r) => r.name), []);

  const selectedRegionObj = useMemo(
    () => UZ_REGIONS.find((r) => r.name === region) ?? null,
    [region]
  );

  const districtNames = useMemo(() => {
    if (selectedRegionObj) {
      return selectedRegionObj.districts.map((d) => d.name);
    }
    return UZ_REGIONS.flatMap((r) => r.districts.map((d) => d.name));
  }, [selectedRegionObj]);

  const mahallaSuggestions = useMemo(() => {
    if (!district) return [];
    for (const r of UZ_REGIONS) {
      if (region && r.name !== region) continue;
      const found = r.districts.find((d) => d.name === district);
      if (found) return found.mahallas;
    }
    return [];
  }, [region, district]);

  const handleRegionChange = (nextRegion: string) => {
    setRegion(nextRegion);
    setDistrict("");
    setMahalla("");
  };

  const handleDistrictChange = (nextDistrict: string) => {
    setDistrict(nextDistrict);
    setMahalla("");
    if (nextDistrict && !region) {
      const parentRegion = UZ_REGIONS.find((r) =>
        r.districts.some((d) => d.name === nextDistrict)
      );
      if (parentRegion) {
        setRegion(parentRegion.name);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!district.trim()) {
      setError(t.districtError);
      return;
    }

    setBusy(true);
    try {
      const res = await signup({
        fullName,
        email,
        password,
        role,
        phone: phone.trim(),
        region: region.trim(),
        district: district.trim(),
        mahalla: role === "PATIENT" ? mahalla.trim() : undefined,
        dateOfBirth: role === "PATIENT" ? dateOfBirth : undefined,
        bloodType: role === "PATIENT" ? bloodType : undefined,
      });
      if (!res.ok) {
        setError(res.error || t.submitError);
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="w-full max-w-2xl rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">
          {t.title}
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          {t.subtitle}
        </p>
      </div>

      {error && (
        <div
          role="alert"
          className="flex items-center gap-2 rounded-xl border border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/60 px-3.5 py-2.5 text-xs font-semibold text-rose-800 dark:text-rose-200"
        >
          <IconAlertTriangle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <fieldset>
          <legend className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
            {t.roleLabel}
          </legend>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {ROLE_OPTIONS.map((opt) => {
              const active = role === opt.role;
              return (
                <button
                  key={opt.role}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setSelectedRole(opt.role)}
                  className={`flex items-start gap-2.5 rounded-xl border p-3 text-left transition ${
                    active
                      ? "border-teal-600 bg-teal-50/70 dark:bg-teal-950/50 ring-1 ring-teal-600"
                      : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 hover:border-slate-300 dark:hover:border-slate-700"
                  }`}
                >
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                    {opt.icon}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      {opt.title[lang]}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug mt-0.5">
                      {opt.desc[lang]}
                    </p>
                    <span className="mt-1 inline-block rounded bg-white dark:bg-slate-900 px-1.5 py-0.5 text-[10px] font-semibold text-teal-700 dark:text-teal-400 border border-slate-200 dark:border-slate-700">
                      {opt.tag[lang]}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </fieldset>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label
              htmlFor="signup-fullname"
              className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
            >
              {t.fullName}
            </label>
            <input
              id="signup-fullname"
              name="name"
              type="text"
              autoComplete="name"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder={t.fullNamePlaceholder}
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-teal-600 focus:outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="signup-email"
              className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
            >
              {t.email}
            </label>
            <input
              id="signup-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t.emailPlaceholder}
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-teal-600 focus:outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="signup-password"
              className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
            >
              {t.password}
            </label>
            <div className="relative">
              <input
                id="signup-password"
                name="password"
                type={showPw ? "text" : "password"}
                autoComplete="new-password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t.passwordPlaceholder}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3.5 py-2 pr-10 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-teal-600 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                aria-label={t.togglePw}
              >
                {showPw ? (
                  <IconEyeOff className="h-4 w-4" />
                ) : (
                  <IconEye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <div>
            <label
              htmlFor="signup-phone"
              className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
            >
              {t.phone}
            </label>
            <input
              id="signup-phone"
              name="tel"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+998 90 123 45 67"
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-teal-600 focus:outline-none"
            />
          </div>

          <SearchableCombobox
            id="signup-region"
            name="address-level1"
            label={t.region}
            value={region}
            onChange={handleRegionChange}
            options={regionNames}
            placeholder={t.regionPlaceholder}
            autoComplete="address-level1"
            emptyText={t.emptySearch}
            customHint={t.customHint}
          />

          <SearchableCombobox
            id="signup-district"
            name="address-level2"
            label={t.district}
            value={district}
            onChange={handleDistrictChange}
            options={districtNames}
            placeholder={t.districtPlaceholder}
            autoComplete="address-level2"
            emptyText={t.emptySearch}
            customHint={t.customHint}
            required
          />

          {role === "PATIENT" && (
            <>
              <div>
                <SearchableCombobox
                  id="signup-mahalla"
                  name="address-line1"
                  label={t.mahalla}
                  value={mahalla}
                  onChange={setMahalla}
                  options={mahallaSuggestions}
                  placeholder={t.mahallaPlaceholder}
                  autoComplete="street-address"
                  emptyText={t.emptySearch}
                  customHint={t.customHint}
                  allowCustom
                />
                <p className="mt-1 text-[11px] text-slate-400 dark:text-slate-500">
                  <InfoTooltip label="MFY" explanation={t.mahallaTooltip} />
                </p>
              </div>

              <div>
                <label
                  htmlFor="signup-dob"
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
                >
                  {t.dob}
                </label>
                <input
                  id="signup-dob"
                  name="bday"
                  type="date"
                  autoComplete="bday"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100 focus:border-teal-600 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="signup-blood-type"
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
                >
                  {t.bloodType}
                </label>
                <select
                  id="signup-blood-type"
                  name="bloodType"
                  value={bloodType}
                  onChange={(e) => setBloodType(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100 focus:border-teal-600 focus:outline-none"
                >
                  <option value="">{t.bloodPlaceholder}</option>
                  {BLOOD_TYPE_OPTIONS.map((bt) => (
                    <option key={bt.value} value={bt.value}>
                      {lang === "ru"
                        ? bt.labelRu
                        : lang === "en"
                          ? bt.labelEn
                          : bt.labelUz}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}
        </div>

        <button
          type="submit"
          disabled={busy}
          className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-50 transition"
        >
          <IconUserPlus className="h-4 w-4" />
          {busy ? t.submitting : t.submit}
        </button>
      </form>

      <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
        {t.already}{" "}
        <Link href="/login" className="font-semibold text-teal-700 dark:text-teal-400 hover:underline">
          {t.signInHere}
        </Link>
      </p>
    </div>
  );
}

function SignupFallback() {
  const { lang } = useLanguage();
  return (
    <div className="w-full max-w-2xl rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 text-center text-xs text-slate-500 dark:text-slate-400">
      {COPY[lang].loadingForm}
    </div>
  );
}

export default function SignupPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
      <PublicHeader />
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <Suspense fallback={<SignupFallback />}>
          <SignupFormInner />
        </Suspense>
      </main>
    </div>
  );
}
