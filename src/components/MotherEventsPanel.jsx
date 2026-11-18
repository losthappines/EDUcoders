"use client";
import React, { useMemo, useState } from "react";
import Link from "next/link";
import {
  IconArrowRight,
  IconCalendarEvent,
  IconCheck,
  IconClock,
  IconExternalLink,
  IconMapPin,
  IconPlus,
  IconRadio,
  IconSparkles,
  IconStar,
  IconUsersGroup,
  IconX,
} from "@tabler/icons-react";
import { useLanguage } from "@/context/LanguageContext";

const EVENTS_COPY = {
  uz: {
    summaryTitle: "Onalar uchun tadbirlar: Davom etayotgan va qo'shilayotganlar",
    summarySub: "Hozir jonli o'tayotgan uchrashuvlar hamda jadvalga qo'shilayotgan yangi tadbirlar",
    summaryViewAll: "Barcha tadbirlar",
    title: "Onalar uchun tadbirlar va uchrashuvlar",
    subtitle:
      "Hozir davom etayotgan jonli suhbatlar, jadvalga qo'shilayotgan yangi tadbirlar va yaqinlashayotgan davralarga yoziling.",
    filters: {
      ALL: "Barchasi",
      IN_PROGRESS: "Davom etmoqda",
      BEING_ADDED: "Qo'shilmoqda",
      UPCOMING: "Yaqinlashmoqda",
      MY_RSVPS: "Mening tadbirlarim",
    },
    statusLabels: {
      IN_PROGRESS: "Davom etmoqda • LIVE",
      BEING_ADDED: "Qo'shilmoqda • Tez kunda",
      UPCOMING: "Rejalashtirilgan",
      COMPLETED: "Yakunlangan",
    },
    categories: {
      AUDIO_CIRCLE: "Audio davra",
      WORKSHOP: "Amaliy dars",
      CLINIC_DAY: "Poliklinika kuni",
      SUPPORT_GROUP: "Qo'llab-quvvatlash",
      WEBINAR: "Vebinar",
    },
    goingBtn: "Qatnashaman ✓",
    joinBtn: "Ishtirok etish",
    interestActiveBtn: "Kuzatyapman ✓",
    interestBtn: "Qo'shilganda eslatish",
    openMeeting: "Uchrashuvga ulanish",
    participantsWord: "ona yozildi",
    emptyFiltered: "Bu toifada hozircha tadbirlar topilmadi.",
    loading: "Tadbirlar yuklanmoqda...",
    signInNotice: "Joy band qilish uchun avval hisobingizga kiring yoki ro'yxatdan o'ting.",
    signInBtn: "Kirish",
    addBtn: "Yangi tadbir qo'shish",
    addTitle: "Yangi ona tadbiri qo'shish",
    fieldTitle: "Tadbir nomi",
    fieldDesc: "Qisqacha tavsif",
    fieldStatus: "Holati",
    fieldCategory: "Toifa",
    fieldFormat: "Format",
    fieldLocation: "Joy / Havola matni",
    fieldUrl: "Uchrashuv havolasi (ixtiyoriy)",
    submitEvent: "Tadbirni saqlash",
    savingEvent: "Saqlanmoqda...",
  },
  ru: {
    summaryTitle: "Мероприятия для мам: текущие и добавляемые",
    summarySub: "Встречи, которые идут прямо сейчас, и новые события в расписании",
    summaryViewAll: "Все мероприятия",
    title: "Мероприятия и встречи для мам",
    subtitle:
      "Присоединяйтесь к живым эфирам, отслеживайте новые добавляемые мероприятия и бронируйте места на ближайшие круги.",
    filters: {
      ALL: "Все",
      IN_PROGRESS: "Идут сейчас",
      BEING_ADDED: "Добавляются",
      UPCOMING: "Предстоящие",
      MY_RSVPS: "Мои записи",
    },
    statusLabels: {
      IN_PROGRESS: "Идет сейчас • LIVE",
      BEING_ADDED: "Добавляется • Скоро",
      UPCOMING: "Запланировано",
      COMPLETED: "Завершено",
    },
    categories: {
      AUDIO_CIRCLE: "Аудио-круг",
      WORKSHOP: "Практикум",
      CLINIC_DAY: "День клиники",
      SUPPORT_GROUP: "Группа поддержки",
      WEBINAR: "Вебинар",
    },
    goingBtn: "Я пойду ✓",
    joinBtn: "Участвовать",
    interestActiveBtn: "Отслеживаю ✓",
    interestBtn: "Напомнить при запуске",
    openMeeting: "Подключиться",
    participantsWord: "участниц",
    emptyFiltered: "В этой категории пока нет мероприятий.",
    loading: "Загрузка мероприятий...",
    signInNotice: "Чтобы записаться на мероприятие, войдите в аккаунт или зарегистрируйтесь.",
    signInBtn: "Войти",
    addBtn: "Добавить событие",
    addTitle: "Создать мероприятие для мам",
    fieldTitle: "Название",
    fieldDesc: "Описание",
    fieldStatus: "Статус",
    fieldCategory: "Категория",
    fieldFormat: "Формат",
    fieldLocation: "Место / Подпись",
    fieldUrl: "Ссылка на встречу (опц.)",
    submitEvent: "Сохранить событие",
    savingEvent: "Сохранение...",
  },
  en: {
    summaryTitle: "Mothers Events: In Progress & Being Added",
    summarySub: "Live sessions happening right now plus upcoming events being finalized for you",
    summaryViewAll: "All Events",
    title: "Mothers Events & Live Circles",
    subtitle:
      "Join live sessions currently in progress, watch events currently being added to the calendar, and reserve your spot.",
    filters: {
      ALL: "All",
      IN_PROGRESS: "In Progress",
      BEING_ADDED: "Being Added",
      UPCOMING: "Upcoming",
      MY_RSVPS: "My RSVPs",
    },
    statusLabels: {
      IN_PROGRESS: "In Progress • LIVE",
      BEING_ADDED: "Being Added • Soon",
      UPCOMING: "Upcoming",
      COMPLETED: "Completed",
    },
    categories: {
      AUDIO_CIRCLE: "Audio Circle",
      WORKSHOP: "Workshop",
      CLINIC_DAY: "Polyclinic Day",
      SUPPORT_GROUP: "Support Group",
      WEBINAR: "Webinar",
    },
    goingBtn: "Going ✓",
    joinBtn: "Join / RSVP",
    interestActiveBtn: "Following ✓",
    interestBtn: "Notify Me",
    openMeeting: "Join Live Room",
    participantsWord: "registered",
    emptyFiltered: "No events found in this filter yet.",
    loading: "Loading events...",
    signInNotice: "Sign in or create an account to RSVP for mother events.",
    signInBtn: "Sign In",
    addBtn: "Add Event",
    addTitle: "Publish a Mother Event",
    fieldTitle: "Event title",
    fieldDesc: "Description",
    fieldStatus: "Status",
    fieldCategory: "Category",
    fieldFormat: "Format",
    fieldLocation: "Location / Room label",
    fieldUrl: "Meeting URL (optional)",
    submitEvent: "Publish Event",
    savingEvent: "Saving...",
  },
};

function getLocalizedEventText(ev, lang) {
  return {
    title: lang === "ru" ? ev.titleRu || ev.titleUz : lang === "en" ? ev.titleEn || ev.titleUz : ev.titleUz,
    description:
      lang === "ru"
        ? ev.descriptionRu || ev.descriptionUz
        : lang === "en"
          ? ev.descriptionEn || ev.descriptionUz
          : ev.descriptionUz,
  };
}

function StatusPill({ status, labels }) {
  if (status === "IN_PROGRESS") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-700 px-3 py-1 text-xs font-bold text-emerald-800 dark:text-emerald-200">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600 dark:bg-emerald-400" />
        </span>
        <span>{labels.IN_PROGRESS}</span>
      </span>
    );
  }
  if (status === "BEING_ADDED") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 dark:bg-amber-950/70 border border-amber-300 dark:border-amber-700 px-3 py-1 text-xs font-bold text-amber-900 dark:text-amber-200">
        <IconSparkles className="h-3.5 w-3.5" />
        <span>{labels.BEING_ADDED}</span>
      </span>
    );
  }
  if (status === "UPCOMING") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-100 dark:bg-sky-950/70 border border-sky-200 dark:border-sky-800 px-3 py-1 text-xs font-bold text-sky-800 dark:text-sky-200">
        <IconCalendarEvent className="h-3.5 w-3.5" />
        <span>{labels.UPCOMING}</span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1 text-xs font-semibold text-slate-600 dark:text-slate-300">
      {labels.COMPLETED}
    </span>
  );
}

export function MotherEventsPanel({
  mode = "full",
  events = [],
  loading = false,
  onRsvp,
  rsvpBusyId = null,
  onOpenAllEvents,
  authUser = null,
  canCreateEvent = false,
  onEventCreated,
  fetchWithAuth,
}) {
  const { lang } = useLanguage();
  const t = EVENTS_COPY[lang] || EVENTS_COPY.uz;
  const [filter, setFilter] = useState("ALL");
  const [showAuthNotice, setShowAuthNotice] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newStatus, setNewStatus] = useState("BEING_ADDED");
  const [newCategory, setNewCategory] = useState("WORKSHOP");
  const [newFormat, setNewFormat] = useState("ONLINE");
  const [newLocation, setNewLocation] = useState("");
  const [newUrl, setNewUrl] = useState("");

  const activeEvents = useMemo(() => {
    if (mode === "summary") {
      const highlighted = events.filter(
        (ev) => ev.status === "IN_PROGRESS" || ev.status === "BEING_ADDED"
      );
      return (highlighted.length > 0 ? highlighted : events).slice(0, 3);
    }
    if (filter === "ALL") return events;
    if (filter === "MY_RSVPS") return events.filter((ev) => Boolean(ev.myRsvp));
    return events.filter((ev) => ev.status === filter);
  }, [events, filter, mode]);

  const handleRsvpClick = async (eventId, desiredStatus) => {
    if (!authUser) {
      setShowAuthNotice(true);
      return;
    }
    setShowAuthNotice(false);
    if (onRsvp) {
      await onRsvp(eventId, desiredStatus);
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDesc.trim() || !fetchWithAuth) return;
    setCreating(true);
    try {
      const res = await fetchWithAuth("/api/community/events", {
        method: "POST",
        body: JSON.stringify({
          action: "CREATE_EVENT",
          title: newTitle.trim(),
          description: newDesc.trim(),
          status: newStatus,
          category: newCategory,
          format: newFormat,
          locationText: newLocation.trim() || undefined,
          meetingUrl: newUrl.trim() || undefined,
        }),
      });
      if (res.ok) {
        setNewTitle("");
        setNewDesc("");
        setNewLocation("");
        setNewUrl("");
        setCreateOpen(false);
        if (onEventCreated) await onEventCreated();
      }
    } finally {
      setCreating(false);
    }
  };

  if (mode === "summary") {
    const liveCount = events.filter((e) => e.status === "IN_PROGRESS").length;
    const addingCount = events.filter((e) => e.status === "BEING_ADDED").length;
    return (
      <section className="med-card p-5 space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="font-heading text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <IconRadio className="h-5 w-5 text-teal-700 dark:text-teal-300" />
              <span>{t.summaryTitle}</span>
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">{t.summarySub}</p>
          </div>
          {onOpenAllEvents && (
            <button
              type="button"
              onClick={onOpenAllEvents}
              className="inline-flex min-h-[42px] items-center gap-1.5 rounded-xl border border-teal-600/40 bg-[#EDF5F3] dark:bg-[#16272B] px-3.5 py-2 text-sm font-bold text-teal-800 dark:text-teal-200 hover:bg-teal-100/70 dark:hover:bg-teal-900/50 active:scale-[0.98] transition-all"
            >
              <span>{t.summaryViewAll}</span>
              <span className="rounded-full bg-teal-700 dark:bg-teal-500 text-white dark:text-slate-950 px-2 py-0.5 text-xs">
                {events.length}
              </span>
              <IconArrowRight className="h-4 w-4" />
            </button>
          )}
        </div>

        {(liveCount > 0 || addingCount > 0) && (
          <div className="flex flex-wrap gap-2 text-xs font-semibold">
            {liveCount > 0 && (
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 px-2.5 py-1 text-emerald-800 dark:text-emerald-200">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                {liveCount} {t.filters.IN_PROGRESS}
              </span>
            )}
            {addingCount > 0 && (
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 px-2.5 py-1 text-amber-900 dark:text-amber-200">
                <IconSparkles className="h-3.5 w-3.5" />
                {addingCount} {t.filters.BEING_ADDED}
              </span>
            )}
          </div>
        )}

        {loading && events.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">{t.loading}</p>
        ) : (
          <div className="space-y-3">
            {activeEvents.map((ev) => {
              const copy = getLocalizedEventText(ev, lang);
              const isBusy = rsvpBusyId === ev.id;
              const isGoing = ev.myRsvp === "GOING";
              const isInterested = ev.myRsvp === "INTERESTED";
              const targetDesired = ev.status === "BEING_ADDED" ? "INTERESTED" : "GOING";
              return (
                <div
                  key={ev.id}
                  className="rounded-xl border border-[#D7E4E1] dark:border-[#1E353A] bg-[#F4F8F7] dark:bg-[#091315] p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors"
                >
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusPill status={ev.status} labels={t.statusLabels} />
                      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                        {t.categories[ev.category] || ev.category} • {ev.format}
                      </span>
                    </div>
                    <p className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-snug">
                      {copy.title}
                    </p>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                      {ev.hostName} • {ev.locationText || ev.district || "Online"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() => handleRsvpClick(ev.id, targetDesired)}
                      className={`min-h-[44px] rounded-xl px-4 py-2 text-sm font-bold transition-all active:scale-[0.98] disabled:opacity-50 ${
                        isGoing || isInterested
                          ? "bg-white dark:bg-[#16272B] border border-teal-600 text-teal-800 dark:text-teal-200"
                          : "bg-teal-700 dark:bg-teal-600 text-white hover:bg-teal-800 dark:hover:bg-teal-500"
                      }`}
                    >
                      {isBusy
                        ? "..."
                        : isGoing
                          ? t.goingBtn
                          : isInterested
                            ? t.interestActiveBtn
                            : ev.status === "BEING_ADDED"
                              ? t.interestBtn
                              : t.joinBtn}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    );
  }

  return (
    <section className="space-y-5 oc-fade-up">
      <div className="med-card p-5 sm:p-6 space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1 max-w-2xl">
            <h2 className="font-heading text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
              <IconCalendarEvent className="h-6 w-6 text-teal-700 dark:text-teal-300 shrink-0" />
              <span>{t.title}</span>
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
              {t.subtitle}
            </p>
          </div>
          {canCreateEvent && (
            <button
              type="button"
              onClick={() => setCreateOpen((v) => !v)}
              className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl bg-teal-700 dark:bg-teal-600 px-4 py-2 text-sm font-bold text-white hover:bg-teal-800 active:scale-[0.98] transition-all"
            >
              {createOpen ? <IconX className="h-4 w-4" /> : <IconPlus className="h-4 w-4" />}
              <span>{t.addBtn}</span>
            </button>
          )}
        </div>

        {/* Status Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {["ALL", "IN_PROGRESS", "BEING_ADDED", "UPCOMING", ...(authUser ? ["MY_RSVPS"] : [])].map((key) => {
            const active = filter === key;
            const count =
              key === "ALL"
                ? events.length
                : key === "MY_RSVPS"
                  ? events.filter((e) => Boolean(e.myRsvp)).length
                  : events.filter((e) => e.status === key).length;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setFilter(key)}
                className={`inline-flex min-h-[42px] shrink-0 items-center gap-2 rounded-xl border px-3.5 py-2 text-sm font-semibold transition-all active:scale-[0.98] ${
                  active
                    ? "border-teal-700 bg-teal-700 dark:bg-teal-600 text-white shadow-xs"
                    : "border-[#D7E4E1] dark:border-[#1E353A] bg-[#F4F8F7] dark:bg-[#091315] text-slate-700 dark:text-slate-200 hover:border-teal-600/60"
                }`}
              >
                <span>{t.filters[key]}</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                    active ? "bg-white/20 text-white" : "bg-white dark:bg-[#101E21] text-slate-600 dark:text-slate-300"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {showAuthNotice && (
          <div className="rounded-xl border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 px-4 py-3 flex flex-wrap items-center justify-between gap-3 text-sm text-amber-900 dark:text-amber-200 oc-slide-down">
            <span className="font-medium">{t.signInNotice}</span>
            <Link
              href="/login"
              className="inline-flex min-h-[40px] items-center rounded-xl bg-teal-700 px-4 py-1.5 text-sm font-bold text-white hover:bg-teal-800"
            >
              {t.signInBtn}
            </Link>
          </div>
        )}

        {createOpen && canCreateEvent && (
          <form
            onSubmit={handleCreateSubmit}
            className="rounded-2xl border border-teal-200 dark:border-teal-800 bg-[#EDF5F3] dark:bg-[#091315] p-4 sm:p-5 space-y-3.5 oc-slide-down"
          >
            <h3 className="font-heading text-base font-bold text-slate-900 dark:text-white">
              {t.addTitle}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder={t.fieldTitle}
                className="min-h-[46px] rounded-xl border border-[#D7E4E1] dark:border-[#1E353A] bg-white dark:bg-[#101E21] px-3.5 py-2 text-base sm:text-sm text-slate-900 dark:text-white"
              />
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="min-h-[46px] rounded-xl border border-[#D7E4E1] dark:border-[#1E353A] bg-white dark:bg-[#101E21] px-3.5 py-2 text-base sm:text-sm text-slate-900 dark:text-white"
              >
                <option value="BEING_ADDED">{t.filters.BEING_ADDED}</option>
                <option value="IN_PROGRESS">{t.filters.IN_PROGRESS}</option>
                <option value="UPCOMING">{t.filters.UPCOMING}</option>
              </select>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="min-h-[46px] rounded-xl border border-[#D7E4E1] dark:border-[#1E353A] bg-white dark:bg-[#101E21] px-3.5 py-2 text-base sm:text-sm text-slate-900 dark:text-white"
              >
                {Object.entries(t.categories).map(([val, label]) => (
                  <option key={val} value={val}>
                    {label}
                  </option>
                ))}
              </select>
              <select
                value={newFormat}
                onChange={(e) => setNewFormat(e.target.value)}
                className="min-h-[46px] rounded-xl border border-[#D7E4E1] dark:border-[#1E353A] bg-white dark:bg-[#101E21] px-3.5 py-2 text-base sm:text-sm text-slate-900 dark:text-white"
              >
                <option value="ONLINE">ONLINE</option>
                <option value="TELEGRAM">TELEGRAM</option>
                <option value="OFFLINE">OFFLINE</option>
              </select>
              <input
                type="text"
                value={newLocation}
                onChange={(e) => setNewLocation(e.target.value)}
                placeholder={t.fieldLocation}
                className="min-h-[46px] rounded-xl border border-[#D7E4E1] dark:border-[#1E353A] bg-white dark:bg-[#101E21] px-3.5 py-2 text-base sm:text-sm text-slate-900 dark:text-white"
              />
              <input
                type="text"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                placeholder={t.fieldUrl}
                className="min-h-[46px] rounded-xl border border-[#D7E4E1] dark:border-[#1E353A] bg-white dark:bg-[#101E21] px-3.5 py-2 text-base sm:text-sm text-slate-900 dark:text-white"
              />
            </div>
            <textarea
              rows={2}
              required
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              placeholder={t.fieldDesc}
              className="w-full rounded-xl border border-[#D7E4E1] dark:border-[#1E353A] bg-white dark:bg-[#101E21] px-3.5 py-2.5 text-base sm:text-sm text-slate-900 dark:text-white"
            />
            <button
              type="submit"
              disabled={creating}
              className="min-h-[46px] rounded-xl bg-teal-700 dark:bg-teal-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-teal-800 disabled:opacity-50"
            >
              {creating ? t.savingEvent : t.submitEvent}
            </button>
          </form>
        )}
      </div>

      {/* Events Grid */}
      {loading && events.length === 0 ? (
        <div className="med-card p-8 text-center text-sm text-slate-600 dark:text-slate-300">
          {t.loading}
        </div>
      ) : activeEvents.length === 0 ? (
        <div className="med-card p-8 text-center text-sm text-slate-600 dark:text-slate-300">
          {t.emptyFiltered}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {activeEvents.map((ev) => {
            const copy = getLocalizedEventText(ev, lang);
            const isBusy = rsvpBusyId === ev.id;
            const isGoing = ev.myRsvp === "GOING";
            const isInterested = ev.myRsvp === "INTERESTED";
            const totalParticipants = (ev.goingCount || 0) + (ev.interestedCount || 0);
            const isExternal = ev.meetingUrl && ev.meetingUrl.startsWith("http");

            return (
              <article
                key={ev.id}
                className={`med-card med-card-interactive p-5 flex flex-col justify-between gap-4 ${
                  ev.status === "IN_PROGRESS"
                    ? "border-emerald-300 dark:border-emerald-800"
                    : ev.status === "BEING_ADDED"
                      ? "border-amber-200 dark:border-amber-900/80"
                      : ""
                }`}
              >
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <StatusPill status={ev.status} labels={t.statusLabels} />
                    <span className="rounded-full bg-[#EDF5F3] dark:bg-[#16272B] border border-[#D7E4E1] dark:border-[#1E353A] px-2.5 py-0.5 text-xs font-semibold text-teal-800 dark:text-teal-200">
                      {t.categories[ev.category] || ev.category}
                    </span>
                  </div>

                  <h3 className="font-heading text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-snug">
                    {copy.title}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {copy.description}
                  </p>

                  <div className="space-y-1.5 text-xs sm:text-sm text-slate-600 dark:text-slate-300 pt-1">
                    <p className="font-semibold text-slate-800 dark:text-slate-100">
                      {ev.hostName} • <span className="font-normal text-slate-500 dark:text-slate-400">{ev.hostRole}</span>
                    </p>
                    <p className="flex items-center gap-1.5">
                      <IconMapPin className="h-4 w-4 text-teal-700 dark:text-teal-300 shrink-0" />
                      <span>{ev.locationText || ev.district || ev.format}</span>
                    </p>
                    {ev.startsAt && (
                      <p className="flex items-center gap-1.5">
                        <IconClock className="h-4 w-4 text-teal-700 dark:text-teal-300 shrink-0" />
                        <span>
                          {new Date(ev.startsAt).toLocaleString("en-GB", {
                            day: "2-digit",
                            month: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2.5 pt-3 border-t border-[#D7E4E1] dark:border-[#1E353A]">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300">
                    <IconUsersGroup className="h-4 w-4 text-teal-700 dark:text-teal-300" />
                    <span>
                      {totalParticipants} {t.participantsWord}
                    </span>
                  </span>

                  <div className="flex flex-wrap items-center gap-2">
                    {ev.meetingUrl && ev.status === "IN_PROGRESS" && (
                      isExternal ? (
                        <a
                          href={ev.meetingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex min-h-[42px] items-center gap-1.5 rounded-xl border border-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 px-3.5 py-2 text-xs sm:text-sm font-bold text-emerald-800 dark:text-emerald-200 hover:bg-emerald-100"
                        >
                          <span>{t.openMeeting}</span>
                          <IconExternalLink className="h-4 w-4" />
                        </a>
                      ) : (
                        <Link
                          href={ev.meetingUrl}
                          className="inline-flex min-h-[42px] items-center gap-1.5 rounded-xl border border-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 px-3.5 py-2 text-xs sm:text-sm font-bold text-emerald-800 dark:text-emerald-200 hover:bg-emerald-100"
                        >
                          <span>{t.openMeeting}</span>
                          <IconArrowRight className="h-4 w-4" />
                        </Link>
                      )
                    )}

                    {ev.status === "BEING_ADDED" ? (
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => handleRsvpClick(ev.id, "INTERESTED")}
                        className={`inline-flex min-h-[42px] items-center gap-1.5 rounded-xl px-4 py-2 text-xs sm:text-sm font-bold transition-all active:scale-[0.98] disabled:opacity-50 ${
                          isInterested || isGoing
                            ? "border border-amber-600 bg-amber-50 dark:bg-amber-950/50 text-amber-900 dark:text-amber-200"
                            : "bg-amber-600 hover:bg-amber-700 text-white"
                        }`}
                      >
                        <IconStar className="h-4 w-4" />
                        <span>{isBusy ? "..." : isInterested || isGoing ? t.interestActiveBtn : t.interestBtn}</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => handleRsvpClick(ev.id, "GOING")}
                        className={`inline-flex min-h-[42px] items-center gap-1.5 rounded-xl px-4 py-2 text-xs sm:text-sm font-bold transition-all active:scale-[0.98] disabled:opacity-50 ${
                          isGoing
                            ? "border border-teal-600 bg-[#EDF5F3] dark:bg-[#16272B] text-teal-800 dark:text-teal-200"
                            : "bg-teal-700 dark:bg-teal-600 hover:bg-teal-800 text-white"
                        }`}
                      >
                        {isGoing && <IconCheck className="h-4 w-4" />}
                        <span>{isBusy ? "..." : isGoing ? t.goingBtn : t.joinBtn}</span>
                      </button>
                    )}
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
