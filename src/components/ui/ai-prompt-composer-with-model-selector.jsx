'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback, useSyncExternalStore } from 'react';

const COMPOSER_PREFS_EVENT = 'ai-composer-prefs-change';

function subscribeComposerPrefs(callback) {
  if (typeof window === 'undefined') return () => {};
  const onPrefs = () => callback();
  window.addEventListener('storage', onPrefs);
  window.addEventListener(COMPOSER_PREFS_EVENT, onPrefs);
  return () => {
    window.removeEventListener('storage', onPrefs);
    window.removeEventListener(COMPOSER_PREFS_EVENT, onPrefs);
  };
}

function getStoredThemeSnapshot() {
  try {
    const val = window.localStorage.getItem('ai_composer_theme');
    return val === 'light' || val === 'dark' ? val : null;
  } catch {
    return null;
  }
}

function getStoredFavsSnapshot() {
  try {
    return window.localStorage.getItem('ai_composer_fav_models');
  } catch {
    return null;
  }
}

function getNullServerSnapshot() {
  return null;
}

const DEFAULT_MODELS = [
  {
    id: 'gemini-3.5-flash',
    name: 'Gemini 3.5 Flash',
    effort: 'High',
    provider: 'gemini',
    isFav: true,
    efforts: ['Low', 'Medium', 'High', 'Max'],
  },
  {
    id: 'kimi-k3',
    name: 'Kimi K3',
    effort: 'High',
    provider: 'kimi',
    isFav: false,
    efforts: ['Low', 'Medium', 'High', 'Max'],
  },
  {
    id: 'gpt-56-terra',
    name: 'GPT-5.6 Terra',
    effort: 'Medium',
    provider: 'openai',
    isFav: false,
    efforts: ['Low', 'Medium', 'High', 'Max'],
  },
  {
    id: 'gpt-56-sol',
    name: 'GPT-5.6 Sol',
    effort: 'Medium',
    provider: 'openai',
    isFav: false,
    efforts: ['Low', 'Medium', 'High', 'Max'],
  },
  {
    id: 'sonnet-5',
    name: 'Sonnet 5',
    effort: 'High',
    provider: 'spark',
    isFav: true,
    efforts: ['Low', 'Medium', 'High', 'Max'],
  },
  {
    id: 'opus-48',
    name: 'Opus 4.8',
    effort: 'High',
    provider: 'spark',
    isFav: false,
    efforts: ['Low', 'Medium', 'High', 'Max'],
  },
  {
    id: 'fable-5',
    name: 'Fable 5',
    effort: 'High',
    provider: 'spark',
    isFav: true,
    efforts: ['Medium', 'High', 'Max'],
  },
];

const DEFAULT_CONTEXT_OPTIONS = [
  { tag: '@medications', category: 'Prescriptions' },
  { tag: '@checkins', category: 'Daily health' },
  { tag: '@labs', category: 'Lab reports' },
  { tag: '@visit', category: 'Home visit' },
];

const ALL_MODES = ['Plan', 'Ask', 'Build'];

function ProviderBadgeIcon({ provider }) {
  if (provider === 'gemini') {
    return (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M12 2.5C12.8 7.8 16.2 11.2 21.5 12C16.2 12.8 12.8 16.2 12 21.5C11.2 16.2 7.8 12.8 2.5 12C7.8 11.2 11.2 7.8 12 2.5Z"
          stroke="#5EA8FF"
          strokeWidth="1.7"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (provider === 'kimi') {
    return (
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path
          d="M4.2 3.2V12.8M4.2 8.2L10.4 3.2M6.8 6.2L11.2 12.8"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="12.2" cy="4.2" r="1.15" fill="currentColor" />
      </svg>
    );
  }

  if (provider === 'openai') {
    return (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M21.2 10.1c.2-1.5-.2-3.1-1.2-4.3-1.3-1.6-3.4-2.3-5.4-1.8-.9-1.1-2.3-1.8-3.8-1.8-2.1 0-3.9 1.3-4.6 3.2-1.5.3-2.8 1.2-3.6 2.5-1 1.8-.9 4 .2 5.7-.2 1.5.2 3.1 1.2 4.3 1.3 1.6 3.4 2.3 5.4 1.8.9 1.1 2.3 1.8 3.8 1.8 2.1 0 3.9-1.3 4.6-3.2 1.5-.3 2.8-1.2 3.6-2.5 1.1-1.8 1-4-.2-5.7z"
          stroke="currentColor"
          strokeWidth="1.65"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="12" cy="12" r="2.7" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    );
  }

  return (
    <svg width="15" height="15" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <g stroke="#E87B58" strokeWidth="1.35" strokeLinecap="round">
        <line x1="9" y1="2.2" x2="9" y2="15.8" />
        <line x1="2.2" y1="9" x2="15.8" y2="9" />
        <line x1="4.1" y1="4.1" x2="13.9" y2="13.9" />
        <line x1="13.9" y1="4.1" x2="4.1" y2="13.9" />
        <line x1="6.4" y1="2.7" x2="11.6" y2="15.3" />
        <line x1="2.7" y1="6.4" x2="15.3" y2="11.6" />
      </g>
      <circle cx="9" cy="9" r="1.4" fill="var(--bg-composer)" />
    </svg>
  );
}

function CheckmarkIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 16 16"
      fill="none"
      className="flex-shrink-0"
      style={{ color: 'var(--text-primary)' }}
      aria-hidden="true"
    >
      <path
        d="M3.2 8.5L6.5 11.8L13 4.5"
        stroke="currentColor"
        strokeWidth="1.65"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function AIComposer({
  initialTheme,
  showUpgradeBanner = true,
  showWalkthroughControl = true,
  embedded = false,
  disabled = false,
  placeholder = 'Ask anything... Use @ for health context',
  contextOptions,
  initialModels,
  defaultMode = 'Ask',
  defaultModelId = 'gemini-3.5-flash',
  labels = {},
  onSubmit,
} = {}) {
  const resolvedInitialModels = useMemo(
    () => (Array.isArray(initialModels) && initialModels.length > 0 ? initialModels : DEFAULT_MODELS),
    [initialModels]
  );
  const resolvedContextOptions = useMemo(
    () => (Array.isArray(contextOptions) && contextOptions.length > 0 ? contextOptions : DEFAULT_CONTEXT_OPTIONS),
    [contextOptions]
  );

  const storedTheme = useSyncExternalStore(
    subscribeComposerPrefs,
    getStoredThemeSnapshot,
    getNullServerSnapshot
  );
  const storedFavsRaw = useSyncExternalStore(
    subscribeComposerPrefs,
    getStoredFavsSnapshot,
    getNullServerSnapshot
  );

  const [themeOverride, setThemeOverride] = useState(null);
  const theme = themeOverride ?? storedTheme ?? (initialTheme === 'light' || initialTheme === 'dark' ? initialTheme : 'dark');

  const [promptText, setPromptText] = useState('');
  const [mode, setMode] = useState(ALL_MODES.includes(defaultMode) ? defaultMode : 'Ask');
  const [modeMenuOpen, setModeMenuOpen] = useState(false);

  const [autoMode, setAutoMode] = useState(false);
  const [modelMenuOpen, setModelMenuOpen] = useState(false);
  const [searchRevealed, setSearchRevealed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [modelFilterTab, setModelFilterTab] = useState('fav');
  const [effortOverrides, setEffortOverrides] = useState({});
  const [favOverrides, setFavOverrides] = useState(null);

  const models = useMemo(() => {
    let parsedStoredFavs = null;
    if (storedFavsRaw) {
      try {
        const parsed = JSON.parse(storedFavsRaw);
        if (Array.isArray(parsed)) parsedStoredFavs = parsed;
      } catch {
        parsedStoredFavs = null;
      }
    }
    const activeFavList = favOverrides ?? parsedStoredFavs;
    return resolvedInitialModels.map((m) => ({
      ...m,
      isFav: activeFavList ? activeFavList.includes(m.id) : m.isFav,
      effort: effortOverrides[m.id] ?? m.effort,
    }));
  }, [resolvedInitialModels, storedFavsRaw, favOverrides, effortOverrides]);

  const [activeModelId, setActiveModelId] = useState(
    resolvedInitialModels.some((m) => m.id === defaultModelId)
      ? defaultModelId
      : resolvedInitialModels[0]?.id || 'gemini-3.5-flash'
  );
  const [hoveredModelId, setHoveredModelId] = useState(null);
  const [modelMenuPointerReady, setModelMenuPointerReady] = useState(false);

  const [attachedFiles, setAttachedFiles] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);

  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [proModalOpen, setProModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [contextMenuOpen, setContextMenuOpen] = useState(false);

  // Walkthrough tour state
  const [isPlayingTour, setIsPlayingTour] = useState(false);
  const [tourExpandAddFiles, setTourExpandAddFiles] = useState(false);
  const [tourExpandRecord, setTourExpandRecord] = useState(false);
  const [tourHoverAutoPill, setTourHoverAutoPill] = useState(false);

  const containerRef = useRef(null);
  const fileInputRef = useRef(null);
  const promptInputRef = useRef(null);
  const searchInputRef = useRef(null);
  const speechRecRef = useRef(null);
  const isHoveringModelRowRef = useRef(false);
  const isHoveringEffortMenuRef = useRef(false);
  const hideEffortTimerRef = useRef(null);
  const tourTimersRef = useRef([]);
  const toastTimerRef = useRef(null);

  const showNotice = useCallback((msg) => {
    setToastMessage(msg);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  }, []);

  // Close menus on outside click or Escape key
  useEffect(() => {
    const handleOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setModeMenuOpen(false);
        setModelMenuOpen(false);
        setContextMenuOpen(false);
        setHoveredModelId(null);
      }
    };
    const handleKey = (e) => {
      if (e.key === 'Escape') {
        setModeMenuOpen(false);
        setModelMenuOpen(false);
        setContextMenuOpen(false);
        setHoveredModelId(null);
        setProModalOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('keydown', handleKey);
    };
  }, []);

  // Recording elapsed timer
  useEffect(() => {
    if (!isRecording) return undefined;
    const id = setInterval(() => {
      setRecordingSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(id);
  }, [isRecording]);

  // Cleanup timers on unmount
  useEffect(() => {
    const timers = tourTimersRef.current;
    return () => {
      timers.forEach((id) => clearTimeout(id));
      if (hideEffortTimerRef.current) clearTimeout(hideEffortTimerRef.current);
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
      try {
        speechRecRef.current?.stop?.();
      } catch {
        // Ignore cleanup errors
      }
    };
  }, []);

  const setTheme = useCallback((nextTheme) => {
    setThemeOverride(nextTheme);
    try {
      localStorage.setItem('ai_composer_theme', nextTheme);
      window.dispatchEvent(new Event(COMPOSER_PREFS_EVENT));
    } catch {
      // Ignore storage errors
    }
  }, []);

  const activeModel = useMemo(
    () => models.find((m) => m.id === activeModelId) ?? models[0],
    [models, activeModelId]
  );

  const filteredModels = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return models.filter((m) => {
      if (modelFilterTab === 'fav' && !m.isFav) return false;
      if (q && !m.name.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [models, modelFilterTab, searchQuery]);

  const toggleFavoriteModel = (modelId, e) => {
    e.stopPropagation();
    const currentFavIds = models.filter((m) => m.isFav).map((m) => m.id);
    const nextFavIds = currentFavIds.includes(modelId)
      ? currentFavIds.filter((id) => id !== modelId)
      : [...currentFavIds, modelId];
    setFavOverrides(nextFavIds);
    try {
      localStorage.setItem('ai_composer_fav_models', JSON.stringify(nextFavIds));
      window.dispatchEvent(new Event(COMPOSER_PREFS_EVENT));
    } catch {
      // Ignore storage errors
    }
  };

  const handleSelectModel = (modelId) => {
    setActiveModelId(modelId);
    setAutoMode(false);
    setModelMenuOpen(false);
    setHoveredModelId(null);
  };

  const handleSelectEffort = (modelId, effort, e) => {
    e.stopPropagation();
    setEffortOverrides((prev) => ({ ...prev, [modelId]: effort }));
    setActiveModelId(modelId);
    setAutoMode(false);
    setModelMenuOpen(false);
    setHoveredModelId(null);
  };

  const scheduleHideEffort = () => {
    if (hideEffortTimerRef.current) clearTimeout(hideEffortTimerRef.current);
    hideEffortTimerRef.current = setTimeout(() => {
      if (!isHoveringModelRowRef.current && !isHoveringEffortMenuRef.current) {
        setHoveredModelId(null);
      }
    }, 120);
  };

  const handleFilesSelected = (e) => {
    const fileList = Array.from(e.target.files || []);
    if (fileList.length === 0) return;
    const newNames = fileList.map((f) => f.name);
    setAttachedFiles((prev) => [...new Set([...prev, ...newNames])]);
    setSelectedFiles((prev) => [...prev, ...fileList]);
    e.target.value = '';
  };

  const removeAttachedFile = (name) => {
    setAttachedFiles((prev) => prev.filter((f) => f !== name));
    setSelectedFiles((prev) => prev.filter((f) => f.name !== name));
  };

  const insertContextTag = (tag) => {
    setPromptText((prev) => {
      const needsSpace = prev.length > 0 && !/\s$/.test(prev);
      return `${prev}${needsSpace ? ' ' : ''}${tag} `;
    });
    setContextMenuOpen(false);
    promptInputRef.current?.focus();
  };

  const toggleRecording = () => {
    if (isRecording) {
      try {
        speechRecRef.current?.stop?.();
      } catch {
        // Ignore stop errors
      }
      setIsRecording(false);
      setRecordingSeconds(0);
      return;
    }

    const SpeechRecognition =
      typeof window !== 'undefined'
        ? window.SpeechRecognition || window.webkitSpeechRecognition
        : null;

    setIsRecording(true);
    setRecordingSeconds(0);

    if (SpeechRecognition) {
      try {
        const rec = new SpeechRecognition();
        rec.interimResults = false;
        rec.maxAlternatives = 1;
        rec.onresult = (evt) => {
          const transcript = evt?.results?.[0]?.[0]?.transcript || '';
          if (transcript) {
            setPromptText((prev) => (prev ? `${prev.trimEnd()} ${transcript}` : transcript));
          }
        };
        rec.onerror = () => {
          setIsRecording(false);
          setRecordingSeconds(0);
          showNotice('Microphone unavailable or permission denied');
        };
        rec.onend = () => {
          setIsRecording(false);
          setRecordingSeconds(0);
        };
        speechRecRef.current = rec;
        rec.start();
        return;
      } catch {
        // Fall through to simulated voice state
      }
    }

    showNotice('Voice note recording started (click mic again to stop)');
  };

  const handleSubmit = () => {
    if (disabled) return;
    const trimmed = promptText.trim();
    if (!trimmed && attachedFiles.length === 0) return;

    const submission = {
      prompt: trimmed,
      mode,
      modelId: autoMode ? 'auto' : activeModel?.id || 'gemini-3.5-flash',
      modelName: autoMode ? 'Auto (Gemini 3.5 Flash)' : activeModel?.name || 'Gemini 3.5 Flash',
      effort: activeModel?.effort || 'High',
      autoMode,
      attachedFiles: [...attachedFiles],
      files: [...selectedFiles],
    };

    if (onSubmit) {
      onSubmit(submission);
    } else {
      showNotice(`Sent to ${submission.modelName} (${submission.mode})`);
    }

    setPromptText('');
    setAttachedFiles([]);
    setSelectedFiles([]);
    setModeMenuOpen(false);
    setModelMenuOpen(false);
    setContextMenuOpen(false);
  };

  const runWalkthroughTour = () => {
    if (isPlayingTour) return;
    setIsPlayingTour(true);
    const schedule = (fn, ms) => {
      const id = setTimeout(fn, ms);
      tourTimersRef.current.push(id);
    };
    schedule(() => setTourExpandAddFiles(true), 250);
    schedule(() => {
      setTourExpandAddFiles(false);
      setModeMenuOpen(true);
    }, 1300);
    schedule(() => {
      setModeMenuOpen(false);
      setTourHoverAutoPill(true);
      setModelMenuOpen(true);
    }, 2400);
    schedule(() => {
      setModelMenuOpen(false);
      setTourHoverAutoPill(false);
      setTourExpandRecord(true);
    }, 3800);
    schedule(() => {
      setTourExpandRecord(false);
      setIsPlayingTour(false);
    }, 4900);
  };

  const themeVars =
    theme === 'dark'
      ? {
          '--bg-shell': '#111114',
          '--bg-composer': '#18181c',
          '--bg-elevated': '#1e1e24',
          '--bg-pill': '#222228',
          '--bg-hover': '#2a2a32',
          '--border-subtle': 'rgba(255,255,255,0.09)',
          '--border-strong': 'rgba(255,255,255,0.16)',
          '--text-primary': '#f4f4f6',
          '--text-secondary': '#a1a1aa',
          '--text-muted': '#71717a',
          '--accent-bg': '#f4f4f6',
          '--accent-fg': '#111114',
          '--shadow-composer': '0 18px 46px -14px rgba(0,0,0,0.65)',
          '--shadow-menu': '0 22px 50px -12px rgba(0,0,0,0.8)',
        }
      : {
          '--bg-shell': '#f4f4f7',
          '--bg-composer': '#ffffff',
          '--bg-elevated': '#ffffff',
          '--bg-pill': '#f4f4f5',
          '--bg-hover': '#e4e4e7',
          '--border-subtle': 'rgba(24,24,27,0.11)',
          '--border-strong': 'rgba(24,24,27,0.2)',
          '--text-primary': '#18181b',
          '--text-secondary': '#52525b',
          '--text-muted': '#71717a',
          '--accent-bg': '#18181b',
          '--accent-fg': '#ffffff',
          '--shadow-composer': '0 14px 36px -14px rgba(15,23,42,0.14)',
          '--shadow-menu': '0 20px 44px -12px rgba(15,23,42,0.2)',
        };

  const canSubmit = !disabled && (promptText.trim().length > 0 || attachedFiles.length > 0);
  const addFilesLabel = labels.addFiles || 'Add files';
  const recordLabel = labels.record || 'Record';
  const autoLabel = labels.auto || 'Auto';
  const favLabel = labels.favorites || 'Favorites';
  const allLabel = labels.all || 'All';
  const searchModelsPlaceholder = labels.searchModels || 'Search models...';

  return (
    <div
      ref={containerRef}
      style={themeVars}
      className={
        embedded
          ? 'relative w-full font-sans'
          : 'relative flex min-h-[420px] w-full flex-col items-center justify-center rounded-2xl p-4 sm:p-6 font-sans transition-colors'
      }
    >
      <div
        className={embedded ? 'w-full' : 'w-full max-w-3xl'}
        style={!embedded ? { backgroundColor: 'var(--bg-shell)', borderRadius: '24px', padding: '16px' } : undefined}
      >
        {/* Main Composer Box */}
        <div
          className="relative rounded-[22px] border transition-all"
          style={{
            backgroundColor: 'var(--bg-composer)',
            borderColor: 'var(--border-subtle)',
            boxShadow: 'var(--shadow-composer)',
            color: 'var(--text-primary)',
          }}
        >
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={handleFilesSelected}
          />

          {/* Attached Files Strip */}
          {attachedFiles.length > 0 && (
            <div className="flex flex-wrap gap-1.5 px-4 pt-3.5">
              {attachedFiles.map((fileName) => (
                <span
                  key={fileName}
                  className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium"
                  style={{
                    backgroundColor: 'var(--bg-pill)',
                    borderColor: 'var(--border-subtle)',
                    color: 'var(--text-primary)',
                  }}
                >
                  <span className="max-w-[160px] truncate">{fileName}</span>
                  <button
                    type="button"
                    onClick={() => removeAttachedFile(fileName)}
                    aria-label={`Remove ${fileName}`}
                    className="rounded-full p-0.5 hover:opacity-75"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Prompt Textarea */}
          <div className="px-4 pt-3.5 pb-2">
            <textarea
              ref={promptInputRef}
              rows={2}
              value={promptText}
              disabled={disabled}
              onChange={(e) => {
                const val = e.target.value;
                setPromptText(val);
                if (val.endsWith(' @') || val === '@') {
                  setContextMenuOpen(true);
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
              placeholder={placeholder}
              className="w-full resize-none bg-transparent text-sm leading-relaxed focus:outline-none disabled:opacity-60"
              style={{
                color: 'var(--text-primary)',
                minHeight: '52px',
                maxHeight: '180px',
              }}
            />
          </div>

          {/* Bottom Controls Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-2 px-3 pb-3 pt-1">
            {/* Left Group: + Add files, Mode Selector, @ Context */}
            <div className="flex flex-wrap items-center gap-1.5">
              {/* Expanding + Add files button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className={`group inline-flex h-8 items-center overflow-hidden rounded-full border px-2 text-xs font-medium transition-all ${
                  tourExpandAddFiles ? 'gap-1.5 pr-3' : 'gap-0 hover:gap-1.5 hover:pr-3'
                }`}
                style={{
                  backgroundColor: 'var(--bg-pill)',
                  borderColor: 'var(--border-subtle)',
                  color: 'var(--text-secondary)',
                }}
                title={addFilesLabel}
              >
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 16 16"
                  fill="none"
                  className="flex-shrink-0"
                  aria-hidden="true"
                >
                  <path
                    d="M8 3.2V12.8M3.2 8H12.8"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                </svg>
                <span
                  className={`overflow-hidden whitespace-nowrap transition-all duration-200 ${
                    tourExpandAddFiles ? 'max-w-[90px] opacity-100' : 'max-w-0 opacity-0 group-hover:max-w-[90px] group-hover:opacity-100'
                  }`}
                >
                  {addFilesLabel}
                </span>
              </button>

              {/* Mode Selector Pill */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setModeMenuOpen((v) => !v);
                    setModelMenuOpen(false);
                    setContextMenuOpen(false);
                  }}
                  aria-expanded={modeMenuOpen}
                  className="inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-xs font-medium transition-colors"
                  style={{
                    backgroundColor: 'var(--bg-pill)',
                    borderColor: 'var(--border-subtle)',
                    color: 'var(--text-primary)',
                  }}
                >
                  <span>{mode}</span>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                    <path
                      d="M3 4.5L6 7.5L9 4.5"
                      stroke="currentColor"
                      strokeWidth="1.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>

                {modeMenuOpen && (
                  <div
                    className="absolute bottom-full left-0 z-30 mb-2 w-44 rounded-2xl border p-1.5"
                    style={{
                      backgroundColor: 'var(--bg-elevated)',
                      borderColor: 'var(--border-strong)',
                      boxShadow: 'var(--shadow-menu)',
                    }}
                  >
                    {ALL_MODES.map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => {
                          setMode(m);
                          setModeMenuOpen(false);
                        }}
                        className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs font-medium transition-colors hover:bg-white/5"
                        style={{
                          color: 'var(--text-primary)',
                          backgroundColor: mode === m ? 'var(--bg-hover)' : 'transparent',
                        }}
                      >
                        <span>{m}</span>
                        {mode === m && <CheckmarkIcon />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* @ Context Trigger */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setContextMenuOpen((v) => !v);
                    setModeMenuOpen(false);
                    setModelMenuOpen(false);
                  }}
                  aria-expanded={contextMenuOpen}
                  title="Attach health context"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full border text-xs font-semibold transition-colors"
                  style={{
                    backgroundColor: 'var(--bg-pill)',
                    borderColor: 'var(--border-subtle)',
                    color: 'var(--text-secondary)',
                  }}
                >
                  @
                </button>

                {contextMenuOpen && (
                  <div
                    className="absolute bottom-full left-0 z-30 mb-2 w-56 rounded-2xl border p-1.5"
                    style={{
                      backgroundColor: 'var(--bg-elevated)',
                      borderColor: 'var(--border-strong)',
                      boxShadow: 'var(--shadow-menu)',
                    }}
                  >
                    {resolvedContextOptions.map((ctx) => (
                      <button
                        key={ctx.tag}
                        type="button"
                        onClick={() => insertContextTag(ctx.tag)}
                        className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs transition-colors hover:bg-white/5"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        <span className="font-mono font-semibold">{ctx.tag}</span>
                        <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                          {ctx.category}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Theme Toggle inside composer */}
              <button
                type="button"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                title={theme === 'dark' ? 'Light theme' : 'Dark theme'}
                aria-label={theme === 'dark' ? 'Switch composer to light theme' : 'Switch composer to dark theme'}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border text-xs transition-colors"
                style={{
                  backgroundColor: 'var(--bg-pill)',
                  borderColor: 'var(--border-subtle)',
                  color: 'var(--text-secondary)',
                }}
              >
                {theme === 'dark' ? '☀' : '☾'}
              </button>
            </div>

            {/* Right Group: Model Selector, Record Voice, Submit */}
            <div className="flex items-center gap-1.5">
              {/* Model & Effort Selector */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setModelMenuOpen((v) => !v);
                    setModelMenuPointerReady(true);
                    setModeMenuOpen(false);
                    setContextMenuOpen(false);
                  }}
                  aria-expanded={modelMenuOpen}
                  className={`inline-flex h-8 items-center gap-1.5 rounded-full border px-2.5 text-xs font-medium transition-all ${
                    tourHoverAutoPill ? 'ring-2 ring-amber-400/60' : ''
                  }`}
                  style={{
                    backgroundColor: 'var(--bg-pill)',
                    borderColor: modelMenuOpen ? 'var(--border-strong)' : 'var(--border-subtle)',
                    color: 'var(--text-primary)',
                  }}
                >
                  {autoMode ? (
                    <span className="inline-flex items-center gap-1 text-emerald-400">
                      <span className="h-2 w-2 rounded-full bg-emerald-400" />
                      <span>{autoLabel}</span>
                    </span>
                  ) : (
                    <>
                      <ProviderBadgeIcon provider={activeModel?.provider || 'gemini'} />
                      <span className="max-w-[125px] truncate">{activeModel?.name}</span>
                      <span
                        className="hidden sm:inline rounded-full px-1.5 py-0.5 text-[10px]"
                        style={{
                          backgroundColor: 'var(--bg-hover)',
                          color: 'var(--text-secondary)',
                        }}
                      >
                        {activeModel?.effort}
                      </span>
                    </>
                  )}
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                    <path
                      d="M3 4.5L6 7.5L9 4.5"
                      stroke="currentColor"
                      strokeWidth="1.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>

                {modelMenuOpen && (
                  <div
                    className="absolute bottom-full right-0 z-40 mb-2 w-72 sm:w-80 rounded-2xl border p-2"
                    style={{
                      backgroundColor: 'var(--bg-elevated)',
                      borderColor: 'var(--border-strong)',
                      boxShadow: 'var(--shadow-menu)',
                    }}
                  >
                    {/* Auto Toggle Row */}
                    <div
                      className="flex items-center justify-between rounded-xl px-2.5 py-2 border-b mb-1.5"
                      style={{ borderColor: 'var(--border-subtle)' }}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
                          {autoLabel}
                        </span>
                        <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                          Smart model routing
                        </span>
                      </div>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={autoMode}
                        onClick={() => setAutoMode((v) => !v)}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                          autoMode ? 'bg-emerald-500' : 'bg-zinc-600'
                        }`}
                      >
                        <span
                          className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                            autoMode ? 'translate-x-4' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Filter Tabs + Search Toggle */}
                    <div className="flex items-center justify-between gap-2 px-1 pb-2">
                      <div className="flex items-center gap-1 rounded-full p-0.5" style={{ backgroundColor: 'var(--bg-pill)' }}>
                        <button
                          type="button"
                          onClick={() => setModelFilterTab('fav')}
                          className="rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors"
                          style={{
                            backgroundColor: modelFilterTab === 'fav' ? 'var(--bg-hover)' : 'transparent',
                            color: modelFilterTab === 'fav' ? 'var(--text-primary)' : 'var(--text-secondary)',
                          }}
                        >
                          {favLabel}
                        </button>
                        <button
                          type="button"
                          onClick={() => setModelFilterTab('all')}
                          className="rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors"
                          style={{
                            backgroundColor: modelFilterTab === 'all' ? 'var(--bg-hover)' : 'transparent',
                            color: modelFilterTab === 'all' ? 'var(--text-primary)' : 'var(--text-secondary)',
                          }}
                        >
                          {allLabel}
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setSearchRevealed((v) => !v);
                          setTimeout(() => searchInputRef.current?.focus(), 40);
                        }}
                        aria-label="Search models"
                        className="inline-flex h-7 w-7 items-center justify-center rounded-full"
                        style={{
                          backgroundColor: searchRevealed ? 'var(--bg-hover)' : 'var(--bg-pill)',
                          color: 'var(--text-secondary)',
                        }}
                      >
                        <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                          <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.5" />
                          <path d="M10.5 10.5L13.8 13.8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                      </button>
                    </div>

                    {searchRevealed && (
                      <div className="px-1 pb-2">
                        <input
                          ref={searchInputRef}
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder={searchModelsPlaceholder}
                          className="w-full rounded-xl border px-2.5 py-1.5 text-xs focus:outline-none"
                          style={{
                            backgroundColor: 'var(--bg-pill)',
                            borderColor: 'var(--border-subtle)',
                            color: 'var(--text-primary)',
                          }}
                        />
                      </div>
                    )}

                    {/* Models List */}
                    <div className="max-h-60 overflow-y-auto space-y-0.5 pr-0.5">
                      {filteredModels.length === 0 ? (
                        <p className="py-4 text-center text-xs" style={{ color: 'var(--text-muted)' }}>
                          No models match
                        </p>
                      ) : (
                        filteredModels.map((m) => {
                          const isSelected = !autoMode && activeModel?.id === m.id;
                          const isEffortHovered = modelMenuPointerReady && hoveredModelId === m.id;
                          return (
                            <div
                              key={m.id}
                              onMouseEnter={() => {
                                isHoveringModelRowRef.current = true;
                                if (hideEffortTimerRef.current) clearTimeout(hideEffortTimerRef.current);
                                setHoveredModelId(m.id);
                              }}
                              onMouseLeave={() => {
                                isHoveringModelRowRef.current = false;
                                scheduleHideEffort();
                              }}
                              onClick={() => handleSelectModel(m.id)}
                              className="relative flex cursor-pointer items-center justify-between gap-2 rounded-xl px-2.5 py-2 text-xs transition-colors"
                              style={{
                                backgroundColor: isSelected || isEffortHovered ? 'var(--bg-hover)' : 'transparent',
                                color: 'var(--text-primary)',
                              }}
                            >
                              <div className="flex min-w-0 items-center gap-2">
                                <ProviderBadgeIcon provider={m.provider} />
                                <span className="truncate font-medium">{m.name}</span>
                                <span
                                  className="rounded px-1.5 py-0.5 text-[10px]"
                                  style={{
                                    backgroundColor: 'var(--bg-pill)',
                                    color: 'var(--text-muted)',
                                  }}
                                >
                                  {m.effort}
                                </span>
                              </div>

                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={(e) => toggleFavoriteModel(m.id, e)}
                                  aria-label={m.isFav ? `Unfavorite ${m.name}` : `Favorite ${m.name}`}
                                  className="rounded p-0.5 text-xs transition-opacity hover:opacity-100"
                                  style={{
                                    color: m.isFav ? '#F59E0B' : 'var(--text-muted)',
                                    opacity: m.isFav ? 1 : 0.65,
                                  }}
                                >
                                  {m.isFav ? '★' : '☆'}
                                </button>
                                {isSelected && <CheckmarkIcon />}
                              </div>

                              {/* Effort level hover / inline picker */}
                              {isEffortHovered && (
                                <div
                                  onMouseEnter={() => {
                                    isHoveringEffortMenuRef.current = true;
                                    if (hideEffortTimerRef.current) clearTimeout(hideEffortTimerRef.current);
                                  }}
                                  onMouseLeave={() => {
                                    isHoveringEffortMenuRef.current = false;
                                    scheduleHideEffort();
                                  }}
                                  onClick={(e) => e.stopPropagation()}
                                  className="mt-1 flex items-center gap-1 rounded-xl border px-1.5 py-1 sm:absolute sm:right-full sm:top-0 sm:mr-2 sm:mt-0 sm:flex-col sm:items-stretch sm:w-28"
                                  style={{
                                    backgroundColor: 'var(--bg-elevated)',
                                    borderColor: 'var(--border-strong)',
                                    boxShadow: 'var(--shadow-menu)',
                                  }}
                                >
                                  {m.efforts.map((eff) => (
                                    <button
                                      key={eff}
                                      type="button"
                                      onClick={(e) => handleSelectEffort(m.id, eff, e)}
                                      className="flex items-center justify-between rounded-lg px-2 py-1 text-[11px] font-medium transition-colors"
                                      style={{
                                        backgroundColor: m.effort === eff ? 'var(--bg-hover)' : 'transparent',
                                        color: 'var(--text-primary)',
                                      }}
                                    >
                                      <span>{eff}</span>
                                      {m.effort === eff && <CheckmarkIcon />}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Expanding Record Voice Button */}
              <button
                type="button"
                onClick={toggleRecording}
                className={`group inline-flex h-8 items-center overflow-hidden rounded-full border px-2 text-xs font-medium transition-all ${
                  isRecording
                    ? 'gap-1.5 pr-3 border-rose-500/60 bg-rose-500/15 text-rose-400'
                    : tourExpandRecord
                      ? 'gap-1.5 pr-3'
                      : 'gap-0 hover:gap-1.5 hover:pr-3'
                }`}
                style={
                  !isRecording
                    ? {
                        backgroundColor: 'var(--bg-pill)',
                        borderColor: 'var(--border-subtle)',
                        color: 'var(--text-secondary)',
                      }
                    : undefined
                }
                title={recordLabel}
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="flex-shrink-0" aria-hidden="true">
                  <rect x="5.5" y="2" width="5" height="8" rx="2.5" stroke="currentColor" strokeWidth="1.5" />
                  <path
                    d="M3.2 8.2C3.2 10.8 5.3 12.8 8 12.8C10.7 12.8 12.8 10.8 12.8 8.2M8 12.8V14.5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
                <span
                  className={`overflow-hidden whitespace-nowrap transition-all duration-200 ${
                    isRecording || tourExpandRecord
                      ? 'max-w-[85px] opacity-100'
                      : 'max-w-0 opacity-0 group-hover:max-w-[85px] group-hover:opacity-100'
                  }`}
                >
                  {isRecording ? `${recordingSeconds}s` : recordLabel}
                </span>
              </button>

              {/* Circular Submit Arrow Button */}
              <button
                type="button"
                disabled={!canSubmit}
                onClick={handleSubmit}
                aria-label="Send prompt"
                className="inline-flex h-8 w-8 items-center justify-center rounded-full transition-all disabled:opacity-35"
                style={{
                  backgroundColor: 'var(--accent-bg)',
                  color: 'var(--accent-fg)',
                }}
              >
                <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path
                    d="M8 12.5V3.5M8 3.5L4 7.5M8 3.5L12 7.5"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Optional Upgrade Banner & Walkthrough Control */}
        {showUpgradeBanner && !bannerDismissed && (
          <div
            className="mt-2.5 flex flex-wrap items-center justify-between gap-2 rounded-2xl border px-4 py-2 text-xs"
            style={{
              backgroundColor: 'var(--bg-composer)',
              borderColor: 'var(--border-subtle)',
              color: 'var(--text-secondary)',
            }}
          >
            <span>Unlock extended health memory and priority model speed.</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setProModalOpen(true)}
                className="rounded-lg px-2.5 py-1 font-semibold"
                style={{ backgroundColor: 'var(--accent-bg)', color: 'var(--accent-fg)' }}
              >
                Details
              </button>
              <button
                type="button"
                onClick={() => setBannerDismissed(true)}
                aria-label="Dismiss banner"
                style={{ color: 'var(--text-muted)' }}
              >
                ×
              </button>
            </div>
          </div>
        )}

        {showWalkthroughControl && (
          <div className="mt-2 flex justify-end">
            <button
              type="button"
              onClick={runWalkthroughTour}
              disabled={isPlayingTour}
              className="rounded-full border px-3 py-1 text-[11px] font-medium"
              style={{
                backgroundColor: 'var(--bg-pill)',
                borderColor: 'var(--border-subtle)',
                color: 'var(--text-secondary)',
              }}
            >
              {isPlayingTour ? 'Playing tour...' : 'Interactive Walkthrough'}
            </button>
          </div>
        )}

        {proModalOpen && (
          <div
            className="mt-2 rounded-2xl border p-3 text-xs"
            style={{
              backgroundColor: 'var(--bg-elevated)',
              borderColor: 'var(--border-strong)',
              color: 'var(--text-primary)',
            }}
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold">AI Composer Info</span>
              <button type="button" onClick={() => setProModalOpen(false)}>
                ×
              </button>
            </div>
            <p className="mt-1" style={{ color: 'var(--text-secondary)' }}>
              Supports mode switching (Plan / Ask / Build), @ context tags, favorite models, and voice dictation.
            </p>
          </div>
        )}

        {toastMessage && (
          <div
            className="mt-2 rounded-xl border px-3 py-1.5 text-xs font-medium"
            style={{
              backgroundColor: 'var(--bg-elevated)',
              borderColor: 'var(--border-strong)',
              color: 'var(--text-primary)',
            }}
          >
            {toastMessage}
          </div>
        )}
      </div>
    </div>
  );
}
