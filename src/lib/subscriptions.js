// Subscription catalog for Bemor (Patients) and Shifokor (Doctors)

export const PATIENT_PLANS = [
  {
    code: "FREE",
    targetRole: "PATIENT",
    priceUzs: 0,
    badgeUz: "Davlat kafolati",
    badgeRu: "Госгарантия",
    badgeEn: "State Basic",
    nameUz: "Bepul Asosiy Reja",
    nameRu: "Бесплатный Базовый",
    nameEn: "Free Basic Care",
    featuresUz: [
      "24 soatlik tug'ruqdan keyingi majburiy ko'rik",
      "Kunlik holat tekshiruvi va shifoxona tahlillari",
      "Standart shikoyat yuborish",
    ],
    featuresRu: [
      "Обязательный визит врача за 24 часа",
      "Ежедневная проверка и анализы из роддома",
      "Стандартная отправка жалоб",
    ],
    featuresEn: [
      "Mandatory 24h postpartum home visit",
      "Daily check-in & hospital lab tracking",
      "Standard complaint submission",
    ],
  },
  {
    code: "CARE_PLUS",
    targetRole: "PATIENT",
    priceUzs: 49000,
    recommended: true,
    badgeUz: "Ommabop",
    badgeRu: "Популярный",
    badgeEn: "Popular",
    nameUz: "OnaCare Plus (49,000 so'm / oy)",
    nameRu: "OnaCare Plus (49 000 сум / мес)",
    nameEn: "OnaCare Plus (49,000 UZS / mo)",
    featuresUz: [
      "Shikoyat bo'yicha eng yaqin shifokorni tezkor GPS biriktirish",
      "Shifokor bilan cheksiz Telegram & Portal maslahat chati",
      "Tez tibbiy yordam manzilini jonli tanlash va ustuvor nazorat",
    ],
    featuresRu: [
      "Быстрый подбор ближайшего врача по GPS при жалобе",
      "Безлимитный прямой чат с врачом в Telegram и на сайте",
      "Выбор точки выезда и приоритетный мониторинг",
    ],
    featuresEn: [
      "Priority GPS matching to nearest specialist",
      "Unlimited direct doctor advice chat (Web + Telegram)",
      "Live paramedic destination selection & priority alerts",
    ],
  },
  {
    code: "CARE_FAMILY",
    targetRole: "PATIENT",
    priceUzs: 99000,
    badgeUz: "Oila VIP",
    badgeRu: "Семейный VIP",
    badgeEn: "Family VIP",
    nameUz: "OnaCare Oila 24/7 (99,000 so'm / oy)",
    nameRu: "OnaCare Семья 24/7 (99 000 сум / мес)",
    nameEn: "OnaCare Family 24/7 (99,000 UZS / mo)",
    featuresUz: [
      "Ona va chaqaloq uchun 24/7 shoshilinch shifokor maslahati",
      "Uyda kengaytirilgan laboratoriya va pediatr ko'rigi",
      "Oilaning barcha a'zolari uchun ustuvor chaqiruv",
    ],
    featuresRu: [
      "Круглосуточная связь с врачом для мамы и малыша",
      "Расширенные домашние анализы и педиатрический контроль",
      "Приоритетные вызовы для всей семьи",
    ],
    featuresEn: [
      "24/7 urgent doctor advice for mother & newborn",
      "Extended home lab & pediatric monitoring visits",
      "Priority dispatch for entire household",
    ],
  },
];

export const DOCTOR_PLANS = [
  {
    code: "FREE",
    targetRole: "DOCTOR",
    priceUzs: 0,
    badgeUz: "Asosiy",
    badgeRu: "Базовый",
    badgeEn: "Basic",
    nameUz: "Standart Shifokor",
    nameRu: "Стандарт Врач",
    nameEn: "Standard Doctor",
    featuresUz: [
      "Biriktirilgan poliklinika bemorlari ro'yxati",
      "24 soatlik tashrifni tasdiqlash va EHR",
    ],
    featuresRu: [
      "Список пациенток прикрепленной поликлиники",
      "Подтверждение 24ч визитов и медкарта",
    ],
    featuresEn: [
      "Assigned clinic patient roster",
      "24h visit verification & EHR access",
    ],
  },
  {
    code: "DOCTOR_PRO",
    targetRole: "DOCTOR",
    priceUzs: 149000,
    recommended: true,
    badgeUz: "Shifokor PRO",
    badgeRu: "Врач PRO",
    badgeEn: "Doctor PRO",
    nameUz: "Shifokor GPS Radar PRO (149,000 so'm / oy)",
    nameRu: "Врач GPS Радар PRO (149 000 сум / мес)",
    nameEn: "Doctor GPS Radar PRO (149,000 UZS / mo)",
    featuresUz: [
      "GPS bo'yicha eng yaqin bemor shikoyatlarini real vaqtda ko'rish",
      "Telegram bot orqali avtomatik tashrif eslatmalari",
      "Mutaxassislik va tajriba nishoni + to'g'ridan-to'g'ri maslahat chati",
    ],
    featuresRu: [
      "Радар ближайших пациентов по GPS в реальном времени",
      "Автоматические напоминания о визитах в Telegram-боте",
      "Бейдж опыта и экспертизы + прямой чат с пациентами",
    ],
    featuresEn: [
      "Real-time nearest-patient GPS complaint radar",
      "Automated Telegram bot visit reminders",
      "Verified expertise/experience badge & direct patient chat",
    ],
  },
  {
    code: "DOCTOR_CLINIC",
    targetRole: "DOCTOR",
    priceUzs: 349000,
    badgeUz: "Klinika Plus",
    badgeRu: "Клиника Плюс",
    badgeEn: "Clinic Plus",
    nameUz: "Klinika & Guruh (349,000 so'm / oy)",
    nameRu: "Клиника и Команда (349 000 сум / мес)",
    nameEn: "Clinic & Multi-District (349,000 UZS / mo)",
    featuresUz: [
      "Bir nechta tumanlarda eng yaqin bemorlarni qabul qilish",
      "Ustuvor tasdiqlangan shifokor reytingi",
      "Telegram & FHIR to'liq integratsiya va tahlil paneli",
    ],
    featuresRu: [
      "Прием вызовов сразу в нескольких районах",
      "Приоритетное отображение в поиске пациентов",
      "Полная интеграция Telegram, FHIR и аналитика",
    ],
    featuresEn: [
      "Multi-district nearby complaint dispatch",
      "Top priority ranking in specialist matching",
      "Full Telegram reminders, FHIR & clinic analytics",
    ],
  },
];

export function getPlanByCode(code) {
  return [...PATIENT_PLANS, ...DOCTOR_PLANS].find((p) => p.code === code) || null;
}

export function formatUzs(amount) {
  if (!amount) return "0 UZS";
  return `${Number(amount).toLocaleString("en-US")} UZS`;
}
