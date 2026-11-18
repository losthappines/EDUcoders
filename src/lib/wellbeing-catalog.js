export const MOOD_SCALE = [
  { value: 1, emoji: "😢", uz: "Juda yomon", ru: "Очень плохо", en: "Very low" },
  { value: 2, emoji: "😕", uz: "Yomon", ru: "Плохо", en: "Low" },
  { value: 3, emoji: "😐", uz: "O'rtacha", ru: "Нормально", en: "Okay" },
  { value: 4, emoji: "🙂", uz: "Yaxshi", ru: "Хорошо", en: "Good" },
  { value: 5, emoji: "😊", uz: "A'lo", ru: "Отлично", en: "Great" },
];

export const EPDS_QUESTIONS = [
  {
    index: 0,
    uz: "1. Men kulib, voqealarning quvnoq tomonini ko'ra oldim:",
    ru: "1. Я могла смеяться и видеть смешную сторону вещей:",
    en: "1. I have been able to laugh and see the funny side of things:",
    options: [
      { score: 0, uz: "Har doimgidek ko'p", ru: "Столько же, сколько и раньше", en: "As much as I always could" },
      { score: 1, uz: "Hozir biroz kamroq", ru: "Сейчас немного меньше", en: "Not quite so much now" },
      { score: 2, uz: "Ancha kamroq", ru: "Определённо меньше", en: "Definitely not so much now" },
      { score: 3, uz: "Umuman yo'q", ru: "Совсем нет", en: "Not at all" },
    ],
  },
  {
    index: 1,
    uz: "2. Men kelajakdagi ishlarni quvonch bilan kutdim:",
    ru: "2. Я с удовольствием предвкушала предстоящие дела:",
    en: "2. I have looked forward with enjoyment to things:",
    options: [
      { score: 0, uz: "Har doimgidek", ru: "Столько же, сколько всегда", en: "As much as I ever did" },
      { score: 1, uz: "Odatdagidan bir oz kamroq", ru: "Чуть меньше обычного", en: "Rather less than I used to" },
      { score: 2, uz: "Odatdagidan ancha kamroq", ru: "Значительно меньше обычного", en: "Definitely less than I used to" },
      { score: 3, uz: "Deyarli umuman yo'q", ru: "Почти совсем нет", en: "Hardly at all" },
    ],
  },
  {
    index: 2,
    uz: "3. Ishlar noto'g'ri ketganda o'zimni keraksiz aybladim:",
    ru: "3. Я без причины винила себя, когда что-то шло не так:",
    en: "3. I have blamed myself unnecessarily when things went wrong:",
    options: [
      { score: 3, uz: "Ha, ko'p hollarda", ru: "Да, почти всегда", en: "Yes, most of the time" },
      { score: 2, uz: "Ha, ba'zan", ru: "Да, иногда", en: "Yes, some of the time" },
      { score: 1, uz: "Juda kam", ru: "Не очень часто", en: "Not very often" },
      { score: 0, uz: "Yo'q, hech qachon", ru: "Нет, никогда", en: "No, never" },
    ],
  },
  {
    index: 3,
    uz: "4. Sababsiz xavotir va tashvish his qildim:",
    ru: "4. Я испытывала тревогу или волнение без видимой причины:",
    en: "4. I have been anxious or worried for no good reason:",
    options: [
      { score: 0, uz: "Yo'q, umuman yo'q", ru: "Нет, совсем нет", en: "No, not at all" },
      { score: 1, uz: "Deyarli hech qachon", ru: "Почти никогда", en: "Hardly ever" },
      { score: 2, uz: "Ha, ba'zida", ru: "Да, иногда", en: "Yes, sometimes" },
      { score: 3, uz: "Ha, tez-tez", ru: "Да, очень часто", en: "Yes, very often" },
    ],
  },
  {
    index: 4,
    uz: "5. Sababsiz qo'rquv yoki vahimaga tushdim:",
    ru: "5. Я чувствовала страх или панику без веской причины:",
    en: "5. I have felt scared or panicky for no very good reason:",
    options: [
      { score: 3, uz: "Ha, ancha tez-tez", ru: "Да, довольно часто", en: "Yes, quite a lot" },
      { score: 2, uz: "Ha, ba'zida", ru: "Да, иногда", en: "Yes, sometimes" },
      { score: 1, uz: "Yo'q, deyarli emas", ru: "Нет, почти нет", en: "No, not much" },
      { score: 0, uz: "Yo'q, umuman yo'q", ru: "Нет, совсем нет", en: "No, not at all" },
    ],
  },
  {
    index: 5,
    uz: "6. Vazifalar ustimdan bosib ketayotgandek tuyuldi:",
    ru: "6. Дела наваливались на меня так, что я не справлялась:",
    en: "6. Things have been getting on top of me:",
    options: [
      { score: 3, uz: "Ha, ko'pincha uddalay olmadim", ru: "Да, часто я совсем не справлялась", en: "Yes, most of the time I couldn't cope" },
      { score: 2, uz: "Ha, ba'zan avvalgidek uddalay olmadim", ru: "Да, иногда справлялась хуже обычного", en: "Yes, sometimes not as well as usual" },
      { score: 1, uz: "Yo'q, ko'pincha yaxshi uddaladim", ru: "Нет, в основном справлялась хорошо", en: "No, mostly I coped quite well" },
      { score: 0, uz: "Yo'q, har doimgidek uddalayapman", ru: "Нет, справляюсь как обычно", en: "No, I have been coping as well as ever" },
    ],
  },
  {
    index: 6,
    uz: "7. Shunchalik baxtsiz his qildimki, uxlashga qiynaldim:",
    ru: "7. Мне было так тяжело на душе, что я плохо спала:",
    en: "7. I have been so unhappy that I have had difficulty sleeping:",
    options: [
      { score: 3, uz: "Ha, ko'pincha", ru: "Да, почти всегда", en: "Yes, most of the time" },
      { score: 2, uz: "Ha, ba'zan", ru: "Да, иногда", en: "Yes, sometimes" },
      { score: 1, uz: "Kamdan-kam", ru: "Не очень часто", en: "Not very often" },
      { score: 0, uz: "Yo'q, umuman yo'q", ru: "Нет, совсем нет", en: "No, not at all" },
    ],
  },
  {
    index: 7,
    uz: "8. O'zimni g'amgin yoki tushkun his qildim:",
    ru: "8. Я чувствовала себя грустной или подавленной:",
    en: "8. I have felt sad or miserable:",
    options: [
      { score: 3, uz: "Ha, ko'p hollarda", ru: "Да, большую часть времени", en: "Yes, most of the time" },
      { score: 2, uz: "Ha, tez-tez", ru: "Да, довольно часто", en: "Yes, quite often" },
      { score: 1, uz: "Kamdan-kam", ru: "Не очень часто", en: "Not very often" },
      { score: 0, uz: "Yo'q, umuman yo'q", ru: "Нет, совсем нет", en: "No, not at all" },
    ],
  },
  {
    index: 8,
    uz: "9. Shunchalik tushkun bo'ldimki, yig'lab yubordim:",
    ru: "9. Мне было так плохо, что я плакала:",
    en: "9. I have been so unhappy that I have been crying:",
    options: [
      { score: 3, uz: "Ha, ko'pincha", ru: "Да, почти всегда", en: "Yes, most of the time" },
      { score: 2, uz: "Ha, tez-tez", ru: "Да, довольно часто", en: "Yes, quite often" },
      { score: 1, uz: "Faqat vaqti-vaqti bilan", ru: "Лишь изредка", en: "Only occasionally" },
      { score: 0, uz: "Yo'q, hech qachon", ru: "Нет, никогда", en: "No, never" },
    ],
  },
  {
    index: 9,
    uz: "10. O'zimga zarar yetkazish haqidagi fikr xayolimga keldi:",
    ru: "10. Меня посещали мысли о причинении себе вреда:",
    en: "10. The thought of harming myself has occurred to me:",
    options: [
      { score: 3, uz: "Ha, tez-tez", ru: "Да, довольно часто", en: "Yes, quite often" },
      { score: 2, uz: "Ba'zan", ru: "Иногда", en: "Sometimes" },
      { score: 1, uz: "Deyarli hech qachon", ru: "Почти никогда", en: "Hardly ever" },
      { score: 0, uz: "Hech qachon", ru: "Никогда", en: "Never" },
    ],
  },
];

export function computeEpdsScore(epdsAnswers) {
  if (!Array.isArray(epdsAnswers) || epdsAnswers.length !== 10) return null;
  const normalized = epdsAnswers.map((v) => Math.max(0, Math.min(3, Number(v) || 0)));
  const totalScore = normalized.reduce((sum, val) => sum + val, 0);
  const selfHarmScore = normalized[9] || 0;
  return {
    totalScore,
    selfHarmScore,
    selfHarmFlag: selfHarmScore > 0,
    answers: normalized,
  };
}

export function inferReminderTimesFromFrequency(frequency = "") {
  const f = String(frequency || "").toLowerCase();
  if (f.includes("4") || f.includes("q6h")) return ["07:00", "12:00", "17:00", "22:00"];
  if (f.includes("3") || f.includes("tid") || f.includes("uch")) return ["08:00", "14:00", "20:00"];
  if (f.includes("2") || f.includes("bid") || f.includes("ikki")) return ["08:00", "20:00"];
  if (f.includes("kech") || f.includes("night") || f.includes("uyqu")) return ["21:00"];
  return ["09:00"];
}

export function validateReminderTimes(times) {
  if (!Array.isArray(times)) return [];
  const valid = new Set();
  for (const item of times) {
    const match = String(item || "").trim().match(/^(\d{1,2}):(\d{2})$/);
    if (!match) continue;
    const h = Number(match[1]);
    const m = Number(match[2]);
    if (h >= 0 && h <= 23 && m >= 0 && m <= 59) {
      valid.add(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    }
  }
  return Array.from(valid).sort();
}

export function parseReminderTimesJson(jsonStr, fallbackFrequency = "") {
  try {
    const parsed = JSON.parse(jsonStr || "[]");
    const validated = validateReminderTimes(parsed);
    if (validated.length > 0) return validated;
  } catch {
    // ignore malformed json
  }
  return fallbackFrequency ? inferReminderTimesFromFrequency(fallbackFrequency) : [];
}
