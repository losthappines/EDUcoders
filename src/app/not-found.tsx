import Link from "next/link";
import { IconArrowLeft, IconFileAlert, IconHeartHandshake } from "@tabler/icons-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-600 text-white">
              <IconHeartHandshake className="h-5 w-5" />
            </div>
            <span className="text-base font-bold text-slate-900 dark:text-slate-100">
              OnaCare AI
            </span>
          </Link>
          <div className="flex items-center gap-2 text-xs">
            <Link
              href="/login"
              className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-1.5 font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="rounded-xl bg-teal-600 px-3.5 py-1.5 font-semibold text-white hover:bg-teal-700 transition"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 text-center shadow-sm space-y-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
            <IconFileAlert className="h-6 w-6" />
          </div>
          <p className="font-mono text-xs font-bold uppercase tracking-widest text-teal-700 dark:text-teal-400">
            404 • Page Not Found
          </p>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">
            This page could not be found
          </h1>
          <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
            The URL you requested does not exist or may have moved. Return to the
            OnaCare AI homepage or sign in to access your portal.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 rounded-xl bg-teal-600 px-4 py-2 text-xs font-semibold text-white hover:bg-teal-700 transition"
            >
              <IconArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
            >
              Sign In
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
