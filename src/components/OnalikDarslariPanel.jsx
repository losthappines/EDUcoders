"use client";
import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import {
  IconBookmark,
  IconBookmarkFilled,
  IconBrandYoutube,
  IconCheck,
  IconCircleCheck,
  IconExternalLink,
  IconPlayerPlay,
  IconSearch,
  IconX,
} from "@tabler/icons-react";
import { useLanguage } from "@/context/LanguageContext";
import {
  BABY_CARE_LESSON_CATEGORIES,
  BABY_CARE_LESSONS,
  getYoutubeEmbedUrl,
  getYoutubeThumbnailUrl,
} from "@/lib/baby-care-lessons";

const LESSONS_COPY = {
  uz: {
    title: "Onalik darslari — Chaqaloq parvarishi video kutubxonasi",
    subtitle:
      "YouTube'dagi ishonchli o'zbekcha va xalqaro shifoxona (NHS, Johns Hopkins, AAP, Rotunda) qo'llanmalari: emizish, cho'miltirish, kekirtirish va xavfsiz uyqu.",
    searchPlaceholder: "Darslarni qidirish (masalan: emizish, cho'miltirish, uyqu)...",
    savedFilter: "Saqlanganlar",
    progressLabel: "Ko'rilgan darslar:",
    watchBtn: "Darsni ko'rish",
    watchingNow: "Hozir tomosha qilinmoqda",
    openYoutube: "YouTube'da ochish",
    markWatched: "Ko'rildi deb belgilash",
    watchedBadge: "Ko'rilgan ✓",
    saveLesson: "Saqlash",
    savedLesson: "Saqlangan",
    takeawaysTitle: "Asosiy amaliy eslatmalar",
    closePlayer: "Videoni yopish",
    emptySearch: "Qidiruv bo'yicha video darslar topilmadi.",
    safetyNote:
      "Eslatma: Video darslar umumiy parvarish bo'yicha qo'llanmadir. Chaqalog'ingizda isitma, holsizlik yoki sariqlik kuchaysa shifokoringizga yozing yoki 103 ga murojaat qiling.",
  },
  ru: {
    title: "Школа материнства (Onalik darslari) — Видеоуроки по уходу за малышом",
    subtitle:
      "Проверенные видео на YouTube от клиник (NHS, Johns Hopkins, AAP, Rotunda) и узбекских специалистов: ГВ, купание, отрыжка и безопасный сон.",
    searchPlaceholder: "Поиск уроков (например: купание, кормление, сон)...",
    savedFilter: "Избранное",
    progressLabel: "Просмотрено уроков:",
    watchBtn: "Смотреть урок",
    watchingNow: "Сейчас воспроизводится",
    openYoutube: "Открыть в YouTube",
    markWatched: "Отметить просмотренным",
    watchedBadge: "Просмотрено ✓",
    saveLesson: "Сохранить",
    savedLesson: "Сохранено",
    takeawaysTitle: "Ключевые советы из урока",
    closePlayer: "Закрыть плеер",
    emptySearch: "По вашему запросу видео не найдены.",
    safetyNote:
      "Важно: видеоуроки носят обучающий характер. При температуре, вялости или усилении желтухи у малыша напишите врачу или звоните 103.",
  },
  en: {
    title: "Onalik Darslari — Curated Newborn Care Video Lessons",
    subtitle:
      "Trusted baby-care guides from YouTube (Uzbek pediatric channels, NHS, Johns Hopkins, AAP, and maternity hospitals): latching, burping, bathing & safe sleep.",
    searchPlaceholder: "Search lessons (e.g. latch, sponge bath, burp, swaddle)...",
    savedFilter: "Saved",
    progressLabel: "Lessons completed:",
    watchBtn: "Watch Lesson",
    watchingNow: "Now Playing",
    openYoutube: "Open on YouTube",
    markWatched: "Mark Completed",
    watchedBadge: "Completed ✓",
    saveLesson: "Save",
    savedLesson: "Saved",
    takeawaysTitle: "Key Clinical Takeaways",
    closePlayer: "Close Player",
    emptySearch: "No lessons match your search.",
    safetyNote:
      "Note: These curated videos support daily newborn care. Contact your doctor or call 103 immediately for newborn fever, poor feeding, or worsening jaundice.",
  },
};

function getLessonText(lesson, lang) {
  return {
    title: lang === "ru" ? lesson.titleRu : lang === "en" ? lesson.titleEn : lesson.titleUz,
    summary: lang === "ru" ? lesson.summaryRu : lang === "en" ? lesson.summaryEn : lesson.summaryUz,
  };
}

export function OnalikDarslariPanel({ userId = "guest" }) {
  const { lang } = useLanguage();
  const t = LESSONS_COPY[lang] || LESSONS_COPY.uz;
  const storageKey = `onacare_lessons_${userId}`;

  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedLessonId, setSelectedLessonId] = useState(BABY_CARE_LESSONS[0]?.id || "");
  const [playerOpen, setPlayerOpen] = useState(false);
  const [watchedIds, setWatchedIds] = useState([]);
  const [savedIds, setSavedIds] = useState([]);

  useEffect(() => {
    const rafId = requestAnimationFrame(() => {
      try {
        const raw = localStorage.getItem(storageKey);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed.watchedIds)) setWatchedIds(parsed.watchedIds);
          if (Array.isArray(parsed.savedIds)) setSavedIds(parsed.savedIds);
        }
      } catch {
        // ignore storage errors
      }
    });
    return () => cancelAnimationFrame(rafId);
  }, [storageKey]);

  const persistProgress = (nextWatched, nextSaved) => {
    try {
      localStorage.setItem(
        storageKey,
        JSON.stringify({ watchedIds: nextWatched, savedIds: nextSaved })
      );
    } catch {
      // ignore storage errors
    }
  };

  const toggleWatched = (id) => {
    setWatchedIds((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      persistProgress(next, savedIds);
      return next;
    });
  };

  const toggleSaved = (id) => {
    setSavedIds((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      persistProgress(watchedIds, next);
      return next;
    });
  };

  const handleWatchLesson = (lesson) => {
    setSelectedLessonId(lesson.id);
    setPlayerOpen(true);
    if (!watchedIds.includes(lesson.id)) {
      const next = [...watchedIds, lesson.id];
      setWatchedIds(next);
      persistProgress(next, savedIds);
    }
  };

  const filteredLessons = useMemo(() => {
    const q = search.trim().toLowerCase();
    return BABY_CARE_LESSONS.filter((lesson) => {
      if (category === "saved" && !savedIds.includes(lesson.id)) return false;
      if (category !== "all" && category !== "saved" && lesson.category !== category) return false;
      if (!q) return true;
      const haystack = `${lesson.titleUz} ${lesson.titleRu} ${lesson.titleEn} ${lesson.summaryUz} ${lesson.channel}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [category, savedIds, search]);

  const activeLesson =
    BABY_CARE_LESSONS.find((l) => l.id === selectedLessonId) || BABY_CARE_LESSONS[0];
  const activeCopy = activeLesson ? getLessonText(activeLesson, lang) : null;
  const watchedPct = Math.round((watchedIds.length / BABY_CARE_LESSONS.length) * 100);

  return (
    <section className="space-y-5 oc-fade-up">
      {/* Header + Progress + Filter */}
      <div className="med-card p-5 sm:p-6 space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1 max-w-2xl">
            <h2 className="font-heading text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
              <IconBrandYoutube className="h-6 w-6 text-rose-600 dark:text-rose-400 shrink-0" />
              <span>{t.title}</span>
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
              {t.subtitle}
            </p>
          </div>
          <div className="rounded-xl border border-[#D7E4E1] dark:border-[#1E353A] bg-[#F4F8F7] dark:bg-[#091315] px-4 py-2.5 text-sm min-w-[190px]">
            <div className="flex items-center justify-between gap-3 font-semibold text-slate-800 dark:text-slate-100">
              <span>{t.progressLabel}</span>
              <span className="font-mono text-teal-700 dark:text-teal-300">
                {watchedIds.length}/{BABY_CARE_LESSONS.length}
              </span>
            </div>
            <div className="mt-2 h-2 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-teal-600 transition-all duration-300"
                style={{ width: `${watchedPct}%` }}
              />
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <IconSearch className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="min-h-[46px] w-full rounded-xl border border-[#D7E4E1] dark:border-[#1E353A] bg-[#F4F8F7] dark:bg-[#091315] pl-10 pr-4 py-2 text-base sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-teal-600 focus:outline-none"
          />
        </div>

        {/* Categories */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {BABY_CARE_LESSON_CATEGORIES.map((cat) => {
            const active = category === cat.key;
            const label = lang === "ru" ? cat.ru : lang === "en" ? cat.en : cat.uz;
            return (
              <button
                key={cat.key}
                type="button"
                onClick={() => setCategory(cat.key)}
                className={`inline-flex min-h-[42px] shrink-0 items-center rounded-xl border px-3.5 py-2 text-sm font-semibold transition-all active:scale-[0.98] ${
                  active
                    ? "border-teal-700 bg-teal-700 dark:bg-teal-600 text-white shadow-xs"
                    : "border-[#D7E4E1] dark:border-[#1E353A] bg-[#F4F8F7] dark:bg-[#091315] text-slate-700 dark:text-slate-200 hover:border-teal-600/60"
                }`}
              >
                {label}
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => setCategory("saved")}
            className={`inline-flex min-h-[42px] shrink-0 items-center gap-1.5 rounded-xl border px-3.5 py-2 text-sm font-semibold transition-all active:scale-[0.98] ${
              category === "saved"
                ? "border-teal-700 bg-teal-700 dark:bg-teal-600 text-white shadow-xs"
                : "border-[#D7E4E1] dark:border-[#1E353A] bg-[#F4F8F7] dark:bg-[#091315] text-slate-700 dark:text-slate-200 hover:border-teal-600/60"
            }`}
          >
            <IconBookmark className="h-4 w-4" />
            <span>
              {t.savedFilter} ({savedIds.length})
            </span>
          </button>
        </div>

        <p className="rounded-xl border border-teal-200/80 dark:border-teal-900 bg-[#EDF5F3] dark:bg-[#16272B] px-3.5 py-2.5 text-xs sm:text-sm text-teal-900 dark:text-teal-200">
          {t.safetyNote}
        </p>
      </div>

      {/* Featured Embedded Player */}
      {playerOpen && activeLesson && activeCopy && (
        <div className="med-card border-teal-300 dark:border-teal-700 overflow-hidden oc-slide-down">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#D7E4E1] dark:border-[#1E353A] bg-[#EDF5F3] dark:bg-[#16272B] px-4 sm:px-5 py-3">
            <div className="flex items-center gap-2 min-w-0">
              <span className="rounded-full bg-rose-600 px-2.5 py-0.5 text-xs font-bold text-white shrink-0">
                {t.watchingNow}
              </span>
              <span className="text-sm font-bold text-slate-900 dark:text-white truncate">
                {activeCopy.title}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setPlayerOpen(false)}
              className="inline-flex min-h-[38px] items-center gap-1 rounded-xl border border-[#D7E4E1] dark:border-[#1E353A] bg-white dark:bg-[#101E21] px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50"
            >
              <IconX className="h-4 w-4" />
              <span>{t.closePlayer}</span>
            </button>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-12">
            <div className="lg:col-span-7 bg-black aspect-video">
              <iframe
                src={getYoutubeEmbedUrl(activeLesson.videoId)}
                title={activeCopy.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full border-0"
              />
            </div>
            <div className="lg:col-span-5 p-4 sm:p-5 space-y-3 bg-white dark:bg-[#101E21] flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="rounded-full bg-[#EDF5F3] dark:bg-[#16272B] px-2.5 py-0.5 font-bold text-teal-800 dark:text-teal-200">
                    {activeLesson.langBadge}
                  </span>
                  <span className="font-semibold text-slate-600 dark:text-slate-300">
                    {activeLesson.channel}
                  </span>
                </div>
                <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
                  {activeCopy.summary}
                </p>
                {activeLesson.tipsUz && activeLesson.tipsUz.length > 0 && (
                  <div className="rounded-xl border border-[#D7E4E1] dark:border-[#1E353A] bg-[#F4F8F7] dark:bg-[#091315] p-3.5 space-y-2">
                    <p className="text-xs font-bold uppercase tracking-wider text-teal-800 dark:text-teal-300">
                      {t.takeawaysTitle}
                    </p>
                    <ul className="space-y-1.5 text-xs sm:text-sm text-slate-700 dark:text-slate-200">
                      {activeLesson.tipsUz.map((tip, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <IconCheck className="h-4 w-4 text-teal-700 dark:text-teal-300 shrink-0 mt-0.5" />
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                <a
                  href={activeLesson.youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-[42px] items-center gap-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 px-4 py-2 text-xs sm:text-sm font-bold text-white transition-colors"
                >
                  <IconBrandYoutube className="h-4 w-4" />
                  <span>{t.openYoutube}</span>
                  <IconExternalLink className="h-3.5 w-3.5" />
                </a>
                <button
                  type="button"
                  onClick={() => toggleSaved(activeLesson.id)}
                  className="inline-flex min-h-[42px] items-center gap-1.5 rounded-xl border border-[#D7E4E1] dark:border-[#1E353A] bg-[#F4F8F7] dark:bg-[#091315] px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100"
                >
                  {savedIds.includes(activeLesson.id) ? (
                    <IconBookmarkFilled className="h-4 w-4 text-teal-700 dark:text-teal-300" />
                  ) : (
                    <IconBookmark className="h-4 w-4" />
                  )}
                  <span>{savedIds.includes(activeLesson.id) ? t.savedLesson : t.saveLesson}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Video Cards Grid */}
      {filteredLessons.length === 0 ? (
        <div className="med-card p-8 text-center text-sm text-slate-600 dark:text-slate-300">
          {t.emptySearch}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredLessons.map((lesson) => {
            const copy = getLessonText(lesson, lang);
            const isWatched = watchedIds.includes(lesson.id);
            const isSaved = savedIds.includes(lesson.id);
            const isPlaying = playerOpen && selectedLessonId === lesson.id;

            return (
              <article
                key={lesson.id}
                className={`med-card med-card-interactive overflow-hidden flex flex-col justify-between ${
                  isPlaying ? "ring-2 ring-teal-600 border-teal-600" : ""
                }`}
              >
                <div>
                  <button
                    type="button"
                    onClick={() => handleWatchLesson(lesson)}
                    className="relative block w-full aspect-video bg-slate-900 overflow-hidden group text-left"
                  >
                    <Image
                      src={getYoutubeThumbnailUrl(lesson.videoId)}
                      alt={copy.title}
                      width={640}
                      height={360}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-slate-950/15 to-transparent" />
                    <span className="absolute top-3 left-3 rounded-full bg-slate-950/80 backdrop-blur-xs px-2.5 py-1 text-xs font-bold text-white border border-white/15">
                      {lesson.langBadge}
                    </span>
                    {isWatched && (
                      <span className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-full bg-teal-600 px-2.5 py-1 text-xs font-bold text-white shadow-xs">
                        <IconCircleCheck className="h-3.5 w-3.5" />
                        <span>{t.watchedBadge}</span>
                      </span>
                    )}
                    <span className="absolute inset-0 flex items-center justify-center">
                      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-rose-600/95 text-white shadow-lg group-hover:scale-110 transition-transform">
                        <IconPlayerPlay className="h-6 w-6 ml-0.5" />
                      </span>
                    </span>
                  </button>

                  <div className="p-4 sm:p-5 space-y-2">
                    <p className="text-xs font-semibold text-teal-700 dark:text-teal-300">
                      {lesson.channel}
                    </p>
                    <h3 className="font-heading text-base font-bold text-slate-900 dark:text-white leading-snug">
                      {copy.title}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-2">
                      {copy.summary}
                    </p>
                  </div>
                </div>

                <div className="px-4 sm:px-5 pb-4 pt-3 border-t border-[#D7E4E1] dark:border-[#1E353A] flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleWatchLesson(lesson)}
                      className="inline-flex min-h-[42px] items-center gap-1.5 rounded-xl bg-teal-700 dark:bg-teal-600 hover:bg-teal-800 px-3.5 py-2 text-xs sm:text-sm font-bold text-white active:scale-[0.98] transition-all"
                    >
                      <IconPlayerPlay className="h-4 w-4" />
                      <span>{t.watchBtn}</span>
                    </button>
                    <a
                      href={lesson.youtubeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-[42px] items-center gap-1.5 rounded-xl border border-[#D7E4E1] dark:border-[#1E353A] bg-[#F4F8F7] dark:bg-[#091315] px-3 py-2 text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100 hover:border-rose-500 transition-colors"
                    >
                      <IconBrandYoutube className="h-4 w-4 text-rose-600" />
                      <span>YouTube</span>
                      <IconExternalLink className="h-3.5 w-3.5 text-slate-400" />
                    </a>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => toggleWatched(lesson.id)}
                      title={t.markWatched}
                      aria-label={t.markWatched}
                      className={`inline-flex h-10 w-10 items-center justify-center rounded-xl border transition-colors ${
                        isWatched
                          ? "border-teal-600 bg-[#EDF5F3] dark:bg-[#16272B] text-teal-700 dark:text-teal-300"
                          : "border-[#D7E4E1] dark:border-[#1E353A] text-slate-500 hover:text-teal-700"
                      }`}
                    >
                      <IconCheck className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleSaved(lesson.id)}
                      title={isSaved ? t.savedLesson : t.saveLesson}
                      aria-label={isSaved ? t.savedLesson : t.saveLesson}
                      className={`inline-flex h-10 w-10 items-center justify-center rounded-xl border transition-colors ${
                        isSaved
                          ? "border-amber-500 bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300"
                          : "border-[#D7E4E1] dark:border-[#1E353A] text-slate-500 hover:text-amber-600"
                      }`}
                    >
                      {isSaved ? <IconBookmarkFilled className="h-4 w-4" /> : <IconBookmark className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
