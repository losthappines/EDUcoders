// Subscription catalog for Bemor (Patients)

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
      "Perinatal psixolog suhbatlari (birinchi suhbat bepul, keyingilari kiritilgan)",
    ],
    featuresRu: [
      "Быстрый подбор ближайшего врача по GPS при жалобе",
      "Безлимитный прямой чат с врачом в Telegram и на сайте",
      "Выбор точки выезда и приоритетный мониторинг",
      "Сессии с перинатальным психологом (первая бесплатно, далее включено)",
    ],
    featuresEn: [
      "Priority GPS matching to nearest specialist",
      "Unlimited direct doctor advice chat (Web + Telegram)",
      "Live paramedic destination selection & priority alerts",
      "Perinatal psychologist sessions (first session free, follow-ups included)",
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

export function getPlanByCode(code) {
  return PATIENT_PLANS.find((p) => p.code === code) || null;
}

export function formatUzs(amount) {
  if (!amount) return "0 UZS";
  return `${Number(amount).toLocaleString("en-US")} UZS`;
}
